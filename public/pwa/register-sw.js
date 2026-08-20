// Service worker registration.
//
// An unattended kiosk should never need someone to clear a cache, so a worker
// that finds an update installs it and takes over on the spot. The app is
// re-rendered from scratch on every navigation anyway, and the idle timer
// returns to the welcome screen, so the reload is invisible in practice.

if ('serviceWorker' in navigator) {
  // On the very first visit the worker claims an already-loaded page, which is
  // not an update and must not trigger a reload.
  const hadController = Boolean(navigator.serviceWorker.controller);

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;

        if (!installing) {
          return;
        }

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            installing.postMessage('skip-waiting');
          }
        });
      });

      // Check for a new deployment periodically; kiosks can run for weeks.
      window.setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    } catch (error) {
      console.warn('Service worker registration failed', error);
    }
  });

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !hadController) {
      return;
    }

    reloading = true;
    window.location.reload();
  });
}
