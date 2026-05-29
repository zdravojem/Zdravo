const navIcons = {
  home: `
    <svg class="home-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    </svg>
  `,
  items: `
    <svg class="home-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h12l-1 12H7L6 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
  recipes: `
    <svg class="home-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12v16H6z" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M9 8h6M9 12h6M9 16h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
  games: `
    <svg class="home-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9h12a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-2l-2-2h-4l-2 2H6a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <path d="M8 13h3M9.5 11.5v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="16.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="18.5" cy="14.5" r="1" fill="currentColor" />
    </svg>
  `
};

const homeCategories = [
  { label: { sl: 'Sadje', en: 'Fruit' }, icon: '🍎', categoryKey: 'sadje' },
  { label: { sl: 'Zelenjava', en: 'Vegetables' }, icon: '🥕', categoryKey: 'zelenjava' },
  { label: { sl: 'Mlečni izdelki', en: 'Dairy' }, icon: '🥛', categoryKey: 'mlecni' },
  { label: { sl: 'Žita', en: 'Grains' }, icon: '🌾', categoryKey: 'zita' },
  { label: { sl: 'Zelišča', en: 'Herbs' }, icon: '🌿', categoryKey: 'zacimbe' },
  { label: { sl: 'Med', en: 'Honey' }, icon: '🍯' }
];

const homeItems = [
  { name: 'Jabolka', icon: '🍎' },
  { name: 'Korenje', icon: '🥕' },
  { name: 'Skuta', icon: '🧀' },
  { name: 'Ajda', icon: '🌾' },
  { name: 'Jagode', icon: '🍓' }
];

const featuredRecipes = [
  {
    title: { sl: 'Ajdova skleda z zelenjavo', en: 'Buckwheat veggie bowl' },
    time: '30 min',
    difficulty: { sl: 'Enostavno', en: 'Easy' },
    servings: { sl: '2 porciji', en: '2 servings' },
    image: 'assets/images/recipes/ajdova-kasa-z-jurcki.jpg'
  },
  {
    title: { sl: 'Skutini palačinki', en: 'Curd crepes' },
    time: '20 min',
    difficulty: { sl: 'Enostavno', en: 'Easy' },
    servings: { sl: '2 porciji', en: '2 servings' },
    image: 'assets/images/recipes/ajdovi-zganci-s-skuto.jpg'
  },
  {
    title: { sl: 'Zelenjavna pita', en: 'Vegetable pie' },
    time: '45 min',
    difficulty: { sl: 'Srednje', en: 'Medium' },
    servings: { sl: '4 porcije', en: '4 servings' },
    image: 'assets/images/recipes/krompirjev-golaz.jpg'
  }
];

const homeGames = [
  { title: { sl: 'Sestavi zdrav obrok', en: 'Build a healthy meal' }, icon: '🥗' },
  { title: { sl: 'Prepoznaj živilo', en: 'Identify the ingredient' }, icon: '🔎' }
];

function pickLabel(value, locale) {
  if (!value || typeof value === 'string') {
    return value;
  }
  return value[locale] || value.sl;
}

export function render({ state }) {
  const locale = state.ui.locale;

  return `
    <section class="screen screen--home">
      <header class="home-hero">
        <div class="home-hero__content">
          <div class="home-hero__title">${state.ui.copy.appTitle}</div>
          <p class="home-hero__subtitle">${state.ui.copy.homeIntro}</p>
        </div>
      </header>

      <section class="home-section">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeMarketTitle}</h2>
          <span class="home-badge">${state.ui.copy.homeMarketBadge}</span>
        </div>
        <div class="home-chip-row">
          ${homeCategories
            .map(
              (category) => `
                <button
                  class="home-chip"
                  data-action="start"
                  ${category.categoryKey ? `data-category="${category.categoryKey}"` : ''}
                >
                  <span class="home-chip__icon">${category.icon}</span>
                  <span>${pickLabel(category.label, locale)}</span>
                </button>
              `
            )
            .join('')}
        </div>
        <div class="home-item-row">
          ${homeItems
            .map(
              (item) => `
                <button class="home-item" data-action="start">
                  <span class="home-item__icon">${item.icon}</span>
                  <span>${state.ui.translateIngredient(item.name)}</span>
                </button>
              `
            )
            .join('')}
        </div>
      </section>

      <section class="home-section">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeRecipesTitle}</h2>
        </div>
        <div class="home-recipe-grid">
          ${featuredRecipes
            .map(
              (recipe) => `
                <button class="home-recipe-card" data-action="recipes">
                  <div class="home-recipe-image">
                    <img src="../${recipe.image}" alt="${pickLabel(recipe.title, locale)}" />
                  </div>
                  <div class="home-recipe-body">
                    <h3>${pickLabel(recipe.title, locale)}</h3>
                    <div class="home-recipe-meta">
                      <span>${recipe.time}</span>
                      <span>${pickLabel(recipe.difficulty, locale)}</span>
                      <span>${pickLabel(recipe.servings, locale)}</span>
                    </div>
                  </div>
                </button>
              `
            )
            .join('')}
        </div>
      </section>

      <section class="home-section">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeGamesTitle}</h2>
        </div>
        <div class="home-game-grid">
          ${homeGames
            .map(
              (game) => `
                <button class="home-game-card" data-action="games">
                  <span class="home-game-icon">${game.icon}</span>
                  <span>${pickLabel(game.title, locale)}</span>
                </button>
              `
            )
            .join('')}
        </div>
      </section>

    </section>
  `;
}

export function bind({ actions, root, state }) {
  const screen = root.querySelector('.screen--home');
  if (!screen) {
    return;
  }

  screen.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) {
      return;
    }

    const action = target.dataset.action;

    if (action === 'start') {
      const categoryKey = target.dataset.category;
      if (categoryKey) {
        state.activeCategory = categoryKey;
      }
      actions.goTo('ingredients');
      return;
    }

    if (action === 'recipes') {
      actions.goTo('results');
    }
  });
}
