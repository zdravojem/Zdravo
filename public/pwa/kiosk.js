// Browser-side kiosk hardening.
//
// The Electron shell got this from BrowserWindow options and Chromium switches
// (kiosk, frame: false, disable-pinch, blocked shortcuts). A PWA has to ask for
// the same behaviour from the page, and can only do the parts the browser
// allows — a web page cannot block Alt+F4 or the OS task switcher. Locking the
// machine down further is the job of the device's own kiosk mode.

// Long-press and right-click menus have no place on a public screen.
document.addEventListener('contextmenu', (event) => event.preventDefault());

// Safari's pinch gestures are not covered by touch-action.
['gesturestart', 'gesturechange', 'gestureend'].forEach((name) => {
  document.addEventListener(name, (event) => event.preventDefault(), { passive: false });
});

// Ctrl/⌘ + wheel zoom, in case the kiosk ends up with a mouse attached.
document.addEventListener(
  'wheel',
  (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener('dragstart', (event) => event.preventDefault());

// Belt and braces against double-tap zoom on engines that ignore touch-action.
let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  (event) => {
    const now = Date.now();

    if (now - lastTouchEnd < 300) {
      event.preventDefault();
    }

    lastTouchEnd = now;
  },
  { passive: false }
);

// When the kiosk is opened as a plain browser tab rather than as an installed
// app, go fullscreen on the first touch — the same edge-to-edge presentation
// the Electron window had. Installed (display: fullscreen) sessions are already
// fullscreen and skip this.
function isStandalone() {
  return (
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function requestFullscreenOnce() {
  document.removeEventListener('pointerdown', requestFullscreenOnce);

  if (isStandalone() || document.fullscreenElement) {
    return;
  }

  // Rejected when the browser does not consider this a user gesture, or when
  // the policy forbids it; either way the app stays usable in a window.
  document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {});
}

document.addEventListener('pointerdown', requestFullscreenOnce);
