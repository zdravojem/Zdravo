import { ingredientImageSrc } from '../ingredient-images.js';

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function totalTime(recipe) {
  return (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
}

const ingredientIcons = {
  Ajda: '&#127806;',
  Korenje: '&#129365;',
  Paprika: '&#129745;',
  'ParadiÅ¾nik': '&#127813;',
  Krompir: '&#129364;',
  Zelje: '&#129388;',
  Repa: '&#129365;',
  Pesa: '&#129364;',
  Brokoli: '&#129382;',
  'CvetaÄa': '&#129382;',
  'JurÄki': '&#127812;',
  Koruza: '&#127805;',
  Skuta: '&#129472;',
  Jajca: '&#129370;',
  Maslo: '&#129480;',
  Mleko: '&#129371;',
  Sol: '&#129474;',
  Poper: '&#127798;',
  Meta: '&#127807;'
};

const prepIcons = [
  '<path d="M5 8h14l-1 12H6L5 8zM8 8a4 4 0 0 1 8 0" />',
  '<path d="M4 20l9-9M13 11l4-4a3 3 0 0 1 4 4l-4 4M8 16l4 4" />',
  '<path d="M12 21c5-4 8-7 8-11a5 5 0 0 0-8-4 5 5 0 0 0-8 4c0 4 3 7 8 11z" />',
  '<path d="M5 12h14M7 8h10M8 16h8" />'
];

function iconSvg(path) {
  return `
    <svg class="recipe-detail-icon" viewBox="0 0 24 24" aria-hidden="true">
      ${path}
    </svg>
  `;
}

function amountText(state, item) {
  return [item.quantity, state.ui.translateUnit(item.quantity, item.unit)]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function recipeTags(state, recipe) {
  const tags = [];
  if (recipe.difficulty) {
    tags.push(state.ui.translateDifficulty(recipe.difficulty));
  }
  if (recipe.servings) {
    tags.push(`${recipe.servings} ${state.ui.copy.servings.toLowerCase()}`);
  }
  if (recipe.is_gluten_free) {
    tags.push(state.ui.locale === 'en' ? 'Gluten free' : 'Brez glutena');
  }
  return tags;
}

function shareCopy(locale) {
  if (locale === 'en') {
    return {
      title: 'Scan the QR code',
      description: 'Scan this code on your phone to open a prefilled email with the recipe.',
      loading: 'Preparing QR code...',
      openEmail: 'Open email app',
      close: 'Close'
    };
  }

  return {
    title: 'Skeniraj QR kodo',
    description: 'Skeniraj to kodo na telefonu, da se odpre pripravljen e-mail z receptom.',
    loading: 'Pripravljam QR kodo ...',
    openEmail: 'Odpri e-pošto',
    close: 'Zapri'
  };
}

function renderShareModal(state) {
  const share = state.recipeShare;
  if (!share || share.mode !== 'qr') {
    return '';
  }

  const copy = shareCopy(state.ui.locale);

  return `
    <div class="recipe-share-modal-backdrop">
      <div class="recipe-share-modal" role="dialog" aria-modal="true" aria-label="${copy.title}">
        <button class="recipe-share-modal__close" data-action="close-share" aria-label="${copy.close}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <h3>${copy.title}</h3>
        <p>${copy.description}</p>
        <div class="recipe-share-modal__qr ${share.loading ? 'is-loading' : ''}">
          ${share.loading ? `<span class="recipe-share-modal__spinner"></span><strong>${copy.loading}</strong>` : share.qrSvg}
        </div>
        ${share.error ? `<p class="recipe-share-modal__error">${share.error}</p>` : ''}
        <div class="recipe-share-modal__actions">
          <button class="btn btn--outline" data-action="share-email">${copy.openEmail}</button>
          <button class="btn btn--primary" data-action="close-share">${copy.close}</button>
        </div>
      </div>
    </div>
  `;
}

export function render({ state }) {
  const recipe = state.currentRecipe;
  if (!recipe) {
    return `
      <section class="screen screen--standard">
        <div class="empty-state">
          <h1>${state.ui.copy.unavailableRecipe}</h1>
          <button class="btn btn--primary" data-action="home">${state.ui.copy.home}</button>
        </div>
      </section>
    `;
  }

  const recipeCopy = state.ui.translateRecipe(recipe);
  const steps = recipeCopy.steps || [];
  const ingredients = recipe.ingredients || [];
  const selectedNames = new Set(
    Array.from(state.selectedIngredients).map(normalizeName)
  );
  const marketIngredients = ingredients.filter((item) =>
    selectedNames.has(normalizeName(item.name_sl))
  );
  const marketList = (marketIngredients.length ? marketIngredients : ingredients).slice(0, 5);
  const tags = recipeTags(state, recipe);

  return `
    <section class="screen screen--detail">
      <div class="recipe-sheet">
        <header class="recipe-sheet__topbar">
          <button class="recipe-back" data-action="back" aria-label="${state.ui.copy.back}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span>${state.ui.copy.homeNavRecipes}</span>
          <strong><span class="brand-leaf"></span>${state.ui.copy.appTitle.toUpperCase()}</strong>
        </header>

        <div class="recipe-sheet__scroll">
          <div class="recipe-photo">
            <img src="../${recipe.image_path}" alt="${recipeCopy.title}" />
            <button class="recipe-favorite" aria-label="Favorite">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11z" />
              </svg>
            </button>
          </div>

          <section class="recipe-intro">
            <div>
              <h1>${recipeCopy.title}</h1>
              <p>${recipeCopy.description}</p>
            </div>
            <span class="recipe-leaf-mark" aria-hidden="true"></span>
          </section>

          <div class="recipe-pill-row">
            <span>${iconSvg('<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />')} ${totalTime(recipe)} min</span>
            ${tags.map((tag) => `<span>${tag}</span>`).join('')}
          </div>

          <section class="recipe-share-panel">
            <div class="recipe-section-title">
              <h2>${state.ui.locale === 'en' ? 'Send yourself the recipe' : 'Po&#353;lji si recept'}</h2>
              <span></span>
            </div>
            <p>${state.ui.locale === 'en' ? 'Choose a way to keep the recipe with you.' : 'Izberi na&#269;in in imej recept vedno pri sebi.'}</p>
            <div class="recipe-share-grid">
              <button class="recipe-share-card" type="button" data-action="share-email">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
                <span><strong>${state.ui.locale === 'en' ? 'Send by email' : 'Po&#353;lji na e-mail'}</strong>${state.ui.locale === 'en' ? 'Recipe to your inbox' : 'Recept prejme&#353; na svoj e-mail'}</span>
              </button>
              <button class="recipe-share-card" type="button" data-action="share-qr">
                <span class="recipe-qr" aria-hidden="true"></span>
                <span><strong>${state.ui.locale === 'en' ? 'Scan QR code' : 'Skeniraj QR kodo'}</strong>${state.ui.locale === 'en' ? 'Open on your phone' : 'Odpri recept na svojem telefonu'}</span>
              </button>
            </div>
          </section>

          <section class="recipe-card-panel">
            <h2>${state.ui.copy.ingredientsHeading}</h2>
            <div class="recipe-ingredient-grid">
              ${ingredients
                .map((item) => {
                  const hasIt = selectedNames.has(normalizeName(item.name_sl));
                  const amount = amountText(state, item);
                  return `
                    <div class="recipe-ingredient-tile ${hasIt ? 'is-available' : 'is-missing'}">
                      <span class="recipe-ingredient-photo">
                        <img src="${ingredientImageSrc(item.name_sl)}" alt="${state.ui.translateIngredient(item.name_sl)}" loading="lazy" />
                      </span>
                      <span><strong>${state.ui.translateIngredient(item.name_sl)}</strong>${amount}</span>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </section>

          <section class="recipe-market-panel">
            <div class="recipe-market-title">
              <h2>${state.ui.locale === 'en' ? 'Market ingredients' : 'Sestavine iz tr&#382;nice'}</h2>
              <span>${state.ui.copy.homeMarketBadge}</span>
            </div>
            <div class="recipe-market-row">
              ${marketList
                .map(
                  (item) => `
                    <div class="recipe-market-chip">
                      <span class="recipe-market-chip__photo">
                        <img src="${ingredientImageSrc(item.name_sl)}" alt="${state.ui.translateIngredient(item.name_sl)}" loading="lazy" />
                      </span>
                      ${state.ui.translateIngredient(item.name_sl)}
                    </div>
                  `
                )
                .join('')}
            </div>
          </section>

          <section class="recipe-card-panel recipe-prep-panel">
            <h2>${state.ui.copy.stepsHeading}</h2>
            <div class="recipe-prep-list">
              ${steps
                .map(
                  (step, index) => `
                    <div class="recipe-prep-step">
                      <span class="recipe-prep-number">${index + 1}</span>
                      ${iconSvg(prepIcons[index % prepIcons.length])}
                      <p>${step}</p>
                    </div>
                  `
                )
                .join('')}
            </div>
          </section>
        </div>
      </div>
      ${renderShareModal(state)}
    </section>
  `;
}

export function bind({ actions, root }) {
  root.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) {
      if (event.target.classList.contains('recipe-share-modal-backdrop')) {
        actions.closeRecipeShare();
      }
      return;
    }

    const action = target.dataset.action;
    if (action === 'home') {
      actions.goHome(true);
      return;
    }

    if (action === 'back') {
      actions.goTo('results');
      return;
    }

    if (action === 'share-email') {
      actions.shareRecipeByEmail();
      return;
    }

    if (action === 'share-qr') {
      actions.openRecipeQrShare();
      return;
    }

    if (action === 'close-share') {
      actions.closeRecipeShare();
    }
  });
}
