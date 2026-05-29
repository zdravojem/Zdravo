function renderDifficultyDots(level, label) {
  return `
    <span class="difficulty-dots" aria-label="${label} ${level}">
      ${[1, 2, 3]
        .map((dot) => `<span class="dot ${dot <= level ? 'is-active' : ''}"></span>`)
        .join('')}
    </span>
  `;
}

function totalTime(recipe) {
  return (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
}

export function render({ state }) {
  const recipes = state.results;
  const meta = state.resultsMeta;

  return `
    <section class="screen screen--standard">
      <header class="screen-header">
        <button class="btn btn--ghost btn--back" data-action="back">← ${state.ui.copy.back}</button>
        <div class="header-copy">
          <h1>${state.ui.copy.resultsTitle}</h1>
          <p>${state.ui.copy.resultsFound(meta.count)} · ${meta.label}</p>
        </div>
        <button class="btn btn--primary btn--home" data-action="home">🏠 ${state.ui.copy.home}</button>
      </header>

      <div class="recipe-grid">
        ${recipes
          .map((recipe) => {
            const recipeCopy = state.ui.translateRecipe(recipe);
            const missingText = recipe.missingPreview.length
              ? state.ui.copy.missingIngredients(
                  recipe.missingPreview
                    .map((name) => state.ui.translateIngredient(name))
                    .join(', ')
                )
              : '';
            return `
              <article class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-image">
                  <img src="../${recipe.image_path}" alt="${recipeCopy.title}" />
                  <div class="recipe-badges">
                    <span class="badge">${state.ui.translateSeason(recipe.season)}</span>
                    <span class="badge badge--outline">${state.ui.translateDifficulty(
                      recipe.difficulty
                    )}</span>
                  </div>
                </div>
                <div class="recipe-body">
                  <h3 class="recipe-title">${recipeCopy.title}</h3>
                  <p class="recipe-desc">${recipeCopy.description}</p>
                  <div class="recipe-meta">
                    <span>⏱ ${totalTime(recipe)} min</span>
                    <span>👥 ${recipe.servings || 2}</span>
                    ${renderDifficultyDots(recipe.difficulty || 2, state.ui.copy.difficulty)}
                  </div>
                  ${
                    missingText
                      ? `<div class="missing-badge">${missingText}</div>`
                      : ''
                  }
                  <button class="btn btn--outline btn--small" data-recipe-id="${
                    recipe.id
                  }">${state.ui.copy.viewRecipe}</button>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

export function bind({ actions, root }) {
  root.querySelector('[data-action="back"]').addEventListener('pointerdown', () => {
    actions.goTo('preferences');
  });

  root.querySelector('[data-action="home"]').addEventListener('pointerdown', () => {
    actions.goHome(true);
  });

  const grid = root.querySelector('.recipe-grid');
  if (grid) {
    grid.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-recipe-id]');
      if (card) {
        actions.selectRecipe(Number(card.dataset.recipeId));
      }
    });
  }
}
