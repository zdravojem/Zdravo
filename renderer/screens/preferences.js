const checkSvg = `
<svg class="icon icon-check" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <path d="M10 20l6 6 14-14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const SCREEN_COPY = {
  sl: {
    eyebrow: 'Prehranski filtri',
    heroTitle: 'Izberi, kar ti ustreza',
    heroText: 'Ti filtri pomagajo prilagoditi predloge receptov tvojemu tempu in prehrani.',
    heroCount: 'izbranih',
    heroCountOf: 'od',
    activeTitle: 'Aktivni filtri',
    activeHint: 'Neobvezno',
    activeEmpty: 'Zaenkrat ni izbranih filtrov.',
    cardMeta: 'Vključeno v rezultate receptov',
    footerNote: 'Recepte lahko vedno zožiš ali razširiš.'
  },
  en: {
    eyebrow: 'Dietary filters',
    heroTitle: 'Pick what fits you',
    heroText: 'These filters help tailor recipe suggestions to your pace and diet.',
    heroCount: 'selected',
    heroCountOf: 'of',
    activeTitle: 'Active filters',
    activeHint: 'Optional',
    activeEmpty: 'No filters selected yet.',
    cardMeta: 'Included in recipe results',
    footerNote: 'You can narrow or broaden results anytime.'
  }
};

function getCopy(locale) {
  return SCREEN_COPY[locale] || SCREEN_COPY.sl;
}

function activeLabel(selected, total, copy) {
  return `${selected} ${copy.heroCount} ${copy.heroCountOf} ${total}`;
}

export function render({ state }) {
  const locale = state.ui.locale || 'sl';
  const copy = getCopy(locale);
  const options = state.ui.preferences;
  const selectedOptions = options.filter((option) => state.preferences[option.key]);

  const selectedChips = selectedOptions.length
    ? selectedOptions
        .map(
          (option) => `
            <span class="prefs-chip">
              <span class="prefs-chip__emoji" aria-hidden="true">${option.emoji}</span>
              <span>${option.label}</span>
            </span>
          `
        )
        .join('')
    : `<div class="prefs-empty">${copy.activeEmpty}</div>`;

  return `
    <section class="screen screen--standard screen--preferences">
      <header class="screen-header screen-header--preferences">
        <button class="btn btn--ghost btn--back" data-action="back">&larr; ${state.ui.copy.back}</button>
        <div class="header-copy">
          <span class="header-copy__eyebrow">${copy.eyebrow}</span>
          <h1>${state.ui.copy.preferencesTitle}</h1>
          <p>${state.ui.copy.preferencesSubtitle}</p>
        </div>
        <button class="btn btn--primary btn--home" data-action="home">${state.ui.copy.home}</button>
      </header>

      <section class="prefs-hero" aria-label="${copy.heroTitle}">
        <div class="prefs-hero__copy">
          <div class="prefs-hero__icon" aria-hidden="true">🌿</div>
          <div class="prefs-hero__text">
            <h2>${copy.heroTitle}</h2>
            <p>${copy.heroText}</p>
          </div>
        </div>
        <div class="prefs-hero__count" aria-label="${activeLabel(selectedOptions.length, options.length, copy)}">
          <strong>${selectedOptions.length}</strong>
          <span>${copy.heroCount}</span>
          <small>${copy.heroCountOf} ${options.length}</small>
        </div>
      </section>

      <section class="prefs-summary" aria-label="${copy.activeTitle}">
        <div class="prefs-summary__header">
          <h2>${copy.activeTitle}</h2>
          <span>${copy.activeHint}</span>
        </div>
        <div class="prefs-chip-row">
          ${selectedChips}
        </div>
      </section>

      <div class="toggle-list prefs-grid">
        ${options
          .map((option) => {
            const isActive = state.preferences[option.key];
            return `
              <button
                class="toggle-card prefs-card ${isActive ? 'is-active' : ''}"
                data-pref="${option.key}"
                aria-pressed="${isActive}"
              >
                <span class="toggle-emoji prefs-card__emoji" aria-hidden="true">${option.emoji}</span>
                <span class="toggle-body">
                  <span class="toggle-label">${option.label}</span>
                  <span class="toggle-meta">${copy.cardMeta}</span>
                </span>
                <span class="toggle-check">${checkSvg}</span>
              </button>
            `;
          })
          .join('')}
      </div>

      <div class="bottom-bar prefs-footer">
        <div class="prefs-footer__note">${copy.footerNote}</div>
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
