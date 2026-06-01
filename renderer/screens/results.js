import { recipeImageSrc } from '../recipe-images.js';

const recipeCategories = {
  sl: [
    ['all', 'Vsi'],
    ['breakfast', 'Zajtrk'],
    ['lunch', 'Kosilo'],
    ['dinner', 'Ve&#269;erja'],
    ['dessert', 'Sladice'],
    ['quick', 'Hitri recepti']
  ],
  en: [
    ['all', 'All'],
    ['breakfast', 'Breakfast'],
    ['lunch', 'Lunch'],
    ['dinner', 'Dinner'],
    ['dessert', 'Desserts'],
    ['quick', 'Quick recipes']
  ]
};

function totalTime(recipe) {
  return (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function categoryMatches(recipe, activeCategory) {
  if (activeCategory === 'all') {
    return true;
  }
  if (activeCategory === 'quick') {
    return recipe.is_quick === 1;
  }
  if (activeCategory === 'dessert') {
    return ['potica', 'flancati', 'prekmurska-gibanica'].includes(recipe.slug);
  }
  if (activeCategory === 'breakfast') {
    return ['zganci', 'ajdovi-zganci-s-skuto', 'struklji'].includes(recipe.slug);
  }
  if (activeCategory === 'lunch') {
    return ['kranjska-juha', 'goveja-juha-z-rezanci', 'jota', 'ricet'].includes(recipe.slug);
  }
  if (activeCategory === 'dinner') {
    return ['postrv-na-zaru', 'krompirjev-golaz', 'ajdova-kasa-z-jurcki'].includes(recipe.slug);
  }
  return true;
}

function visibleRecipes(state) {
  const query = normalize(state.recipeSearch);
  return state.results.filter((recipe) => {
    const copy = state.ui.translateRecipe(recipe);
    const text = [
      copy.title,
      copy.description,
      ...(recipe.ingredients || []).map((item) => state.ui.translateIngredient(item.name_sl))
    ]
      .join(' ')
      .toLowerCase();
    return categoryMatches(recipe, state.activeRecipeCategory) && text.includes(query);
  });
}

export function render({ state }) {
  const locale = state.ui.locale;
  const recipes = visibleRecipes(state);

  return `
    <section class="screen kiosk-screen screen--recipe-browser">
      <header class="kiosk-topbar">
        <button class="kiosk-back" data-action="back" aria-label="${state.ui.copy.back}">
          <span aria-hidden="true">&#8249;</span>
          ${state.ui.copy.back}
        </button>
        <h1>${state.ui.copy.homeNavRecipes}</h1>
        <span></span>
      </header>

      <div class="kiosk-scroll">
        <label class="recipe-search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            value="${state.recipeSearch}"
            placeholder="${locale === 'en' ? 'Search recipes or ingredients...' : 'I&#353;&#269;i recepte ali sestavine...'}"
            data-recipe-search
          />
        </label>

        <div class="kiosk-tabs" role="tablist">
          ${recipeCategories[locale]
            .map(
              ([key, label]) => `
                <button
                  class="kiosk-tab ${state.activeRecipeCategory === key ? 'is-active' : ''}"
                  data-recipe-category="${key}"
                  role="tab"
                  aria-selected="${state.activeRecipeCategory === key}"
                >
                  ${label}
                </button>
              `
            )
            .join('')}
        </div>

        <div class="recipe-browser-list">
          ${
            recipes.length
              ? recipes
                  .map((recipe) => {
                    const copy = state.ui.translateRecipe(recipe);
                    const difficulty = state.ui.translateDifficulty(recipe.difficulty || 2);
                    const isEasy = (recipe.difficulty || 2) === 1;
                    return `
                      <button class="recipe-browser-row" data-recipe-id="${recipe.id}">
                        <span class="recipe-browser-row__thumb">
                          <img src="${recipeImageSrc(recipe.slug)}" alt="${copy.title}" loading="lazy" />
                        </span>
                        <span class="recipe-browser-row__body">
                          <strong>${copy.title}</strong>
                          <span>
                            <em>${totalTime(recipe)} min</em>
                            <b class="${isEasy ? 'is-easy' : ''}">${difficulty}</b>
                          </span>
                        </span>
                      </button>
                    `;
                  })
                  .join('')
              : `<div class="recipe-browser-empty">${state.ui.copy.resultsNoMatches}</div>`
          }
        </div>
      </div>
    </section>
  `;
}

export function bind({ actions, root }) {
  const back = root.querySelector('[data-action="back"]');
  if (back) {
    back.addEventListener('pointerdown', () => actions.goHome(false));
  }

  const search = root.querySelector('[data-recipe-search]');
  if (search) {
    search.addEventListener('input', (event) => {
      actions.setRecipeSearch(event.target.value);
    });
  }

  const tabs = root.querySelector('.kiosk-tabs');
  if (tabs) {
    tabs.addEventListener('pointerdown', (event) => {
      const tab = event.target.closest('[data-recipe-category]');
      if (tab) {
        actions.setRecipeCategory(tab.dataset.recipeCategory);
      }
    });
  }

  const list = root.querySelector('.recipe-browser-list');
  if (list) {
    list.addEventListener('pointerdown', (event) => {
      const row = event.target.closest('[data-recipe-id]');
      if (row) {
        actions.selectRecipe(Number(row.dataset.recipeId));
      }
    });
  }
}
