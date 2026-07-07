import { DeleteObjectCommand, PutObjectCommand, S3Client } from 'npm:@aws-sdk/client-s3';
import { APP_JS_B64, STYLES_CSS_B64 } from './share-assets.ts';

type JsonRecord = Record<string, unknown>;

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: JsonRecord | null;
  old_record?: JsonRecord | null;
};

type Recipe = JsonRecord & {
  id: number;
  name_sl?: string;
  description_sl?: string | null;
  difficulty?: string | null;
  image_path?: string | null;
  nacin_priprave?: string | null;
  qr_url?: string | null;
  servings_quantity?: number | string | null;
  servings_unit?: string | null;
  slug?: string | null;
  steps_sl?: string | null;
  tags?: string | null;
  time_min?: number | string | null;
  ingredients?: Ingredient[];
};

type Ingredient = {
  id?: number;
  image_path?: string | null;
  ingredient_id?: number;
  is_optional?: boolean | number | null;
  name_sl: string;
  quantity?: string | number | null;
  recipe_id?: number;
  updated_at?: string | null;
  unit?: string | null;
};

const corsHeaders = {
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info, x-zdravo-webhook-secret',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-origin': '*'
};

const encoder = new TextEncoder();

function env(name: string, fallback = '') {
  return (Deno.env.get(name) || fallback).trim();
}

function firstEnv(names: string[], fallback = '') {
  for (const name of names) {
    const value = env(name);
    if (value) return value;
  }
  return fallback;
}

function requiredEnv(name: string) {
  const value = env(name);
  if (!value) {
    throw new Error(`Missing required secret: ${name}`);
  }
  return value;
}

function requiredFirstEnv(names: string[]) {
  const value = firstEnv(names);
  if (!value) {
    throw new Error(`Missing required secret: ${names.join(' or ')}`);
  }
  return value;
}

function bearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  return match?.[1]?.trim() || '';
}

async function isAuthenticatedSupabaseUser(request: Request) {
  const token = bearerToken(request);
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (request.headers.get('apikey') === serviceRoleKey) return true;
  if (!token) return false;
  if (token === serviceRoleKey) return true;

  const supabaseUrl = normalizeBaseUrl(requiredEnv('SUPABASE_URL'));
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      authorization: `Bearer ${token}`
    }
  });

  return response.ok;
}

function jsonResponse(body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' },
    status
  });
}

function normalizeBaseUrl(value: string) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function r2EndpointFromUrl(value: string) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return '';

  try {
    const url = new URL(normalized);
    return /\.r2\.cloudflarestorage\.com$/i.test(url.hostname) ? url.origin : '';
  } catch {
    return '';
  }
}

function r2Endpoint() {
  const explicitEndpoint = normalizeBaseUrl(firstEnv(['R2_ENDPOINT', 'CF_R2_ENDPOINT', 'S3_ENDPOINT']));
  if (explicitEndpoint) return explicitEndpoint;

  const publicEndpoint = r2EndpointFromUrl(firstEnv(['R2_PUBLIC_BASE_URL', 'CF_PUBLIC_BASE_URL']));
  if (publicEndpoint) return publicEndpoint;

  const accountId = firstEnv(['R2_ACCOUNT_ID', 'CF_ACCOUNT_ID']);
  if (!accountId) return '';

  const jurisdiction = firstEnv(['R2_JURISDICTION', 'CF_R2_JURISDICTION'])
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  const jurisdictionPart = jurisdiction ? `.${jurisdiction}` : '';
  return `https://${accountId}${jurisdictionPart}.r2.cloudflarestorage.com`;
}

function safeFileName(value: unknown) {
  return String(value || 'recipe')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'recipe';
}

function encodePath(path: string) {
  return path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

function objectKeyForRecipe(recipe: Recipe) {
  const prefix = env('R2_RECIPE_PREFIX', env('ZDRAVO_RECIPE_QR_PREFIX', 'recipes'))
    .replace(/^\/+|\/+$/g, '');
  const fileName = `${safeFileName(recipe.slug || recipe.name_sl || recipe.id)}.html`;
  return [prefix, fileName].filter(Boolean).join('/');
}

function publicUrlForKey(key: string) {
  return `${normalizeBaseUrl(requiredFirstEnv(['R2_PUBLIC_BASE_URL', 'CF_PUBLIC_BASE_URL']))}/${encodePath(key)}`;
}

function keyFromPublicUrl(url: string) {
  const baseUrl = normalizeBaseUrl(firstEnv(['R2_PUBLIC_BASE_URL', 'CF_PUBLIC_BASE_URL']));
  if (!baseUrl || !url.startsWith(baseUrl + '/')) return '';
  const encodedPath = url.slice(baseUrl.length + 1);
  return encodedPath.split('/').filter(Boolean).map(decodeURIComponent).join('/');
}

function r2ImagePrefix(kind: 'recipe' | 'ingredient') {
  const names = kind === 'recipe'
    ? ['R2_RECIPE_IMAGE_PREFIX', 'CF_R2_RECIPE_IMAGE_PREFIX', 'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_PREFIX']
    : ['R2_INGREDIENT_IMAGE_PREFIX', 'CF_R2_INGREDIENT_IMAGE_PREFIX', 'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_PREFIX'];

  return firstEnv(names, kind === 'recipe' ? 'epix-group_recipes-photo-1-70_2026-06-04_0734' : 'ingredient-images')
    .replace(/^\/+|\/+$/g, '');
}

function r2ImageTemplate(kind: 'recipe' | 'ingredient') {
  const names = kind === 'recipe'
    ? ['R2_RECIPE_IMAGE_TEMPLATE', 'CF_R2_RECIPE_IMAGE_TEMPLATE', 'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_TEMPLATE']
    : ['R2_INGREDIENT_IMAGE_TEMPLATE', 'CF_R2_INGREDIENT_IMAGE_TEMPLATE', 'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_TEMPLATE'];

  return firstEnv(names, kind === 'recipe' ? '{recipe_index}.png' : '{ingredient_index}.png');
}

function recipeQrImageMode() {
  return firstEnv(
    ['ZDRAVO_RECIPE_QR_IMAGE_MODE', 'RECIPE_QR_IMAGE_MODE'],
    firstEnv(['R2_PUBLIC_BASE_URL', 'CF_PUBLIC_BASE_URL']) ? 'r2-url' : 'embed'
  ).toLowerCase();
}

function r2AssetUrl(prefix: string, imagePath: unknown) {
  const normalizedPath = String(imagePath || '').trim().replace(/^\/+/, '');
  if (!normalizedPath || normalizedPath.startsWith('assets/') || /^(data:|https?:\/\/)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  return publicUrlForKey([prefix, normalizedPath].filter(Boolean).join('/'));
}

function templateValue(template: string, item: JsonRecord) {
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

function r2AssetUrlForItem(prefix: string, item: JsonRecord, template: string, options: { preferTemplate?: boolean } = {}) {
  const explicitPath = String(item.image_path || '').trim();
  const templatedPath = templateValue(template, item);
  return r2AssetUrl(prefix, options.preferTemplate ? (templatedPath || explicitPath) : (explicitPath || templatedPath));
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTextBlock(value: unknown) {
  const text = String(value || '').trim();
  return text ? escapeHtml(text).replace(/\r?\n/g, '<br>') : '';
}

function parseSteps(value: unknown) {
  const text = String(value || '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  } catch {
    // Fall through to line splitting.
  }
  return text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function parseTags(value: unknown) {
  const text = String(value || '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  } catch {
    // Fall through to simple splitting.
  }
  return text.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

function formatAmount(item: Ingredient) {
  return [item.quantity, item.unit].filter((part) => part !== null && part !== undefined && part !== '').join(' ');
}

function storageImageUrl(bucket: string, imagePath: unknown, version?: unknown) {
  const supabaseUrl = normalizeBaseUrl(requiredEnv('SUPABASE_URL'));
  const normalizedPath = String(imagePath || '').trim();
  const versionValue = String(version || '').trim();

  if (/^data:/i.test(normalizedPath)) {
    return normalizedPath;
  }
  if (/^https?:\/\//i.test(normalizedPath)) {
    if (!versionValue) return normalizedPath;
    try {
      const url = new URL(normalizedPath);
      url.searchParams.set('v', versionValue);
      return url.toString();
    } catch {
      return normalizedPath;
    }
  }
  if (!normalizedPath || normalizedPath.startsWith('assets/')) {
    return placeholderImage();
  }
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodePath(normalizedPath)}`;
  return versionValue ? `${url}?v=${encodeURIComponent(versionValue)}` : url;
}

function mimeTypeForPath(filePath: unknown) {
  const ext = String(filePath || '').toLowerCase().split('.').pop();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

async function storageObjectDataUrl(bucket: string, imagePath: unknown) {
  const normalizedPath = String(imagePath || '').trim();
  if (!normalizedPath || normalizedPath.startsWith('assets/') || /^(data:|https?:\/\/)/i.test(normalizedPath)) {
    return normalizedPath;
  }

  const supabaseUrl = normalizeBaseUrl(requiredEnv('SUPABASE_URL'));
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(normalizedPath)}`, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Storage image fetch failed (${response.status}) for ${bucket}/${normalizedPath}: ${await response.text()}`);
  }

  const contentType = response.headers.get('content-type') || mimeTypeForPath(normalizedPath);
  return `data:${contentType};base64,${arrayBufferToBase64(await response.arrayBuffer())}`;
}

async function inlineRecipeImages(recipe: Recipe) {
  const recipeImageBucket = env('RECIPE_IMAGE_BUCKET', 'recipe-images');
  const ingredientImageBucket = env('INGREDIENT_IMAGE_BUCKET', 'ingredient-images');
  const nextRecipe: Recipe = {
    ...recipe,
    ingredients: (recipe.ingredients || []).map((ingredient) => ({ ...ingredient }))
  };

  const imageMode = recipeQrImageMode();
  if (imageMode === 'r2-url' || imageMode === 'r2') {
    const recipeId = Number(recipe.id);
    nextRecipe.image_path = r2AssetUrlForItem(r2ImagePrefix('recipe'), recipe, r2ImageTemplate('recipe'), {
      preferTemplate: Number.isInteger(recipeId) && recipeId >= 76 && recipeId <= 145
    });
    (nextRecipe.ingredients || []).forEach((ingredient) => {
      ingredient.image_path = r2AssetUrlForItem(r2ImagePrefix('ingredient'), ingredient as unknown as JsonRecord, r2ImageTemplate('ingredient'));
    });
    return nextRecipe;
  }

  try {
    nextRecipe.image_path = await storageObjectDataUrl(recipeImageBucket, recipe.image_path);
  } catch (error) {
    console.warn(`Recipe image could not be embedded for ${recipe.id}: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const ingredient of nextRecipe.ingredients || []) {
    try {
      ingredient.image_path = await storageObjectDataUrl(ingredientImageBucket, ingredient.image_path);
    } catch (error) {
      console.warn(`Ingredient image could not be embedded for recipe ${recipe.id}, ingredient ${ingredient.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return nextRecipe;
}

function placeholderImage() {
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#f5efe1"/>
      <circle cx="320" cy="220" r="92" fill="#d9e7b5"/>
      <path d="M244 276c42 58 110 58 152 0" fill="none" stroke="#6d7f38" stroke-width="24" stroke-linecap="round"/>
      <path d="M320 128c46-58 112-66 148-48-12 66-58 104-148 112" fill="#88aa45"/>
    </svg>
  `);
}

async function sha256Hex(value: string | Uint8Array) {
  const data = typeof value === 'string' ? encoder.encode(value) : value;
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmac(key: ArrayBuffer | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
}

async function signingKey(secret: string, dateStamp: string, region: string) {
  const kDate = await hmac(encoder.encode(`AWS4${secret}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, 's3');
  return hmac(kService, 'aws4_request');
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function amzDateParts(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8)
  };
}

async function putR2Object(key: string, html: string) {
  const body = encoder.encode(html);
  await putR2Bytes(key, body, {
    cacheControl: env('R2_CACHE_CONTROL', 'public, max-age=300'),
    contentDisposition: `inline; filename="${safeFileName(key.split('/').pop())}"`,
    contentType: 'text/html; charset=utf-8',
    metadata: {
      'x-amz-meta-zdravo-sha256': await sha256Hex(body)
    }
  });
}

async function putR2Bytes(
  key: string,
  body: Uint8Array,
  options: {
    cacheControl?: string;
    contentDisposition?: string;
    contentType?: string;
    metadata?: Record<string, string>;
  } = {}
) {
  const endpoint = r2Endpoint();
  if (!endpoint) {
    throw new Error('Missing required secret: R2_ENDPOINT or R2_ACCOUNT_ID');
  }

  const bucket = requiredFirstEnv(['R2_BUCKET', 'CF_R2_BUCKET']);
  const accessKeyId = requiredFirstEnv(['R2_ACCESS_KEY_ID', 'CF_R2_ACCESS_KEY_ID']);
  const secretAccessKey = requiredFirstEnv(['R2_SECRET_ACCESS_KEY', 'CF_R2_SECRET_ACCESS_KEY']);
  const region = env('R2_REGION', 'auto');
  const client = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint,
    forcePathStyle: /^(1|true|yes|on)$/i.test(env('R2_FORCE_PATH_STYLE')),
    region
  });

  try {
    await client.send(new PutObjectCommand({
      Body: body,
      Bucket: bucket,
      CacheControl: options.cacheControl || env('R2_CACHE_CONTROL', 'public, max-age=300'),
      ContentDisposition: options.contentDisposition,
      ContentType: options.contentType || 'application/octet-stream',
      Key: key,
      Metadata: Object.fromEntries(
        Object.entries(options.metadata || {}).map(([name, value]) => [
          name.replace(/^x-amz-meta-/i, ''),
          value
        ])
      )
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`R2 upload failed for bucket=${bucket} endpoint=${endpoint} key=${key}: ${message}`);
  }
}

async function deleteR2Object(key: string) {
  const endpoint = r2Endpoint();
  if (!endpoint) {
    throw new Error('Missing required secret: R2_ENDPOINT or R2_ACCOUNT_ID');
  }

  const bucket = requiredFirstEnv(['R2_BUCKET', 'CF_R2_BUCKET']);
  const accessKeyId = requiredFirstEnv(['R2_ACCESS_KEY_ID', 'CF_R2_ACCESS_KEY_ID']);
  const secretAccessKey = requiredFirstEnv(['R2_SECRET_ACCESS_KEY', 'CF_R2_SECRET_ACCESS_KEY']);
  const region = env('R2_REGION', 'auto');
  const client = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint,
    forcePathStyle: /^(1|true|yes|on)$/i.test(env('R2_FORCE_PATH_STYLE')),
    region
  });

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`R2 delete failed for bucket=${bucket} endpoint=${endpoint} key=${key}: ${message}`);
  }
}

async function downloadStorageObject(bucket: string, objectPath: string) {
  const supabaseUrl = normalizeBaseUrl(requiredEnv('SUPABASE_URL'));
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(objectPath)}`, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase storage download failed (${response.status}) for ${bucket}/${objectPath}: ${await response.text()}`);
  }

  return {
    body: new Uint8Array(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || mimeTypeForPath(objectPath)
  };
}

function r2PrefixForStorageBucket(bucket: string) {
  if (bucket === env('RECIPE_IMAGE_BUCKET', 'recipe-images')) {
    return r2ImagePrefix('recipe');
  }

  if (bucket === env('INGREDIENT_IMAGE_BUCKET', 'ingredient-images')) {
    return r2ImagePrefix('ingredient');
  }

  return '';
}

async function mirrorStorageObjectToR2(bucket: string, objectPath: string) {
  const prefix = r2PrefixForStorageBucket(bucket);
  if (!prefix || !objectPath) {
    return { bucket, objectPath, skipped: true, reason: 'not_recipe_or_ingredient_image' };
  }

  const object = await downloadStorageObject(bucket, objectPath);
  const key = [prefix, objectPath.replace(/^\/+/, '')].filter(Boolean).join('/');
  await putR2Bytes(key, object.body, {
    cacheControl: env('R2_IMAGE_CACHE_CONTROL', 'public, max-age=300'),
    contentType: object.contentType
  });

  return { bucket, key, mirrored: true, objectPath };
}

async function mirrorReferencedRecipeImagesToR2(recipe: Recipe) {
  if (!['r2-url', 'r2'].includes(recipeQrImageMode())) {
    return [];
  }

  const recipeImageBucket = env('RECIPE_IMAGE_BUCKET', 'recipe-images');
  const ingredientImageBucket = env('INGREDIENT_IMAGE_BUCKET', 'ingredient-images');
  const references = [
    { bucket: recipeImageBucket, objectPath: String(recipe.image_path || '').trim() },
    ...(recipe.ingredients || []).map((ingredient) => ({
      bucket: ingredientImageBucket,
      objectPath: String(ingredient.image_path || '').trim()
    }))
  ].filter(({ objectPath }) => objectPath && !objectPath.startsWith('assets/') && !/^(data:|https?:\/\/)/i.test(objectPath));
  const results = [];

  for (const reference of references) {
    try {
      results.push(await mirrorStorageObjectToR2(reference.bucket, reference.objectPath));
    } catch (error) {
      console.warn(`Referenced image could not be mirrored for recipe ${recipe.id}: ${reference.bucket}/${reference.objectPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return results;
}

async function deleteMirroredStorageObjectFromR2(bucket: string, objectPath: string) {
  const prefix = r2PrefixForStorageBucket(bucket);
  if (!prefix || !objectPath) {
    return { bucket, objectPath, skipped: true, reason: 'not_recipe_or_ingredient_image' };
  }

  const key = [prefix, objectPath.replace(/^\/+/, '')].filter(Boolean).join('/');
  await deleteR2Object(key);
  return { bucket, deleted: true, key, objectPath };
}

async function supabaseRows<T = JsonRecord>(table: string, params: Record<string, string>) {
  const supabaseUrl = normalizeBaseUrl(requiredEnv('SUPABASE_URL'));
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<T[]>;
}

async function patchRecipeQrUrl(recipeId: number, qrUrl: string) {
  const supabaseUrl = normalizeBaseUrl(requiredEnv('SUPABASE_URL'));
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const url = new URL(`${supabaseUrl}/rest/v1/recipes`);
  url.searchParams.set('id', `eq.${recipeId}`);

  const response = await fetch(url, {
    body: JSON.stringify({ qr_url: qrUrl, updated_at: new Date().toISOString() }),
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal'
    },
    method: 'PATCH'
  });

  if (!response.ok) {
    throw new Error(`Supabase qr_url update failed (${response.status}): ${await response.text()}`);
  }
}

async function loadRecipe(recipeId: number): Promise<Recipe | null> {
  const recipes = await supabaseRows<Recipe>('recipes', {
    id: `eq.${recipeId}`,
    limit: '1',
    select: '*'
  });
  const recipe = recipes[0];
  if (!recipe) return null;

  const links = await supabaseRows<JsonRecord>('recipe_ingredients', {
    order: 'ingredient_id.asc',
    recipe_id: `eq.${recipe.id}`,
    select: 'recipe_id,ingredient_id,quantity,unit,is_optional'
  });
  const ingredientIds = links
    .map((link) => Number(link.ingredient_id))
    .filter((id) => Number.isInteger(id));
  const ingredientRows = ingredientIds.length
    ? await supabaseRows<JsonRecord>('ingredients', {
      id: `in.(${ingredientIds.join(',')})`,
      select: 'id,name_sl,image_path,updated_at'
    })
    : [];
  const ingredientsById = new Map(ingredientRows.map((ingredient) => [Number(ingredient.id), ingredient]));

  recipe.ingredients = links
    .map((link) => {
      const ingredient = ingredientsById.get(Number(link.ingredient_id));
      return {
        ...link,
        id: Number(link.ingredient_id),
        image_path: String(ingredient?.image_path || ''),
        name_sl: String(ingredient?.name_sl || ''),
        updated_at: String(ingredient?.updated_at || '')
      } as Ingredient;
    })
    .filter((ingredient) => ingredient.name_sl);

  return recipe;
}

async function recipeIdsForIngredient(ingredientId: number) {
  const links = await supabaseRows<JsonRecord>('recipe_ingredients', {
    ingredient_id: `eq.${ingredientId}`,
    select: 'recipe_id'
  });
  return links
    .map((link) => Number(link.recipe_id))
    .filter((id) => Number.isInteger(id));
}

async function recipeIdsForRecipeImagePath(imagePath: string) {
  if (!imagePath) return [];
  const recipes = await supabaseRows<JsonRecord>('recipes', {
    image_path: `eq.${imagePath}`,
    select: 'id'
  });
  return recipes
    .map((recipe) => Number(recipe.id))
    .filter((id) => Number.isInteger(id));
}

async function recipeIdsForIngredientImagePath(imagePath: string) {
  if (!imagePath) return [];
  const ingredients = await supabaseRows<JsonRecord>('ingredients', {
    image_path: `eq.${imagePath}`,
    select: 'id'
  });
  const ingredientIds = ingredients
    .map((ingredient) => Number(ingredient.id))
    .filter((id) => Number.isInteger(id));
  const recipeIdGroups = await Promise.all(ingredientIds.map((id) => recipeIdsForIngredient(id)));
  return recipeIdGroups.flat();
}

function changedOnlyQrUrl(payload: WebhookPayload) {
  if (payload.table !== 'recipes' || payload.type !== 'UPDATE') return false;
  const next = { ...(payload.record || {}) };
  const prev = { ...(payload.old_record || {}) };
  delete next.qr_url;
  delete next.updated_at;
  delete prev.qr_url;
  delete prev.updated_at;
  return JSON.stringify(next) === JSON.stringify(prev);
}

function storageObjectInfo(payload: WebhookPayload) {
  if (payload.table !== 'objects' && payload.table !== 'storage.objects') return null;
  const record = payload.record || payload.old_record || {};
  const bucket = String(record.bucket_id || record.bucket || '').trim();
  const objectPath = String(record.name || record.path || '').trim();
  if (!bucket || !objectPath) return null;
  return { bucket, objectPath };
}

async function recipeIdsFromPayload(payload: WebhookPayload) {
  const storageObject = storageObjectInfo(payload);
  if (storageObject) {
    if (storageObject.bucket === env('RECIPE_IMAGE_BUCKET', 'recipe-images')) {
      return recipeIdsForRecipeImagePath(storageObject.objectPath);
    }

    if (storageObject.bucket === env('INGREDIENT_IMAGE_BUCKET', 'ingredient-images')) {
      return recipeIdsForIngredientImagePath(storageObject.objectPath);
    }

    return [];
  }

  if (payload.table === 'recipes') {
    const id = Number(payload.record?.id ?? payload.old_record?.id);
    return Number.isInteger(id) ? [id] : [];
  }

  if (payload.table === 'recipe_ingredients') {
    const id = Number(payload.record?.recipe_id ?? payload.old_record?.recipe_id);
    return Number.isInteger(id) ? [id] : [];
  }

  if (payload.table === 'ingredients') {
    const id = Number(payload.record?.id ?? payload.old_record?.id);
    return Number.isInteger(id) ? await recipeIdsForIngredient(id) : [];
  }

  const directId = Number(payload.record?.recipe_id ?? payload.record?.id ?? payload.old_record?.recipe_id ?? payload.old_record?.id);
  return Number.isInteger(directId) ? [directId] : [];
}

function pageCss() {
  return `
    :root{--green:#3b6d11;--leaf:#78a82a;--cream:#fbf4df;--ink:#25331b;--muted:#66705d;--orange:#d85a30;--shadow:0 18px 50px rgba(38,52,24,.16)}
    *{box-sizing:border-box}body{margin:0;background:#eef5df;color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}
    .page{min-height:100vh;max-width:760px;margin:0 auto;background:var(--cream);box-shadow:var(--shadow)}
    .topbar{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;background:#fff;color:var(--green);font-weight:900;letter-spacing:.04em}
    .download{width:42px;height:42px;border:2px solid #dce9c6;border-radius:50%;background:#f8fbef;color:var(--green);display:grid;place-items:center;text-decoration:none;font-size:22px}
    .hero{position:relative;min-height:330px;overflow:hidden;background:#d8e8bd}.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(20,34,9,.74))}
    .badge{position:absolute;top:22px;left:22px;padding:9px 15px;border-radius:999px;background:#fff;color:var(--green);font-size:13px;font-weight:900}.copy{position:absolute;left:24px;right:24px;bottom:26px;color:#fff}.copy small{font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#dff2bd}.copy h1{margin:.25em 0;font-family:Georgia,serif;font-size:44px;line-height:.98}.copy p{max-width:560px;margin:0;font-size:17px;line-height:1.45}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:18px}.stat{min-height:82px;padding:14px;border-radius:18px;background:#fff;box-shadow:0 8px 20px rgba(59,109,17,.08)}.stat small{display:block;color:var(--muted);font-weight:800}.stat strong{display:block;margin-top:6px;color:var(--green);font-size:20px}
    .section{margin:0 18px 18px;padding:20px;border-radius:22px;background:#fff;box-shadow:0 12px 28px rgba(59,109,17,.08)}.section h2{margin:0 0 16px;color:var(--green);font-size:24px}
    .ingredients{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ingredient{display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:center;padding:10px;border-radius:16px;background:#f7fbef}.ingredient img{width:64px;height:64px;object-fit:cover;border-radius:14px}.ingredient strong{display:block}.ingredient em{color:var(--muted);font-style:normal;font-size:14px}
    .steps{display:grid;gap:14px}.step{display:grid;grid-template-columns:38px 1fr;gap:12px}.step b{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:var(--green);color:#fff}.step p{margin:7px 0 0;line-height:1.45}
    .tags{display:flex;flex-wrap:wrap;gap:8px}.tags span{padding:8px 12px;border-radius:999px;background:#eef6df;color:var(--green);font-weight:800;font-size:13px}.tip{border-left:6px solid var(--orange)}
    @media(max-width:560px){.copy h1{font-size:36px}.stats{grid-template-columns:1fr}.ingredients{grid-template-columns:1fr}.page{box-shadow:none}}
  `;
}

function buildHtml(recipe: Recipe, publicUrl: string) {
  const ingredients = recipe.ingredients || [];
  const recipeImageBucket = env('RECIPE_IMAGE_BUCKET', 'recipe-images');
  const ingredientImageBucket = env('INGREDIENT_IMAGE_BUCKET', 'ingredient-images');
  const steps = parseSteps(recipe.steps_sl);
  const tags = parseTags(recipe.tags);
  const preparation = formatTextBlock(recipe.nacin_priprave);
  const tip = formatTextBlock(recipe.dodatni_nasvet);
  const title = recipe.name_sl || 'Zdravo Jem';
  const marketIngredients = ingredients.slice(0, 5);

  return `<!doctype html>
<html lang="sl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3b6d11" />
    <title>${escapeHtml(title)} - Zdravo Jem</title>
    <style>${pageCss()}</style>
  </head>
  <body>
    <main class="page">
      <header class="topbar">
        <a class="download" href="${escapeHtml(publicUrl)}" download aria-label="Prenesi">↓</a>
        <span>SESTAVINE</span>
      </header>
      <section class="hero">
        <img src="${escapeHtml(storageImageUrl(recipeImageBucket, recipe.image_path, recipe.updated_at))}" alt="${escapeHtml(title)}" />
        <div class="shade"></div>
        <div class="badge">Zdravo krožnik</div>
        <div class="copy">
          <small>Kuhinjski recept</small>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(recipe.description_sl || '')}</p>
        </div>
      </section>
      <section class="stats">
        <div class="stat"><small>Čas</small><strong>${escapeHtml(recipe.time_min || '')} min</strong></div>
        <div class="stat"><small>Zahtevnost</small><strong>${escapeHtml(recipe.difficulty || '')}</strong></div>
        <div class="stat"><small>Porcije</small><strong>${escapeHtml([recipe.servings_quantity, recipe.servings_unit].filter(Boolean).join(' '))}</strong></div>
      </section>
      ${tags.length || preparation ? `<section class="section">
        ${tags.length ? `<h2>Primerno za</h2><div class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
        ${preparation ? `<h2 style="margin-top:18px">Način priprave</h2><p>${preparation}</p>` : ''}
      </section>` : ''}
      <section class="section">
        <h2>Sestavine</h2>
        <div class="ingredients">${ingredients.map((item) => `
          <div class="ingredient">
            <img src="${escapeHtml(storageImageUrl(ingredientImageBucket, item.image_path, item.updated_at))}" alt="${escapeHtml(item.name_sl)}" />
            <span><strong>${escapeHtml(item.name_sl)}</strong>${formatAmount(item) ? `<em>${escapeHtml(formatAmount(item))}</em>` : ''}</span>
          </div>`).join('')}
        </div>
      </section>
      ${marketIngredients.length ? `<section class="section">
        <h2>Sestavine iz tržnice</h2>
        <div class="tags">${marketIngredients.map((item) => `<span>${escapeHtml(item.name_sl)}</span>`).join('')}</div>
      </section>` : ''}
      <section class="section">
        <h2>Koraki</h2>
        <div class="steps">${steps.map((step, index) => `
          <div class="step"><b>${index + 1}</b><p>${escapeHtml(step)}</p></div>`).join('')}
        </div>
      </section>
      ${tip ? `<section class="section tip"><h2>Dodatni nasvet</h2><p>${tip}</p></section>` : ''}
    </main>
  </body>
</html>`;
}

function escapeJsonForScript(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function escapeScriptText(value: string) {
  return String(value || '').replace(/<\/script/gi, '<\\/script');
}

function decodeAsset(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const SHARE_STYLES_CSS = decodeAsset(STYLES_CSS_B64);
const SHARE_APP_JS = decodeAsset(APP_JS_B64);

function recipeShareLocale() {
  return firstEnv(['ZDRAVO_RECIPE_QR_LOCALE', 'RECIPE_QR_LOCALE']) === 'en' ? 'en' : 'sl';
}

// Renders the same polished page as `npm run recipe-qr:sync` (recipe-share/app.js),
// so Edge-Function regenerations keep the existing design. The share/download
// panel was removed from recipe-share/app.js; run `node scripts/gen-share-assets.cjs`
// to refresh share-assets.ts after editing the renderer or styles.
function buildShareHtml(recipe: Recipe, publicUrl: string) {
  const locale = recipeShareLocale();
  const title = recipe.name_sl || 'Zdravo Jem';
  const payload = {
    autoDownload: false,
    locale,
    recipe,
    selectedIngredients: [] as string[]
  };
  const browserConfig = {
    ingredientImageBucket: env('INGREDIENT_IMAGE_BUCKET', 'ingredient-images'),
    recipeImageBucket: env('RECIPE_IMAGE_BUCKET', 'recipe-images'),
    r2IngredientImagePrefix: r2ImagePrefix('ingredient'),
    r2IngredientImageTemplate: r2ImageTemplate('ingredient'),
    r2PublicBaseUrl: normalizeBaseUrl(firstEnv(['R2_PUBLIC_BASE_URL', 'CF_PUBLIC_BASE_URL'])),
    r2RecipeImagePrefix: r2ImagePrefix('recipe'),
    r2RecipeImageTemplate: r2ImageTemplate('recipe'),
    supabaseUrl: normalizeBaseUrl(requiredEnv('SUPABASE_URL'))
  };

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3b6d11" />
    <title>${escapeHtml(title)} - Zdravo Jem</title>
    <style id="zdravo-recipe-inline-style">${SHARE_STYLES_CSS}</style>
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
    <script>${escapeScriptText(SHARE_APP_JS)}</script>
  </body>
</html>`;
}

async function syncRecipe(recipeId: number) {
  const recipe = await loadRecipe(recipeId);
  if (!recipe) {
    return { recipeId, skipped: true, reason: 'recipe_not_found' };
  }

  const key = objectKeyForRecipe(recipe);
  const publicUrl = publicUrlForKey(key);

  const oldKey = recipe.qr_url ? keyFromPublicUrl(String(recipe.qr_url)) : '';
  if (oldKey && oldKey !== key) {
    try {
      await deleteR2Object(oldKey);
    } catch (error) {
      console.warn(`Old QR file could not be deleted (${oldKey}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const mirroredImages = await mirrorReferencedRecipeImagesToR2(recipe);
  const htmlRecipe = await inlineRecipeImages(recipe);
  const html = buildShareHtml(htmlRecipe, publicUrl);
  await putR2Object(key, html);
  await patchRecipeQrUrl(recipe.id, publicUrl);

  return { key, mirroredImages, qrUrl: publicUrl, recipeId: recipe.id, uploaded: true };
}

Deno.serve(async (request) => {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const webhookSecret = env('RECIPE_QR_WEBHOOK_SECRET');
    if (
      webhookSecret &&
      request.headers.get('x-zdravo-webhook-secret') !== webhookSecret &&
      !(await isAuthenticatedSupabaseUser(request))
    ) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const payload = await request.json() as WebhookPayload;

    if (changedOnlyQrUrl(payload)) {
      return jsonResponse({ ok: true, skipped: true, reason: 'qr_url_writeback' });
    }

    const storageObject = storageObjectInfo(payload);
    const mirrorResult = storageObject
      ? (payload.type === 'DELETE'
        ? await deleteMirroredStorageObjectFromR2(storageObject.bucket, storageObject.objectPath)
        : await mirrorStorageObjectToR2(storageObject.bucket, storageObject.objectPath))
      : null;
    const recipeIds = Array.from(new Set(await recipeIdsFromPayload(payload)));
    const results = [];

    for (const recipeId of recipeIds) {
      results.push(await syncRecipe(recipeId));
    }

    return jsonResponse({ mirrorResult, ok: true, results });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
