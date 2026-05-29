const leafSvg = `
<svg class="icon icon-leaf" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
  <ellipse cx="40" cy="40" rx="28" ry="18" transform="rotate(-20 40 40)" />
  <ellipse cx="80" cy="40" rx="28" ry="18" transform="rotate(20 80 40)" />
</svg>`;

const chefSvg = `
<svg class="icon icon-chef" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <path d="M30 55c-10-6-12-20-4-30 8-9 22-9 30-1 8-10 24-10 32 0 7 9 5 24-5 30" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
  <rect x="28" y="55" width="64" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="6" />
  <path d="M52 83v18M68 83v18" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
  <path d="M20 95h18M82 95h18" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
  <path d="M20 95l6-12M100 95l-6-12" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
</svg>`;

const tapSvg = `
<svg class="icon icon-tap" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" stroke-width="6" opacity="0.5" />
  <path d="M60 35v30" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
  <path d="M46 66l14 18 14-18" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const botanicalSvg = `
<svg class="icon icon-botanical" viewBox="0 0 160 60" aria-hidden="true" focusable="false">
  <path d="M10 30c30-10 70-10 100 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M30 24c-6-10 4-18 12-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M70 20c-6-10 4-18 12-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M110 24c-6-10 4-18 12-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
</svg>`;

export function render({ state }) {
  return `
    <section class="screen screen--welcome">
      <div class="welcome-card">
        <div class="logo-mark">${leafSvg}</div>
        <h1 class="welcome-title">ZDRAVO JEM</h1>
        <p class="welcome-subtitle">${state.ui.copy.welcomeSubtitle}</p>
        <div class="divider"></div>
        <div class="chef-mark">${chefSvg}</div>
        <div class="botanical botanical--left">${botanicalSvg}</div>
        <div class="botanical botanical--right">${botanicalSvg}</div>
        <button class="btn btn--outline btn--cta btn--pulse" data-action="start">
          <span class="btn-icon">${tapSvg}</span>
          <span>${state.ui.copy.startLabel}</span>
        </button>
      </div>

      <footer class="footer-bar">
        <div class="footer-item">
          <img src="../assets/logos/eu-flag.svg" alt="EU" />
          <span>${state.ui.copy.fundingLabel}</span>
        </div>
        <div class="footer-item">
          <img src="../assets/logos/slovenia-flag.svg" alt="${state.ui.languageNames.sl}" />
        </div>
        <div class="footer-item">
          <img src="../assets/logos/i-feel-slovenia.svg" alt="I Feel Slovenia" />
        </div>
      </footer>
    </section>
  `;
}

export function bind({ actions, root }) {
  const screen = root.querySelector('.screen--welcome');
  if (!screen) {
    return;
  }
  screen.addEventListener('pointerdown', () => {
    actions.goTo('home');
  });
}
