import { recipeImageSrc } from '../recipe-images.js';
import {
  recipeHasTag,
  recipeServingsText,
  recipeTimeMinutes
} from '../recipe-meta.js';

function totalTime(recipe) {
  return recipeTimeMinutes(recipe);
}

const recipeBrowserMetaIcons = {
  time: `
    <svg class="recipe-browser-row__meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  servings: `
    <svg class="recipe-browser-row__meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
      <circle cx="16.5" cy="10.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M4.8 19c.4-3 3-5.2 6-5.2s5.6 2.2 6 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M13.5 19c.2-1.8 1.7-3.1 3.5-3.1 1.7 0 3.1 1.3 3.4 3.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  difficulty: `
    <svg class="recipe-browser-row__meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19v-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M12 19V8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M19 19V5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `
};

function normalize(value) {
  return String(value || '').toLowerCase();
}

function categoryMatches(recipe, activeCategory) {
  if (activeCategory === 'all') {
    return true;
  }
  return recipeHasTag(recipe, activeCategory);
}

function visibleRecipes(state) {
  const query = normalize(state.recipeSearch);
  return state.results.filter((recipe) => {
    const copy = state.ui.translateRecipe(recipe);
    const text = [
      copy.title,
      copy.description,
      recipe.tags,
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
            data-focus-key="recipe-search"
          />
        </label>

        <div class="recipe-browser-list">
          ${
            recipes.length
              ? recipes
                  .map((recipe) => {
                    const copy = state.ui.translateRecipe(recipe);
                    const difficulty = state.ui.translateDifficulty(recipe.difficulty || 'Normalna');
                    const servings = recipeServingsText(recipe, locale);
                    return `
                      <button class="recipe-browser-row" data-recipe-id="${recipe.id}">
                        <span class="recipe-browser-row__thumb">
                          <img src="${recipeImageSrc(recipe)}" alt="${copy.title}" loading="lazy" />
                        </span>
                        <span class="recipe-browser-row__body">
                          <strong>${copy.title}</strong>
                          <span class="recipe-browser-row__meta">
                            <span class="recipe-browser-row__meta-item">
                              ${recipeBrowserMetaIcons.time}
                              <span>${totalTime(recipe)} min</span>
                            </span>
                            <span class="recipe-browser-row__meta-item">
                              ${recipeBrowserMetaIcons.difficulty}
                              <span>${difficulty}</span>
                            </span>
                            ${servings ? `
                              <span class="recipe-browser-row__meta-item">
                                ${recipeBrowserMetaIcons.servings}
                                <span>${servings}</span>
                              </span>
                            ` : ''}
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
