#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { HeadObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const appDir = path.resolve(__dirname, '..');
const shareDir = path.join(appDir, 'recipe-share');
const defaultOutputDir = path.join(appDir, 'dist', 'recipe-qr-pages');

function parseArgs(argv) {
  const options = {
    dryRun: false,
    force: false,
    help: false,
    recipeIds: []
  };

  argv.forEach((arg) => {
    if (arg === '--dry-run') {
      options.dryRun = true;
      return;
    }

    if (arg === '--force') {
      options.force = true;
      return;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      return;
    }

    const recipeIdMatch = /^--recipe-id=(\d+)$/.exec(arg);
    if (recipeIdMatch) {
      options.recipeIds.push(Number(recipeIdMatch[1]));
    }
  });

  return options;
}

function printHelp() {
  console.log(`
Generate standalone recipe HTML files, upload them to Cloudflare R2/S3, and
write the public object URL back to Supabase recipes.qr_url.

Usage:
  npm run recipe-qr:sync
  npm run recipe-qr:sync -- --dry-run
  npm run recipe-qr:sync -- --recipe-id=123

Options:
  --dry-run       Generate files locally without uploading or updating Supabase.
  --force         Upload even when qr_url already matches the generated object URL.
  --recipe-id=N   Limit the run to one recipe. Can be repeated.
`);
}

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

function parseJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {};
  }
}

function readConfigFiles() {
  return [
    path.join(appDir, '..', 'admin', 'recipe-admin', '.env.local'),
    path.join(appDir, '.env.local'),
    path.join(appDir, '.env'),
    path.join(appDir, 'supabase-config.json')
  ].reduce((values, filePath) => {
    const nextValues = filePath.endsWith('.json') ? parseJsonFile(filePath) : parseEnvFile(filePath);
    return { ...values, ...nextValues };
  }, {});
}

function firstValue(values, names) {
  return names
    .map((name) => process.env[name] || values[name] || values[name[0].toLowerCase() + name.slice(1)])
    .find((value) => String(value || '').trim()) || '';
}

function boolValue(value, defaultValue = false) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return defaultValue;
  }

  return /^(1|true|yes|on)$/i.test(trimmed);
}

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function r2EndpointFromUrl(value) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) {
    return '';
  }

  try {
    const url = new URL(normalized);
    return /\.r2\.cloudflarestorage\.com$/i.test(url.hostname) ? url.origin : '';
  } catch (error) {
    return '';
  }
}

function resolveR2Endpoint(values, accountId) {
  const explicitEndpoint = normalizeBaseUrl(firstValue(values, [
    'R2_ENDPOINT',
    'CF_R2_ENDPOINT',
    'S3_ENDPOINT',
    'r2Endpoint',
    's3Endpoint'
  ]));

  if (explicitEndpoint) {
    return explicitEndpoint;
  }

  const publicEndpoint = r2EndpointFromUrl(firstValue(values, [
    'R2_PUBLIC_BASE_URL',
    'CF_PUBLIC_BASE_URL',
    'S3_PUBLIC_BASE_URL',
    'ZDRAVO_RECIPE_QR_PUBLIC_BASE_URL',
    'r2PublicBaseUrl',
    'recipeQrPublicBaseUrl'
  ]));

  if (publicEndpoint) {
    return publicEndpoint;
  }

  if (!accountId) {
    return '';
  }

  const jurisdiction = String(firstValue(values, [
    'R2_JURISDICTION',
    'CF_R2_JURISDICTION',
    'r2Jurisdiction'
  ]) || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  const jurisdictionPart = jurisdiction ? `.${jurisdiction}` : '';
  return `https://${accountId}${jurisdictionPart}.r2.cloudflarestorage.com`;
}

function loadConfig() {
  const values = readConfigFiles();
  const accountId = firstValue(values, [
    'R2_ACCOUNT_ID',
    'CLOUDFLARE_ACCOUNT_ID',
    'CF_ACCOUNT_ID',
    'cloudflareAccountId',
    'r2AccountId'
  ]);
  const endpoint = resolveR2Endpoint(values, accountId);
  const publicBaseUrl = normalizeBaseUrl(firstValue(values, [
    'R2_PUBLIC_BASE_URL',
    'CF_PUBLIC_BASE_URL',
    'S3_PUBLIC_BASE_URL',
    'ZDRAVO_RECIPE_QR_PUBLIC_BASE_URL',
    'r2PublicBaseUrl',
    'recipeQrPublicBaseUrl'
  ]));
  const explicitImageMode = String(firstValue(values, [
    'ZDRAVO_RECIPE_QR_IMAGE_MODE',
    'RECIPE_QR_IMAGE_MODE',
    'recipeQrImageMode'
  ]) || '').trim().toLowerCase();

  return {
    ingredientImageBucket: firstValue(values, ['INGREDIENT_IMAGE_BUCKET', 'ingredientImageBucket']) || 'ingredient-images',
    imageMode: explicitImageMode || (publicBaseUrl ? 'r2-url' : 'embed'),
    locale: firstValue(values, ['ZDRAVO_RECIPE_QR_LOCALE', 'recipeQrLocale']) === 'en' ? 'en' : 'sl',
    outputDir: path.resolve(firstValue(values, ['ZDRAVO_RECIPE_QR_OUTPUT', 'recipeQrOutput']) || defaultOutputDir),
    recipeImageBucket: firstValue(values, ['RECIPE_IMAGE_BUCKET', 'recipeImageBucket']) || 'recipe-images',
    r2: {
      accessKeyId: firstValue(values, ['R2_ACCESS_KEY_ID', 'CF_R2_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID', 'r2AccessKeyId']),
      bucket: firstValue(values, ['R2_BUCKET', 'CF_R2_BUCKET', 'S3_BUCKET', 'AWS_BUCKET', 'r2Bucket']),
      cacheControl: firstValue(values, ['R2_CACHE_CONTROL', 'recipeQrCacheControl']) || 'public, max-age=300',
      endpoint,
      forcePathStyle: boolValue(firstValue(values, ['R2_FORCE_PATH_STYLE', 'S3_FORCE_PATH_STYLE', 'r2ForcePathStyle']), false),
      publicBaseUrl,
      region: firstValue(values, ['R2_REGION', 'AWS_REGION', 'r2Region']) || 'auto',
      secretAccessKey: firstValue(values, ['R2_SECRET_ACCESS_KEY', 'CF_R2_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY', 'r2SecretAccessKey']),
      prefix: String(firstValue(values, ['R2_RECIPE_PREFIX', 'ZDRAVO_RECIPE_QR_PREFIX', 'recipeQrPrefix']) || 'recipes')
        .trim()
        .replace(/^\/+|\/+$/g, ''),
      recipeImagePrefix: String(firstValue(values, ['R2_RECIPE_IMAGE_PREFIX', 'CF_R2_RECIPE_IMAGE_PREFIX', 'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_PREFIX', 'recipeQrRecipeImagePrefix']) || 'epix-group_recipes-photo-1-70_2026-06-04_0734')
        .trim()
        .replace(/^\/+|\/+$/g, ''),
      ingredientImagePrefix: String(firstValue(values, ['R2_INGREDIENT_IMAGE_PREFIX', 'CF_R2_INGREDIENT_IMAGE_PREFIX', 'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_PREFIX', 'recipeQrIngredientImagePrefix']) || 'ingredient-images')
        .trim()
        .replace(/^\/+|\/+$/g, ''),
      recipeImageTemplate: String(firstValue(values, ['R2_RECIPE_IMAGE_TEMPLATE', 'CF_R2_RECIPE_IMAGE_TEMPLATE', 'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_TEMPLATE', 'recipeQrRecipeImageTemplate']) || '{recipe_index}.png').trim(),
      ingredientImageTemplate: String(firstValue(values, ['R2_INGREDIENT_IMAGE_TEMPLATE', 'CF_R2_INGREDIENT_IMAGE_TEMPLATE', 'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_TEMPLATE', 'recipeQrIngredientImageTemplate']) || '{ingredient_index}.png').trim()
    },
    supabase: {
      anonKey: firstValue(values, [
        'SUPABASE_ANON_KEY',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
        'anonKey',
        'supabaseAnonKey'
      ]),
      serviceKey: firstValue(values, [
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_SERVICE_KEY',
        'supabaseServiceRoleKey',
        'serviceRoleKey'
      ]),
      url: normalizeBaseUrl(firstValue(values, [
        'SUPABASE_URL',
        'VITE_SUPABASE_URL',
        'VITE_PUBLIC_SUPABASE_URL',
        'url',
        'supabaseUrl'
      ]))
    }
  };
}

function validateConfig(config, options) {
  const missing = [];
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.anonKey && !config.supabase.serviceKey) missing.push('SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');

  if (!options.dryRun) {
    if (!config.supabase.serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!config.r2.endpoint) missing.push('R2_ACCOUNT_ID or R2_ENDPOINT');
    if (!config.r2.accessKeyId) missing.push('R2_ACCESS_KEY_ID');
    if (!config.r2.secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
    if (!config.r2.bucket) missing.push('R2_BUCKET');
    if (!config.r2.publicBaseUrl) missing.push('R2_PUBLIC_BASE_URL');
  }

  if (missing.length) {
    throw new Error(`Missing required config: ${missing.join(', ')}`);
  }
}

function supabaseHeaders(config, forUpdate = false) {
  const key = forUpdate
    ? (config.supabase.serviceKey || config.supabase.anonKey)
    : (config.supabase.anonKey || config.supabase.serviceKey);

  return {
    apikey: key,
    authorization: `Bearer ${key}`
  };
}

async function supabaseRequest(config, pathname, searchParams = {}, options = {}) {
  const url = new URL(`${config.supabase.url}${pathname}`);
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const headers = {
    ...supabaseHeaders(config, options.forUpdate),
    ...(options.headers || {})
  };

  let body;
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), {
    body,
    headers,
    method: options.method || 'GET'
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function mimeTypeForPath(filePath) {
  const ext = path.extname(String(filePath || '').toLowerCase());
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function encodeStoragePath(imagePath) {
  return String(imagePath || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

async function storageObjectDataUrl(config, bucket, imagePath) {
  const normalizedPath = String(imagePath || '').trim();
  if (!normalizedPath || normalizedPath.startsWith('assets/') || /^(data:|https?:\/\/)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  const url = `${config.supabase.url}/storage/v1/object/${bucket}/${encodeStoragePath(normalizedPath)}`;
  const response = await fetch(url, {
    headers: supabaseHeaders(config, true)
  });

  if (!response.ok) {
    throw new Error(`Storage image fetch failed (${response.status}) for ${bucket}/${normalizedPath}: ${await response.text()}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || mimeTypeForPath(normalizedPath);
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

function r2AssetUrl(config, prefix, imagePath) {
  const normalizedPath = String(imagePath || '').trim().replace(/^\/+/, '');
  if (!normalizedPath || normalizedPath.startsWith('assets/') || /^(data:|https?:\/\/)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  return publicUrlForKey(
    config.r2.publicBaseUrl || 'https://example.invalid',
    [prefix, normalizedPath].filter(Boolean).join('/')
  );
}

function templateValue(template, item) {
  const slug = safeFileName(item.slug || item.name_sl || item.id);
  const id = Number(item.id || item.ingredient_id);
  const recipeIndex = Number.isInteger(id) && id >= 76 && id <= 145 ? String(id - 75) : '';
  const ingredientIndex = Number.isInteger(id)
    ? String(id >= 222 && id <= 257 ? id - 116 : id >= 117 ? id - 116 : id >= 12 ? id - 11 : id)
    : '';

  return String(template || '')
    .replace(/\{id\}/g, safeFileName(item.id || item.ingredient_id || ''))
    .replace(/\{recipe_index\}/g, safeFileName(recipeIndex))
    .replace(/\{ingredient_index\}/g, safeFileName(ingredientIndex))
    .replace(/\{slug\}/g, slug)
    .replace(/\{name\}/g, slug)
    .replace(/\{image_path\}/g, String(item.image_path || '').replace(/^\/+/, ''));
}

function r2AssetUrlForItem(config, prefix, item, template, options = {}) {
  const explicitPath = String(item.image_path || '').trim();
  const templatedPath = templateValue(template, item);
  const imagePath = options.preferTemplate ? (templatedPath || explicitPath) : (explicitPath || templatedPath);
  return r2AssetUrl(config, prefix, imagePath);
}

async function inlineRecipeImages(config, recipe) {
  const nextRecipe = {
    ...recipe,
    ingredients: (recipe.ingredients || []).map((ingredient) => ({ ...ingredient }))
  };

  if (config.imageMode === 'r2-url' || config.imageMode === 'r2') {
    const recipeId = Number(recipe.id);
    nextRecipe.image_path = r2AssetUrlForItem(config, config.r2.recipeImagePrefix, recipe, config.r2.recipeImageTemplate, {
      preferTemplate: Number.isInteger(recipeId) && recipeId >= 76 && recipeId <= 145
    });
    nextRecipe.ingredients.forEach((ingredient) => {
      ingredient.image_path = r2AssetUrlForItem(config, config.r2.ingredientImagePrefix, ingredient, config.r2.ingredientImageTemplate);
    });
    return nextRecipe;
  }

  try {
    nextRecipe.image_path = await storageObjectDataUrl(config, config.recipeImageBucket, recipe.image_path);
  } catch (error) {
    console.warn(`Recipe image could not be embedded for ${recipe.id}: ${error.message}`);
  }

  for (const ingredient of nextRecipe.ingredients) {
    try {
      ingredient.image_path = await storageObjectDataUrl(config, config.ingredientImageBucket, ingredient.image_path);
    } catch (error) {
      console.warn(`Ingredient image could not be embedded for recipe ${recipe.id}, ingredient ${ingredient.id}: ${error.message}`);
    }
  }

  return nextRecipe;
}

function chunk(items, size) {
  const groups = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
}

async function fetchRecipes(config, options) {
  const recipeParams = {
    order: 'id.asc',
    select: '*'
  };

  if (options.recipeIds.length) {
    recipeParams.id = `in.(${options.recipeIds.join(',')})`;
  }

  const recipes = await supabaseRequest(config, '/rest/v1/recipes', recipeParams);
  const recipeIds = recipes.map((recipe) => Number(recipe.id)).filter((id) => Number.isInteger(id));
  const linkRows = [];

  for (const recipeIdChunk of chunk(recipeIds, 100)) {
    if (!recipeIdChunk.length) {
      continue;
    }

    const rows = await supabaseRequest(config, '/rest/v1/recipe_ingredients', {
      order: 'recipe_id.asc,ingredient_id.asc',
      recipe_id: `in.(${recipeIdChunk.join(',')})`,
      select: 'recipe_id,ingredient_id,quantity,unit,is_optional'
    });
    linkRows.push(...rows);
  }

  const ingredients = await supabaseRequest(config, '/rest/v1/ingredients', {
    order: 'id.asc',
    select: 'id,name_sl,image_path'
  });
  const ingredientsById = new Map(ingredients.map((ingredient) => [Number(ingredient.id), ingredient]));
  const linksByRecipeId = new Map();

  linkRows.forEach((link) => {
    const recipeId = Number(link.recipe_id);
    if (!linksByRecipeId.has(recipeId)) {
      linksByRecipeId.set(recipeId, []);
    }

    linksByRecipeId.get(recipeId).push(link);
  });

  return recipes.map((recipe) => {
    const recipeLinks = linksByRecipeId.get(Number(recipe.id)) || [];
    return {
      ...recipe,
      ingredients: recipeLinks
        .map((link) => {
          const ingredient = ingredientsById.get(Number(link.ingredient_id)) || {};
          return {
            ...link,
            id: link.ingredient_id,
            image_path: ingredient.image_path || '',
            name_sl: ingredient.name_sl || ''
          };
        })
        .filter((ingredient) => ingredient.name_sl)
    };
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function escapeScriptText(value) {
  return String(value || '').replace(/<\/script/gi, '<\\/script');
}

function safeFileName(value) {
  return String(value || 'recipe')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'recipe';
}

function objectKeyForRecipe(recipe, config) {
  const fileName = `${safeFileName(recipe.slug || recipe.name_sl || recipe.id)}.html`;
  return [config.r2.prefix, fileName].filter(Boolean).join('/');
}

function publicUrlForKey(publicBaseUrl, key) {
  const encodedKey = String(key || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

  return `${publicBaseUrl.replace(/\/+$/, '')}/${encodedKey}`;
}

function readShareAssets() {
  return {
    appJs: fs.readFileSync(path.join(shareDir, 'app.js'), 'utf8'),
    css: fs.readFileSync(path.join(shareDir, 'styles.css'), 'utf8')
  };
}

function buildStandaloneRecipeHtml(recipe, config, assets, publicUrl) {
  const title = recipe.name_sl || 'Zdravo Jem';
  const payload = {
    autoDownload: false,
    locale: config.locale,
    recipe,
    selectedIngredients: []
  };
  const browserConfig = {
    ingredientImageBucket: config.ingredientImageBucket,
    recipeImageBucket: config.recipeImageBucket,
    r2IngredientImagePrefix: config.r2.ingredientImagePrefix,
    r2IngredientImageTemplate: config.r2.ingredientImageTemplate,
    r2PublicBaseUrl: config.r2.publicBaseUrl,
    r2RecipeImagePrefix: config.r2.recipeImagePrefix,
    r2RecipeImageTemplate: config.r2.recipeImageTemplate,
    supabaseUrl: config.supabase.url
  };

  return `<!doctype html>
<html lang="${config.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3b6d11" />
    <title>${escapeHtml(title)} - Zdravo Jem</title>
    <style id="zdravo-recipe-inline-style">${assets.css}</style>
  </head>
  <body data-screen="detail">
    <div id="app" class="app-root">
      <section class="screen screen--standard">
        <div class="empty-state">
          <h1>Nalaganje recepta...</h1>
        </div>
      </section>
    </div>
    <script>
      window.ZDRAVO_RECIPE_SHARE_CONFIG = ${escapeJsonForScript(browserConfig)};
      window.ZDRAVO_STATIC_RECIPE_PAYLOAD = ${escapeJsonForScript(payload)};
      window.ZDRAVO_STATIC_RECIPE_URL = ${escapeJsonForScript(publicUrl)};
    </script>
    <script>${escapeScriptText(assets.appJs)}</script>
  </body>
</html>`;
}

function createS3Client(config) {
  return new S3Client({
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey
    },
    endpoint: config.r2.endpoint,
    forcePathStyle: config.r2.forcePathStyle,
    region: config.r2.region
  });
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function remoteObjectHash(config, client, key) {
  try {
    const result = await client.send(new HeadObjectCommand({
      Bucket: config.r2.bucket,
      Key: key
    }));

    return result.Metadata?.['zdravo-sha256'] || '';
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (statusCode === 404 || error?.name === 'NotFound' || error?.name === 'NoSuchKey') {
      return '';
    }

    console.warn(`Could not read remote metadata for ${key}; uploading anyway. ${error.message || error}`);
    return '';
  }
}

async function uploadHtml(config, client, key, html, fileName, htmlHash) {
  await client.send(new PutObjectCommand({
    Body: html,
    Bucket: config.r2.bucket,
    CacheControl: config.r2.cacheControl,
    ContentDisposition: `inline; filename="${fileName}"`,
    ContentType: 'text/html; charset=utf-8',
    Key: key,
    Metadata: {
      'zdravo-sha256': htmlHash
    }
  }));
}

async function updateRecipeQrUrl(config, recipeId, qrUrl) {
  await supabaseRequest(
    config,
    '/rest/v1/recipes',
    { id: `eq.${recipeId}` },
    {
      body: {
        qr_url: qrUrl,
        updated_at: new Date().toISOString()
      },
      forUpdate: true,
      headers: { Prefer: 'return=minimal' },
      method: 'PATCH'
    }
  );
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const config = loadConfig();
  validateConfig(config, options);

  const assets = readShareAssets();
  const recipes = await fetchRecipes(config, options);
  const s3 = options.dryRun ? null : createS3Client(config);

  fs.mkdirSync(config.outputDir, { recursive: true });

  let uploaded = 0;
  let skipped = 0;
  let updated = 0;

  for (const recipe of recipes) {
    const key = objectKeyForRecipe(recipe, config);
    const fileName = path.basename(key);
    const publicUrl = publicUrlForKey(config.r2.publicBaseUrl || 'https://example.invalid', key);
    const htmlRecipe = await inlineRecipeImages(config, recipe);
    const html = buildStandaloneRecipeHtml(htmlRecipe, config, assets, publicUrl);
    const htmlHash = sha256(html);
    const localPath = path.join(config.outputDir, key);

    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, html);

    if (options.dryRun) {
      console.log(`DRY  ${recipe.id} ${recipe.slug || recipe.name_sl}: ${publicUrl}`);
      continue;
    }

    const remoteHash = options.force ? '' : await remoteObjectHash(config, s3, key);
    if (remoteHash !== htmlHash) {
      await uploadHtml(config, s3, key, html, fileName, htmlHash);
      uploaded += 1;
    }

    if (!options.force && String(recipe.qr_url || '').trim() === publicUrl) {
      skipped += 1;
      console.log(`${remoteHash === htmlHash ? 'SKIP' : 'FILE'} ${recipe.id} ${recipe.slug || recipe.name_sl}: ${publicUrl}`);
      continue;
    }

    await updateRecipeQrUrl(config, recipe.id, publicUrl);
    updated += 1;
    console.log(`SYNC ${recipe.id} ${recipe.slug || recipe.name_sl}: ${publicUrl}`);
  }

  console.log(JSON.stringify({
    dryRun: options.dryRun,
    generated: recipes.length,
    outputDir: config.outputDir,
    skipped,
    updated,
    uploaded
  }, null, 2));
}

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
