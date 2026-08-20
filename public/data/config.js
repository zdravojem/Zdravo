// Runtime configuration for the PWA.
//
// `public/env.js` is a small non-module script that sets window.__ZDRAVO_ENV__
// before app.js loads. It is generated from .env.local by `npm run env:build`
// and is intentionally gitignored, so the deployed kiosk and a developer
// checkout can point at different Supabase projects without a code change.
//
// Only values that are safe in a public bundle belong here: the Supabase URL
// and the *anon* key. Never the service-role key — anything in env.js is
// readable by every visitor of the kiosk URL.

const raw = (typeof window !== 'undefined' && window.__ZDRAVO_ENV__) || {};

function text(...names) {
  for (const name of names) {
    const value = String(raw[name] ?? '').trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function boolean(value, fallback) {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return fallback;
  }

  return !/^(0|false|no|off)$/i.test(normalized);
}

const supabaseUrl = trimTrailingSlash(text('SUPABASE_URL', 'VITE_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'));
const supabaseAnonKey = text('SUPABASE_ANON_KEY', 'VITE_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

export const config = {
  supabaseUrl,
  supabaseAnonKey,

  // Edge Function that sends the recipe email. The browser cannot talk SMTP or
  // hold Gmail credentials, so the work the Electron main process used to do
  // moved to supabase/functions/send-recipe-email.
  emailEndpoint:
    text('ZDRAVO_EMAIL_ENDPOINT') ||
    (supabaseUrl ? `${supabaseUrl}/functions/v1/send-recipe-email` : ''),

  // Storage buckets holding the images the admin app uploads. The Electron app
  // mirrored these to disk and served them over a zdravo-image:// protocol;
  // the PWA links straight to the public object URLs instead.
  recipeImageBucket: text('ZDRAVO_RECIPE_IMAGE_BUCKET') || 'recipe-images',
  ingredientImageBucket: text('ZDRAVO_INGREDIENT_IMAGE_BUCKET') || 'ingredient-images',

  // Optional CDN in front of the same buckets. Opt-in only: the R2 mirror used
  // by the recipe share pages stores recipe images under a different prefix, so
  // it is not a drop-in for the kiosk's bucket/path pairs.
  imageCdnBaseUrl: trimTrailingSlash(text('ZDRAVO_IMAGE_CDN_BASE_URL')),

  // Appends ?download=1 to the QR share URL, matching the Electron behaviour.
  autoDownloadSharedRecipe: boolean(text('ZDRAVO_PUBLIC_RECIPE_AUTO_DOWNLOAD'), true),

  // How often the kiosk re-checks Supabase for content changes, in ms.
  refreshIntervalMs: Number(text('ZDRAVO_REFRESH_INTERVAL_MS')) || 5 * 60 * 1000
};

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

export function storageObjectUrl(bucket, imagePath) {
  const normalizedPath = String(imagePath || '').trim().replace(/^\/+/, '');

  if (!normalizedPath) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const encodedPath = normalizedPath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

  if (config.imageCdnBaseUrl) {
    return `${config.imageCdnBaseUrl}/${bucket}/${encodedPath}`;
  }

  if (!config.supabaseUrl) {
    return '';
  }

  return `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
