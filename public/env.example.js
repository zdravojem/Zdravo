// Copy to public/env.js (or run `npm run env:build` to generate it from
// .env.local). Loaded before app.js so the Supabase configuration is available
// synchronously.
//
// Everything here is public. Use the project's *anon* key — never the
// service-role key.
window.__ZDRAVO_ENV__ = {
  SUPABASE_URL: 'https://your-project-ref.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-or-publishable-key',

  // Optional overrides — see public/data/config.js for the defaults.
  // ZDRAVO_EMAIL_ENDPOINT: 'https://your-project-ref.supabase.co/functions/v1/send-recipe-email',
  // ZDRAVO_RECIPE_IMAGE_BUCKET: 'recipe-images',
  // ZDRAVO_INGREDIENT_IMAGE_BUCKET: 'ingredient-images',
  // ZDRAVO_IMAGE_CDN_BASE_URL: '',
  // ZDRAVO_PUBLIC_RECIPE_AUTO_DOWNLOAD: 'true',
  // ZDRAVO_REFRESH_INTERVAL_MS: '300000'
};
