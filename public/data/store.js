// The catalogue store — the PWA's replacement for the local SQLite database.
//
// The Electron build mirrored Supabase into better-sqlite3 and the renderer
// queried it with SQL over IPC. A browser has neither, so the three content
// tables (70 recipes / 141 ingredients / ~650 links today) are fetched whole,
// held in memory, and queried in JS. Every helper below reproduces exactly one
// of the SELECTs the renderer used to run, including its ordering, so the
// screens receive the same rows in the same order as before.
//
// The rows are also normalised the way supabase-sync.js normalised them on the
// way into SQLite (difficulty labels, tag encoding, servings, category renames),
// because the screens were written against that normalised shape.

import { config, isSupabaseConfigured } from './config.js';
import { selectAll } from './supabase.js';

const CACHE_KEY = 'zdravo.catalog.v1';
const NEVER_SYNCED_AT = '1970-01-01T00:00:00.000Z';

const emptyCatalog = {
  fetchedAt: null,
  ingredients: [],
  recipeIngredients: [],
  recipes: []
};

let catalog = emptyCatalog;
let activeRefresh = null;
const listeners = new Set();

let status = {
  configured: isSupabaseConfigured,
  lastSyncedAt: null,
  message: isSupabaseConfigured ? 'Ready to sync.' : 'Supabase is not configured.',
  state: isSupabaseConfigured ? 'idle' : 'disabled'
};

/* -------------------------------------------------------------------------
   Row normalisation (ported from supabase-sync.js)
   ------------------------------------------------------------------------- */

const difficultyMap = {
  1: 'Enostavna',
  2: 'Normalna',
  3: 'Zahtevna'
};

const legacyCategoryMap = {
  meso_ribe: 'meso_in_mesni_izdelki',
  mlecni: 'mlecni_izdelki',
  zita: 'zita_kase_zdrobi',
  zacimbe: 'zacimbe_in_zelisca'
};

function normalizeDifficulty(value) {
  const label = String(value ?? '').trim();

  if (label === 'Enostavna' || label === 'Normalna' || label === 'Zahtevna') {
    return label;
  }

  return difficultyMap[label] || null;
}

function normalizeTimeMin(recipe) {
  if (recipe.time_min !== undefined && recipe.time_min !== null) {
    return recipe.time_min;
  }

  if (recipe.prep_time_min !== undefined || recipe.cook_time_min !== undefined) {
    const total = Number(recipe.prep_time_min || 0) + Number(recipe.cook_time_min || 0);
    return total > 0 ? total : null;
  }

  return null;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.length ? JSON.stringify(value) : null;
  }

  return value ?? null;
}

function normalizeServingsQuantity(recipe) {
  return recipe.servings_quantity ?? recipe.servings ?? null;
}

function normalizeServingsUnit(recipe) {
  return recipe.servings_unit ?? (normalizeServingsQuantity(recipe) === null ? null : 'porcije');
}

function normalizeRecipe(recipe) {
  return {
    id: recipe.id,
    name_sl: recipe.name_sl,
    created_at: recipe.created_at ?? null,
    description_sl: recipe.description_sl ?? null,
    difficulty: normalizeDifficulty(recipe.difficulty),
    dodatni_nasvet: recipe.dodatni_nasvet ?? null,
    image_path: recipe.image_path ?? null,
    nacin_priprave: recipe.nacin_priprave ?? null,
    qr_url: recipe.qr_url ?? null,
    servings_quantity: normalizeServingsQuantity(recipe),
    servings_unit: normalizeServingsUnit(recipe),
    slug: recipe.slug ?? null,
    steps_sl: recipe.steps_sl ?? null,
    tags: normalizeTags(recipe.tags),
    time_min: normalizeTimeMin(recipe),
    updated_at: recipe.updated_at ?? null
  };
}

function normalizeIngredient(ingredient) {
  return {
    ...ingredient,
    category: legacyCategoryMap[ingredient.category] || ingredient.category || 'sadje',
    created_at: ingredient.created_at ?? null,
    emoji: ingredient.emoji ?? null,
    image_path: ingredient.image_path ?? null,
    updated_at: ingredient.updated_at ?? null
  };
}

function normalizeRecipeIngredient(link) {
  return {
    ingredient_id: link.ingredient_id,
    is_optional: link.is_optional ? 1 : 0,
    quantity: link.quantity ?? null,
    recipe_id: link.recipe_id,
    unit: link.unit ?? null
  };
}

/* -------------------------------------------------------------------------
   Ordering
   ------------------------------------------------------------------------- */

// SQLite's default TEXT collation is BINARY, so `ORDER BY name_sl` compared
// code points rather than applying Slovenian collation. Comparing raw strings
// here keeps the ingredient and recipe lists in the order the kiosk has always
// shown them.
function compareBinary(left, right) {
  const a = String(left ?? '');
  const b = String(right ?? '');

  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

/* -------------------------------------------------------------------------
   Offline cache
   ------------------------------------------------------------------------- */

function readCachedCatalog() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null');

    if (!cached || !Array.isArray(cached.recipes) || !Array.isArray(cached.ingredients)) {
      return null;
    }

    return {
      fetchedAt: cached.fetchedAt || null,
      ingredients: cached.ingredients,
      recipeIngredients: Array.isArray(cached.recipeIngredients) ? cached.recipeIngredients : [],
      recipes: cached.recipes
    };
  } catch (error) {
    return null;
  }
}

function writeCachedCatalog(next) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch (error) {
    // A full or disabled storage must never break the running kiosk; the app
    // simply loses its offline warm start.
  }
}

/* -------------------------------------------------------------------------
   Status
   ------------------------------------------------------------------------- */

export function getStatus() {
  return status;
}

export function onStatus(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }

  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setStatus(next) {
  status = { ...status, ...next };
  listeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.warn('Sync status listener failed', error);
    }
  });
}

/* -------------------------------------------------------------------------
   Loading
   ------------------------------------------------------------------------- */

function catalogSignature(next) {
  return JSON.stringify([next.recipes, next.ingredients, next.recipeIngredients]);
}

async function fetchCatalog() {
  const [recipes, ingredients, recipeIngredients] = await Promise.all([
    selectAll('recipes', { order: 'id.asc' }),
    selectAll('ingredients', { order: 'id.asc' }),
    selectAll('recipe_ingredients', { order: 'recipe_id.asc,ingredient_id.asc' })
  ]);

  return {
    fetchedAt: new Date().toISOString(),
    ingredients: ingredients.map(normalizeIngredient),
    recipeIngredients: recipeIngredients.map(normalizeRecipeIngredient),
    recipes: recipes.map(normalizeRecipe)
  };
}

/**
 * Re-reads the catalogue from Supabase. Mirrors the old `sync:run` contract so
 * app.js can keep treating a truthy `changed` as "re-render with fresh data".
 */
export async function refresh(trigger = 'manual') {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      ok: false,
      skipped: true,
      message: 'Supabase is not configured.'
    };
  }

  if (activeRefresh) {
    return activeRefresh;
  }

  activeRefresh = (async () => {
    const previousSync = status.lastSyncedAt || NEVER_SYNCED_AT;

    setStatus({
      message: `Syncing from ${previousSync}.`,
      state: 'syncing',
      trigger
    });

    try {
      const next = await fetchCatalog();
      const changed = catalogSignature(next) !== catalogSignature(catalog);

      if (changed) {
        catalog = next;
        writeCachedCatalog(next);
      }

      const result = {
        changed,
        counts: {
          ingredients: next.ingredients.length,
          recipeIngredients: next.recipeIngredients.length,
          recipes: next.recipes.length
        },
        lastSyncedAt: next.fetchedAt,
        ok: true
      };

      setStatus({
        ...result,
        message: changed ? 'Sync complete.' : 'Already up to date.',
        state: 'synced'
      });

      return result;
    } catch (error) {
      const result = {
        // A rejected key or a missing table is a deployment mistake, not a
        // flaky network, and retrying forever will not fix it. Callers use this
        // to decide whether to keep trying and what to tell the room.
        fatal: error.status === 401 || error.status === 403 || error.status === 404,
        lastSyncedAt: status.lastSyncedAt,
        message: error.message,
        ok: false,
        status: error.status
      };

      setStatus({ ...result, state: 'error' });

      return result;
    } finally {
      activeRefresh = null;
    }
  })();

  return activeRefresh;
}

/**
 * First load. Serves the cached catalogue immediately when there is one so the
 * kiosk paints instantly (and still works with the network down), then refreshes
 * in the background.
 */
export async function init() {
  const cached = readCachedCatalog();

  if (cached) {
    catalog = cached;
    setStatus({
      lastSyncedAt: cached.fetchedAt,
      message: 'Loaded from offline cache.',
      state: 'idle'
    });
  }

  if (!isSupabaseConfigured) {
    return { fromCache: Boolean(cached), ok: Boolean(cached) };
  }

  // Without a cache there is nothing to draw, so the first fetch is awaited.
  // With one, the refresh runs in the background and re-renders if it differs.
  if (!cached) {
    const result = await refresh('startup');
    return { fromCache: false, fatal: result.fatal, message: result.message, ok: result.ok };
  }

  return { fromCache: true, ok: true, pending: refresh('startup') };
}

export function isEmpty() {
  return catalog.recipes.length === 0 && catalog.ingredients.length === 0;
}

/* -------------------------------------------------------------------------
   Queries — one per SELECT the renderer used to send over IPC
   ------------------------------------------------------------------------- */

// SELECT id, name_sl, category, emoji, image_path FROM ingredients ORDER BY name_sl
export function listIngredients() {
  return catalog.ingredients
    .map(({ id, name_sl, category, emoji, image_path }) => ({
      id,
      name_sl,
      category,
      emoji,
      image_path
    }))
    .sort((left, right) => compareBinary(left.name_sl, right.name_sl));
}

// SELECT * FROM recipes ORDER BY name_sl
export function listRecipes() {
  return catalog.recipes
    .slice()
    .sort((left, right) => compareBinary(left.name_sl, right.name_sl));
}

// SELECT * FROM recipes WHERE TRIM(name_sl) <> '' ORDER BY RANDOM() LIMIT 10
export function randomRecipes(limit = 10) {
  const named = catalog.recipes.filter((recipe) => String(recipe.name_sl ?? '').trim() !== '');

  for (let index = named.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [named[index], named[swap]] = [named[swap], named[index]];
  }

  return named.slice(0, limit);
}

// SELECT DISTINCT i.category, i.name_sl AS ingredient_name_sl, r.*
//   FROM recipes r
//   JOIN recipe_ingredients ri ON ri.recipe_id = r.id
//   JOIN ingredients i ON i.id = ri.ingredient_id
//   ORDER BY i.category, r.name_sl
export function listCategoryRecipeRows() {
  const recipesById = new Map(catalog.recipes.map((recipe) => [recipe.id, recipe]));
  const ingredientsById = new Map(catalog.ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const rows = [];

  catalog.recipeIngredients.forEach((link) => {
    const recipe = recipesById.get(link.recipe_id);
    const ingredient = ingredientsById.get(link.ingredient_id);

    if (!recipe || !ingredient) {
      return;
    }

    rows.push({
      ...recipe,
      category: ingredient.category,
      ingredient_name_sl: ingredient.name_sl
    });
  });

  return rows.sort(
    (left, right) =>
      compareBinary(left.category, right.category) || compareBinary(left.name_sl, right.name_sl)
  );
}

// SELECT ri.recipe_id, i.id, i.name_sl, i.image_path, ri.quantity, ri.unit, ri.is_optional
//   FROM recipe_ingredients ri
//   JOIN ingredients i ON i.id = ri.ingredient_id
//   WHERE ri.recipe_id IN (...)
export function listRecipeIngredients(recipeIds) {
  const wanted = new Set(recipeIds);
  const ingredientsById = new Map(catalog.ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const rows = [];

  catalog.recipeIngredients.forEach((link) => {
    if (!wanted.has(link.recipe_id)) {
      return;
    }

    const ingredient = ingredientsById.get(link.ingredient_id);

    if (!ingredient) {
      return;
    }

    rows.push({
      recipe_id: link.recipe_id,
      id: ingredient.id,
      name_sl: ingredient.name_sl,
      image_path: ingredient.image_path,
      quantity: link.quantity,
      unit: link.unit,
      is_optional: link.is_optional
    });
  });

  return rows;
}

// SELECT * FROM recipes WHERE id = ? LIMIT 1
export function findRecipe(recipeId) {
  return catalog.recipes.find((recipe) => recipe.id === recipeId) || null;
}

/**
 * Builds the public share URL for a recipe.
 *
 * Ported from buildRecipeShareUrl() in main.js — same validation, same query
 * parameters — because the recipe share pages on R2 read them as they are.
 */
export function buildRecipeShareUrl(recipeId, options = {}) {
  const normalizedRecipeId = Number(recipeId);

  if (!Number.isInteger(normalizedRecipeId) || normalizedRecipeId <= 0) {
    throw new Error('Invalid recipe id');
  }

  const recipe = findRecipe(normalizedRecipeId);

  if (!recipe) {
    throw new Error('Recipe not found');
  }

  const configuredQrUrl = String(recipe.qr_url || '').trim();

  if (!configuredQrUrl) {
    throw new Error('Recipe QR page is not ready yet');
  }

  const shareUrl = new URL(configuredQrUrl);

  if (!/^https?:$/.test(shareUrl.protocol)) {
    throw new Error('Recipe QR URL must be an HTTP URL');
  }

  const selectedIngredients = Array.isArray(options.selectedIngredients)
    ? options.selectedIngredients.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 100)
    : [];

  shareUrl.searchParams.set('locale', options.locale === 'en' ? 'en' : 'sl');

  if (selectedIngredients.length) {
    shareUrl.searchParams.set('selected', encodeBase64Url(JSON.stringify(selectedIngredients)));
  }

  if (config.autoDownloadSharedRecipe) {
    shareUrl.searchParams.set('download', '1');
  }

  return shareUrl.toString();
}

function encodeBase64Url(value) {
  const utf8 = new TextEncoder().encode(String(value));
  let binary = '';

  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
