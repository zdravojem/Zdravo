import { ingredientImageSrc } from '../ingredient-images.js';
import { recipeImageSrc } from '../recipe-images.js';
import { parseRecipeTags, recipeServingsText, recipeTimeMinutes } from '../recipe-meta.js';
import { renderEmailModal } from '../components/EmailModal.js';

// Canonical unit keys for declension lookup — maps any inflected form to its root
const UNIT_ROOT = {
  porcija: 'porcija', porcije: 'porcija', porcij: 'porcija',
  kos: 'kos', kosi: 'kos', kosov: 'kos',
  cmok: 'cmok', cmoka: 'cmok', cmoki: 'cmok', cmokov: 'cmok',
  hlebec: 'hlebec', hlebca: 'hlebec', hlebci: 'hlebec', hlebcev: 'hlebec',
  zavitek: 'zavitek', zavitka: 'zavitek', zavitki: 'zavitek', zavitkov: 'zavitek',
};

const SL_FORMS = {
  //              [unused, 1,         2,         3,         4,         5+]
  porcija: [null, 'porcija', 'porcije', 'porcije', 'porcije', 'porcij'],
  kos:     [null, 'kos',     'kosi',    'kosi',    'kosi',    'kosov'],
  cmok:    [null, 'cmok',    'cmoka',   'cmoki',   'cmoki',   'cmokov'],
  hlebec:  [null, 'hlebec',  'hlebca',  'hlebci',  'hlebci',  'hlebcev'],
  zavitek: [null, 'zavitek', 'zavitka', 'zavitki', 'zavitki', 'zavitkov'],
};

const EN_FORMS = {
  porcija: [null, 'serving',  'servings', 'servings', 'servings', 'servings'],
  kos:     [null, 'piece',    'pieces',   'pieces',   'pieces',   'pieces'],
  cmok:    [null, 'dumpling', 'dumplings','dumplings','dumplings','dumplings'],
  hlebec:  [null, 'loaf',     'loaves',   'loaves',   'loaves',   'loaves'],
  zavitek: [null, 'strudel',  'strudels', 'strudels', 'strudels', 'strudels'],
};

function declectUnit(n, unitRaw, locale) {
  const root = UNIT_ROOT[String(unitRaw).trim().toLowerCase()];
  if (!root) return String(unitRaw || '');
  const forms = locale === 'en' ? EN_FORMS[root] : SL_FORMS[root];
  if (!forms) return String(unitRaw || '');
  const idx = Math.min(Math.max(Math.round(n), 1), 5);
  return forms[idx] || forms[5];
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function totalTime(recipe) {
  return recipeTimeMinutes(recipe);
}

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

function emailGlyphSvg() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="6" y="11" width="36" height="26" rx="5" fill="#ffffff" stroke="#e0d8c8" stroke-width="1.5" />
      <path d="M8 15l16 12 16-12" fill="none" stroke="#d44638" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 33l11-9M40 33l-11-9" fill="none" stroke="#d44638" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTextBlock(value) {
  const text = String(value || '').trim();

  return text ? escapeHtml(text).replace(/\r?\n/g, '<br>') : '';
}

function amountText(state, item) {
  return [item.quantity, state.ui.translateUnit(item.quantity, item.unit)]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function ingredientAmountAttrs(item) {
  const qty = item.quantity !== undefined && item.quantity !== null ? item.quantity : '';
  const unit = item.unit || '';
  return qty !== '' ? ` data-base-qty="${qty}" data-unit="${escapeHtml(unit)}"` : '';
}

function ingredientCountText(state, count) {
  if (state.ui.locale === 'en') {
    return `${count} ingredient${count === 1 ? '' : 's'}`;
  }

  const unit = count === 1
    ? 'sestavina'
    : count === 2
      ? 'sestavini'
      : count === 3 || count === 4
        ? 'sestavine'
        : 'sestavin';

  return `${count} ${unit}`;
}

const recipeTagLabels = {
  en: {
    Zajtrk: 'Breakfast',
    Malica: 'Snack',
    Kosilo: 'Lunch',
    'Lahkotno kosilo': 'Light lunch',
    'Ve\u010derja': 'Dinner',
    Sladica: 'Dessert',
    Priloga: 'Side dish',
    Predjed: 'Starter',
    'Enolon\u010dnica': 'Stew',
    'Jed na \u017elico': 'Spoon dish',
    Prigrizek: 'Snack',
    'Prazni\u010dna jed': 'Holiday dish'
  }
};

function suitabilityLabel(state, tag) {
  return recipeTagLabels[state.ui.locale]?.[tag] || tag;
}

function detailLabels(locale) {
  if (locale === 'en') {
    return {
      eyebrow: 'Kitchen recipe',
      plateBadge: 'Zdravo plate',
      time: 'Time',
      difficulty: 'Difficulty',
      servings: 'Servings',
      ingredientMatch: 'Ingredient match',
      available: 'selected',
      unavailable: 'to gather',
      sendRecipe: 'Save this recipe',
      shareText: 'Keep it close for shopping or cooking.',
      emailTitle: 'Send by email',
      emailText: 'Recipe to your inbox',
      qrTitle: 'Scan QR code',
      qrText: 'Open on your phone'
    };
  }

  return {
    eyebrow: 'Kuhinjski recept',
    plateBadge: 'Zdravo kro&#382;nik',
    time: '&#268;as',
    difficulty: 'Zahtevnost',
    servings: 'Porcije',
    ingredientMatch: 'Ujemanje sestavin',
    available: 'izbranih',
    unavailable: 'za dodati',
    sendRecipe: 'Shrani recept',
    shareText: 'Imej ga pri sebi za tr&#382;nico ali kuhanje.',
    emailTitle: 'Po&#353;lji na e-po&#353;to',
    emailText: 'Recept na tvojem mailu',
    qrTitle: 'Skeniraj QR kodo',
    qrText: 'Odpri na svojem telefonu'
  };
}

function renderStatCard(icon, label, value, modifier = '') {
  if (!value) {
    return '';
  }

  return `
    <span class="recipe-stat-card ${modifier}">
      ${iconSvg(icon)}
      <span class="recipe-stat-card__copy">
        <small>${label}</small>
        <strong>${value}</strong>
      </span>
    </span>
  `;
}

function heartSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20.5c-4.9-3.4-8-6.3-8-10.2A4.4 4.4 0 0 1 8.4 6c1.5 0 2.8.7 3.6 1.8A4.4 4.4 0 0 1 15.6 6 4.4 4.4 0 0 1 20 10.3c0 3.9-3.1 6.8-8 10.2z" />
    </svg>
  `;
}

function renderSuitabilityStat(state, tag) {
  if (!tag) {
    return '';
  }

  return renderStatCard(
    '<circle cx="12" cy="12" r="8" /><path d="M8.5 12.5l2.2 2.2 4.8-5.2" />',
    state.ui.locale === 'en' ? 'Diet' : 'Primerno',
    suitabilityLabel(state, tag),
    'recipe-stat-card--tag'
  );
}

function formatServingQty(n) {
  if (!Number.isFinite(n) || n <= 0) return '0';
  return String(parseFloat(n.toFixed(2)));
}

function renderServingsCard(recipe, locale, label) {
  const quantity = recipe?.servings_quantity ?? recipe?.servings;
  if (quantity === undefined || quantity === null || quantity === '') return '';

  const numQty = Number(quantity);
  const unit = String(recipe?.servings_unit || '').trim();
  const displayText = recipeServingsText(recipe, locale);

  return `
    <span class="recipe-stat-card recipe-stat-card--servings"
          data-servings-default="${numQty}"
          data-servings-unit="${escapeHtml(unit)}"
          data-servings-locale="${locale}">
      ${iconSvg('<path d="M7 3v8M11 3v8M9 3v18M17 3c1.5 2.2 1.5 5.6 0 8v10" />')}
      <span class="recipe-stat-card__copy">
        <small>${label}</small>
        <span class="recipe-servings-control">
          <button class="recipe-servings-btn" data-action="serving-dec" aria-label="−" type="button">−</button>
          <strong class="recipe-servings-val" data-current="${numQty}">${escapeHtml(displayText)}</strong>
          <button class="recipe-servings-btn" data-action="serving-inc" aria-label="+" type="button">+</button>
        </span>
      </span>
    </span>
  `;
}

function shareCopy(locale) {
  if (locale === 'en') {
    return {
      title: 'Scan the QR code',
      description: 'Scan this code on your phone to open and save this recipe page.',
      loading: 'Preparing QR code...',
      openPage: 'Open page',
      close: 'Close'
    };
  }

  return {
    title: 'Skeniraj QR kodo',
    description: 'Skeniraj to kodo na telefonu, da odpre&#353; stran recepta za shranjevanje.',
    loading: 'Pripravljam QR kodo ...',
    openPage: 'Odpri stran',
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
          <button class="btn btn--outline" data-action="open-qr-link">${copy.openPage}</button>
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
  const suitabilityTags = parseRecipeTags(recipe.tags);
  const additionalTip = formatTextBlock(recipe.dodatni_nasvet);
  const labels = detailLabels(state.ui.locale);
  const difficulty = recipe.difficulty ? state.ui.translateDifficulty(recipe.difficulty) : '';

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
        </header>

        <div class="recipe-sheet__scroll">
          <section class="recipe-hero">
            <img class="recipe-hero__image" src="${recipeImageSrc(recipe)}" alt="${recipeCopy.title}" />
            <div class="recipe-hero__shade" aria-hidden="true"></div>
            <div class="recipe-hero__badge">
              ${heartSvg()}
            </div>
            <div class="recipe-hero__copy">
              <span class="recipe-hero__eyebrow">${labels.eyebrow}</span>
              <h1>${recipeCopy.title}</h1>
              <p>${recipeCopy.description}</p>
              <img class="recipe-hero__flower" src="../assets/images/recipes/flower2.png" alt="" aria-hidden="true" />
              <div class="recipe-stat-grid">
                ${renderStatCard('<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />', labels.time, `${totalTime(recipe)} min`, 'recipe-stat-card--time')}
                ${renderStatCard('<path d="M12 3l2.2 5.5 5.8.4-4.5 3.7 1.4 5.7L12 15.2 7.1 18.3l1.4-5.7L4 8.9l5.8-.4L12 3z" />', labels.difficulty, difficulty, 'recipe-stat-card--difficulty')}
                ${renderServingsCard(recipe, state.ui.locale, labels.servings)}
                ${renderSuitabilityStat(state, suitabilityTags[0])}
              </div>
            </div>
          </section>

          <section class="recipe-share-panel">
            <div class="recipe-section-title">
              <h2>${labels.sendRecipe}</h2>
            </div>
            <p>${labels.shareText}</p>
            <img class="recipe-share-flight" src="../assets/images/arrow.png" alt="" aria-hidden="true" />
            <div class="recipe-share-grid">
              <button class="recipe-share-card recipe-share-card--email" type="button" data-action="share-email">
                <span class="recipe-share-card__icon" aria-hidden="true">${emailGlyphSvg()}</span>
                <span><strong>${labels.emailTitle}</strong>${labels.emailText}</span>
              </button>
              <button class="recipe-share-card recipe-share-card--qr" type="button" data-action="share-qr">
                <span class="recipe-share-card__icon" aria-hidden="true">
                  <img src="../assets/images/home-games/qrcode.png" alt="" loading="lazy" />
                </span>
                <span><strong>${labels.qrTitle}</strong>${labels.qrText}</span>
              </button>
            </div>
          </section>

          <section class="recipe-card-panel recipe-ingredients-panel">
            <div class="recipe-ingredients-heading">
              <h2>${state.ui.copy.ingredientsHeading}</h2>
              <span>${ingredientCountText(state, ingredients.length)}</span>
            </div>
            <div class="recipe-ingredient-grid">
              ${ingredients
                .map((item) => {
                  const hasIt = selectedNames.has(normalizeName(item.name_sl));
                  const amount = amountText(state, item);
                  return `
                    <div class="recipe-ingredient-tile ${hasIt ? 'is-available' : 'is-missing'}">
                      <span class="recipe-ingredient-photo">
                        <img src="${ingredientImageSrc(item)}" alt="${state.ui.translateIngredient(item.name_sl)}" loading="lazy" />
                      </span>
                      <span class="recipe-ingredient-copy">
                        <strong>${state.ui.translateIngredient(item.name_sl)}</strong>
                        ${amount ? `<em${ingredientAmountAttrs(item)}>${amount}</em>` : ''}
                      </span>
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
                        <img src="${ingredientImageSrc(item)}" alt="${state.ui.translateIngredient(item.name_sl)}" loading="lazy" />
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
                      <p>${step}</p>
                    </div>
                  `
                )
                .join('')}
            </div>
          </section>

          ${additionalTip ? `
            <section class="recipe-card-panel recipe-tip-panel">
              <div class="recipe-section-title">
                <h2>${state.ui.locale === 'en' ? 'Additional advice' : 'Dodatni nasvet'}</h2>
              </div>
              <p>${additionalTip}</p>
            </section>
          ` : ''}
        </div>
      </div>
      ${renderShareModal(state)}
      ${renderEmailModal({ recipe: recipeCopy, share: state.recipeShare })}
    </section>
  `;
}

function updateServings(root, newQty) {
  const card = root.querySelector('.recipe-stat-card--servings');
  if (!card) return;

  const defaultQty = Number(card.dataset.servingsDefault);
  const unit = card.dataset.servingsUnit || '';
  const locale = card.dataset.servingsLocale || 'sl';
  if (!defaultQty) return;

  const valEl = card.querySelector('.recipe-servings-val');
  if (valEl) {
    const label = unit ? declectUnit(newQty, unit, locale) : '';
    valEl.textContent = [formatServingQty(newQty), label].filter(Boolean).join(' ');
    valEl.dataset.current = newQty;
  }

  const decBtn = card.querySelector('[data-action="serving-dec"]');
  if (decBtn) decBtn.disabled = newQty <= 1;

  // Scale every ingredient quantity
  const ratio = newQty / defaultQty;
  root.querySelectorAll('.recipe-ingredient-copy em[data-base-qty]').forEach((el) => {
    const base = Number(el.dataset.baseQty);
    if (!base) return;
    const scaled = base * ratio;
    const displayQty = formatServingQty(scaled);
    const unitRaw = el.dataset.unit || '';
    const unitLabel = unitRaw ? declectUnit(scaled, unitRaw, locale) : '';
    el.textContent = [displayQty, unitLabel].filter(Boolean).join(' ');
  });
}

export function bind({ actions, root }) {
  const screen = root.querySelector('.screen--detail');
  if (!screen) {
    return;
  }

  screen.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) {
      if (event.target.classList.contains('recipe-share-modal-backdrop')) {
        actions.closeRecipeShare();
      }
      if (event.target.dataset.emailModalBackdrop === 'true') {
        actions.closeRecipeShare();
      }
      return;
    }

    const action = target.dataset.action;

    if (action === 'serving-dec' || action === 'serving-inc') {
      event.preventDefault();
      const valEl = screen.querySelector('.recipe-servings-val');
      if (!valEl) return;
      const current = Number(valEl.dataset.current) || 1;
      const next = action === 'serving-dec' ? Math.max(1, current - 1) : current + 1;
      if (next !== current) updateServings(screen, next);
      return;
    }

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

    if (action === 'send-recipe-email') {
      actions.sendRecipeEmail();
      return;
    }

    if (action === 'close-email-modal') {
      actions.closeRecipeShare();
      return;
    }

    if (action === 'share-qr') {
      actions.openRecipeQrShare();
      return;
    }

    if (action === 'open-qr-link') {
      actions.openRecipeShareLink();
      return;
    }

    if (action === 'close-share') {
      actions.closeRecipeShare();
    }
  });

  const emailInput = screen.querySelector('[data-email-input]');
  if (emailInput) {
    emailInput.addEventListener('input', (event) => {
      actions.setRecipeEmail?.(event.target.value);
    });
  }
}
