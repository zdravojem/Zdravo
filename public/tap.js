// Distinguish a tap from a scroll/drag on touch screens.
//
// Firing navigation on `pointerdown` opens a card the instant a finger lands,
// so on a kiosk any attempt to scroll a list opens whatever happened to be
// under the first touch. Record the press instead and only act on release,
// when the pointer barely moved and is still over the same control. A swipe
// then scrolls and opens nothing.
//
// This mirrors the carousel handling in screens/home.js.
const TAP_SLOP = 10;

export function bindTap(container, selector, onTap) {
  let pressTarget = null;
  let pressX = 0;
  let pressY = 0;

  container.addEventListener('pointerdown', (event) => {
    pressTarget = event.target.closest(selector);
    pressX = event.clientX;
    pressY = event.clientY;
  });

  // The browser takes the gesture over once it resolves into a scroll.
  container.addEventListener('pointercancel', () => {
    pressTarget = null;
  });

  container.addEventListener('pointerup', (event) => {
    const target = pressTarget;
    pressTarget = null;

    if (!target) {
      return;
    }

    // Released somewhere else (e.g. after a swipe) — not a tap on this control.
    if (event.target.closest(selector) !== target) {
      return;
    }

    // Moved too far — treat as a scroll, not a tap.
    if (Math.abs(event.clientX - pressX) > TAP_SLOP || Math.abs(event.clientY - pressY) > TAP_SLOP) {
      return;
    }

    onTap(target, event);
  });
}
