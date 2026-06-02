import * as welcome from './screens/welcome.js';
import * as homeScreen from './screens/home.js';
import * as ingredientsScreen from './screens/ingredients.js';
import * as preferencesScreen from './screens/preferences.js';
import * as resultsScreen from './screens/results.js';
import * as detailScreen from './screens/detail.js';
import * as gamesScreen from './screens/games.js';
import { buildUi } from './i18n.js';

const appRoot = document.getElementById('app');
const localeStorageKey = 'zdravo.locale';

function loadLocale() {
  try {
    const savedLocale = window.localStorage.getItem(localeStorageKey);
    return savedLocale === 'en' ? 'en' : 'sl';
  } catch (error) {
    return 'sl';
  }
}

function saveLocale(locale) {
  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch (error) {
    // Ignore storage failures in kiosk and private browsing modes.
  }
}

const initialLocale = loadLocale();
const initialUi = buildUi(initialLocale);

function defaultPreferences() {
  return {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    heartHealthy: false,
    quick: false
  };
}

function shareLocaleLabels(locale) {
  if (locale === 'en') {
    return {
      time: 'Time',
      servings: 'Servings',
      ingredients: 'Ingredients',
      steps: 'Steps',
      footer: 'Shared from Zdravo Jem kiosk'
    };
  }

  return {
    time: 'Čas',
    servings: 'Porcije',
    ingredients: 'Sestavine',
    steps: 'Koraki',
    footer: 'Deljeno iz kioska Zdravo Jem'
  };
}

function buildRecipeShareBody(state, recipe, recipeCopy) {
  const labels = shareLocaleLabels(state.locale);
  const totalMinutes = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);

  const ingredientLines = (recipe.ingredients || []).map((item) => {
    const name = state.ui.translateIngredient(item.name_sl);
    const amount = [item.quantity, state.ui.translateUnit(item.quantity, item.unit)]
      .filter(Boolean)
      .join(' ')
      .trim();
    return `- ${name}${amount ? ` (${amount})` : ''}`;
  });

  const stepLines = (recipeCopy.steps || []).map((step, index) => `${index + 1}. ${step}`);

  return [
    recipeCopy.title,
    recipeCopy.description,
    '',
    `${labels.time}: ${totalMinutes} min`,
    recipe.servings ? `${labels.servings}: ${recipe.servings}` : '',
    '',
    `${labels.ingredients}:`,
    ...ingredientLines,
    '',
    `${labels.steps}:`,
    ...stepLines,
    '',
    labels.footer
  ]
    .filter(Boolean)
    .join('\n');
}

function buildRecipeMailto(state, recipe) {
  const recipeCopy = state.ui.translateRecipe(recipe);
  const subject = `${recipeCopy.title} - ${state.ui.copy.appTitle}`;
  const body = buildRecipeShareBody(state, recipe, recipeCopy);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const state = {
  locale: initialLocale,
  ui: initialUi,
  screen: 'welcome',
  activeCategory: 'zelenjava',
  activeRecipeCategory: 'all',
  recipeSearch: '',
  ingredientsByCategory: {},
  recipesByCategory: {},
  selectedIngredients: new Set(),
  preferences: defaultPreferences(),
  results: [],
  resultsMeta: {
    count: 0,
    label: initialUi.copy.resultsEmpty
  },
  resultsMode: 'matched',
  resultIngredientFilter: null,
  currentRecipe: null,
  recipeShare: null,
  activeGame: null,
  gameScore: 0,
  gameQuestionIndex: 0,
  gameAnswered: null
};

const screens = {
  welcome,
  home: homeScreen,
  ingredients: ingredientsScreen,
  preferences: preferencesScreen,
  results: resultsScreen,
  detail: detailScreen,
  games: gamesScreen
};

const shellNavIcons = {
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

const IDLE_MS = 120000;
let idleTimer;

// Scale the design surface (.app-root) to fill the viewport edge-to-edge on any
// screen — portrait kiosk or landscape laptop. The vertical rhythm is fixed at
// --app-base-h and scaled to the viewport height, while the logical width is
// derived so that width * scale === viewport width. The kiosk (portrait 9:16)
// resolves to the ~480px design width unchanged; wider screens simply get more
// logical width, so the layout fills the screen with no letterbox bars.
function fitAppScale() {
  const styles = getComputedStyle(document.documentElement);
  const baseH = parseFloat(styles.getPropertyValue('--app-base-h')) || 854;
  const scale = window.innerHeight / baseH;
  const logicalWidth = window.innerWidth / scale;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--app-scale', String(scale));
  rootStyle.setProperty('--app-logical-w', logicalWidth + 'px');
}

window.addEventListener('resize', fitAppScale);
window.addEventListener('orientationchange', fitAppScale);

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

const gameRecipeSlugs = {
  apple_strudel: 'potica',
  vegetable_soup: 'goveja-juha-z-rezanci',
  strawberry_dessert: 'prekmurska-gibanica',
  honey_breakfast: 'potica',
  cottage_pancakes: 'struklji',
  tomato_sauce: 'krompirjev-golaz',
  salad_bowl: 'ajdova-kasa-z-jurcki',
  buckwheat_bowl: 'ajdova-kasa-z-jurcki',
  potato_dish: 'krompirjev-golaz'
};

function recipeSlugFromGameKey(value) {
  const key = String(value || '').trim();
  if (!key) {
    return '';
  }
  return gameRecipeSlugs[key] || key.replace(/_/g, '-');
}

function resetIdleTimer() {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    actions.goWelcome(true);
  }, IDLE_MS);
}

document.addEventListener('pointerdown', resetIdleTimer, { passive: true });
document.addEventListener('touchstart', resetIdleTimer, { passive: true });

function resetState() {
  gamesScreen.cleanup?.();
  state.activeCategory = 'zelenjava';
  state.activeRecipeCategory = 'all';
  state.recipeSearch = '';
  state.selectedIngredients = new Set();
  state.preferences = defaultPreferences();
  state.results = [];
  state.resultsMeta = { count: 0, label: state.ui.copy.resultsEmpty };
  state.resultsMode = 'matched';
  state.resultIngredientFilter = null;
  state.currentRecipe = null;
  state.recipeShare = null;
  state.activeGame = null;
  state.gameScore = 0;
  state.gameQuestionIndex = 0;
  state.gameAnswered = null;
}

async function loadIngredients() {
  const rows = await window.zdravo.dbQuery(
    'SELECT name_sl, category, emoji FROM ingredients ORDER BY name_sl'
  );
  const grouped = {};
  rows.forEach((row) => {
    if (!grouped[row.category]) {
      grouped[row.category] = [];
    }
    grouped[row.category].push(row);
  });
  state.ingredientsByCategory = grouped;
}

async function loadCategoryRecipes() {
  const rows = await window.zdravo.dbQuery(
    `SELECT DISTINCT i.category, r.*
     FROM recipes r
     JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     JOIN ingredients i ON i.id = ri.ingredient_id
     ORDER BY i.category, r.name_sl`
  );
  const grouped = {};
  rows.forEach((row) => {
    if (!grouped[row.category]) {
      grouped[row.category] = [];
    }
    grouped[row.category].push(row);
  });
  state.recipesByCategory = grouped;
}

function buildPreferenceLabel() {
  const active = state.ui.preferences.filter((pref) => state.preferences[pref.key]);
  if (!active.length) {
    return state.ui.copy.resultsEmpty;
  }
  return active.map((pref) => pref.label).join(', ');
}

function currentSortLocale() {
  return state.locale === 'en' ? 'en' : 'sl';
}

async function computeResults() {
  const clauses = [];
  state.ui.preferences.forEach((pref) => {
    if (state.preferences[pref.key]) {
      clauses.push(`${pref.db} = 1`);
    }
  });
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const recipes = await window.zdravo.dbQuery(
    `SELECT * FROM recipes ${where} ORDER BY name_sl`
  );

  const ids = recipes.map((recipe) => recipe.id);
  let ingredientRows = [];
  if (ids.length) {
    const placeholders = ids.map(() => '?').join(', ');
    ingredientRows = await window.zdravo.dbQuery(
      `SELECT ri.recipe_id, i.name_sl, ri.quantity, ri.unit, ri.is_optional
       FROM recipe_ingredients ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.recipe_id IN (${placeholders})`,
      ids
    );
  }

  const ingredientMap = new Map();
  ingredientRows.forEach((row) => {
    if (!ingredientMap.has(row.recipe_id)) {
      ingredientMap.set(row.recipe_id, []);
    }
    ingredientMap.get(row.recipe_id).push(row);
  });

  const selectedNormalized = new Set(
    Array.from(state.selectedIngredients).map(normalizeName)
  );
  const hasSelectedIngredients = selectedNormalized.size > 0;
  const filterNormalized = normalizeName(state.resultIngredientFilter);

  const scored = recipes.map((recipe) => {
    const ingredients = ingredientMap.get(recipe.id) || [];
    const names = ingredients.map((item) => item.name_sl);
    const matchCount = names.filter((name) =>
      selectedNormalized.has(normalizeName(name))
    ).length;
    const missing = names.filter(
      (name) => !selectedNormalized.has(normalizeName(name))
    );
    return {
      ...recipe,
      ingredients,
      matchCount,
      missing,
      missingPreview: missing.slice(0, 3)
    };
  });

  if (state.resultsMode === 'ingredient' && filterNormalized) {
    state.results = scored.filter((item) =>
      item.ingredients.some((ingredient) => normalizeName(ingredient.name_sl) === filterNormalized)
    );
    state.resultsMeta = {
      count: state.results.length,
      label: state.ui.translateIngredient(state.resultIngredientFilter)
    };
    return;
  }

  if (state.resultsMode === 'all') {
    state.results = scored;
    state.resultsMeta = {
      count: state.results.length,
      label: state.ui.copy.resultsEmpty
    };
    return;
  }

  let results = hasSelectedIngredients
    ? scored.filter((item) => item.matchCount > 0)
    : scored;

  results.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    const translatedA = state.ui.translateRecipe(a).title;
    const translatedB = state.ui.translateRecipe(b).title;
    return translatedA.localeCompare(translatedB, currentSortLocale(), {
      sensitivity: 'base'
    });
  });

  state.results = results.slice(0, 6);
  state.resultsMeta = {
    count: state.results.length,
    label: buildPreferenceLabel()
  };
}

const actions = {
  goHome(reset) {
    if (reset) {
      resetState();
    }
    actions.goTo('home');
  },
  goWelcome(reset) {
    if (reset) {
      resetState();
    }
    actions.goTo('welcome');
  },
  async goTo(screen) {
    if (screen !== 'detail') {
      state.recipeShare = null;
    }
    if (screen === 'results') {
      await computeResults();
    }
    state.screen = screen;
    render();
  },
  setCategory(categoryKey) {
    state.activeCategory = categoryKey;
    render();
  },
  setRecipeCategory(categoryKey) {
    state.activeRecipeCategory = categoryKey;
    render();
  },
  setRecipeSearch(query) {
    state.recipeSearch = query;
    render();
  },
  toggleIngredient(name) {
    state.resultsMode = 'matched';
    state.resultIngredientFilter = null;
    state.activeRecipeCategory = 'all';
    state.recipeSearch = '';
    if (state.selectedIngredients.has(name)) {
      state.selectedIngredients.delete(name);
    } else {
      state.selectedIngredients.add(name);
    }
    render();
  },
  togglePreference(key) {
    state.resultsMode = 'matched';
    state.resultIngredientFilter = null;
    state.activeRecipeCategory = 'all';
    state.recipeSearch = '';
    state.preferences[key] = !state.preferences[key];
    render();
  },
  openProducts(categoryKey) {
    state.resultsMode = 'matched';
    state.resultIngredientFilter = null;
    state.activeCategory = categoryKey || 'all';
    actions.goTo('ingredients');
  },
  async showAllRecipes() {
    state.selectedIngredients = new Set();
    state.preferences = defaultPreferences();
    state.resultsMode = 'all';
    state.resultIngredientFilter = null;
    state.activeRecipeCategory = 'all';
    state.recipeSearch = '';
    await actions.goTo('results');
  },
  async showMatchedRecipes() {
    state.resultsMode = 'matched';
    state.resultIngredientFilter = null;
    state.activeRecipeCategory = 'all';
    state.recipeSearch = '';
    await actions.goTo('results');
  },
  async showRecipesForIngredient(name) {
    state.selectedIngredients = new Set([name]);
    state.preferences = defaultPreferences();
    state.resultsMode = 'ingredient';
    state.resultIngredientFilter = name;
    state.activeRecipeCategory = 'all';
    state.recipeSearch = '';
    await actions.goTo('results');
  },
  selectRecipe(recipeId) {
    state.recipeShare = null;
    state.currentRecipe =
      state.results.find((item) => item.id === recipeId) || null;
    if (state.currentRecipe) {
      state.screen = 'detail';
      render();
    }
  },
  async selectRecipeById(recipeId) {
    await actions.showAllRecipes();
    actions.selectRecipe(recipeId);
  },
  async selectRecipeBySlug(recipeSlug) {
    const slug = recipeSlugFromGameKey(recipeSlug);
    if (!slug) {
      return;
    }

    state.selectedIngredients = new Set();
    state.preferences = defaultPreferences();
    state.resultsMode = 'all';
    state.resultIngredientFilter = null;
    state.activeRecipeCategory = 'all';
    state.recipeSearch = '';
    state.recipeShare = null;
    await computeResults();
    state.currentRecipe =
      state.results.find((item) => item.slug === slug) ||
      state.results[0] ||
      null;
    state.screen = state.currentRecipe ? 'detail' : 'results';
    render();
  },
  async openGameRecipe(recipeSlug) {
    gamesScreen.cleanup?.();
    state.activeGame = null;
    state.gameScore = 0;
    state.gameQuestionIndex = 0;
    state.gameAnswered = null;
    await actions.selectRecipeBySlug(recipeSlug);
  },
  startGame(gameKey) {
    state.activeGame = gameKey;
    state.gameScore = 0;
    state.gameQuestionIndex = 0;
    state.gameAnswered = null;
    actions.goTo('games');
  },
  answerGame(optionIndex, isCorrect) {
    if (state.gameAnswered !== null) {
      return;
    }
    state.gameAnswered = optionIndex;
    if (isCorrect) {
      state.gameScore += 1;
    }
    render();
  },
  nextGameQuestion(totalQuestions) {
    if (state.gameQuestionIndex + 1 >= totalQuestions) {
      state.gameQuestionIndex = totalQuestions;
    } else {
      state.gameQuestionIndex += 1;
    }
    state.gameAnswered = null;
    render();
  },
  closeGame() {
    state.activeGame = null;
    state.gameScore = 0;
    state.gameQuestionIndex = 0;
    state.gameAnswered = null;
    actions.goTo('games');
  },
  async shareRecipeByEmail() {
    if (!state.currentRecipe) {
      return;
    }

    const mailto = buildRecipeMailto(state, state.currentRecipe);
    state.recipeShare = null;
    render();

    try {
      await window.zdravo.openExternal(mailto);
    } catch (error) {
      console.warn('Failed to open mail client', error);
    }
  },
  async openRecipeQrShare() {
    if (!state.currentRecipe) {
      return;
    }

    const mailto = buildRecipeMailto(state, state.currentRecipe);
    state.recipeShare = {
      mode: 'qr',
      mailto,
      qrSvg: '',
      loading: true,
      error: ''
    };
    render();

    try {
      const qrSvg = await window.zdravo.generateQrSvg(mailto, {
        margin: 2,
        scale: 8,
        errorCorrectionLevel: 'M'
      });
      if (!state.recipeShare || state.recipeShare.mode !== 'qr') {
        return;
      }
      state.recipeShare.qrSvg = qrSvg;
      state.recipeShare.loading = false;
      render();
    } catch (error) {
      if (!state.recipeShare || state.recipeShare.mode !== 'qr') {
        return;
      }
      console.warn('Failed to generate QR share code', error);
      state.recipeShare.loading = false;
      state.recipeShare.error =
        state.locale === 'en'
          ? 'Unable to generate the QR code.'
          : 'QR kode ni bilo mogoče ustvariti.';
      render();
    }
  },
  closeRecipeShare() {
    if (!state.recipeShare) {
      return;
    }

    state.recipeShare = null;
    render();
  }
};

function activeShellNav() {
  if (state.screen === 'ingredients' || state.screen === 'preferences') {
    return 'items';
  }
  if (state.screen === 'results' || state.screen === 'detail') {
    return 'recipes';
  }
  if (state.screen === 'games') {
    return 'games';
  }
  return 'home';
}

function renderShellNav() {
  if (state.screen === 'welcome' || (state.screen === 'games' && state.activeGame)) {
    return '';
  }

  const active = activeShellNav();
  const navItems = [
    ['home', state.ui.copy.homeNavHome],
    ['items', state.ui.copy.homeNavItems],
    ['recipes', state.ui.copy.homeNavRecipes],
    ['games', state.ui.copy.homeNavGames]
  ];

  return `
    <nav class="home-nav shell-nav" aria-label="${state.ui.copy.homeNavHome}">
      ${navItems
        .map(
          ([key, label]) => `
            <button
              class="home-nav__item ${active === key ? 'is-active' : ''}"
              data-shell-action="${key}"
            >
              ${shellNavIcons[key]}
              <span>${label}</span>
            </button>
          `
        )
        .join('')}
    </nav>
  `;
}

async function handleShellNav(action) {
  if (action === 'home') {
    actions.goHome(false);
    return;
  }

  if (action === 'items') {
    actions.openProducts();
    return;
  }

  if (action === 'recipes') {
    actions.showAllRecipes();
    return;
  }

  if (action === 'games') {
    actions.goTo('games');
  }
}

actions.setLocale = async function setLocale(locale) {
  const normalizedLocale = locale === 'en' ? 'en' : 'sl';
  if (normalizedLocale === state.locale) {
    return;
  }

  state.locale = normalizedLocale;
  state.ui = buildUi(normalizedLocale);
  saveLocale(normalizedLocale);
  document.documentElement.lang = normalizedLocale;

  if (state.screen === 'results') {
    await computeResults();
  }

  render();
};

function render() {
  const screenModule = screens[state.screen];
  document.documentElement.lang = state.locale;
  document.title = state.ui.copy.appTitle;
  appRoot.innerHTML = `
    <div class="language-switcher" role="group" aria-label="${state.ui.copy.languageSelector}">
      ${['sl', 'en']
        .map(
          (locale) => `
            <button
              class="language-switcher__button ${state.locale === locale ? 'is-active' : ''}"
              data-action="set-locale"
              data-locale="${locale}"
              aria-pressed="${state.locale === locale}"
            >
              <span class="language-switcher__code">${locale.toUpperCase()}</span>
              <span class="language-switcher__label">${state.ui.languageNames[locale]}</span>
            </button>
          `
        )
        .join('')}
    </div>
    ${screenModule.render({ state, actions })}
    ${renderShellNav()}
  `;
  document.body.dataset.screen = state.screen;
  document.body.dataset.gameActive = state.screen === 'games' && state.activeGame ? 'true' : 'false';
  screenModule.bind({ state, actions, root: appRoot });
  resetIdleTimer();
  window.scrollTo(0, 0);
}

async function init() {
  fitAppScale();
  await loadIngredients();
  await loadCategoryRecipes();
  document.documentElement.lang = state.locale;
  appRoot.addEventListener('pointerdown', (event) => {
    const shellButton = event.target.closest('[data-shell-action]');
    if (shellButton) {
      handleShellNav(shellButton.dataset.shellAction);
      return;
    }

    const button = event.target.closest('[data-action="set-locale"]');
    if (!button) {
      return;
    }

    actions.setLocale(button.dataset.locale);
  });
  render();
}

init();
