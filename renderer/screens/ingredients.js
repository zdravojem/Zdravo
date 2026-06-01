import { ingredientImageSrc, ingredientImageKey } from '../ingredient-images.js';

const productOrderKeys = [
  'korenje',
  'paradiznik',
  'bucke',
  'krompir',
  'cebula',
  'zelje',
  'jabolka',
  'jagode',
  'hruske',
  'slive',
  'ajda',
  'kruh',
  'govedina',
  'piscanec',
  'med'
];

function normalize(value) {
  return ingredientImageKey(value);
}

function allProducts(state) {
  const rows = Object.values(state.ingredientsByCategory).flat();
  const byName = new Map(rows.map((item) => [normalize(item.name_sl), item]));

  const ordered = productOrderKeys
    .map((key) => byName.get(key))
    .filter(Boolean);
  const rest = rows.filter(
    (item) => !productOrderKeys.includes(normalize(item.name_sl))
  );
  return ordered.concat(rest);
}

function visibleProducts(state) {
  if (state.activeCategory === 'all') {
    return allProducts(state);
  }
  return state.ingredientsByCategory[state.activeCategory] || [];
}

function categoryLabel(category, locale) {
  if (category.key === 'meso_ribe') {
    return locale === 'en' ? 'Meat' : 'Meso';
  }
  if (category.key === 'zacimbe') {
    return locale === 'en' ? 'Herbs' : 'Zeli&#353;&#269;a';
  }
  return category.label;
}

export function render({ state }) {
  const locale = state.ui.locale;
  const categories = [
    { key: 'all', label: locale === 'en' ? 'All' : 'Vse' },
    ...state.ui.categories
  ];
  const products = visibleProducts(state);
  const selectedCount = state.selectedIngredients.size;

  return `
    <section class="screen kiosk-screen screen--products">
      <header class="kiosk-topbar">
        <button class="kiosk-back" data-action="back" aria-label="${state.ui.copy.back}">
          <span aria-hidden="true">&#8249;</span>
          ${state.ui.copy.back}
        </button>
        <h1>${state.ui.copy.homeNavItems}</h1>
        <span></span>
      </header>

      <div class="kiosk-scroll">
        <div class="kiosk-tabs" role="tablist">
          ${categories
            .map(
              (category) => `
                <button
                  class="kiosk-tab ${state.activeCategory === category.key ? 'is-active' : ''}"
                  data-category="${category.key}"
                  role="tab"
                  aria-selected="${state.activeCategory === category.key}"
                >
                  ${categoryLabel(category, locale)}
                </button>
              `
            )
            .join('')}
        </div>

        <div class="product-browser-grid">
          ${products
            .map((item) => {
              const label = state.ui.translateIngredient(item.name_sl);
              const isSelected = state.selectedIngredients.has(item.name_sl);
              return `
                <button
                  class="product-browser-card ${isSelected ? 'is-selected' : ''}"
                  data-product="${item.name_sl}"
                  aria-pressed="${isSelected}"
                >
                  <span class="product-browser-card__photo">
                    <img src="${ingredientImageSrc(item.name_sl)}" alt="${label}" loading="lazy" />
                  </span>
                  <span class="product-browser-card__label">${label}</span>
                  <span class="product-browser-card__check" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="ingredient-selection-bar">
        <span class="counter-badge">${state.ui.copy.selectedCount(selectedCount)}</span>
        <button class="btn btn--primary" data-action="next" ${selectedCount ? '' : 'disabled'}>
          ${state.ui.copy.next}
        </button>
      </div>
    </section>
  `;
}

export function bind({ actions, root, state }) {
  const back = root.querySelector('[data-action="back"]');
  if (back) {
    back.addEventListener('pointerdown', () => actions.goHome(false));
  }

  const tabs = root.querySelector('.kiosk-tabs');
  if (tabs) {
    tabs.addEventListener('pointerdown', (event) => {
      const tab = event.target.closest('[data-category]');
      if (tab) {
        actions.setCategory(tab.dataset.category);
      }
    });
  }

  const grid = root.querySelector('.product-browser-grid');
  if (grid) {
    grid.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-product]');
      if (card) {
        actions.toggleIngredient(card.dataset.product);
      }
    });
  }

  const next = root.querySelector('[data-action="next"]');
  if (next) {
    next.addEventListener('pointerdown', () => {
      if (state.selectedIngredients.size) {
        actions.goTo('preferences');
      }
    });
  }
}
