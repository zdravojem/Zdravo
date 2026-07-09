const fs = require('fs');
const path = require('path');

const neverSyncedAt = '1970-01-01T00:00:00.000Z';
const imageRootFolder = 'synced-images';

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};
  const content = fs.readFileSync(filePath, 'utf8');

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    values[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });

  return values;
}

function parseJsonConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {};
  }
}

function getConfigSearchPaths(appDir, app) {
  const executableDir = process.execPath ? path.dirname(process.execPath) : '';
  const resourcesDir = process.resourcesPath || '';
  const userDataDir = app?.getPath ? app.getPath('userData') : '';

  return [
    path.join(appDir, '..', 'admin', 'recipe-admin', '.env.local'),
    path.join(appDir, '.env.local'),
    path.join(appDir, '.env'),
    path.join(resourcesDir, '.env.local'),
    path.join(resourcesDir, 'supabase-config.json'),
    path.join(executableDir, '.env.local'),
    path.join(executableDir, 'supabase-config.json'),
    path.join(userDataDir, '.env.local'),
    path.join(userDataDir, 'supabase-config.json')
  ].filter(Boolean);
}

function loadSupabaseConfig(appDir, app) {
  const fileValues = getConfigSearchPaths(appDir, app).reduce((values, filePath) => {
    const nextValues = filePath.endsWith('.json')
      ? parseJsonConfig(filePath)
      : parseEnvFile(filePath);

    return { ...values, ...nextValues };
  }, {});

  return {
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      fileValues.anonKey ||
      fileValues.supabaseAnonKey ||
      fileValues.SUPABASE_ANON_KEY ||
      fileValues.VITE_SUPABASE_ANON_KEY ||
      fileValues.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '',
    url:
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.VITE_PUBLIC_SUPABASE_URL ||
      fileValues.url ||
      fileValues.supabaseUrl ||
      fileValues.SUPABASE_URL ||
      fileValues.VITE_SUPABASE_URL ||
      fileValues.VITE_PUBLIC_SUPABASE_URL ||
      ''
  };
}

function normalizeSupabaseUrl(url) {
  return String(url || '').replace(/\/+$/, '');
}

function encodeStoragePath(imagePath) {
  return String(imagePath || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function getImageBucketDir(app, bucket) {
  return path.join(app.getPath('userData'), imageRootFolder, bucket);
}

function getLocalImagePath(app, bucket, imagePath) {
  const bucketDir = getImageBucketDir(app, bucket);
  const parts = String(imagePath || '')
    .split(/[\\/]+/)
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9._ -]/g, '_'));

  const resolvedBucketDir = path.resolve(bucketDir);
  const resolvedPath = path.resolve(bucketDir, ...parts);

  if (!resolvedPath.startsWith(resolvedBucketDir)) {
    throw new Error('Invalid image path');
  }

  return resolvedPath;
}

function rowToFlag(value) {
  return value ? 1 : 0;
}

const difficultyMap = {
  1: 'Enostavna',
  2: 'Normalna',
  3: 'Zahtevna'
};

function normalizeDifficulty(value) {
  const text = String(value ?? '').trim();

  if (text === 'Enostavna' || text === 'Normalna' || text === 'Zahtevna') {
    return text;
  }

  return difficultyMap[text] || null;
}

function normalizeTimeMin(recipe) {
  if (recipe.time_min !== undefined && recipe.time_min !== null) {
    return recipe.time_min;
  }

  if (recipe.prep_time_min !== undefined || recipe.cook_time_min !== undefined) {
    const prepTime = Number(recipe.prep_time_min || 0);
    const cookTime = Number(recipe.cook_time_min || 0);
    const totalTime = prepTime + cookTime;

    return totalTime > 0 ? totalTime : null;
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
  const unit = recipe.servings_unit ?? null;

  if (unit) {
    return unit;
  }

  return normalizeServingsQuantity(recipe) === null ? null : 'porcije';
}

const legacyCategoryMap = {
  meso_ribe: 'meso_in_mesni_izdelki',
  mlecni: 'mlecni_izdelki',
  zita: 'zita_kase_zdrobi',
  zacimbe: 'zacimbe_in_zelisca'
};

function normalizeCategory(category) {
  return legacyCategoryMap[category] || category || 'sadje';
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
    category: normalizeCategory(ingredient.category),
    created_at: ingredient.created_at ?? null,
    emoji: ingredient.emoji ?? null,
    image_path: ingredient.image_path ?? null,
    updated_at: ingredient.updated_at ?? null
  };
}

function normalizeRecipeIngredient(link) {
  return {
    ingredient_id: link.ingredient_id,
    is_optional: rowToFlag(link.is_optional),
    quantity: link.quantity ?? null,
    recipe_id: link.recipe_id,
    unit: link.unit ?? null
  };
}

function sortedRecipeIngredientRows(rows) {
  return rows
    .map(normalizeRecipeIngredient)
    .sort((left, right) => (
      left.recipe_id - right.recipe_id ||
      left.ingredient_id - right.ingredient_id ||
      String(left.quantity ?? '').localeCompare(String(right.quantity ?? '')) ||
      String(left.unit ?? '').localeCompare(String(right.unit ?? '')) ||
      left.is_optional - right.is_optional
    ));
}

function localSyncedDeleteWhere(remoteIds) {
  const syncedWhere = '(updated_at IS NOT NULL OR created_at IS NOT NULL)';

  if (!remoteIds.length) {
    return {
      params: [],
      where: syncedWhere
    };
  }

  return {
    params: remoteIds,
    where: `${syncedWhere} AND id NOT IN (${remoteIds.map(() => '?').join(', ')})`
  };
}

function selectDeletedSyncedRows(db, table, remoteIds) {
  const { params, where } = localSyncedDeleteWhere(remoteIds);

  return db.prepare(`SELECT id, image_path FROM ${table} WHERE ${where}`).all(...params);
}

function deleteSyncedRows(db, table, remoteIds) {
  const { params, where } = localSyncedDeleteWhere(remoteIds);

  return db.prepare(`DELETE FROM ${table} WHERE ${where}`).run(...params).changes;
}

function getLastSyncedAt(db) {
  return (
    db.prepare('SELECT value FROM sync_meta WHERE key = ?').get('lastSyncedAt')?.value ||
    neverSyncedAt
  );
}

function setLastSyncedAt(db, value) {
  db.prepare(
    `INSERT INTO sync_meta (key, value)
     VALUES ('lastSyncedAt', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(value);
}

function createSupabaseRequest(config) {
  const baseUrl = normalizeSupabaseUrl(config.url);
  const headers = {
    apikey: config.anonKey,
    authorization: `Bearer ${config.anonKey}`
  };

  async function fetchJson(pathname, searchParams) {
    const url = new URL(`${baseUrl}${pathname}`);

    Object.entries(searchParams || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    return response.json();
  }

  async function downloadObject(bucket, imagePath) {
    const encodedPath = encodeStoragePath(imagePath);
    const response = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
      headers
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Storage download failed (${response.status}): ${message}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return {
    downloadObject,
    fetchJson
  };
}

function saveSyncedRows(
  db,
  { ingredients, recipeIngredients, recipeIds, recipes, remoteIngredientIds, remoteRecipeIds }
) {
  const deletedRecipes = selectDeletedSyncedRows(db, 'recipes', remoteRecipeIds);
  const deletedIngredients = selectDeletedSyncedRows(db, 'ingredients', remoteIngredientIds);
  const upsertIngredient = db.prepare(
    `INSERT INTO ingredients (
      id, name_sl, category, emoji, image_path, created_at, updated_at
    ) VALUES (
      @id, @name_sl, @category, @emoji, @image_path, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      name_sl = excluded.name_sl,
      category = excluded.category,
      emoji = excluded.emoji,
      image_path = excluded.image_path,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at`
  );

  const upsertRecipe = db.prepare(
    `INSERT INTO recipes (
      id, name_sl, description_sl, servings_quantity, steps_sl, image_path,
      slug, created_at, updated_at, time_min, difficulty, tags,
      servings_unit, nacin_priprave, dodatni_nasvet, qr_url
    ) VALUES (
      @id, @name_sl, @description_sl, @servings_quantity, @steps_sl, @image_path,
      @slug, @created_at, @updated_at, @time_min, @difficulty, @tags,
      @servings_unit, @nacin_priprave, @dodatni_nasvet, @qr_url
    )
    ON CONFLICT(id) DO UPDATE SET
      name_sl = excluded.name_sl,
      description_sl = excluded.description_sl,
      servings_quantity = excluded.servings_quantity,
      steps_sl = excluded.steps_sl,
      image_path = excluded.image_path,
      slug = excluded.slug,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      time_min = excluded.time_min,
      difficulty = excluded.difficulty,
      tags = excluded.tags,
      servings_unit = excluded.servings_unit,
      nacin_priprave = excluded.nacin_priprave,
      dodatni_nasvet = excluded.dodatni_nasvet,
      qr_url = excluded.qr_url`
  );

  const deleteRecipeIngredients = db.prepare(
    'DELETE FROM recipe_ingredients WHERE recipe_id = ?'
  );
  const insertRecipeIngredient = db.prepare(
    `INSERT OR REPLACE INTO recipe_ingredients (
      recipe_id, ingredient_id, quantity, unit, is_optional
    ) VALUES (
      @recipe_id, @ingredient_id, @quantity, @unit, @is_optional
    )`
  );

  const transaction = db.transaction(() => {
    const removedRecipeCount = deleteSyncedRows(db, 'recipes', remoteRecipeIds);
    const removedIngredientCount = deleteSyncedRows(db, 'ingredients', remoteIngredientIds);
    const previousRecipeIngredients = recipeIds.length
      ? db.prepare(
          `SELECT recipe_id, ingredient_id, quantity, unit, is_optional
           FROM recipe_ingredients
           WHERE recipe_id IN (${recipeIds.map(() => '?').join(', ')})`
        ).all(...recipeIds)
      : [];
    const nextRecipeIngredients = sortedRecipeIngredientRows(recipeIngredients);
    const recipeIngredientsChanged =
      JSON.stringify(sortedRecipeIngredientRows(previousRecipeIngredients)) !==
      JSON.stringify(nextRecipeIngredients);

    ingredients.map(normalizeIngredient).forEach((ingredient) => {
      upsertIngredient.run(ingredient);
    });

    recipes.map(normalizeRecipe).forEach((recipe) => {
      upsertRecipe.run(recipe);
    });

    recipeIds.forEach((recipeId) => {
      deleteRecipeIngredients.run(recipeId);
    });

    nextRecipeIngredients.forEach((link) => {
      insertRecipeIngredient.run(link);
    });

    return {
      deletedIngredients,
      deletedRecipes,
      recipeIngredientsChanged,
      removedIngredientCount,
      removedRecipeCount
    };
  });

  return transaction();
}

function createSupabaseSync({ app, db, notify }) {
  const config = loadSupabaseConfig(__dirname, app);
  const configured = Boolean(config.url && config.anonKey);
  const client = configured ? createSupabaseRequest(config) : null;
  const logPath = path.join(app.getPath('userData'), 'logs', 'supabase-sync.log');
  let activeSync = null;
  let status = {
    configured,
    lastSyncedAt: configured ? getLastSyncedAt(db) : null,
    message: configured ? 'Ready to sync.' : 'Supabase sync is not configured.',
    state: configured ? 'idle' : 'disabled'
  };

  function setStatus(nextStatus) {
    status = {
      ...status,
      ...nextStatus
    };

    try {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(
        logPath,
        `${new Date().toISOString()} ${JSON.stringify(status)}\n`
      );
    } catch (error) {
      // Logging is best-effort only; sync should not fail because of it.
    }

    notify?.(status);
  }

  async function downloadImages(rows, bucket) {
    const errors = [];
    let downloaded = 0;

    for (const row of rows) {
      if (!row.image_path || String(row.image_path).startsWith('assets/')) {
        continue;
      }

      try {
        const localPath = getLocalImagePath(app, bucket, row.image_path);
        const buffer = await client.downloadObject(bucket, row.image_path);
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.writeFileSync(localPath, buffer);
        downloaded += 1;
      } catch (error) {
        errors.push(`${bucket}/${row.image_path}: ${error.message}`);
      }
    }

    return { downloaded, errors };
  }

  function deleteLocalImages(rows, bucket) {
    let deleted = 0;

    rows.forEach((row) => {
      if (!row.image_path || String(row.image_path).startsWith('assets/')) {
        return;
      }

      try {
        const localPath = getLocalImagePath(app, bucket, row.image_path);

        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          deleted += 1;
        }
      } catch (error) {
        // Local image cleanup is best-effort; stale files should not block data sync.
      }
    });

    return deleted;
  }

  async function runSync(trigger = 'manual', options = {}) {
    if (!configured || !client) {
      return {
        configured: false,
        ok: false,
        skipped: true,
        message: 'Supabase sync is not configured.'
      };
    }

    if (activeSync) {
      return activeSync;
    }

    const forceFull = options && options.force === true;

    activeSync = (async () => {
      // A forced run ignores the stored watermark and re-fetches everything.
      // This recovers rows (e.g. recipe qr_url) that an earlier incremental
      // sync skipped because of clock skew or a watermark set past the update.
      const previousSync = forceFull ? neverSyncedAt : getLastSyncedAt(db);
      const nextSync = new Date().toISOString();

      setStatus({
        lastSyncedAt: previousSync,
        message: `Syncing from ${previousSync}.`,
        state: 'syncing',
        trigger
      });

      try {
        const recipeParams = {
          order: 'updated_at.asc',
          select: '*'
        };
        const ingredientParams = {
          order: 'updated_at.asc',
          select: '*'
        };

        if (previousSync !== neverSyncedAt) {
          recipeParams.updated_at = `gt.${previousSync}`;
          ingredientParams.updated_at = `gt.${previousSync}`;
        }

        const [remoteIngredientRows, remoteRecipeRows, ingredients, recipes] = await Promise.all([
          client.fetchJson('/rest/v1/ingredients', {
            select: 'id'
          }),
          client.fetchJson('/rest/v1/recipes', {
            select: 'id'
          }),
          client.fetchJson('/rest/v1/ingredients', ingredientParams),
          client.fetchJson('/rest/v1/recipes', recipeParams)
        ]);

        const remoteIngredientIds = remoteIngredientRows.map((ingredient) => ingredient.id);
        const remoteRecipeIds = remoteRecipeRows.map((recipe) => recipe.id);
        const recipeIds = remoteRecipeIds;
        const recipeIngredients = recipeIds.length
          ? await client.fetchJson('/rest/v1/recipe_ingredients', {
              recipe_id: `in.(${recipeIds.join(',')})`,
              select: '*'
            })
          : [];

        const recipeImages = await downloadImages(recipes, 'recipe-images');
        const ingredientImages = await downloadImages(ingredients, 'ingredient-images');
        const imageErrors = recipeImages.errors.concat(ingredientImages.errors);

        const deleteResult = saveSyncedRows(db, {
          ingredients,
          recipeIngredients,
          recipeIds,
          remoteIngredientIds,
          remoteRecipeIds,
          recipes
        });
        const deletedRecipeImages = deleteLocalImages(deleteResult.deletedRecipes, 'recipe-images');
        const deletedIngredientImages = deleteLocalImages(
          deleteResult.deletedIngredients,
          'ingredient-images'
        );

        if (imageErrors.length) {
          throw new Error(`Some images failed to download: ${imageErrors.join('; ')}`);
        }

        setLastSyncedAt(db, nextSync);

        const deletedRows =
          deleteResult.removedIngredientCount + deleteResult.removedRecipeCount;
        const changed =
          ingredients.length +
          recipes.length +
          deletedRows +
          (deleteResult.recipeIngredientsChanged ? recipeIngredients.length : 0);
        const result = {
          changed,
          counts: {
            deletedIngredientImages,
            deletedIngredients: deleteResult.removedIngredientCount,
            deletedRecipeImages,
            deletedRecipes: deleteResult.removedRecipeCount,
            ingredientImages: ingredientImages.downloaded,
            ingredients: ingredients.length,
            recipeImages: recipeImages.downloaded,
            recipeIngredients: deleteResult.recipeIngredientsChanged ? recipeIngredients.length : 0,
            recipes: recipes.length
          },
          lastSyncedAt: nextSync,
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
          lastSyncedAt: previousSync,
          message: error.message,
          ok: false
        };

        setStatus({
          ...result,
          state: 'error'
        });

        return result;
      } finally {
        activeSync = null;
      }
    })();

    return activeSync;
  }

  return {
    getStatus: () => status,
    runSync
  };
}

module.exports = {
  createSupabaseSync,
  getLocalImagePath
};
