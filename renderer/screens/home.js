import { ingredientImageSrc } from '../ingredient-images.js';
import { gameCardImageSrc } from '../game-card-images.js';
import { recipeImageSrc } from '../recipe-images.js';

const heroImageSrc = '../assets/images/home-hero.png';

const categoryCards = [
  { label: { sl: 'Meso', en: 'Meat' }, image: 'Govedina', categoryKey: 'meso_ribe' },
  { label: { sl: 'Zelenjava', en: 'Vegetables' }, image: 'Korenje', categoryKey: 'zelenjava' },
  { label: { sl: 'Sadje', en: 'Fruit' }, image: 'Jabolka', categoryKey: 'sadje' },
  { label: { sl: '&#381;ita', en: 'Grains' }, image: 'Ajda', categoryKey: 'zita' },
  { label: { sl: 'Med', en: 'Honey' }, image: 'Med', categoryKey: 'zacimbe' },
  { label: { sl: 'Zeli&#353;&#269;a', en: 'Herbs' }, image: 'Timijan', categoryKey: 'zacimbe' }
];

const featuredRecipes = [
  { id: 13, slug: 'ajdova-kasa-z-jurcki' },
  { id: 12, slug: 'postrv-na-zaru' },
  { id: 11, slug: 'krompirjev-golaz' },
  { id: 7, slug: 'ajdovi-zganci-s-skuto' },
  { id: 4, slug: 'kranjska-juha' },
  { id: 10, slug: 'goveja-juha-z-rezanci' },
  { id: 3, slug: 'prekmurska-gibanica' },
  { id: 6, slug: 'potica' },
  { id: 8, slug: 'struklji' },
  { id: 15, slug: 'flancati' }
];

const recipeTitles = {
  sl: {
    3: 'Prekmurska gibanica',
    4: 'Kranjska juha',
    6: 'Potica',
    7: 'Ajdovi &#382;ganci s skuto',
    8: 'Struklji',
    10: 'Goveja juha z rezanci',
    11: 'Krompirjev gola&#382;',
    12: 'Postrv na &#382;aru',
    13: 'Ajdova ka&#353;a z jur&#269;ki',
    15: 'Flancati'
  },
  en: {
    3: 'Prekmurje Layer Cake',
    4: 'Carniolan Soup',
    6: 'Potica',
    7: 'Buckwheat Zganci',
    8: 'Struklji',
    10: 'Beef Noodle Soup',
    11: 'Potato Goulash',
    12: 'Grilled Trout',
    13: 'Buckwheat Porcini Bowl',
    15: 'Flancati'
  }
};

const gameCards = [
  {
    title: { sl: 'Tržni detektiv', en: 'Market detective' },
    text: { sl: 'Detektivska igra', en: 'Detective game' },
    image: 'trzni-detektiv'
  },
  {
    title: { sl: 'Od kmetije do krožnika', en: 'From farm to plate' },
    text: { sl: 'Puzzle igra', en: 'Puzzle game' },
    image: 'od-kmetije-do-kroznika'
  }
];

const recipeMetaIcons = {
  time: `
    <svg class="home-recipe-card__meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  servings: `
    <svg class="home-recipe-card__meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
      <circle cx="16.5" cy="10.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M4.8 19c.4-3 3-5.2 6-5.2s5.6 2.2 6 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M13.5 19c.2-1.8 1.7-3.1 3.5-3.1 1.7 0 3.1 1.3 3.4 3.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `
};

function pickLabel(value, locale) {
  return value[locale] || value.sl;
}

function gameTitleLines(title, locale) {
  const value = title[locale] || title.sl;
  if (Array.isArray(value)) {
    return value;
  }
  return String(value || '').split('\n').filter(Boolean);
}

function gameTitleText(title, locale) {
  return gameTitleLines(title, locale).join(' ');
}

function renderGameArt(kind, idPrefix = kind) {
  if (kind === 'magnifier') {
    return renderMagnifierArt(idPrefix);
  }
  return renderBowlArt(idPrefix);
}

function renderBowlArt(idPrefix = 'bowl') {
  const id = (suffix) => `${idPrefix}-${suffix}`;

  return `
    <svg class="home-game-card__svg" viewBox="0 0 540 320" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id('soft-bg')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#eff5df" />
          <stop offset="100%" stop-color="#f7f0db" />
        </linearGradient>
        <linearGradient id="${id('ceramic')}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fffdf7" />
          <stop offset="100%" stop-color="#efe4cf" />
        </linearGradient>
        <linearGradient id="${id('shadow')}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#dfd2b8" stop-opacity="0.9" />
        </linearGradient>
        <linearGradient id="${id('leaf-dark')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8ec14a" />
          <stop offset="100%" stop-color="#5b8f22" />
        </linearGradient>
        <linearGradient id="${id('leaf-light')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#cbe26c" />
          <stop offset="100%" stop-color="#8ebf33" />
        </linearGradient>
        <linearGradient id="${id('onion-purple')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d55db3" />
          <stop offset="100%" stop-color="#8d2e7c" />
        </linearGradient>
        <linearGradient id="${id('carrot-orange')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffcf78" />
          <stop offset="100%" stop-color="#f39a2b" />
        </linearGradient>
        <filter id="${id('soft-shadow')}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#8b7f60" flood-opacity="0.18" />
        </filter>
        <filter id="${id('blur')}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="${id('soft')}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      <rect width="540" height="320" fill="url(#${id('soft-bg')})" />

      <g opacity="0.28" filter="url(#${id('blur')})">
        <circle cx="56" cy="58" r="18" fill="#ffd88b" />
        <circle cx="476" cy="58" r="18" fill="#f0d56f" />
        <circle cx="460" cy="240" r="18" fill="#f7cf78" />
        <circle cx="74" cy="248" r="14" fill="#d8ec9a" />
      </g>

      <g filter="url(#${id('soft-shadow')})">
        <g transform="translate(18 12)">
          <g opacity="0.88" filter="url(#${id('soft')})">
            <ellipse cx="115" cy="124" rx="20" ry="56" fill="url(#${id('leaf-dark')})" transform="rotate(-26 115 124)" />
            <ellipse cx="150" cy="92" rx="14" ry="44" fill="url(#${id('leaf-light')})" transform="rotate(-18 150 92)" />
            <ellipse cx="194" cy="118" rx="18" ry="52" fill="url(#${id('leaf-dark')})" transform="rotate(28 194 118)" />
            <ellipse cx="218" cy="82" rx="14" ry="40" fill="url(#${id('leaf-light')})" transform="rotate(18 218 82)" />
            <ellipse cx="104" cy="168" rx="16" ry="38" fill="url(#${id('leaf-light')})" transform="rotate(10 104 168)" />
            <ellipse cx="224" cy="164" rx="12" ry="34" fill="url(#${id('leaf-dark')})" transform="rotate(42 224 164)" />
          </g>

          <g transform="translate(28 132)">
            <ellipse cx="86" cy="74" rx="108" ry="52" fill="url(#${id('shadow')})" opacity="0.42" />
            <ellipse cx="86" cy="70" rx="104" ry="50" fill="url(#${id('ceramic')})" />
            <ellipse cx="86" cy="58" rx="98" ry="18" fill="#fffaf1" opacity="0.98" />
            <ellipse cx="86" cy="73" rx="86" ry="36" fill="#f7efe0" />
            <circle cx="52" cy="78" r="8" fill="#171717" />
            <circle cx="120" cy="78" r="8" fill="#171717" />
            <circle cx="49.5" cy="75.5" r="2.2" fill="#ffffff" />
            <circle cx="117.5" cy="75.5" r="2.2" fill="#ffffff" />
            <path d="M64 92 C74 104, 98 104, 108 92" fill="none" stroke="#1c1c1c" stroke-width="5.2" stroke-linecap="round" />
            <ellipse cx="28" cy="132" rx="10" ry="4" fill="#d8c9aa" />
            <ellipse cx="144" cy="134" rx="10" ry="4" fill="#d8c9aa" />
          </g>

          <g transform="translate(0 0)">
            <ellipse cx="72" cy="156" rx="26" ry="16" fill="#62a83a" transform="rotate(-18 72 156)" />
            <ellipse cx="86" cy="140" rx="18" ry="30" fill="url(#${id('leaf-light')})" transform="rotate(-36 86 140)" />
            <ellipse cx="118" cy="150" rx="20" ry="34" fill="url(#${id('leaf-dark')})" transform="rotate(26 118 150)" />
            <ellipse cx="144" cy="118" rx="18" ry="26" fill="url(#${id('onion-purple')})" />
            <circle cx="144" cy="118" r="13" fill="#bf4da1" opacity="0.5" filter="url(#${id('soft')})" />
            <circle cx="143" cy="114" r="5" fill="#fff2ff" opacity="0.7" />
            <ellipse cx="46" cy="184" rx="22" ry="34" fill="url(#${id('carrot-orange')})" transform="rotate(-54 46 184)" />
            <ellipse cx="50" cy="176" rx="7" ry="18" fill="#8bc34a" transform="rotate(-54 50 176)" />
            <ellipse cx="178" cy="182" rx="18" ry="30" fill="url(#${id('leaf-dark')})" transform="rotate(24 178 182)" />
            <ellipse cx="202" cy="160" rx="20" ry="32" fill="url(#${id('leaf-light')})" transform="rotate(-30 202 160)" />
            <ellipse cx="228" cy="182" rx="21" ry="15" fill="#d5ef87" transform="rotate(-10 228 182)" />
            <ellipse cx="196" cy="196" rx="14" ry="10" fill="#c99c53" opacity="0.55" />
          </g>

          <g transform="translate(270 166)">
            <ellipse cx="0" cy="42" rx="34" ry="16" fill="#b7c97a" opacity="0.32" />
            <ellipse cx="28" cy="34" rx="26" ry="14" fill="url(#${id('leaf-dark')})" transform="rotate(18 28 34)" />
            <ellipse cx="52" cy="46" rx="24" ry="12" fill="url(#${id('leaf-light')})" transform="rotate(-22 52 46)" />
            <ellipse cx="66" cy="22" rx="12" ry="10" fill="#c8e56a" opacity="0.9" />
            <ellipse cx="98" cy="42" rx="22" ry="14" fill="#c99c53" opacity="0.22" />
          </g>
        </g>
      </g>
    </svg>
  `;
}

function renderMagnifierArt(idPrefix = 'magnifier') {
  const id = (suffix) => `${idPrefix}-${suffix}`;

  return `
    <svg class="home-game-card__svg" viewBox="0 0 540 320" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id('soft-bg')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#faf0ca" />
          <stop offset="100%" stop-color="#f4e3b1" />
        </linearGradient>
        <linearGradient id="${id('glass')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f4faf1" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#e3f0e5" stop-opacity="0.6" />
        </linearGradient>
        <linearGradient id="${id('rim')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c79b56" />
          <stop offset="100%" stop-color="#845628" />
        </linearGradient>
        <linearGradient id="${id('handle')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7e4d21" />
          <stop offset="100%" stop-color="#c38a49" />
        </linearGradient>
        <linearGradient id="${id('apple-red')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffb58a" />
          <stop offset="44%" stop-color="#f66b58" />
          <stop offset="100%" stop-color="#b11f34" />
        </linearGradient>
        <linearGradient id="${id('apple-orange')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd18f" />
          <stop offset="100%" stop-color="#f39a27" />
        </linearGradient>
        <linearGradient id="${id('leaf')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#cde76b" />
          <stop offset="100%" stop-color="#6aa730" />
        </linearGradient>
        <filter id="${id('soft-shadow')}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#8f7a55" flood-opacity="0.16" />
        </filter>
        <filter id="${id('blur')}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <clipPath id="${id('lens-clip')}">
          <circle cx="392" cy="95" r="79" />
        </clipPath>
      </defs>

      <rect width="540" height="320" fill="url(#${id('soft-bg')})" />

      <g opacity="0.3" filter="url(#${id('blur')})">
        <circle cx="47" cy="64" r="16" fill="#ffd56f" />
        <circle cx="484" cy="58" r="18" fill="#ffe17c" />
        <circle cx="488" cy="148" r="14" fill="#f6ca68" />
        <circle cx="58" cy="214" r="12" fill="#fff0a5" />
      </g>

      <g filter="url(#${id('soft-shadow')})">
        <g transform="translate(18 14)">
          <g opacity="0.24" filter="url(#${id('blur')})">
            <ellipse cx="88" cy="196" rx="38" ry="18" fill="#8cc24f" />
            <ellipse cx="188" cy="220" rx="34" ry="18" fill="#e5c65b" />
            <ellipse cx="322" cy="238" rx="42" ry="18" fill="#ffdf8f" />
          </g>

          <g transform="translate(12 10)">
            <ellipse cx="116" cy="220" rx="42" ry="22" fill="#a4c55e" opacity="0.38" />
            <ellipse cx="152" cy="184" rx="28" ry="42" fill="url(#${id('apple-orange')})" transform="rotate(12 152 184)" />
            <ellipse cx="126" cy="170" rx="9" ry="26" fill="#7d4a1d" transform="rotate(-8 126 170)" />
            <ellipse cx="164" cy="150" rx="12" ry="24" fill="url(#${id('leaf')})" transform="rotate(32 164 150)" />

            <g clip-path="url(#${id('lens-clip')})">
              <ellipse cx="388" cy="94" rx="70" ry="70" fill="url(#${id('glass')})" opacity="0.82" />
              <ellipse cx="368" cy="82" rx="56" ry="44" fill="#d8efe0" opacity="0.42" filter="url(#${id('blur')})" />
              <ellipse cx="414" cy="100" rx="34" ry="24" fill="#fff1eb" opacity="0.35" />
              <ellipse cx="398" cy="108" rx="26" ry="30" fill="url(#${id('apple-red')})" />
              <ellipse cx="430" cy="78" rx="24" ry="28" fill="url(#${id('apple-red')})" />
              <ellipse cx="398" cy="104" rx="11" ry="18" fill="#7d4a1d" transform="rotate(-8 398 104)" />
              <ellipse cx="428" cy="72" rx="9" ry="16" fill="#7d4a1d" transform="rotate(10 428 72)" />
              <ellipse cx="414" cy="76" rx="12" ry="8" fill="url(#${id('leaf')})" transform="rotate(-26 414 76)" />
              <circle cx="390" cy="83" r="6" fill="#fff2ef" opacity="0.75" />
              <circle cx="423" cy="63" r="5" fill="#fff2ef" opacity="0.72" />
            </g>

            <circle cx="392" cy="95" r="82" fill="none" stroke="url(#${id('rim')})" stroke-width="20" />
            <circle cx="392" cy="95" r="77" fill="none" stroke="#fff8ea" stroke-width="2.5" opacity="0.8" />
            <circle cx="392" cy="95" r="76" fill="url(#${id('glass')})" opacity="0.48" />
            <ellipse cx="376" cy="71" rx="24" ry="12" fill="#ffffff" opacity="0.35" />
            <ellipse cx="372" cy="63" rx="12" ry="6" fill="#fff" opacity="0.18" />

            <rect x="433" y="136" width="25" height="108" rx="12" fill="url(#${id('handle')})" transform="rotate(38 446 190)" />
            <rect x="438" y="138" width="13" height="96" rx="6" fill="#6f4218" opacity="0.32" transform="rotate(38 444 186)" />

            <ellipse cx="38" cy="228" rx="34" ry="24" fill="#6fa73c" opacity="0.25" />
            <ellipse cx="72" cy="228" rx="29" ry="20" fill="url(#${id('leaf')})" transform="rotate(-18 72 228)" />
            <ellipse cx="102" cy="212" rx="34" ry="44" fill="url(#${id('apple-orange')})" />
            <ellipse cx="100" cy="206" rx="10" ry="26" fill="#7d4a1d" transform="rotate(10 100 206)" />
            <ellipse cx="128" cy="220" rx="16" ry="10" fill="#d6eb87" opacity="0.8" transform="rotate(-22 128 220)" />

            <ellipse cx="214" cy="232" rx="36" ry="28" fill="#eee06b" opacity="0.72" />
            <path d="M214 198 C226 206, 227 228, 214 240 C202 228, 202 206, 214 198Z" fill="#f5e78f" opacity="0.9" />
            <path d="M214 199 C226 207, 226 228, 214 239 C202 228, 202 207, 214 199Z" fill="none" stroke="#d8bf52" stroke-width="2" opacity="0.5" />
            <circle cx="214" cy="218" r="4" fill="#fff4be" />
            <circle cx="203" cy="223" r="2" fill="#fff4be" opacity="0.8" />
            <circle cx="225" cy="223" r="2" fill="#fff4be" opacity="0.8" />

            <circle cx="472" cy="220" r="13" fill="#efbf4f" opacity="0.36" />
            <circle cx="492" cy="186" r="9" fill="#f2d36c" opacity="0.7" />
          </g>
        </g>
      </g>
    </svg>
  `;
}

function totalRecipeTime(recipe) {
  return Number(recipe?.prep_time_min || 0) + Number(recipe?.cook_time_min || 0);
}

function formatRecipeTime(minutes) {
  const total = Math.max(0, Number(minutes || 0));
  if (total >= 60) {
    const hours = Math.floor(total / 60);
    const remainder = total % 60;
    return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
  }
  return `${total} min`;
}

function difficultyClass(level) {
  if (level === 1) {
    return 'is-easy';
  }
  if (level === 3) {
    return 'is-hard';
  }
  return 'is-medium';
}

function buildRecipeIndex(state) {
  const index = new Map();
  Object.values(state.recipesByCategory || {}).forEach((recipes) => {
    recipes.forEach((recipe) => {
      if (!index.has(recipe.id)) {
        index.set(recipe.id, recipe);
      }
    });
  });
  return index;
}

function renderFeaturedRecipeCard({ locale, recipe, recipeIndex, state }) {
  const recipeData = recipeIndex.get(recipe.id);
  const translated = recipeData ? state.ui.translateRecipe(recipeData) : null;
  const title = translated?.title || recipeTitles[locale][recipe.id];
  const timeLabel = recipeData ? formatRecipeTime(totalRecipeTime(recipeData)) : '';
  const servingsLabel = recipeData?.servings ? `${recipeData.servings} ${state.ui.copy.servings.toLowerCase()}` : '';
  const difficultyLevel = Number(recipeData?.difficulty || 2);
  const difficultyLabel = state.ui.translateDifficulty(difficultyLevel);
  const metaHtml = recipeData
    ? `
        <span class="home-recipe-card__meta">
          <span class="home-recipe-card__meta-item">
            ${recipeMetaIcons.time}
            <span>${timeLabel}</span>
          </span>
          <span class="home-recipe-card__meta-item">
            ${recipeMetaIcons.servings}
            <span>${servingsLabel}</span>
          </span>
          <span class="home-recipe-card__difficulty ${difficultyClass(difficultyLevel)}">${difficultyLabel}</span>
        </span>
      `
    : '';

  return `
    <button class="home-recipe-card" data-action="recipe" data-recipe-id="${recipe.id}">
      <span class="home-recipe-card__photo">
        <img src="${recipeImageSrc(recipe.slug)}" alt="${title}" loading="lazy" />
      </span>
      <span class="home-recipe-card__body">
        <span class="home-recipe-card__title">${title}</span>
        ${metaHtml}
      </span>
    </button>
  `;
}

function heroImage(locale) {
  const label = locale === 'en'
    ? 'Zdravo Jem banner: choose market products and discover what you can prepare.'
    : 'Pasica Zdravo Jem: izberi izdelke s tržnice in odkrij, kaj lahko pripraviš.';

  return `
    <img
      class="home-hero__image"
      src="${heroImageSrc}"
      alt="${label}"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  `;
}

export function render({ state }) {
  const locale = state.ui.locale;
  const recipeIndex = buildRecipeIndex(state);

  return `
    <section class="screen screen--home">
      <section class="home-hero">
        <div class="home-hero__art">${heroImage(locale)}</div>
      </section>

      <section class="home-section home-section--categories">
        <div class="home-section__header">
          <h2>${locale === 'en' ? 'Choose a category' : 'Izberi kategorijo'}</h2>
          <button class="home-link" data-action="products">${locale === 'en' ? 'All' : 'Vse'} <span>&rarr;</span></button>
        </div>
        <div class="home-category-grid">
          ${categoryCards
            .map(
              (category) => `
                <button class="home-category-card" data-action="category" data-category="${category.categoryKey}">
                  <span class="home-category-card__photo">
                    <img src="${ingredientImageSrc(category.image)}" alt="${state.ui.translateIngredient(category.image)}" loading="lazy" />
                  </span>
                  <span class="home-category-card__label">${pickLabel(category.label, locale)}</span>
                </button>
              `
            )
            .join('')}
        </div>
      </section>

      <section class="home-section home-section--recipes">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeRecipesTitle}</h2>
          <button class="home-link" data-action="all-recipes">${locale === 'en' ? 'All' : 'Vse'} <span>&rarr;</span></button>
        </div>
        <div class="home-recipe-carousel">
          ${featuredRecipes
            .map((recipe) => renderFeaturedRecipeCard({ locale, recipe, recipeIndex, state }))
            .join('')}
        </div>
      </section>

      <section class="home-section home-section--games">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeGamesTitle}</h2>
          <button class="home-link" data-action="games">${locale === 'en' ? 'All' : 'Vse'} <span>&rarr;</span></button>
        </div>
        <div class="home-game-grid">
          ${gameCards
            .map(
              (game) => `
                <button
                  class="home-game-card"
                  data-action="games"
                  aria-label="${pickLabel(game.title, locale)}. ${pickLabel(game.text, locale)}."
                >
                  <span class="home-game-card__art" aria-hidden="true">
                    <img
                      class="home-game-card__image"
                      src="${gameCardImageSrc(game.image)}"
                      alt=""
                      loading="eager"
                      decoding="async"
                    />
                  </span>
                </button>
              `
            )
            .join('')}
        </div>
      </section>
    </section>
  `;
}

export function bind({ actions, root }) {
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

    if (action === 'products') {
      actions.openProducts();
      return;
    }

    if (action === 'category') {
      actions.openProducts(target.dataset.category);
      return;
    }

    if (action === 'all-recipes') {
      actions.showAllRecipes();
      return;
    }

    if (action === 'recipe') {
      actions.selectRecipeById(Number(target.dataset.recipeId));
      return;
    }

    if (action === 'games') {
      actions.goTo('games');
    }
  });
}
