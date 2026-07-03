import { gameCardImageSrc } from '../game-card-images.js';
import { recipeImageSrc } from '../recipe-images.js';
import {
  difficultyClass,
  recipeServingsText,
  recipeTimeMinutes
} from '../recipe-meta.js';

const heroImageSrc = '../assets/images/home-hero.png';

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

const categoryCarouselCopies = 3;
const categoryCarouselMiddleCopy = 1;

const categoryCardDetails = {
  sadje: {
    subtitle: { sl: 'Sladko in sezonsko', en: 'Sweet and seasonal' },
    accent: '#b14844',
    icon: 'apple'
  },
  zelenjava: {
    subtitle: { sl: 'Sve&#382;a zelenjava', en: 'Fresh vegetables' },
    accent: '#cf7a1d',
    icon: 'carrot'
  },
  meso_in_mesni_izdelki: {
    subtitle: { sl: 'Meso in doma&#269;i izdelki', en: 'Meat and local goods' },
    accent: '#b54d2e',
    icon: 'meat'
  },
  ribe: {
    subtitle: { sl: 'Re&#269;ne in sve&#382;e ribe', en: 'River and fresh fish' },
    accent: '#2f84a6',
    icon: 'fish'
  },
  jajca: {
    subtitle: { sl: 'Sve&#382;a jajca', en: 'Fresh eggs' },
    accent: '#c78b22',
    icon: 'egg'
  },
  mlecni_izdelki: {
    subtitle: { sl: 'Mleko, skuta in sir', en: 'Milk, curd and cheese' },
    accent: '#6c92b8',
    icon: 'dairy'
  },
  strocnice: {
    subtitle: { sl: 'Fi&#382;ol in grah', en: 'Beans and peas' },
    accent: '#7c8f2e',
    icon: 'beans'
  },
  gobe: {
    subtitle: { sl: 'Sve&#382;e in suhe gobe', en: 'Fresh and dried mushrooms' },
    accent: '#8b6b45',
    icon: 'mushroom'
  },
  vlozena_kisana_zelenjava: {
    subtitle: { sl: 'Kisana zelenjava', en: 'Pickled vegetables' },
    accent: '#718d30',
    icon: 'pickled'
  },
  zita_kase_zdrobi: {
    subtitle: { sl: '&#381;ita, ka&#353;e in zdrobi', en: 'Grains and porridges' },
    accent: '#8c632f',
    icon: 'grains'
  },
  moka: {
    subtitle: { sl: 'Moke za kruh in testo', en: 'Flours for bread and dough' },
    accent: '#a8793f',
    icon: 'flour'
  },
  pekovski_izdelki_testo_kvas: {
    subtitle: { sl: 'Kruh, testo in kvas', en: 'Bread, dough and yeast' },
    accent: '#b77938',
    icon: 'bread'
  },
  olja_in_mascobe: {
    subtitle: { sl: 'Olja in ma&#353;&#269;obe', en: 'Oils and fats' },
    accent: '#b78a19',
    icon: 'oil'
  },
  zacimbe_in_zelisca: {
    subtitle: { sl: 'Za&#269;imbe in zeli&#353;&#269;a', en: 'Spices and herbs' },
    accent: '#7b972d',
    icon: 'herbs'
  },
  omake_kis_dodatki: {
    subtitle: { sl: 'Omake, kis in dodatki', en: 'Sauces and additions' },
    accent: '#a95d34',
    icon: 'sauce'
  },
  sladila: {
    subtitle: { sl: 'Med, sladkor in sladila', en: 'Honey, sugar and sweeteners' },
    accent: '#c58b19',
    icon: 'honey'
  },
  juhe_in_osnove: {
    subtitle: { sl: 'Juhe in osnove', en: 'Soups and stocks' },
    accent: '#6b8f3a',
    icon: 'soup'
  },
  semena: {
    subtitle: { sl: 'Semena za jedi', en: 'Seeds for dishes' },
    accent: '#88992e',
    icon: 'seeds'
  },
  pijace_alkohol_za_kuhanje: {
    subtitle: { sl: 'Pija&#269;e za kuhanje', en: 'Drinks for cooking' },
    accent: '#8b5aa3',
    icon: 'drink'
  }
};

const gameCards = [
  {
    key: 'detective',
    title: { sl: 'Tržni detektiv', en: 'Market detective' },
    text: { sl: 'Detektivska igra', en: 'Detective game' },
    image: 'trzni-detektiv',
    description: {
      sl: 'Razi&#353;&#269;i tr&#382;nico, postavi prava vpra&#353;anja in odkrij, od kod prihaja hrana!',
      en: 'Explore the market, ask the right questions and discover where food comes from!'
    },
    cta: { sl: 'Igraj zdaj', en: 'Play now' }
  },
  {
    title: { sl: 'Od kmetije do krožnika', en: 'From farm to plate' },
    text: { sl: 'Puzzle igra', en: 'Puzzle game' },
    image: 'od-kmetije-do-kroznika',
    key: 'puzzle',
    description: {
      sl: 'Sestavi slike in spoznaj pot hrane od kmetije do tvojega kro&#382;nika!',
      en: 'Complete the pictures and learn the path food takes from farm to your plate!'
    },
    cta: { sl: 'Igraj zdaj', en: 'Play now' }
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
  `,
  difficulty: `
    <svg class="home-recipe-card__meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19v-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M12 19V8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M19 19V5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `
};

function pickLabel(value, locale) {
  return value[locale] || value.sl;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function categoryImageSrc(categoryKey) {
  const index = categoryImageByKey.get(categoryKey);

  return index ? `../assets/images/categories/ordered/${index}.png` : '';
}

function buildCategoryCards(state) {
  return state.ui.categories.map((category) => ({
    ...categoryCardDetails[category.key],
    categoryKey: category.key,
    label: category.label
  }));
}

function categoryTitle(category, locale) {
  return typeof category.label === 'string'
    ? category.label
    : pickLabel(category.label, locale);
}

function categorySubtitle(category, locale) {
  return category.subtitle ? pickLabel(category.subtitle, locale) : '';
}

function renderHomeLeafIcon() {
  return `
    <svg class="home-section__title-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19.5 5.2c-5.9 0-10.6 4.4-10.6 9.8 0 2.6 2.1 4.8 4.8 4.8 6.1 0 10.8-5.7 10.8-12.2 0-1.6-1.2-2.4-2.7-2.4-1.2 0-1.7 0-2.3 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8.2 18.2c3-1.4 6.3-4.7 8.7-9.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `;
}

const homeNavIcons = {
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

function renderHomeNav(state) {
  const items = [
    ['home', state.ui.copy.homeNavHome],
    ['items', state.ui.copy.homeNavItems],
    ['recipes', state.ui.copy.homeNavRecipes],
    ['games', state.ui.copy.homeNavGames]
  ];

  return `
    <nav class="home-nav home-nav--inline" aria-label="${state.ui.copy.homeNavHome}">
      ${items
        .map(
          ([key, label]) => `
            <button
              class="home-nav__item ${key === 'home' ? 'is-active' : ''}"
              data-shell-action="${key}"
            >
              ${homeNavIcons[key]}
              <span>${label}</span>
            </button>
          `
        )
        .join('')}
    </nav>
  `;
}

function renderMarketLeafIcon() {
  return `
    <svg class="home-market-badge__leaf" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19.5 5.2c-5.9 0-10.6 4.4-10.6 9.8 0 2.6 2.1 4.8 4.8 4.8 6.1 0 10.8-5.7 10.8-12.2 0-1.6-1.2-2.4-2.7-2.4-1.2 0-1.7 0-2.3 0z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8.2 18.2c3-1.4 6.3-4.7 8.7-9.1" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
    </svg>
  `;
}

function renderGameCardArrowIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 6.5l6 5.5-6 5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function renderCategoryCardIcon(kind) {
  const icons = {
    meat: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8.2 7.2c2.2-2 5.7-2.2 8.2-.4 2.1 1.6 3 4.5 2.1 6.9-.7 1.9-2.3 3.3-4.3 3.8-1.6.4-3.3.3-4.8-.4-1.3-.6-2.4-1.6-3.1-2.9-.8-1.6-.9-3.5-.3-5.1.4-1 1.1-1.8 2.2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M15.9 9.3c.4-.8 1.2-1.4 2.1-1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    fish: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 12c2.4-3.2 5.1-4.8 8.2-4.8 3 0 5.6 1.6 7.8 4.8-2.2 3.2-4.8 4.8-7.8 4.8C9.1 16.8 6.4 15.2 4 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M4 12 2.5 8.8M4 12l-1.5 3.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <circle cx="15.8" cy="10.8" r="0.9" fill="currentColor" />
      </svg>
    `,
    egg: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3.8c3.3 3.1 5 6 5 9.4 0 3.5-2.1 5.8-5 5.8s-5-2.3-5-5.8c0-3.4 1.7-6.3 5-9.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
    `,
    dairy: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 4.5h6l1.2 3V20H7.8V7.5L9 4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M8 9h8M10 4.5V3h4v1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    beans: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8.4 8.2c1.6-1.7 4.5-.8 4.9 1.5.4 2.2-1.5 4.2-3.6 3.8-2.4-.4-3.2-3.4-1.3-5.3zM14.2 13.4c1.4-1.5 3.9-.7 4.3 1.3.3 1.9-1.3 3.7-3.2 3.3-2.1-.4-2.8-2.9-1.1-4.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
    `,
    mushroom: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 11.4C5.6 7.3 8.4 5 12 5s6.4 2.3 7 6.4H5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M10 11.4c0 2.5-.6 4.9-1.8 7.1h7.6c-1.2-2.2-1.8-4.6-1.8-7.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
    `,
    pickled: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8.5 4.5h7M9.5 7h5l1.5 2.2V20H8V9.2L9.5 7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M10 13.5h4M10 16h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    carrot: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5.2c2.2 2.3 4 4.8 5.4 7.7 1.1 2.3.8 4.4-.8 5.9-1.5 1.5-3.6 1.8-5.9.8-2.9-1.3-5.4-3.1-7.7-5.4L12 5.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M10.4 5.6c-.4-1.4-1.4-2.3-2.8-2.6M11.9 4.8c.6-1.2 1.7-2 3.1-2.2M13.4 5.9c1.4-.4 2.5-.2 3.5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `,
    apple: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M13.8 5.2c.7-1.2 1.8-2 3.2-2.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M14.1 6.1c1.6-.2 2.8.2 3.7 1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M12 6.4c2.9 0 5.2 2.4 5.2 5.4 0 4.1-2.9 7.2-5.2 7.2S6.8 15.9 6.8 11.8c0-3 2.4-5.4 5.2-5.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
    `,
    grains: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 19.5V6.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M12 11.1c-1.7-1.1-3.4-1.4-5.1-.9.9 2.5 2.7 3.9 5.1 4.2M12 8.8c1.7-1.1 3.4-1.4 5.1-.9-.9 2.5-2.7 3.9-5.1 4.2M12 14.1c-1.2-1.2-2.7-1.9-4.4-2-.2 2.7 1.2 4.6 4.4 5.7M12 12.5c1.2-1.2 2.7-1.9 4.4-2 .2 2.7-1.2 4.6-4.4 5.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `,
    honey: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 4.8h6M10.2 7.2h3.6l1.4 2.2V17H8.8V9.4l1.4-2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M10 11.3h4M10 14h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    flour: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8 6.2h8l1.2 4.2V20H6.8v-9.6L8 6.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M9 6.2V4h6v2.2M9.5 13h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    bread: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 12c0-3.3 3.1-5.8 7-5.8s7 2.5 7 5.8v6H5v-6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M9 10.5v5M12 9.8v5.7M15 10.5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    oil: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10 4.5h4l1.2 2.8V20H8.8V7.3L10 4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M10 4.5V3h4v1.5M12 10.5c1.4 1.5 2.1 2.7 2.1 3.8 0 1.2-.8 2-2.1 2s-2.1-.8-2.1-2c0-1.1.7-2.3 2.1-3.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `,
    sauce: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.5 5h9l-1 14h-7L7.5 5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M8 9h8M9 14h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    soup: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 11h14l-1.2 7H6.2L5 11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M8 8c-.7-.8-.7-1.5 0-2.2M12 8c-.7-.8-.7-1.5 0-2.2M16 8c-.7-.8-.7-1.5 0-2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    seeds: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5c2.1 2.1 3.1 4 3.1 5.9 0 1.9-1.2 3.1-3.1 3.1s-3.1-1.2-3.1-3.1C8.9 9 9.9 7.1 12 5zM7.5 12.4c1.5 1.6 2.2 3.1 2.2 4.4 0 1.4-.9 2.2-2.2 2.2s-2.2-.8-2.2-2.2c0-1.3.7-2.8 2.2-4.4zM16.5 12.4c1.5 1.6 2.2 3.1 2.2 4.4 0 1.4-.9 2.2-2.2 2.2s-2.2-.8-2.2-2.2c0-1.3.7-2.8 2.2-4.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
      </svg>
    `,
    drink: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8 4h8l-1 7.5a4 4 0 0 1-8 0L8 4zM12 15.5V20M9.5 20h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8.5 8h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `,
    herbs: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 19.2V5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M12 10.7c-2.9-2.3-5-2.2-6.2-1.4.9 2.4 2.8 3.7 6.2 4.1M12 8.8c2.9-2.3 5-2.2 6.2-1.4-.9 2.4-2.8 3.7-6.2 4.1M12 14c-2.2-1.7-3.9-1.8-5-.9.9 2 2.3 3.2 5 3.5M12 12.7c2.2-1.7 3.9-1.8 5-.9-.9 2-2.3 3.2-5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `
  };

  return icons[kind] || icons.herbs;
}

function renderCategoryChevronIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 6.5l6 5.5-6 5.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function renderCategoryCheckIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.5 12.5l4.1 4.1 8.9-9.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function categoryAriaLabel(category, locale) {
  return `${categoryTitle(category, locale)}. ${categorySubtitle(category, locale)}.`;
}

function renderHomeCategoryCard({ category, isSelected, locale }) {
  return `
    <button
      class="home-category-card ${isSelected ? 'is-selected' : ''}"
      data-action="category"
      data-category="${category.categoryKey}"
      style="--card-accent: ${category.accent};"
      aria-label="${categoryAriaLabel(category, locale)}"
      aria-pressed="${isSelected}"
    >
      <span class="home-category-card__thumb">
        <img
          class="home-category-card__img"
          src="${categoryImageSrc(category.categoryKey)}"
          alt=""
          loading="lazy"
        />
        ${isSelected ? `<span class="home-category-card__check">${renderCategoryCheckIcon()}</span>` : ''}
      </span>
      <span class="home-category-card__name">${categoryTitle(category, locale)}</span>
    </button>
  `;
}

// Paged category carousel (no looping): just remember/restore the scroll
// position so selecting a category does not jump the user back to the first page.
function setupCategoryCarousel(carousel, state, actions) {
  if (!carousel) {
    return;
  }

  window.requestAnimationFrame(() => {
    const saved = Number(state.homeCategoryScrollLeft);
    if (Number.isFinite(saved) && saved > 0) {
      carousel.scrollLeft = saved;
    }
  });

  carousel.addEventListener('scroll', () => {
    actions.rememberHomeCategoryScroll?.(carousel.scrollLeft);
  }, { passive: true });
}

// Seamless looping carousel: the track holds three identical copies of the row
// and moves with a transform so browser scroll clamping cannot halt the motion.
function setupInfiniteCarousel(track) {
  if (!track) {
    return;
  }

  let frame = 0;
  let x = 0;
  let lastAutoTime = 0;
  let loopWidth = 0;
  let isPaused = false;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartOffset = 0;
  const autoSpeed = 0.025;

  const normalizeOffset = (value) => {
    if (!loopWidth && !measure()) {
      return value;
    }

    let next = value;
    while (next <= -loopWidth) next += loopWidth;
    while (next > 0) next -= loopWidth;
    return next;
  };

  const applyOffset = (value) => {
    x = normalizeOffset(value);
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  const measure = () => {
    const first = track.querySelector('[data-loop="0"]');
    const second = track.querySelector('[data-loop="1"]');

    if (!first || !second) {
      return false;
    }

    loopWidth = second.offsetLeft - first.offsetLeft;
    return loopWidth > 0;
  };

  const autoScroll = (time) => {
    if (!track.isConnected) {
      frame = 0;
      return;
    }

    if (!loopWidth && !measure()) {
      lastAutoTime = 0;
      frame = window.requestAnimationFrame(autoScroll);
      return;
    }

    if (!lastAutoTime) {
      lastAutoTime = time;
    }

    const elapsed = Math.min(48, Math.max(0, time - lastAutoTime));
    lastAutoTime = time;

    if (!isPaused && elapsed > 0) {
      applyOffset(x - elapsed * autoSpeed);
    }

    frame = window.requestAnimationFrame(autoScroll);
  };

  track.addEventListener('pointerdown', (event) => {
    isPaused = true;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartOffset = x;
    track.classList.add('is-dragging');
    track.setPointerCapture?.(event.pointerId);
  }, { passive: true });

  const resumeAutoScroll = () => {
    isPaused = false;
    dragPointerId = null;
    track.classList.remove('is-dragging');
    lastAutoTime = 0;
  };

  track.addEventListener('pointermove', (event) => {
    if (dragPointerId !== event.pointerId) {
      return;
    }

    applyOffset(dragStartOffset + event.clientX - dragStartX);
  }, { passive: true });

  track.addEventListener('pointerup', resumeAutoScroll, { passive: true });
  track.addEventListener('pointercancel', resumeAutoScroll, { passive: true });
  track.addEventListener('pointerleave', resumeAutoScroll, { passive: true });

  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) {
      return;
    }

    event.preventDefault();
    const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
    isPaused = true;
    applyOffset(x - delta);
    window.clearTimeout(track._resumeWheelTimer);
    track._resumeWheelTimer = window.setTimeout(resumeAutoScroll, 600);
  }, { passive: false });

  frame = window.requestAnimationFrame(autoScroll);
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
  return recipeTimeMinutes(recipe);
}

function formatRecipeTime(minutes) {
  const total = Math.max(0, Number(minutes || 0));
  return `${total} min`;
}

function renderFeaturedRecipeCard({ locale, recipe, state, loopIndex = 0 }) {
  const translated = state.ui.translateRecipe(recipe);
  const title = translated?.title || recipe.name_sl || '';
  const timeMinutes = totalRecipeTime(recipe);
  const timeLabel = timeMinutes > 0 ? formatRecipeTime(timeMinutes) : '';
  const servingsLabel = recipeServingsText(recipe, locale);
  const difficulty = recipe.difficulty || 'Normalna';
  const difficultyLabel = state.ui.translateDifficulty(difficulty);

  const metaItems = [
    timeLabel ? { icon: recipeMetaIcons.time, value: timeLabel } : null,
    difficultyLabel ? { icon: recipeMetaIcons.difficulty, value: difficultyLabel } : null,
    servingsLabel ? { icon: recipeMetaIcons.servings, value: servingsLabel } : null
  ].filter(Boolean);

  const metaHtml = metaItems.length
    ? `
        <span class="home-recipe-card__meta">
          ${metaItems
            .map(
              (item) => `
            <span class="home-recipe-card__meta-item">
              ${item.icon}
              <span>${item.value}</span>
            </span>
          `
            )
            .join('')}
        </span>
      `
    : '';

  return `
    <button class="home-recipe-card" data-action="recipe" data-recipe-id="${recipe.id}" data-loop="${loopIndex}">
      <span class="home-recipe-card__photo">
        <img src="${recipeImageSrc(recipe)}" alt="${title}" loading="lazy" />
      </span>
      <span class="home-recipe-card__body">
        <span class="home-recipe-card__title">${title}</span>
        ${metaHtml}
      </span>
    </button>
  `;
}

function renderHomeGameCard({ game, locale }) {
  return `
    <button
      class="home-game-card home-game-card--${game.key}"
      data-action="start-game"
      data-game="${game.key}"
      aria-label="${gameTitleText(game.title, locale)}"
    >
      <span class="home-game-card__scene" aria-hidden="true">
        <img
          class="home-game-card__image"
          src="${gameCardImageSrc(game.image)}"
          alt=""
          loading="eager"
          decoding="async"
        />
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
  const categoryCards = buildCategoryCards(state);
  const homeRecipeIdeas = Array.isArray(state.homeRecipeIdeas) ? state.homeRecipeIdeas : [];

  return `
    <section class="screen screen--home">
      <div class="home-shell">
      <div class="home-shell__scroll">
      <section class="home-hero">
        <div class="home-hero__art">${heroImage(locale)}</div>
      </section>

      <section class="home-section home-section--categories">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeMarketTitle}</h2>
          <span class="home-market-badge">${state.ui.copy.homeMarketBadge}${renderMarketLeafIcon()}</span>
        </div>
        <div class="home-category-carousel" data-category-carousel>
          ${chunkArray(categoryCards, 10)
            .map(
              (page) => `
            <div class="home-category-page">
              ${page
                .map((category) =>
                  renderHomeCategoryCard({
                    category,
                    isSelected: false,
                    locale
                  })
                )
                .join('')}
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="home-section home-section--recipes">
        <div class="home-section__header">
          <h2>${state.ui.copy.homeRecipesTitle}</h2>
          <button class="home-link" data-action="all-recipes">${locale === 'en' ? 'View all' : 'Vsi recepti'} <span>&rarr;</span></button>
        </div>
        <div class="home-recipe-carousel-clip">
          <div class="home-recipe-carousel" data-recipe-carousel>
            ${homeRecipeIdeas.length
              ? Array.from({ length: 3 }, (_, loopIndex) =>
                  homeRecipeIdeas
                    .map((recipe) => renderFeaturedRecipeCard({ locale, recipe, state, loopIndex }))
                    .join('')
                ).join('')
              : `<span class="home-recipe-empty">${locale === 'en' ? 'No recipes available yet.' : 'Recepti še niso na voljo.'}</span>`}
          </div>
        </div>
      </section>

      <section class="home-section home-section--games">
        <div class="home-section__header home-games-header">
          <span class="home-games-heading">
            <span class="home-games-heading__copy">
              <h2>${state.ui.copy.homeGamesTitle}</h2>
            </span>
          </span>
        </div>
        <div class="home-game-grid">
          ${gameCards
            .map((game) => renderHomeGameCard({ game, locale }))
            .join('')}
        </div>
      </section>
      </div>

      ${renderHomeNav(state)}
      </div>
    </section>
  `;
}

export function bind({ actions, root, state }) {
  const screen = root.querySelector('.screen--home');
  if (!screen) {
    return;
  }

  const categoryGrid = screen.querySelector('[data-category-carousel]');
  setupCategoryCarousel(categoryGrid, state, actions);
  setupInfiniteCarousel(screen.querySelector('[data-recipe-carousel]'));

  // Distinguish a tap from a scroll/drag so the horizontal carousels
  // (categories, recipe ideas) stay scrollable on touch screens: record the
  // press, then only fire the action on release if the pointer barely moved
  // and is still over the same control. A swipe scrolls and opens nothing.
  const TAP_SLOP = 10;
  let pressTarget = null;
  let pressX = 0;
  let pressY = 0;

  screen.addEventListener('pointerdown', (event) => {
    pressTarget = event.target.closest('[data-action]');
    pressX = event.clientX;
    pressY = event.clientY;
  });

  screen.addEventListener('pointercancel', () => {
    pressTarget = null;
  });

  screen.addEventListener('pointerup', (event) => {
    const start = pressTarget;
    pressTarget = null;
    if (!start) {
      return;
    }

    // Released somewhere else (e.g. after a swipe) — not a tap on this card.
    if (event.target.closest('[data-action]') !== start) {
      return;
    }

    // Moved too far — treat as a scroll, not a tap.
    if (Math.abs(event.clientX - pressX) > TAP_SLOP || Math.abs(event.clientY - pressY) > TAP_SLOP) {
      return;
    }

    const target = start;
    const action = target.dataset.action;

    if (action === 'products') {
      actions.openProducts();
      return;
    }

    if (action === 'category') {
      actions.rememberHomeCategoryScroll?.(categoryGrid?.scrollLeft || 0);
      actions.showRecipesForHomeCategory(target.dataset.category);
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
      return;
    }

    if (action === 'start-game') {
      actions.startGame(target.dataset.game);
    }
  });
}
