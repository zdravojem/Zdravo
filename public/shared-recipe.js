import { buildUi } from './i18n.js';
import * as detailScreen from './screens/detail.js';

const appRoot = document.getElementById('app');
const config = window.__ZDRAVO_SHARED_RECIPE__ || {};

function fitAppScale() {
  const styles = getComputedStyle(document.documentElement);
  const baseH = parseFloat(styles.getPropertyValue('--app-base-h')) || 854;
  const scale = window.innerHeight / baseH;
  const logicalWidth = window.innerWidth / scale;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--app-scale', String(scale));
  rootStyle.setProperty('--app-logical-w', logicalWidth + 'px');
}

function recipeMailto(state) {
  const recipe = state.currentRecipe;
  const recipeCopy = state.ui.translateRecipe(recipe);
  const ingredients = (recipe.ingredients || []).map((item) => {
    const amount = [item.quantity, state.ui.translateUnit(item.quantity, item.unit)]
      .filter(Boolean)
      .join(' ')
      .trim();
    return `- ${state.ui.translateIngredient(item.name_sl)}${amount ? ` (${amount})` : ''}`;
  });
  const steps = (recipeCopy.steps || []).map((step, index) => `${index + 1}. ${step}`);
  const body = [
    recipeCopy.title,
    recipeCopy.description,
    '',
    state.ui.copy.ingredientsHeading,
    ...ingredients,
    '',
    state.ui.copy.stepsHeading,
    ...steps
  ].filter(Boolean).join('\n');

  return `mailto:?subject=${encodeURIComponent(recipeCopy.title)}&body=${encodeURIComponent(body)}`;
}

function renderError(message) {
  appRoot.innerHTML = `
    <section class="screen screen--standard">
      <div class="empty-state">
        <h1>${message}</h1>
      </div>
    </section>
  `;
}

function normalizeSelectedIngredients(value) {
  if (!Array.isArray(value)) {
    return new Set();
  }

  return new Set(value.map((item) => String(item || '').trim()).filter(Boolean));
}

function createActions(state, render) {
  return {
    goHome() {
      window.history.back();
    },
    goTo() {
      window.history.back();
    },
    shareRecipeByEmail() {
      if (!state.currentRecipe) {
        return;
      }

      window.location.href = recipeMailto(state);
    },
    openRecipeQrShare() {
      const recipeCopy = state.ui.translateRecipe(state.currentRecipe);
      const shareUrl = config.shareUrl || window.location.href;

      if (navigator.share) {
        navigator.share({
          title: recipeCopy.title,
          text: recipeCopy.description,
          url: shareUrl
        }).catch(() => {});
        return;
      }

      navigator.clipboard?.writeText(shareUrl).catch(() => {});
    },
    openRecipeShareLink() {
      window.open(config.shareUrl || window.location.href, '_blank', 'noopener');
    },
    closeRecipeShare() {
      state.recipeShare = null;
      render();
    }
  };
}

function renderRecipe(recipe) {
  const locale = config.locale === 'en' ? 'en' : 'sl';
  const ui = buildUi(locale);
  const state = {
    locale,
    ui,
    screen: 'detail',
    currentRecipe: recipe,
    selectedIngredients: normalizeSelectedIngredients(config.selectedIngredients),
    recipeShare: null
  };
  const render = () => {
    const actions = createActions(state, render);
    appRoot.innerHTML = detailScreen.render({ state, actions });
    detailScreen.bind({ state, actions, root: appRoot });
  };

  document.documentElement.lang = locale;
  document.body.dataset.screen = 'detail';
  document.title = `${ui.translateRecipe(recipe).title} - ${ui.copy.appTitle}`;
  render();
}

async function loadRecipe() {
  if (config.recipe) {
    renderRecipe(config.recipe);
    return;
  }

  if (!config.recipeId) {
    renderError('Recipe not found');
    return;
  }

  const response = await fetch(`/api/recipes/${encodeURIComponent(config.recipeId)}`);
  if (!response.ok) {
    renderError('Recipe not found');
    return;
  }

  const data = await response.json();
  renderRecipe(data.recipe);
}

window.addEventListener('resize', fitAppScale);
window.addEventListener('orientationchange', fitAppScale);
fitAppScale();
loadRecipe().catch((error) => {
  console.warn('Failed to load shared recipe', error);
  renderError('Recipe could not be loaded');
});
