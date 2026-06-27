# Supabase Sync In Packaged Builds

The Electron app syncs from Supabase with the anon key and stores everything in
local SQLite plus local files under Electron `userData`.

In development, `npm start` can read:

- `Zdravo/.env.local`
- `admin/recipe-admin/.env.local`

In packaged builds, the app can read either `.env.local` or
`supabase-config.json` from these locations:

- Electron `userData`
- The folder next to the compiled `.exe`
- The packaged `resources` folder

If `Zdravo/.env.local` exists when you run `npm run pack` or `npm run dist`,
`electron-builder` copies it to `resources/.env.local`.

Example `.env.local`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-qr-url-updates
ZDRAVO_PUBLIC_RECIPE_BASE_URL=https://recipes.your-domain.com
ZDRAVO_PUBLIC_RECIPE_AUTO_DOWNLOAD=true
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ENDPOINT=https://your-cloudflare-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=your-r2-bucket-name
R2_PUBLIC_BASE_URL=https://recipes.your-domain.com
R2_RECIPE_PREFIX=recipes
```

These Vite-style names are also supported:

```env
VITE_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Example `supabase-config.json`:

```json
{
  "url": "https://your-project-ref.supabase.co",
  "anonKey": "your-anon-key",
  "serviceRoleKey": "your-service-role-key-for-qr-url-updates",
  "publicRecipeBaseUrl": "https://recipes.your-domain.com",
  "publicRecipeAutoDownload": true,
  "r2AccountId": "your-cloudflare-account-id",
  "r2AccessKeyId": "your-r2-access-key-id",
  "r2SecretAccessKey": "your-r2-secret-access-key",
  "r2Bucket": "your-r2-bucket-name",
  "r2PublicBaseUrl": "https://recipes.your-domain.com",
  "recipeQrPrefix": "recipes"
}
```

The packaged app uses a different SQLite database from `npm start`, located in
Electron `userData`. On first launch with Supabase config present, it downloads
new/updated recipes, ingredients, recipe ingredients, and images.

Hard deletes are handled by reconciliation: each sync fetches the current
Supabase recipe and ingredient IDs, then removes local rows that were previously
synced but no longer exist remotely. Bundled seed rows without Supabase
timestamps are left in place.

## Public QR Recipe Pages

QR codes can open on devices outside the kiosk network by pointing them at a
public recipe share site.

1. Build the static recipe share site:

```bash
npm run recipe-share:build
```

2. Deploy `dist/recipe-share` to Vercel, Cloudflare Pages, or another static
host.

3. Set `ZDRAVO_PUBLIC_RECIPE_BASE_URL` in the kiosk config to the deployed URL
only if you still use the legacy public recipe-share site directly. The QR modal
does not use this as a fallback anymore; it requires `recipes.qr_url` from the
R2 automation.

```text
https://recipes.your-domain.com/recipes/<recipe-id>?locale=sl&download=1
```

The public page reads recipe data from Supabase with the anon key. The
`recipe-images` and `ingredient-images` buckets should be public for browser
image loading. If the buckets stay private, add a server/Edge Function that
returns signed image URLs.

## Cloudflare R2 Recipe QR Files

For scan links that download a ready-made HTML file immediately, add the
nullable Supabase column:

```sql
alter table public.recipes
add column if not exists qr_url text;
```

The same SQL is stored in `supabase-recipe-qr-url.sql`.

Then configure Cloudflare R2 public access. Use a custom domain for production,
or the Cloudflare `r2.dev` public development URL for testing. The value you put
in `R2_PUBLIC_BASE_URL` must be the public base URL for the bucket or for the
folder mapped to recipe files.

The event-driven automation:

- fetches recipes and ingredients from Supabase;
- generates standalone HTML files;
- uploads each file to Cloudflare R2;
- updates `recipes.qr_url` with the public R2 URL and bumps `updated_at` so
  kiosks pull the change on the next Supabase sync.

After the kiosk syncs from Supabase, local SQLite stores `qr_url`. The QR modal
uses `recipes.qr_url` only. If it is missing, the kiosk shows that the QR page is
not ready yet instead of generating a localhost or same-network fallback URL.

### Edge Function Secrets

Set these Supabase Edge Function secrets:

```bash
supabase secrets set \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  R2_ACCOUNT_ID=your-cloudflare-account-id \
  R2_ENDPOINT=https://your-cloudflare-account-id.r2.cloudflarestorage.com \
  R2_ACCESS_KEY_ID=your-r2-access-key-id \
  R2_SECRET_ACCESS_KEY=your-r2-secret-access-key \
  R2_BUCKET=your-r2-bucket-name \
  R2_PUBLIC_BASE_URL=https://recipes.your-domain.com \
  R2_RECIPE_PREFIX=recipes \
  R2_IMAGE_CACHE_CONTROL="public, max-age=300" \
  ZDRAVO_RECIPE_QR_IMAGE_MODE=r2-url \
  R2_RECIPE_IMAGE_PREFIX=recipe-images \
  R2_INGREDIENT_IMAGE_PREFIX=ingredient-images \
  R2_RECIPE_IMAGE_TEMPLATE= \
  R2_INGREDIENT_IMAGE_TEMPLATE= \
  RECIPE_QR_WEBHOOK_SECRET=use-a-long-random-secret
```

For EU jurisdiction R2 buckets, set the endpoint to the EU API host:

```bash
supabase secrets set R2_ENDPOINT=https://your-cloudflare-account-id.eu.r2.cloudflarestorage.com
```

If Supabase logs show uploads going to
`https://<account-id>.r2.cloudflarestorage.com` while your bucket is EU-scoped,
the deployed Edge Function is missing this secret or has a stale value.

Deploy the function:

```bash
supabase functions deploy recipe-qr-sync
```

The function config in `supabase/config.toml` disables JWT verification for this
webhook endpoint. The function still checks `x-zdravo-webhook-secret`, so keep
that value private.

### Optional Backfill Or Repair

Normal admin recipe creates and edits should not need this command. If you have
old recipes that never received `qr_url`, or you need to repair R2 objects
without editing each recipe in the admin app, you can run:

```bash
npm run recipe-qr:sync
```

Preview without uploading:

```bash
npm run recipe-qr:dry-run
```

This uses the same R2 object path convention as the Edge Function.

### Event-Driven Trigger

Run `supabase-recipe-qr-webhook.sql` in the Supabase SQL editor after replacing
`PROJECT_REF` and `REPLACE_WITH_WEBHOOK_SECRET`.

The SQL creates Supabase Database Webhooks for:

- `recipes` insert/update;
- `recipe_ingredients` insert/update/delete, so the page refreshes after the
  admin app saves the ingredient list;
- `ingredients` update, so ingredient name/image edits refresh related recipes.
- `storage.objects` insert/update/delete for `recipe-images` and
  `ingredient-images`, so image uploads/updates/deletes are mirrored to R2 and
  related recipe pages are refreshed.

The runtime flow is:

```text
Supabase Database Webhook
-> recipe-qr-sync Edge Function
-> Cloudflare R2 image mirror/delete, when a Supabase Storage file changed
-> referenced recipe/ingredient images checked and mirrored when a recipe page refreshes
-> Cloudflare R2 HTML upload
-> recipes.qr_url update
-> Electron sync pulls qr_url on next network connection
```

The Edge Function ignores the `qr_url` write-back update, so it will not loop.
After this is configured, you should not need to run `npm run recipe-qr:sync`
for normal admin changes. The script is only for one-time backfills or manual
repair.

For local or CI one-time uploads, provide:

```env
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
R2_ACCOUNT_ID
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_BASE_URL
R2_RECIPE_PREFIX=recipes
R2_IMAGE_CACHE_CONTROL=public, max-age=300
ZDRAVO_RECIPE_QR_IMAGE_MODE=r2-url
R2_RECIPE_IMAGE_PREFIX=recipe-images
R2_INGREDIENT_IMAGE_PREFIX=ingredient-images
R2_RECIPE_IMAGE_TEMPLATE=
R2_INGREDIENT_IMAGE_TEMPLATE=
RECIPE_QR_WEBHOOK_SECRET=use-a-long-random-secret
```

The automation also accepts your Cloudflare-style aliases:

```env
CF_ACCOUNT_ID
CF_R2_ENDPOINT
CF_R2_ACCESS_KEY_ID
CF_R2_SECRET_ACCESS_KEY
CF_R2_BUCKET
CF_PUBLIC_BASE_URL
CF_R2_RECIPE_IMAGE_PREFIX
CF_R2_INGREDIENT_IMAGE_PREFIX
CF_R2_RECIPE_IMAGE_TEMPLATE
CF_R2_INGREDIENT_IMAGE_TEMPLATE
```

Image handling has two modes:

- `ZDRAVO_RECIPE_QR_IMAGE_MODE=embed`: downloads images from Supabase Storage
  and embeds them as `data:` URLs inside the HTML file.
- `ZDRAVO_RECIPE_QR_IMAGE_MODE=r2-url`: writes image URLs that point to files
  in the same public R2 bucket.

For `r2-url`, the generated HTML expects:

```text
<R2_PUBLIC_BASE_URL>/<R2_RECIPE_IMAGE_PREFIX>/<recipes.image_path>
<R2_PUBLIC_BASE_URL>/<R2_INGREDIENT_IMAGE_PREFIX>/<ingredients.image_path>
```

So if `ingredients.image_path` is `tomato.png` and
`R2_INGREDIENT_IMAGE_PREFIX=ingredient-images`, the HTML uses:

```text
https://your-r2-public-url/ingredient-images/tomato.png
```

The Edge Function mirrors Supabase Storage files to R2 at that exact path. It
also adds a version query to generated image URLs from the row `updated_at`, so
the scanned HTML can pick up edited images without waiting on a long browser
cache. By default, mirrored R2 images use `Cache-Control: public, max-age=300`;
override with `R2_IMAGE_CACHE_CONTROL` only if you are also using versioned
filenames or query strings.

If your Supabase recipe or ingredient rows do not have the same `image_path`
values as the files you uploaded to R2, configure templates that match the R2
filenames. Supported template tokens are `{id}`, `{slug}`, `{name}`,
`{image_path}`, `{recipe_index}`, and `{ingredient_index}`.

Examples:

```env
# Uses ingredient-images/137.png
R2_INGREDIENT_IMAGE_TEMPLATE={id}.png

# Uses ingredient-images/tomato.png, based on the ingredient name/slug
R2_INGREDIENT_IMAGE_TEMPLATE={slug}.png

# Uses ingredient-images/foods/tomato.webp
R2_INGREDIENT_IMAGE_PREFIX=ingredient-images/foods
R2_INGREDIENT_IMAGE_TEMPLATE={slug}.webp

# Uses the ordered recipe image folder, for recipes 76-145:
# recipe 76 -> 1.png, recipe 83 -> 8.png
R2_RECIPE_IMAGE_PREFIX=epix-group_recipes-photo-1-70_2026-06-04_0734
R2_RECIPE_IMAGE_TEMPLATE={recipe_index}.png

# Uses ordered ingredient images:
# ingredient 137 -> 21.png, ingredient 256 -> 140.png
R2_INGREDIENT_IMAGE_PREFIX=ingredient-images
R2_INGREDIENT_IMAGE_TEMPLATE={ingredient_index}.png
```

The same values must be set both locally for `npm run recipe-qr:sync` and as
Supabase Edge Function secrets for the event-driven webhook.
