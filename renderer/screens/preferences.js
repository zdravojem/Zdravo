const checkSvg = `
<svg class="icon icon-check" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <path d="M10 20l6 6 14-14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export function render({ state }) {
  const options = state.ui.preferences;

  return `
    <section class="screen screen--standard">
      <header class="screen-header">
        <button class="btn btn--ghost btn--back" data-action="back">← ${state.ui.copy.back}</button>
        <div class="header-copy">
          <h1>${state.ui.copy.preferencesTitle}</h1>
          <p>${state.ui.copy.preferencesSubtitle}</p>
        </div>
        <button class="btn btn--primary btn--home" data-action="home">${state.ui.copy.home}</button>
      </header>

      <div class="toggle-list">
        ${options
          .map((option) => {
            const isActive = state.preferences[option.key];
            return `
              <button
                class="toggle-card ${isActive ? 'is-active' : ''}"
                data-pref="${option.key}"
                aria-pressed="${isActive}"
              >
                <span class="toggle-emoji">${option.emoji}</span>
                <span class="toggle-label">${option.label}</span>
                <span class="toggle-check">${checkSvg}</span>
              </button>
            `;
          })
          .join('')}
      </div>

      <div class="bottom-bar bottom-bar--right">
        <button class="btn btn--primary" data-action="next">${state.ui.copy.findRecipes}</button>
      </div>
    </section>
  `;
}

export function bind({ actions, root }) {
  root.querySelector('[data-action="back"]').addEventListener('pointerdown', () => {
    actions.goTo('ingredients');
  });

  root.querySelector('[data-action="home"]').addEventListener('pointerdown', () => {
    actions.goHome(true);
  });

  const list = root.querySelector('.toggle-list');
  if (list) {
    list.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-pref]');
      if (card) {
        actions.togglePreference(card.dataset.pref);
      }
    });
  }

  root.querySelector('[data-action="next"]').addEventListener('pointerdown', () => {
    actions.showMatchedRecipes();
  });
}
