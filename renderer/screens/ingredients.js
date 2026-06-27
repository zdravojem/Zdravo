import { ingredientImageSrc } from '../ingredient-images.js';

const categoryImageOrder = [
  'sadje',
  'zelenjava',
  'meso_in_mesni_izdelki',
  'ribe',
  'jajca',
  'mlecni_izdelki',
  'strocnice',
  'gobe',
  'vlozena_kisana_zelenjava',
  'zita_kase_zdrobi',
  'moka',
  'pekovski_izdelki_testo_kvas',
  'olja_in_mascobe',
  'zacimbe_in_zelisca',
  'omake_kis_dodatki',
  'sladila',
  'juhe_in_osnove',
  'semena',
  'pijace_alkohol_za_kuhanje'
];

const categoryImageByKey = new Map(
  categoryImageOrder.map((categoryKey, index) => [categoryKey, index + 1])
);

function activeCategoryKey(state, categories) {
  return categories.some((category) => category.key === state.activeCategory)
    ? state.activeCategory
    : null;
}

function visibleProducts(state, categoryKey) {
  return state.ingredientsByCategory[categoryKey] || [];
}

function categoryLabel(category) {
  if (typeof category.label === 'string') {
    return category.label;
  }

  return category.label?.[category.locale] || category.label?.sl || '';
}

function categoryImageSrc(categoryKey) {
  const index = categoryImageByKey.get(categoryKey);
  return index ? `../assets/images/categories/ordered/${index}.png` : '';
}

export function render({ state }) {
  const locale = state.ui.locale;
  const categories = state.ui.categories.map((category) => ({ ...category, locale }));
  const activeCategory = activeCategoryKey(state, categories);
  const activeCategoryData = categories.find((category) => category.key === activeCategory);
  const products = activeCategory ? visibleProducts(state, activeCategory) : [];
  const title = activeCategoryData ? categoryLabel(activeCategoryData) : state.ui.copy.homeNavItems;

  return `
    <section class="screen kiosk-screen screen--products">
      <header class="kiosk-topbar">
        <button class="kiosk-back" data-action="back" aria-label="${state.ui.copy.back}">
          <span aria-hidden="true">&#8249;</span>
          ${state.ui.copy.back}
        </button>
        <h1>${title}</h1>
        <span></span>
      </header>

      <div class="kiosk-scroll">
        ${activeCategory
          ? `
            <div class="product-browser-grid">
              ${products
                .map((item) => {
                  const label = state.ui.translateIngredient(item.name_sl);
                  return `
                    <button class="product-browser-card" data-product="${item.name_sl}">
                      <span class="product-browser-card__photo">
                        <img src="${ingredientImageSrc(item)}" alt="${label}" loading="lazy" />
                      </span>
                      <span class="product-browser-card__label">${label}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>
          `
          : `
            <div class="ingredient-category-grid" aria-label="${state.ui.copy.homeMarketTitle}">
              ${categories
                .map(
                  (category) => `
                    <button
                      class="ingredient-category-card"
                      data-category="${category.key}"
                      aria-label="${categoryLabel(category)}"
                    >
                      <span class="ingredient-category-card__thumb">
                        <img src="${categoryImageSrc(category.key)}" alt="" loading="lazy" />
                      </span>
                      <span class="ingredient-category-card__name">${categoryLabel(category)}</span>
                    </button>
                  `
                )
                .join('')}
            </div>
          `}
      </div>
    </section>
  `;
}

export function bind({ actions, root, state }) {
  const back = root.querySelector('[data-action="back"]');
  if (back) {
    back.addEventListener('pointerdown', () => {
      if (state.activeCategory) {
        actions.openProducts();
        return;
      }
      actions.goHome(false);
    });
  }

  const categories = root.querySelector('.ingredient-category-grid');
  if (categories) {
    categories.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-category]');
      if (card) {
        actions.setCategory(card.dataset.category);
      }
    });
  }

  const grid = root.querySelector('.product-browser-grid');
  if (grid) {
    grid.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-product]');
      if (card) {
        actions.showRecipesForIngredient(card.dataset.product);
      }
    });
  }
}
