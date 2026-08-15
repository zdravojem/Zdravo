# Zdravo Jem TEST

Zdravo Jem ("I Eat Healthy") is a virtual culinary assistant for a Slovenian farmers' market kiosk,
built for a 55" portrait touchscreen. It is an installable PWA: a set of plain ES modules served as
static files, reading its content straight from Supabase.

It was previously an Electron app that mirrored Supabase into a local SQLite database. The UI, the
screens and the game logic are unchanged; what moved is the data layer (SQLite over IPC → Supabase
REST), QR generation (main process → browser), and email delivery (main process → Edge Function).

## Requirements

- Node.js LTS (for the tooling only — the app itself has no build step)
- A Supabase project with the `recipes`, `ingredients` and `recipe_ingredients` tables, and public
  read access for the anon role (see `supabase-kiosk-read-policies.sql`)

## Setup

```bash
npm install
npm run env:build     # writes public/env.js from .env.local
npm start             # http://localhost:4173
```

For local development the same two values come from `.env.local` instead of Netlify's environment.

`public/env.js` holds the Supabase URL and **anon** key. It is generated, gitignored, and loaded
before the app so the configuration can be swapped per deployment without touching code. See
`public/env.example.js` for the full list of options.

> The script refuses to write a `service_role` key into `public/env.js`. Anything in that file is
> readable by every visitor of the kiosk URL, and a service-role key would hand them full read and
> write access to the database. Set `SUPABASE_ANON_KEY` in `.env.local` to the project's anon /
> publishable key (Supabase dashboard → Project Settings → API Keys).

## Deploying to Netlify

`netlify.toml` in the repository root configures everything; the site needs no manual settings
beyond two environment variables.

1. **Connect the repository** in Netlify (Add new site → Import an existing project). The build
   command (`npm run build`) and publish directory (`public`) come from `netlify.toml`, so leave
   Netlify's own fields untouched.

2. **Set the environment variables** under Site configuration → Environment variables:

   | Variable | Value |
   | --- | --- |
   | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `SUPABASE_ANON_KEY` | the project's **anon / publishable** key |

   These are the only two required. The optional `ZDRAVO_*` overrides in `public/env.example.js`
   can be set the same way.

3. **Deploy.** The build generates `public/env.js` from those variables and then verifies the key
   against Supabase, so a missing or rejected key fails the deploy instead of shipping a kiosk that
   boots to an error screen.

### Why it is configured this way

- **`public/env.js` is gitignored and generated at build time.** The Supabase URL and anon key are
  public — every visitor downloads them — but they differ per environment, so they belong in
  Netlify's environment rather than in the repository. Never put the service-role key here; the
  build script refuses it.
- **`NPM_FLAGS = "--omit=dev"`.** Nothing in `package.json` ships to the browser. Every dependency
  is local tooling (image conversion, icon generation, the R2 scripts) and the build itself uses
  only Node builtins, so Netlify installs nothing and deploys take seconds. Remove the flag if a
  future build step needs a package.
- **`sw.js`, `env.js` and `index.html` are sent with `must-revalidate`.** A stale service worker
  pins the entire app to an old version; artwork gets a week, fonts a year.
- **No `/* → /index.html` catch-all.** The kiosk is a single page with no client-side routing, so a
  catch-all would only turn missing assets into 200 responses containing HTML — which the service
  worker would then cache as though it were an image.
- **A Content-Security-Policy is set.** The app has no inline `<script>` and never calls `eval`, so
  `script-src` needs no escape hatches; `style-src` allows `'unsafe-inline'` only because the
  screens use inline `style=""` attributes. The policy was verified against every screen — including
  fonts, QR generation and the service worker — with no violations. Narrow `*.supabase.co` to your
  own project host if you want it tighter.

### Deploying anywhere else

`public/` is the site root and works on any static host. Three requirements: serve it over HTTPS
(service workers and installability need a secure context), serve it at the domain root (the
manifest, `sw.js` and asset paths assume `/`), and do not cache `sw.js` or `env.js`. Run
`npm run env:build` as part of the deploy so `public/env.js` exists in the uploaded directory.

## Content

Recipes, ingredients and their links live in Supabase and are edited through the admin app. The
kiosk reads all three tables on start, keeps them in memory, and re-reads them every five minutes
(`ZDRAVO_REFRESH_INTERVAL_MS`), so an edit reaches an unattended kiosk on its own.

Images uploaded through the admin app are read from the public Supabase Storage buckets
`recipe-images` and `ingredient-images`. Recipes with no uploaded image fall back to the artwork
bundled in `public/assets/images/`.

## Offline behaviour

The kiosk keeps working through a dropped connection:

- the service worker (`public/sw.js`) precaches the app shell and caches artwork as screens use it;
- the last catalogue read is kept in `localStorage`, so a cold start paints immediately and works
  with the network down.

Bump `CACHE_VERSION` in `public/sw.js` whenever the shell file list changes.

## Sending a recipe by email

Handled by the `send-recipe-email` Edge Function, which holds the Gmail credentials the Electron
main process used to hold. **It has to be deployed before the email button works.**

```bash
supabase functions deploy send-recipe-email
supabase secrets set \
  GMAIL_USER=... \
  GMAIL_APP_PASSWORD=... \
  GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... GMAIL_REFRESH_TOKEN=... \
  R2_PUBLIC_BASE_URL=... \
  ZDRAVO_ALLOWED_ORIGINS=https://your-kiosk-domain
```

Values in `.env.local` are **not** visible to Edge Functions — only Supabase secrets are. That is
the usual cause of a function that works locally and fails deployed.

### Which credential is used

The function uses the app password route first, because it does not depend on a refresh token.
OAuth is kept as a fallback for deployments that have not configured SMTP yet:

| Route | Needs | Notes |
| --- | --- | --- |
| App password (SMTP) | `GMAIL_APP_PASSWORD` | Does not expire. Tried on port 465, then 587. |
| OAuth (Gmail API) | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | Used only when SMTP is not configured. |

The current function no longer depends on the refresh token when `GMAIL_APP_PASSWORD` is present.
That keeps a dead OAuth token from breaking the kiosk mail flow.

### `invalid_grant` from the OAuth route

Google is rejecting the refresh token. Re-issue it with `node get-token.js` and update the secret.

If you still rely on OAuth instead of SMTP, and the token keeps dying after about a week, the cause
is usually the OAuth consent screen sitting in **Testing** mode in Google Cloud Console, where
refresh tokens expire after seven days. Publishing the app (APIs & Services → OAuth consent screen
→ Publish app) is the durable fix.

`recipe-qr-sync` is untouched by this port.

## Installing on the kiosk

Open the URL in Chrome/Edge on the kiosk machine and install it from the browser's own menu
(**⋮ → Cast, save and share → Install page as app**, or the install icon in the address bar). The
app ships a manifest and a service worker, so browsers offer this automatically; there is no
in-app install button.

For an unattended kiosk, also enable the operating system's own kiosk mode (or Chrome's `--kiosk`
flag): a web page can request fullscreen and block context menus and pinch zoom, which the app
does, but it cannot block Alt+F4 or the task switcher.

## Tooling

| Command | What it does |
| --- | --- |
| `npm start` | Static server for `public/` on port 4173 |
| `npm run env:build` | Regenerates `public/env.js` from `.env.local` |
| `npm run icons:build` | Regenerates the PWA icon set from `public/assets/icons/zdravo-jem-icon.png` |
| `npm run images:optimize` | Converts new artwork to WebP at the sizes in the script's `SIZES` table |
| `npm run assets:manifest` | Rewrites `public/assets-manifest.json` (the service worker's precache list) |
| `npm run vendor:qrcode` | Rebundles `public/vendor/qrcode.js` from the npm `qrcode` package |
| `npm run recipe-qr:sync` | Publishes the public recipe share pages to R2 (unchanged) |

## Kiosk behaviour

- Fullscreen on first touch when opened as a browser tab; installed sessions start fullscreen.
- Right-click, long-press menus, pinch zoom and double-tap zoom are blocked (`public/pwa/kiosk.js`).
- The idle timer returns to the Welcome screen after two minutes of no touches.

## Artwork

The Electron build read its images off the local disk, so screens simply rendered. Three things
recreate that in the browser.

**Format.** `public/assets/images/` is WebP, down from 609 MB of lossless PNG. The artwork is
unchanged to the eye.

**Size.** The originals were badly oversized for their slots — a 1254×1254 category tile is drawn
at 158 CSS px, 63× more pixels than the screen can show. `scripts/optimize-images.cjs` holds a
`SIZES` table recording the widest each folder is ever drawn (measured in the running app, doubled
for a 4K portrait kiosk). Recipe photos are the one folder used at two very different sizes — a
315 px grid card and a ~1000 px detail hero — so they keep the full file and gain a 720 px `-card`
copy, which `recipeImageSrc(recipe, { variant: 'card' })` selects. Together this cut the home
screen from 3.1 MB to 1.3 MB and the results screen from 8.3 MB to 3.3 MB.

**Precaching.** `npm run assets:manifest` writes `public/assets-manifest.json`, and the service
worker downloads every file in it into the cache after it activates — a few at a time, in the
background, so it never competes with someone using the screen. After the first couple of minutes
on a kiosk no screen touches the network for an image again. Verified by warming the cache, cutting
the network, and walking every screen: 160 images, none broken.

`npm run images:optimize` is idempotent — drop new artwork into the folder, run it, and reference
the file as `.webp`. Add `--from-git` when changing a size in `SIZES`: it re-encodes from the
original PNGs still in git history instead of stacking a second generation of lossy encoding.

Two files stay as they were: `public/assets/icons/` remains PNG because the web app manifest
requires PNG icons, and `public/assets/images/bg-landscape.jpg` is a corrupt 431-byte placeholder
that no code references and no decoder can read.
