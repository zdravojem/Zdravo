const checkSvg = `
<svg class="icon icon-check" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <path d="M10 20l6 6 14-14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export function render({ state }) {
  const categories = state.ui.categories;
  const activeItems = state.ingredientsByCategory[state.activeCategory] || [];
  const selectedCount = state.selectedIngredients.size;
  const canContinue = selectedCount > 0;

  return `
    <section class="screen screen--standard">
      <header class="screen-header">
        <button class="wordmark" data-action="home">${state.ui.copy.appTitle}</button>
        <div class="header-copy">
          <h1>${state.ui.copy.ingredientsTitle}</h1>
          <p>${state.ui.copy.ingredientsSubtitle}</p>
        </div>
        <button class="btn btn--primary btn--home" data-action="home">${state.ui.copy.home}</button>
      </header>

      <div class="tab-list" role="tablist">
        ${categories
          .map(
            (category) => `
              <button
                class="tab ${category.key === state.activeCategory ? 'is-active' : ''}"
                data-category="${category.key}"
                role="tab"
                aria-selected="${category.key === state.activeCategory}"
              >
                <span class="tab-emoji">${category.emoji}</span>
                <span>${category.label}</span>
              </button>
            `
          )
          .join('')}
      </div>

      <div class="ingredient-grid">
        ${activeItems
          .map((item) => {
            const isSelected = state.selectedIngredients.has(item.name_sl);
            return `
              <button
                class="ingredient-card ${isSelected ? 'is-selected' : ''}"
                data-ingredient="${item.name_sl}"
                aria-pressed="${isSelected}"
              >
                <div class="ingredient-emoji">${item.emoji || '🥗'}</div>
                <div class="ingredient-name">${state.ui.translateIngredient(item.name_sl)}</div>
                <div class="ingredient-check">${checkSvg}</div>
              </button>
            `;
          })
          .join('')}
      </div>

      <div class="bottom-bar">
        <div class="counter-badge">${state.ui.copy.selectedCount(selectedCount)}</div>
        <button
          class="btn btn--primary"
          data-action="next"
          ${canContinue ? '' : 'disabled'}
        >
          ${state.ui.copy.next}
        </button>
      </div>
    </section>
  `;
}

export function bind({ actions, root }) {
  root.querySelectorAll('[data-action="home"]').forEach((button) => {
    button.addEventListener('pointerdown', () => actions.goHome(true));
  });

  const tabList = root.querySelector('.tab-list');
  if (tabList) {
    tabList.addEventListener('pointerdown', (event) => {
      const tab = event.target.closest('[data-category]');
      if (tab) {
        actions.setCategory(tab.dataset.category);
      }
    });
  }

  const grid = root.querySelector('.ingredient-grid');
  if (grid) {
    grid.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-ingredient]');
      if (card) {
        actions.toggleIngredient(card.dataset.ingredient);
      }
    });
  }

  const nextButton = root.querySelector('[data-action="next"]');
  if (nextButton && !nextButton.disabled) {
    nextButton.addEventListener('pointerdown', () => actions.goTo('preferences'));
  }
}
