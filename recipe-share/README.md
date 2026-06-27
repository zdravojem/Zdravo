# Zdravo Public Recipe Share

This folder is a deployable static recipe page for QR scans outside the kiosk
network. Deploy it to Vercel, Cloudflare Pages, or any static host.

It is also used by `npm run recipe-qr:sync` to build standalone per-recipe HTML
files for Cloudflare R2. Those generated files embed the CSS, app script, and
recipe payload directly, so the QR URL can point at a single `.html` object.

## Build With Supabase Config

From `Zdravo/`:

```bash
npm run recipe-share:build
```

The build copies this folder to `dist/recipe-share` and creates `config.js`
from `.env.local`, `supabase-config.json`, or process env values.

Required values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Deploy `dist/recipe-share`.

## Connect The Kiosk QR

Set this in the kiosk `.env.local` or `supabase-config.json`:

```env
ZDRAVO_PUBLIC_RECIPE_BASE_URL=https://recipes.your-domain.com
ZDRAVO_PUBLIC_RECIPE_AUTO_DOWNLOAD=true
```

When the base URL exists, kiosk QR codes use the public recipe site. Without it,
the kiosk keeps using the local same-network fallback.

If `recipes.qr_url` is populated by the R2 upload automation, the kiosk prefers
that URL for QR generation before falling back to `ZDRAVO_PUBLIC_RECIPE_BASE_URL`.

## Supabase Notes

The recipe page reads `recipes`, `ingredients`, and `recipe_ingredients` with
the anon key. If Row Level Security is enabled, apply the read policies in
`supabase-kiosk-read-policies.sql`.

For images to display in a plain browser, the `recipe-images` and
`ingredient-images` buckets should be public. If you keep private buckets, add a
server or Supabase Edge Function to sign image URLs.
