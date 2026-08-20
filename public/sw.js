/* Zdravo Jem service worker.
 *
 * The kiosk has to keep working through a flaky connection, which the Electron
 * build got from its on-disk SQLite mirror and downloaded images. Here the same
 * resilience comes from two layers:
 *
 *   - this worker, which precaches the app shell and caches artwork as it is
 *     used, and
 *   - public/data/store.js, which keeps the last catalogue in localStorage.
 *
 * Bump CACHE_VERSION whenever the shell list changes so kiosks discard the old
 * caches on their next load.
 */

const CACHE_VERSION = 'v20';
const SHELL_CACHE = `zdravo-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `zdravo-assets-${CACHE_VERSION}`;
const CURRENT_CACHES = new Set([SHELL_CACHE, ASSET_CACHE]);

// Everything needed to boot and render, offline, on a cold start.
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',

  '/app.js',
  '/i18n.js',
  '/recipe-field-translations.js',
  '/tap.js',
  '/recipe-meta.js',
  '/recipe-images.js',
  '/ingredient-images.js',
  '/game-card-images.js',
  '/screens/welcome.js',
  '/screens/home.js',
  '/screens/ingredients.js',
  '/screens/results.js',
  '/screens/detail.js',
  '/screens/games.js',
  '/components/EmailModal.js',
  '/data/config.js',
  '/data/supabase.js',
  '/data/store.js',
  '/data/qr.js',
  '/data/email.js',
  '/pwa/kiosk.js',
  '/pwa/register-sw.js',
  '/vendor/qrcode.js',

  '/styles/base.css',
  '/styles/layout.css',
  '/styles/components.css',
  '/styles/games.css',
  '/styles/pwa.css',

  '/assets/fonts/InterVariable.woff2',
  '/assets/fonts/InterVariable-Italic.woff2',
  '/assets/fonts/Fraunces-latin.woff2',
  '/assets/fonts/Fraunces-latinext.woff2',
  '/assets/fonts/DMSans-latin.woff2',
  '/assets/fonts/DMSans-latinext.woff2',
  '/assets/fonts/Fredoka-latin.woff2',
  '/assets/fonts/Fredoka-latinext.woff2',

  // The two images on the screens a visitor always sees first.
  '/assets/images/welcome-poster.webp',
  '/assets/images/welcome-poster2.webp',
  '/assets/images/home-hero.webp',
  '/assets/images/home-hero.png',
  '/assets/images/games/header.png',
  '/assets/images/games/detective/header.en.png',
  '/assets/images/ui/additional-advice-bulb.png',

  '/assets/icons/pwa-192.png',
  '/assets/icons/pwa-512.png',
  '/assets/icons/pwa-maskable-512.png'
];

// env.js carries the Supabase URL and anon key. It is fetched separately from
// the shell so a deployment that only rotates configuration is picked up on the
// next load without a cache version bump.
const CONFIG_FILE = '/env.js';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll() is atomic: one 404 would leave the kiosk with no cache at all.
      // Adding entries individually means a renamed file costs one asset, not
      // the whole offline story.
      await Promise.all(
        SHELL_FILES.map((file) =>
          cache.add(new Request(file, { cache: 'reload' })).catch((error) => {
            console.warn('[sw] could not precache', file, error);
          })
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => !CURRENT_CACHES.has(name)).map((name) => caches.delete(name))
      );
      await self.clients.claim();

      // Not awaited: the kiosk must be usable immediately, and this takes a
      // couple of minutes on a cold cache.
      warmArtworkCache();
    })()
  );
});

/**
 * Downloads every bundled image and font into the cache.
 *
 * The Electron build read its artwork off the local disk, so screens rendered
 * with no wait. Fetching each image the first time a screen shows it — the
 * usual PWA approach — is what makes the web version feel slower, and it costs
 * that wait again on every screen a visitor reaches first. Pulling the whole
 * set once, in the background, restores the old behaviour: after the first few
 * minutes on a kiosk, no screen ever touches the network for an image again.
 *
 * Requests are issued a few at a time so the warm-up never competes with what
 * the person in front of the screen is actually doing.
 */
const WARM_CONCURRENCY = 6;
let warming = false;

async function warmArtworkCache() {
  if (warming) {
    return;
  }

  warming = true;

  try {
    const response = await fetch('/assets-manifest.json', { cache: 'no-store' });

    if (!response.ok) {
      return;
    }

    const { files } = await response.json();
    const cache = await caches.open(ASSET_CACHE);
    const queue = files.slice();
    let stored = 0;
    let failed = 0;

    const worker = async () => {
      while (queue.length) {
        const file = queue.shift();

        // Already cached from an earlier run or an earlier visit — skip the
        // request entirely rather than re-downloading.
        if (await cache.match(file)) {
          continue;
        }

        try {
          const asset = await fetch(file, { cache: 'no-cache' });

          if (asset.ok) {
            await cache.put(file, asset);
            stored += 1;
          } else {
            failed += 1;
          }
        } catch (error) {
          failed += 1;
        }
      }
    };

    await Promise.all(Array.from({ length: WARM_CONCURRENCY }, worker));
    console.log(`[sw] artwork cache warm: ${stored} stored, ${failed} failed, ${files.length} total`);
  } catch (error) {
    // A failed warm-up is not a failure: every image still resolves on demand.
    console.warn('[sw] could not warm the artwork cache', error);
  } finally {
    warming = false;
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});

function isImageRequest(url) {
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(url.pathname);
}

function isStorageImage(url) {
  return (
    url.pathname.includes('/storage/v1/object/') ||
    (url.hostname.endsWith('.r2.dev') && isImageRequest(url))
  );
}

/** Cache-first: artwork never changes behind a given URL. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  // Opaque cross-origin responses are cached too — they still render, and the
  // alternative is re-downloading every recipe photo on every view.
  if (response.ok || response.type === 'opaque') {
    cache.put(request, response.clone()).catch(() => {});
  }

  return response;
}

/** Network-first with a cached fallback: correctness first, offline second. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Stale-while-revalidate, used for the app shell: answer from the cache so the
 * kiosk paints instantly and works offline, but always re-fetch in the
 * background so the next load runs the deployed code. Without this, a deploy
 * that forgot to bump CACHE_VERSION would be invisible to every kiosk forever.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }

      return response;
    })
    .catch((error) => {
      if (cached) {
        return cached;
      }

      throw error;
    });

  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Content reads must not be served stale from here — store.js owns the
  // catalogue cache and needs to know whether it is looking at fresh data.
  if (url.pathname.startsWith('/rest/v1/') || url.pathname.startsWith('/functions/v1/')) {
    return;
  }

  // Single-page app: any navigation resolves to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, SHELL_CACHE).catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (isStorageImage(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname === CONFIG_FILE || url.pathname === '/assets-manifest.json') {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  // Artwork is served from the cache and only fetched if the background
  // warm-up has not reached it yet (see warmArtworkCache).
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});
