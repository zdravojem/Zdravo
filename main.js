const { app, BrowserWindow, ipcMain, net, protocol, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const Database = require('better-sqlite3');
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
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

function publicRecipeImageUrl(recipe) {
  const explicitUrl = String(recipe.image_url || recipe.imageUrl || recipe.image || '').trim();
  if (/^https?:\/\//i.test(explicitUrl)) {
    return explicitUrl;
  }

  const imagePath = String(recipe.image_path || explicitUrl || '').trim();
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (!imagePath || imagePath.startsWith('assets/')) {
    return '';
  }

  const r2BaseUrl = String(runtimeConfigValue([
    'R2_PUBLIC_BASE_URL',
    'CF_PUBLIC_BASE_URL',
    'publicBaseUrl'
  ]) || '').trim().replace(/\/+$/, '');
  const r2RecipePrefix = String(runtimeConfigValue([
    'R2_RECIPE_IMAGE_PREFIX',
    'CF_R2_RECIPE_IMAGE_PREFIX',
    'recipeImagePrefix'
  ]) || 'recipe-images').replace(/^\/+|\/+$/g, '');

  if (r2BaseUrl) {
    return `${r2BaseUrl}/${r2RecipePrefix}/${encodeStoragePath(imagePath)}`;
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

function normalizeEmailIngredient(item) {
  if (typeof item === 'string') {
    return {
      name: item,
      amount: '',
      unit: ''
    };
  }

  return {
    name: item?.name ?? item?.name_sl ?? '',
    amount: item?.amount ?? item?.quantity ?? '',
    unit: item?.unit ?? ''
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
    prepTime,
    servings,
    difficulty: recipe.difficulty ?? '',
    ingredients,
    steps
  };
}

function metaCardHtml(label, value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return `
    <td style="padding:6px; width:33.33%;">
      <div style="background:#f1f8e9; border:1px solid #a5d6a7; border-radius:10px; padding:12px 10px; text-align:center;">
        <div style="font-size:11px; line-height:1.2; color:#2e7d32; font-weight:700; text-transform:uppercase;">${label}</div>
        <div style="font-size:15px; line-height:1.35; color:#1b5e20; font-weight:700; margin-top:4px;">${escapeHtml(value)}</div>
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

function ingredientRowsHtml(ingredients) {
  if (!ingredients.length) {
    return `
      <tr>
        <td colspan="3" style="padding:12px; border-bottom:1px solid #e0e0e0; color:#5f6f52;">Sestavine niso navedene.</td>
      </tr>
    `;
  }

  return ingredients
    .map((item) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e0e0e0; color:#1f2d1b; font-weight:700;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e0e0e0; color:#4f5f49; text-align:right;">${escapeHtml(item.amount)}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e0e0e0; color:#4f5f49;">${escapeHtml(item.unit)}</td>
      </tr>
    `)
    .join('');
}

function stepsHtml(steps) {
  if (!steps.length) {
    return '<p style="margin:0; color:#5f6f52;">Koraki priprave niso navedeni.</p>';
  }

  return `
    <ol style="margin:0; padding:0 0 0 22px; color:#1f2d1b;">
      ${steps.map((step) => `
        <li style="margin:0 0 12px 0; padding-left:4px; line-height:1.55;">${escapeHtml(step)}</li>
      `).join('')}
    </ol>
  `;
}

function buildRecipeEmailHtml(recipe) {
  const imageHtml = recipe.imageUrl
    ? `
      <img src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}" style="display:block; width:100%; max-width:600px; height:auto; border:0;" />
    `
    : `
      <div style="background:#f1f8e9; color:#2e7d32; padding:42px 24px; text-align:center; font-weight:700;">
        Slika recepta
      </div>
    `;

  return `
    <!doctype html>
    <html>
      <body style="margin:0; padding:0; background:#edf4e8; font-family:Arial, sans-serif; color:#1f2d1b;">
        <div style="width:100%; background:#edf4e8; padding:24px 0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden;">
            <div style="background:#2e7d32; color:#ffffff; padding:26px 28px; text-align:center;">
              <div style="font-size:28px; font-weight:800; line-height:1.1;">Zdravo Jem</div>
              <div style="font-size:14px; line-height:1.4; margin-top:8px;">Lokalni recepti za zdrav kro&#382;nik</div>
            </div>

            ${imageHtml}

            <div style="padding:28px;">
              <h1 style="font-size:28px; line-height:1.2; margin:0 0 12px; color:#1b5e20;">${escapeHtml(recipe.title)}</h1>
              <p style="font-size:16px; line-height:1.55; margin:0 0 20px; color:#4f5f49;">${escapeHtml(recipe.description)}</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:0 0 24px;">
                <tr>
                  ${metaCardHtml('Priprava', prepTimeText(recipe.prepTime))}
                  ${metaCardHtml('Porcije', recipe.servings)}
                  ${metaCardHtml('Zahtevnost', recipe.difficulty)}
                </tr>
              </table>

              <h2 style="font-size:20px; line-height:1.25; margin:0 0 12px; color:#2e7d32;">Sestavine</h2>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; border:1px solid #d7e8cf; margin:0 0 26px;">
                <thead>
                  <tr>
                    <th align="left" style="background:#f1f8e9; color:#2e7d32; padding:10px 12px; font-size:13px;">Ime</th>
                    <th align="right" style="background:#f1f8e9; color:#2e7d32; padding:10px 12px; font-size:13px;">Koli&#269;ina</th>
                    <th align="left" style="background:#f1f8e9; color:#2e7d32; padding:10px 12px; font-size:13px;">Enota</th>
                  </tr>
                </thead>
                <tbody>
                  ${ingredientRowsHtml(recipe.ingredients)}
                </tbody>
              </table>

              <h2 style="font-size:20px; line-height:1.25; margin:0 0 12px; color:#2e7d32;">Postopek</h2>
              ${stepsHtml(recipe.steps)}
            </div>

            <div style="background:#2e7d32; color:#ffffff; padding:18px 24px; text-align:center; font-size:13px; line-height:1.4;">
              Recept poslan z Zdravo Jem kioska &middot; Ob&#269;ina Sevnica
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildRecipeEmailText(recipe) {
  const metaLines = [
    prepTimeText(recipe.prepTime) ? `Priprava: ${prepTimeText(recipe.prepTime)}` : '',
    recipe.servings ? `Porcije: ${recipe.servings}` : '',
    recipe.difficulty ? `Zahtevnost: ${recipe.difficulty}` : ''
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
    .filter((line) => line !== undefined && line !== null)
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
      const gmailUser = runtimeConfigValue(['GMAIL_USER']);

      if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
        throw new Error('Gmail credentials are not configured.');
      }

      const oauth2Client = new google.auth.OAuth2(gmailClientId, gmailClientSecret);

      oauth2Client.setCredentials({
        refresh_token: gmailRefreshToken
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const htmlBody = buildRecipeEmailHtml(recipe);

      const emailLines = [
        `From: "Zdravo Jem" <${gmailUser}>`,
        `To: ${toEmail}`,
        `Subject: Recept: ${recipe.title}`,
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

      await withRetry(() => gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail }
      }));

      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);

      if (isTransientNetworkError(error)) {
        return {
          success: false,
          error: 'Trenutno ni povezave z internetom. Poskusite znova \u010Dez nekaj trenutkov.'
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
        dark: '#6B4423',
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
