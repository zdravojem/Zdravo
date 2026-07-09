const { app, BrowserWindow, ipcMain, net, protocol, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const Database = require('better-sqlite3');
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const { createSupabaseSync, getLocalImagePath } = require('./supabase-sync');

let dbPath;
let db;
let isQuitting = false;
let syncManager;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'zdravo-image',
    privileges: {
      bypassCSP: true,
      secure: true,
      standard: true,
      stream: true,
      supportFetchAPI: true
    }
  }
]);

if (process.platform === 'win32') {
  app.setAppUserModelId('si.zdravo.jem');
}

function getDatabasePath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'zdravo-jem.db');
  }

  return path.join(__dirname, 'database', 'zdravo-jem.db');
}

function initDatabase() {
  dbPath = getDatabasePath();
  const firstRun = !fs.existsSync(dbPath);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  if (firstRun) {
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    db.exec(schema);
  }

  migrateDatabase();
}

function columnExists(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((row) => row.name === column);
}

function ensureColumn(table, column, definition) {
  if (columnExists(table, column)) {
    return;
  }

  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function recipeTableSql(tableName = 'recipes') {
  return `
    CREATE TABLE ${tableName} (
      id INTEGER PRIMARY KEY,
      name_sl TEXT NOT NULL,
      description_sl TEXT,
      servings_quantity INTEGER,
      steps_sl TEXT,
      image_path TEXT,
      slug TEXT UNIQUE,
      created_at TEXT,
      updated_at TEXT,
      time_min INTEGER,
      difficulty TEXT CHECK(difficulty IN ('Enostavna','Normalna','Zahtevna') OR difficulty IS NULL),
      tags TEXT,
      servings_unit TEXT,
      nacin_priprave TEXT,
      dodatni_nasvet TEXT,
      qr_url TEXT
    )
  `;
}

function tableColumns(table) {
  return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name));
}

function selectColumn(columns, name, fallback = 'NULL') {
  return columns.has(name) ? name : fallback;
}

function migratedServingsQuantityExpression(columns) {
  if (columns.has('servings_quantity') && columns.has('servings')) {
    return 'COALESCE(servings_quantity, servings)';
  }

  if (columns.has('servings_quantity')) {
    return 'servings_quantity';
  }

  return selectColumn(columns, 'servings');
}

function migratedServingsUnitExpression(columns) {
  if (columns.has('servings_unit')) {
    return 'servings_unit';
  }

  if (columns.has('servings_quantity') && columns.has('servings')) {
    return "CASE WHEN COALESCE(servings_quantity, servings) IS NULL THEN NULL ELSE 'porcije' END";
  }

  if (columns.has('servings_quantity')) {
    return "CASE WHEN servings_quantity IS NULL THEN NULL ELSE 'porcije' END";
  }

  if (columns.has('servings')) {
    return "CASE WHEN servings IS NULL THEN NULL ELSE 'porcije' END";
  }

  return 'NULL';
}

function migratedTimeExpression(columns) {
  if (columns.has('time_min')) {
    return 'time_min';
  }

  if (columns.has('prep_time_min') || columns.has('cook_time_min')) {
    const prep = columns.has('prep_time_min') ? 'COALESCE(prep_time_min, 0)' : '0';
    const cook = columns.has('cook_time_min') ? 'COALESCE(cook_time_min, 0)' : '0';
    const nullCheck = [
      columns.has('prep_time_min') ? 'prep_time_min IS NULL' : '1',
      columns.has('cook_time_min') ? 'cook_time_min IS NULL' : '1'
    ].join(' AND ');

    return `CASE WHEN ${nullCheck} THEN NULL ELSE ${prep} + ${cook} END`;
  }

  return 'NULL';
}

function migratedDifficultyExpression(columns) {
  if (!columns.has('difficulty')) {
    return 'NULL';
  }

  return `
    CASE CAST(difficulty AS TEXT)
      WHEN '1' THEN 'Enostavna'
      WHEN '2' THEN 'Normalna'
      WHEN '3' THEN 'Zahtevna'
      WHEN 'Enostavna' THEN 'Enostavna'
      WHEN 'Normalna' THEN 'Normalna'
      WHEN 'Zahtevna' THEN 'Zahtevna'
      ELSE NULL
    END
  `;
}

function shouldMigrateRecipesTable() {
  const columns = tableColumns('recipes');
  const createSql = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'recipes'")
    .get()?.sql || '';

  return (
    !columns.has('servings_quantity') ||
    !columns.has('servings_unit') ||
    !columns.has('nacin_priprave') ||
    !columns.has('dodatni_nasvet') ||
    columns.has('servings') ||
    !columns.has('time_min') ||
    !columns.has('tags') ||
    !columns.has('qr_url') ||
    columns.has('prep_time_min') ||
    columns.has('cook_time_min') ||
    columns.has('season') ||
    columns.has('is_vegetarian') ||
    /difficulty\s+INTEGER/i.test(createSql)
  );
}

function migrateRecipesTable() {
  if (!shouldMigrateRecipesTable()) {
    return;
  }

  const columns = tableColumns('recipes');
  const selectExpressions = [
    selectColumn(columns, 'id'),
    selectColumn(columns, 'name_sl', "''"),
    selectColumn(columns, 'description_sl'),
    migratedServingsQuantityExpression(columns),
    selectColumn(columns, 'steps_sl'),
    selectColumn(columns, 'image_path'),
    selectColumn(columns, 'slug'),
    selectColumn(columns, 'created_at'),
    selectColumn(columns, 'updated_at'),
    migratedTimeExpression(columns),
    migratedDifficultyExpression(columns),
    selectColumn(columns, 'tags'),
    migratedServingsUnitExpression(columns),
    selectColumn(columns, 'nacin_priprave'),
    selectColumn(columns, 'dodatni_nasvet'),
    selectColumn(columns, 'qr_url')
  ];

  db.pragma('foreign_keys = OFF');

  try {
    db.transaction(() => {
      db.exec('DROP TABLE IF EXISTS recipes_next');
      db.exec(recipeTableSql('recipes_next'));
      db.exec(`
        INSERT INTO recipes_next (
          id, name_sl, description_sl, servings_quantity, steps_sl, image_path,
          slug, created_at, updated_at, time_min, difficulty, tags,
          servings_unit, nacin_priprave, dodatni_nasvet, qr_url
        )
        SELECT ${selectExpressions.join(', ')}
        FROM recipes
      `);
      db.exec('DROP TABLE recipes');
      db.exec('ALTER TABLE recipes_next RENAME TO recipes');
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

function migrateDatabase() {
  migrateRecipesTable();
  ensureColumn('ingredients', 'image_path', 'TEXT');
  ensureColumn('ingredients', 'created_at', 'TEXT');
  ensureColumn('ingredients', 'updated_at', 'TEXT');
  migrateIngredientCategories();
  removeSeededLocalData();
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

function migrateIngredientCategories() {
  const legacyCategories = {
    meso_ribe: 'meso_in_mesni_izdelki',
    mlecni: 'mlecni_izdelki',
    zita: 'zita_kase_zdrobi',
    zacimbe: 'zacimbe_in_zelisca'
  };
  const updateByCategory = db.prepare('UPDATE ingredients SET category = ? WHERE category = ?');

  Object.entries(legacyCategories).forEach(([legacyCategory, category]) => {
    updateByCategory.run(category, legacyCategory);
  });
}

function removeSeededLocalData() {
  db.exec(`
    DELETE FROM recipe_ingredients
    WHERE recipe_id IN (
      SELECT id FROM recipes WHERE created_at IS NULL AND updated_at IS NULL
    )
    OR ingredient_id IN (
      SELECT id FROM ingredients WHERE created_at IS NULL AND updated_at IS NULL
    );

    DELETE FROM recipes
    WHERE created_at IS NULL AND updated_at IS NULL;

    DELETE FROM ingredients
    WHERE created_at IS NULL AND updated_at IS NULL;
  `);
}

function notifySyncStatus(status) {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('sync:status-changed', status);
  });
}

function encodeBase64Url(value) {
  return Buffer.from(String(value), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function parseRuntimeEnvFile(filePath) {
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
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    values[key] = value;
  });

  return values;
}

function parseRuntimeJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {};
  }
}

function getRuntimeConfigSearchPaths() {
  const executableDir = process.execPath ? path.dirname(process.execPath) : '';
  const resourcesDir = process.resourcesPath || '';
  const userDataDir = app?.getPath ? app.getPath('userData') : '';

  return [
    path.join(__dirname, '.env.local'),
    path.join(__dirname, '.env'),
    path.join(resourcesDir, '.env.local'),
    path.join(resourcesDir, 'supabase-config.json'),
    path.join(executableDir, '.env.local'),
    path.join(executableDir, 'supabase-config.json'),
    path.join(userDataDir, '.env.local'),
    path.join(userDataDir, 'supabase-config.json')
  ].filter(Boolean);
}

function loadRuntimeFileConfig() {
  return getRuntimeConfigSearchPaths().reduce((values, filePath) => {
    const nextValues = filePath.endsWith('.json')
      ? parseRuntimeJsonFile(filePath)
      : parseRuntimeEnvFile(filePath);

    return { ...values, ...nextValues };
  }, {});
}

function runtimeConfigValue(names) {
  const fileValues = loadRuntimeFileConfig();

  return names.map((name) => process.env[name] || fileValues[name] || fileValues[name[0].toLowerCase() + name.slice(1)])
    .find((value) => String(value || '').trim()) || '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return String(value)
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function encodeStoragePath(imagePath) {
  return String(imagePath || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function normalizePublicBaseUrl(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function safeFileName(value, fallback = 'item') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
}

function r2ImageTemplateValue(template, item = {}) {
  const id = Number(item.id || item.ingredient_id);
  const recipeIndex = Number.isInteger(id) && id >= 76 && id <= 145 ? String(id - 75) : '';
  const ingredientIndex = Number.isInteger(id)
    ? String(id >= 222 && id <= 257 ? id - 116 : id >= 117 ? id - 116 : id >= 12 ? id - 11 : id)
    : '';
  const slug = safeFileName(item.slug || item.name || item.name_sl || item.title || item.id);
  const templateText = String(template || '');

  if (
    (templateText.includes('{recipe_index}') && !recipeIndex) ||
    (templateText.includes('{ingredient_index}') && !ingredientIndex) ||
    (templateText.includes('{id}') && !safeFileName(item.id || item.ingredient_id || '', ''))
  ) {
    return '';
  }

  return templateText
    .replace(/\{id\}/g, safeFileName(item.id || item.ingredient_id || '', ''))
    .replace(/\{recipe_index\}/g, safeFileName(recipeIndex, ''))
    .replace(/\{ingredient_index\}/g, safeFileName(ingredientIndex, ''))
    .replace(/\{slug\}/g, slug)
    .replace(/\{name\}/g, slug)
    .replace(/\{image_path\}/g, String(item.image_path || '').replace(/^\/+/, ''));
}

function configuredR2PublicBaseUrl() {
  return normalizePublicBaseUrl(runtimeConfigValue([
    'R2_PUBLIC_BASE_URL',
    'CF_PUBLIC_BASE_URL',
    'S3_PUBLIC_BASE_URL',
    'ZDRAVO_RECIPE_QR_PUBLIC_BASE_URL',
    'publicBaseUrl',
    'r2PublicBaseUrl',
    'recipeQrPublicBaseUrl'
  ]));
}

function publicR2ObjectUrl(prefix, imagePath) {
  const r2BaseUrl = configuredR2PublicBaseUrl();
  const normalizedPrefix = String(prefix || '').replace(/^\/+|\/+$/g, '');
  const normalizedPath = String(imagePath || '').trim().replace(/^\/+/, '');

  if (!r2BaseUrl || !normalizedPath || /^https?:\/\//i.test(normalizedPath)) {
    return /^https?:\/\//i.test(normalizedPath) ? normalizedPath : '';
  }

  return `${r2BaseUrl}/${[normalizedPrefix, normalizedPath].filter(Boolean).map(encodeStoragePath).join('/')}`;
}

function isLocalEmailImagePath(value) {
  const pathValue = String(value || '').trim();
  return (
    !pathValue ||
    pathValue.startsWith('assets/') ||
    pathValue.startsWith('../') ||
    pathValue.startsWith('/synced-images/') ||
    pathValue.startsWith('zdravo-image:')
  );
}

function publicRecipeImageUrl(recipe) {
  const explicitUrl = String(recipe.image_url || recipe.imageUrl || recipe.image || '').trim();
  if (/^https?:\/\//i.test(explicitUrl)) {
    return explicitUrl;
  }

  const templatePath = r2ImageTemplateValue(runtimeConfigValue([
    'R2_RECIPE_IMAGE_TEMPLATE',
    'CF_R2_RECIPE_IMAGE_TEMPLATE',
    'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_TEMPLATE',
    'recipeQrRecipeImageTemplate',
    'recipeImageTemplate'
  ]) || '{recipe_index}.png', recipe);
  const storedImagePath = String(recipe.image_path || explicitUrl || '').trim();
  const imagePath = String(isLocalEmailImagePath(storedImagePath) ? templatePath : storedImagePath || templatePath).trim();
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (isLocalEmailImagePath(imagePath)) {
    return '';
  }

  const r2RecipePrefix = String(runtimeConfigValue([
    'R2_RECIPE_IMAGE_PREFIX',
    'CF_R2_RECIPE_IMAGE_PREFIX',
    'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_PREFIX',
    'recipeQrRecipeImagePrefix',
    'recipeImagePrefix'
  ]) || 'epix-group_recipes-photo-1-70_2026-06-04_0734').replace(/^\/+|\/+$/g, '');

  const r2Url = publicR2ObjectUrl(r2RecipePrefix, imagePath);
  if (r2Url) {
    return r2Url;
  }

  const supabaseUrl = String(runtimeConfigValue([
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_PUBLIC_SUPABASE_URL',
    'supabaseUrl'
  ]) || '').trim().replace(/\/+$/, '');

  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/recipe-images/${encodeStoragePath(imagePath)}`;
  }

  return '';
}

function publicIngredientImageUrl(ingredient) {
  const explicitUrl = String(ingredient.image_url || ingredient.imageUrl || '').trim();
  if (/^https?:\/\//i.test(explicitUrl)) {
    return explicitUrl;
  }

  const templatePath = r2ImageTemplateValue(runtimeConfigValue([
    'R2_INGREDIENT_IMAGE_TEMPLATE',
    'CF_R2_INGREDIENT_IMAGE_TEMPLATE',
    'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_TEMPLATE',
    'recipeQrIngredientImageTemplate',
    'ingredientImageTemplate'
  ]) || '{ingredient_index}.png', ingredient);
  const storedImagePath = String(ingredient.image_path || explicitUrl || '').trim();
  const imagePath = String(isLocalEmailImagePath(storedImagePath) ? templatePath : storedImagePath || templatePath).trim();

  if (isLocalEmailImagePath(imagePath)) {
    return '';
  }

  const r2IngredientPrefix = String(runtimeConfigValue([
    'R2_INGREDIENT_IMAGE_PREFIX',
    'CF_R2_INGREDIENT_IMAGE_PREFIX',
    'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_PREFIX',
    'recipeQrIngredientImagePrefix',
    'ingredientImagePrefix'
  ]) || 'ingredient-images').replace(/^\/+|\/+$/g, '');
  const r2Url = publicR2ObjectUrl(r2IngredientPrefix, imagePath);
  if (r2Url) {
    return r2Url;
  }

  const supabaseUrl = String(runtimeConfigValue([
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_PUBLIC_SUPABASE_URL',
    'supabaseUrl'
  ]) || '').trim().replace(/\/+$/, '');

  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/ingredient-images/${encodeStoragePath(imagePath)}`;
  }

  return '';
}

function normalizeEmailIngredient(item) {
  if (typeof item === 'string') {
    return {
      id: '',
      name: item,
      imageUrl: '',
      image_path: '',
      amount: '',
      unit: ''
    };
  }

  const ingredient = {
    id: item?.id ?? item?.ingredient_id ?? '',
    name: item?.name ?? item?.name_sl ?? '',
    image_path: item?.image_path ?? '',
    amount: item?.amount ?? item?.quantity ?? '',
    unit: item?.unit ?? ''
  };

  return {
    ...ingredient,
    imageUrl: publicIngredientImageUrl(ingredient)
  };
}

function normalizeRecipeForEmail(recipe = {}) {
  const ingredients = parseJsonArray(recipe.ingredients).map(normalizeEmailIngredient);
  const steps = parseJsonArray(recipe.steps ?? recipe.steps_sl);
  const servings = recipe.servings ?? recipe.servings_text ?? recipe.servings_quantity ?? '';
  const prepTime = recipe.prep_time ?? recipe.prepTime ?? recipe.time_min ?? recipe.prep_time_min ?? '';

  return {
    id: recipe.id ?? '',
    title: recipe.title ?? recipe.name_sl ?? 'Recept',
    description: recipe.description ?? recipe.description_sl ?? '',
    imageUrl: publicRecipeImageUrl(recipe),
    shareUrl: String(recipe.qr_url || recipe.qrUrl || '').trim(),
    tip: recipe.dodatni_nasvet ?? recipe.additionalTip ?? '',
    prepTime,
    servings,
    difficulty: recipe.difficulty ?? '',
    ingredients,
    steps
  };
}

const emailPalette = {
  page: '#fff7ea',
  card: '#fffdf8',
  soft: '#fff6e8',
  greenSoft: '#eff9e5',
  border: '#eadcc7',
  greenBorder: '#d2e7c1',
  title: '#20242a',
  body: '#4f5b4a',
  muted: '#829274',
  brown: '#b3906a',
  green: '#719b44'
};

function emailMetaCardHtml(label, value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return `
    <td width="33.33%" style="padding:0 4px 8px 0; vertical-align:top;">
      <div style="min-height:42px; border:1px solid ${emailPalette.border}; border-radius:12px; background:${emailPalette.card}; padding:9px 8px; text-align:center;">
        <div style="font-size:10px; line-height:1.2; color:${emailPalette.green}; font-weight:800; text-transform:uppercase; letter-spacing:.2px;">${escapeHtml(label)}</div>
        <div style="font-size:13px; line-height:1.25; color:#283126; font-weight:900; margin-top:3px;">${escapeHtml(value)}</div>
      </div>
    </td>
  `;
}

function prepTimeText(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const text = String(value).trim();
  return /\bmin\b/i.test(text) ? text : `${text} min`;
}

function emailIngredientCardsHtml(ingredients) {
  if (!ingredients.length) {
    return `
      <tr>
        <td style="padding:12px; color:${emailPalette.body}; font-weight:700;">Sestavine niso navedene.</td>
      </tr>
    `;
  }

  const cells = ingredients.map((item) => {
    const amount = [item.amount, item.unit].filter(Boolean).join(' ').trim();
    const imageHtml = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" width="54" height="54" alt="${escapeHtml(item.name)}" style="display:block; width:54px; height:54px; border-radius:999px; object-fit:cover; border:0;" />`
      : `<div style="width:54px; height:54px; border-radius:999px; background:#eef3e8;"></div>`;

    return `
      <td width="50%" style="padding:5px; vertical-align:top;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0; min-height:76px; background:${emailPalette.soft}; border:1px solid #f1e2c8; border-radius:12px;">
          <tr>
            <td width="66" style="padding:10px 0 10px 10px; vertical-align:middle;">${imageHtml}</td>
            <td style="padding:10px 10px 10px 8px; vertical-align:middle;">
              <div style="color:#2d332d; font-size:13px; font-weight:800; line-height:1.2; word-break:normal; overflow-wrap:normal;">${escapeHtml(item.name)}</div>
              ${amount ? `<div style="margin-top:3px; color:${emailPalette.muted}; font-size:12px; font-weight:700; line-height:1.2;">${escapeHtml(amount)}</div>` : ''}
            </td>
          </tr>
        </table>
      </td>
    `;
  });

  const rows = [];
  for (let index = 0; index < cells.length; index += 2) {
    rows.push(`<tr>${cells[index]}${cells[index + 1] || '<td width="50%" style="padding:5px;"></td>'}</tr>`);
  }

  return rows.join('');
}

function emailMarketChipsHtml(ingredients) {
  return ingredients.slice(0, 5).map((item) => {
    const imageHtml = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" width="28" height="28" alt="${escapeHtml(item.name)}" style="display:block; width:28px; height:28px; border-radius:999px; object-fit:cover; border:0;" />`
      : `<span style="display:block; width:28px; height:28px; border-radius:999px; background:#f1e8d9;"></span>`;

    return `
      <td width="20%" style="padding:4px; vertical-align:top; text-align:center;">
        <div style="min-height:58px; padding:7px 4px; border:1px solid #ebdcc1; border-radius:10px; background:${emailPalette.card}; color:#5f5848; font-size:10px; font-weight:800; line-height:1.15;">
          <div style="display:inline-block; margin:0 auto 4px;">${imageHtml}</div>
          <div>${escapeHtml(item.name)}</div>
        </div>
      </td>
    `;
  }).join('');
}

function emailStepsHtml(steps) {
  if (!steps.length) {
    return `<p style="margin:0; color:${emailPalette.body};">Koraki priprave niso navedeni.</p>`;
  }

  return steps.map((step, index) => `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; border-bottom:${index === steps.length - 1 ? '0' : '1px solid #efe5d6'};">
      <tr>
        <td width="34" style="padding:10px 0; vertical-align:top;">
          <span style="display:inline-block; width:23px; height:23px; border-radius:999px; background:#eef7e7; color:${emailPalette.green}; font-size:12px; font-weight:900; line-height:23px; text-align:center;">${index + 1}</span>
        </td>
        <td style="padding:10px 0; color:#665f4e; font-size:14px; font-weight:600; line-height:1.55;">${escapeHtml(step)}</td>
      </tr>
    </table>
  `).join('');
}

function buildRecipeEmailHtml(recipe) {
  const imageHtml = recipe.imageUrl
    ? `
      <img src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}" width="640" height="230" style="display:block; width:100%; max-width:640px; height:230px; border:0; border-radius:16px 16px 0 0; object-fit:cover; object-position:center;" />
    `
    : `
      <div style="height:230px; border-radius:16px 16px 0 0; background:#f5efe1; color:${emailPalette.green}; padding:94px 24px; text-align:center; font-weight:800; box-sizing:border-box;">
        Slika recepta
      </div>
    `;
  const tipHtml = recipe.tip
    ? `
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:#f5fbef; border:1px solid #dcebcf; border-radius:18px;">
        <tr>
          <td style="padding:16px;">
            <h2 style="margin:0 0 8px; color:${emailPalette.title}; font-size:20px; line-height:1.15; font-weight:900;">Dodatni nasvet</h2>
            <p style="margin:0; color:#665f4e; font-size:14px; line-height:1.6;">${escapeHtml(recipe.tip)}</p>
          </td>
        </tr>
      </table>
    `
    : '';

  return `
    <!doctype html>
    <html>
      <body style="margin:0; padding:0; background:${emailPalette.page}; font-family:Arial, Helvetica, sans-serif; color:${emailPalette.title};">
        <div style="width:100%; background:${emailPalette.page}; padding:22px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:0 14px;">
                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 8px; color:#24251f; font-size:14px; font-weight:900;">Zdravo Jem</td>
                  </tr>
                  <tr>
                    <td>${imageHtml}</td>
                  </tr>
                </table>

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:-20px; background:${emailPalette.card}; border:1px solid ${emailPalette.border}; border-radius:18px; box-shadow:0 10px 24px rgba(68, 48, 22, 0.08);">
                  <tr>
                    <td style="padding:26px 20px 18px;">
                      <div style="color:${emailPalette.green}; font-size:11px; line-height:1; font-weight:900; text-transform:uppercase; letter-spacing:.4px; margin-bottom:8px;">Kuhinjski recept</div>
                      <h1 style="margin:0 0 10px; max-width:420px; color:${emailPalette.title}; font-size:34px; line-height:.98; font-weight:900;">${escapeHtml(recipe.title)}</h1>
                      ${recipe.description ? `<p style="margin:0; max-width:540px; color:${emailPalette.body}; font-size:14px; font-weight:700; line-height:1.45;">${escapeHtml(recipe.description)}</p>` : ''}
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:16px;">
                        <tr>
                          ${emailMetaCardHtml('Cas', prepTimeText(recipe.prepTime))}
                          ${emailMetaCardHtml('Porcije', recipe.servings)}
                          ${emailMetaCardHtml('Zahtevnost', recipe.difficulty)}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:${emailPalette.card}; border:1px solid ${emailPalette.border}; border-radius:18px; box-shadow:0 8px 18px rgba(68, 48, 22, 0.06);">
                  <tr>
                    <td style="padding:16px;">
                      <h2 style="margin:0 0 8px; color:${emailPalette.title}; font-size:21px; line-height:1.15; font-weight:900;">Sestavine</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        ${emailIngredientCardsHtml(recipe.ingredients)}
                      </table>
                    </td>
                  </tr>
                </table>

                ${recipe.ingredients.length ? `
                  <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:${emailPalette.greenSoft}; border:1px solid ${emailPalette.greenBorder}; border-radius:18px;">
                    <tr>
                      <td style="padding:16px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:8px;">
                          <tr>
                            <td style="color:${emailPalette.title}; font-size:20px; font-weight:900; line-height:1.15;">Sestavine iz tr&#382;nice</td>
                            <td align="right" style="color:#5d7b41; font-size:11px; font-weight:800;">Sve&#382;a izbira</td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                          <tr>${emailMarketChipsHtml(recipe.ingredients)}</tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                ` : ''}

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:${emailPalette.card}; border:1px solid ${emailPalette.border}; border-radius:18px; box-shadow:0 8px 18px rgba(68, 48, 22, 0.06);">
                  <tr>
                    <td style="padding:16px;">
                      <h2 style="margin:0 0 8px; color:${emailPalette.title}; font-size:21px; line-height:1.15; font-weight:900;">Koraki</h2>
                      ${emailStepsHtml(recipe.steps)}
                    </td>
                  </tr>
                </table>

                ${tipHtml}

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:collapse;">
                  <tr>
                    <td style="padding:18px 8px 0; text-align:center; color:#665f4e; font-size:12px; font-weight:700; line-height:1.4;">
                      Recept poslan z Zdravo Jem kioska &middot; Ob&#269;ina Sevnica
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
}

function buildRecipeEmailText(recipe) {
  const metaLines = [
    prepTimeText(recipe.prepTime) ? `Priprava: ${prepTimeText(recipe.prepTime)}` : '',
    recipe.servings ? `Porcije: ${recipe.servings}` : '',
    recipe.difficulty ? `Zahtevnost: ${recipe.difficulty}` : '',
    recipe.shareUrl ? `Stran recepta: ${recipe.shareUrl}` : ''
  ].filter(Boolean);
  const ingredientLines = recipe.ingredients.length
    ? recipe.ingredients.map((item) => {
      const amount = [item.amount, item.unit].filter(Boolean).join(' ').trim();
      return `- ${item.name}${amount ? ` (${amount})` : ''}`;
    })
    : ['- Sestavine niso navedene.'];
  const stepLines = recipe.steps.length
    ? recipe.steps.map((step, index) => `${index + 1}. ${step}`)
    : ['1. Koraki priprave niso navedeni.'];

  return [
    'Zdravo Jem',
    'Lokalni recepti za zdrav kroznik',
    '',
    recipe.title,
    recipe.description,
    '',
    ...metaLines,
    '',
    'Sestavine:',
    ...ingredientLines,
    '',
    'Postopek:',
    ...stepLines,
    '',
    'Recept poslan z Zdravo Jem kioska - Obcina Sevnica'
  ]
    .filter((line) => line !== undefined && line !== null && line !== '')
    .join('\n');
}

function shouldAutoDownloadPublicRecipe() {
  const rawValue = runtimeConfigValue([
    'ZDRAVO_PUBLIC_RECIPE_AUTO_DOWNLOAD',
    'PUBLIC_RECIPE_AUTO_DOWNLOAD',
    'publicRecipeAutoDownload'
  ]);

  if (!String(rawValue || '').trim()) {
    return true;
  }

  return !/^(0|false|no|off)$/i.test(String(rawValue).trim());
}

async function buildRecipeShareUrl(recipeId, options = {}) {
  const normalizedRecipeId = Number(recipeId);
  if (!Number.isInteger(normalizedRecipeId) || normalizedRecipeId <= 0) {
    throw new Error('Invalid recipe id');
  }

  const recipe = db.prepare('SELECT id, qr_url FROM recipes WHERE id = ? LIMIT 1').get(normalizedRecipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  const locale = options.locale === 'en' ? 'en' : 'sl';
  const selectedIngredients = Array.isArray(options.selectedIngredients)
    ? options.selectedIngredients
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 100)
    : [];
  const configuredQrUrl = String(recipe?.qr_url || '').trim();

  if (!configuredQrUrl) {
    throw new Error('Recipe QR page is not ready yet');
  }

  const staticUrl = new URL(configuredQrUrl);
  if (!/^https?:$/.test(staticUrl.protocol)) {
    throw new Error('Recipe QR URL must be an HTTP URL');
  }

  staticUrl.searchParams.set('locale', locale);

  if (selectedIngredients.length) {
    staticUrl.searchParams.set('selected', encodeBase64Url(JSON.stringify(selectedIngredients)));
  }

  if (shouldAutoDownloadPublicRecipe()) {
    staticUrl.searchParams.set('download', '1');
  }

  return staticUrl.toString();
}

function registerImageProtocol() {
  protocol.handle('zdravo-image', (request) => {
    try {
      const url = new URL(request.url);
      const bucket = url.hostname;
      const imagePath = decodeURIComponent(url.pathname.replace(/^\/+/, ''));

      if (!bucket || !imagePath) {
        return new Response('Invalid image URL', { status: 400 });
      }

      const localPath = getLocalImagePath(app, bucket, imagePath);

      if (!fs.existsSync(localPath)) {
        return new Response('Image not found', { status: 404 });
      }

      return net.fetch(pathToFileURL(localPath).toString());
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  });
}

const TRANSIENT_NETWORK_CODES = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EHOSTUNREACH'
]);

function isTransientNetworkError(error) {
  if (!error) {
    return false;
  }

  const code = error.code || error.cause?.code;
  if (code && TRANSIENT_NETWORK_CODES.has(code)) {
    return true;
  }

  const message = String(error.message || '');
  return TRANSIENT_NETWORK_CODES.has(message.split(' ')[0]) ||
    /getaddrinfo|ENOTFOUND|EAI_AGAIN|network|socket hang up/i.test(message);
}

function isGoogleOAuthInvalidGrant(error) {
  return error?.response?.data?.error === 'invalid_grant' ||
    error?.cause?.message === 'invalid_grant' ||
    error?.message === 'invalid_grant';
}

function logEmailSendError(error) {
  console.error('Failed to send email:', {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    googleError: error?.response?.data?.error,
    googleDescription: error?.response?.data?.error_description
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, { retries = 3, baseDelayMs = 1000 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries || !isTransientNetworkError(error)) {
        throw error;
      }

      const wait = baseDelayMs * 2 ** attempt;
      console.warn(
        `Transient network error (${error.code || error.message}); retrying in ${wait}ms (attempt ${attempt + 1}/${retries})`
      );
      await delay(wait);
    }
  }

  throw lastError;
}

async function sendRecipeEmailWithGmailSmtp({ gmailUser, gmailAppPassword, toEmail, recipe, htmlBody, textBody }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  });

  await withRetry(() => transporter.sendMail({
    from: `"Zdravo Jem" <${gmailUser}>`,
    to: toEmail,
    subject: `Recept: ${recipe.title}`,
    text: textBody,
    html: htmlBody
  }));
}

function registerIpc() {
  ipcMain.handle('db:query', (event, { sql, params }) => {
    if (typeof sql !== 'string') {
      throw new Error('Invalid SQL');
    }
    const trimmed = sql.trim().toLowerCase();
    if (!trimmed.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }
    const stmt = db.prepare(sql);
    return stmt.all(params || []);
  });

  ipcMain.handle('shell:open-external', (_event, url) => {
    if (typeof url !== 'string') {
      throw new Error('Invalid external URL');
    }

    const trimmed = url.trim();
    if (!/^(mailto:|https?:)/i.test(trimmed)) {
      throw new Error('Unsupported external URL');
    }

    return shell.openExternal(trimmed);
  });

  ipcMain.handle('send-recipe-email', async (event, { toEmail, recipe }) => {
    try {
      const gmailClientId = runtimeConfigValue(['GMAIL_CLIENT_ID']);
      const gmailClientSecret = runtimeConfigValue(['GMAIL_CLIENT_SECRET']);
      const gmailRefreshToken = runtimeConfigValue(['GMAIL_REFRESH_TOKEN']);
      const gmailAppPassword = runtimeConfigValue(['GMAIL_APP_PASSWORD']);
      const gmailUser = runtimeConfigValue(['GMAIL_USER']);

      if (!gmailUser) {
        throw new Error('Gmail sender address is not configured.');
      }

      const emailRecipe = normalizeRecipeForEmail(recipe);
      const htmlBody = buildRecipeEmailHtml(emailRecipe);
      const textBody = buildRecipeEmailText(emailRecipe);

      if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
        if (!gmailAppPassword) {
          throw new Error('Gmail credentials are not configured.');
        }

        await sendRecipeEmailWithGmailSmtp({
          gmailUser,
          gmailAppPassword,
          toEmail,
          recipe: emailRecipe,
          htmlBody,
          textBody
        });

        return { success: true };
      }

      const oauth2Client = new google.auth.OAuth2(gmailClientId, gmailClientSecret);
      oauth2Client.setCredentials({
        refresh_token: gmailRefreshToken
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const emailLines = [
        `From: "Zdravo Jem" <${gmailUser}>`,
        `To: ${toEmail}`,
        `Subject: Recept: ${emailRecipe.title}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        htmlBody
      ];

      const email = emailLines.join('\n');
      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      try {
        await withRetry(() => gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: encodedEmail }
        }));
      } catch (error) {
        if (!isGoogleOAuthInvalidGrant(error) || !gmailAppPassword) {
          throw error;
        }

        console.warn('Gmail OAuth refresh token is invalid; retrying email with Gmail app password.');
        await sendRecipeEmailWithGmailSmtp({
          gmailUser,
          gmailAppPassword,
          toEmail,
          recipe: emailRecipe,
          htmlBody,
          textBody
        });
      }

      return { success: true };
    } catch (error) {
      logEmailSendError(error);

      if (isTransientNetworkError(error)) {
        return {
          success: false,
          error: 'Trenutno ni povezave z internetom. Poskusite znova \u010Dez nekaj trenutkov.'
        };
      }

      if (isGoogleOAuthInvalidGrant(error)) {
        return {
          success: false,
          error: 'Prijava v Gmail je potekla. Ustvarite nov Gmail refresh token ali nastavite Gmail app password.'
        };
      }

      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('qr:generate-svg', (_event, text, options = {}) => {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Invalid QR payload');
    }

    return QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#F7F3EC'
      },
      ...options
    });
  });

  ipcMain.handle('recipe-share:get-url', (_event, { recipeId, options } = {}) => (
    buildRecipeShareUrl(recipeId, options)
  ));

  ipcMain.handle('sync:run', (_event, trigger = 'manual', options = {}) => {
    if (!syncManager) {
      return { ok: false, message: 'Sync is not initialized.' };
    }

    return syncManager.runSync(trigger, options);
  });

  ipcMain.handle('sync:status', () => {
    if (!syncManager) {
      return { ok: false, message: 'Sync is not initialized.' };
    }

    return syncManager.getStatus();
  });
}

function closeDatabase() {
  if (!db) {
    return;
  }

  try {
    db.close();
  } catch (error) {
    console.warn('Failed to close database cleanly', error);
  } finally {
    db = undefined;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: '#2C4220',
    icon: path.join(__dirname, 'assets', 'icons', 'zdravo-jem-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  win.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (!app.isPackaged) {
      return;
    }
    const key = (input.key || '').toLowerCase();
    const isBlocked =
      key === 'f12' ||
      key === 'f5' ||
      (input.control && key === 'r') ||
      (input.control && input.shift && key === 'i') ||
      (input.alt && key === 'f4') ||
      input.control ||
      input.alt ||
      input.meta;

    if (isBlocked) {
      event.preventDefault();
    }
  });
}

function relaunchApp() {
  if (!app.isPackaged || isQuitting) {
    return;
  }

  app.relaunch();
  app.exit(0);
}

function shouldRelaunch(details) {
  if (isQuitting) {
    return false;
  }

  const reason = details?.reason;
  return Boolean(reason) && reason !== 'clean-exit' && reason !== 'killed';
}

app.whenReady().then(() => {
  initDatabase();
  syncManager = createSupabaseSync({
    app,
    db,
    notify: notifySyncStatus
  });
  registerImageProtocol();
  registerIpc();
  createWindow();
  syncManager.runSync('startup').catch((error) => {
    console.warn('Startup sync failed', error);
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  closeDatabase();
});

app.on('render-process-gone', (_event, _webContents, details) => {
  if (shouldRelaunch(details)) {
    relaunchApp();
  }
});

app.on('child-process-gone', (_event, details) => {
  if (shouldRelaunch(details)) {
    relaunchApp();
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', error);
  if (!isQuitting) {
    relaunchApp();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
