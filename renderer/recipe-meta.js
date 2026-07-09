export const recipeTagOptions = [
  'Zajtrk',
  'Malica',
  'Kosilo',
  'Lahkotno kosilo',
  'Ve\u010derja',
  'Sladica',
  'Priloga',
  'Predjed',
  'Enolon\u010dnica',
  'Jed na \u017elico',
  'Prigrizek',
  'Prazni\u010dna jed'
];

const difficultyMap = {
  1: 'Enostavna',
  2: 'Normalna',
  3: 'Zahtevna'
};

const servingUnitLabels = {
  en: {
    porcija: 'serving',
    porcije: 'servings',
    porcij: 'servings',
    hlebec: 'loaf',
    hlebca: 'loaves',
    hlebci: 'loaves',
    hlebcev: 'loaves',
    potica: 'potica',
    ocvirkovka: 'ocvirkovka',
    cmok: 'dumpling',
    cmoka: 'dumplings',
    cmoki: 'dumplings',
    cmokov: 'dumplings',
    kos: 'piece',
    kosi: 'pieces',
    kosov: 'pieces',
    zavitek: 'strudel',
    zavitka: 'strudels',
    zavitki: 'strudels',
    zavitkov: 'strudels'
  }
};

function slServingsLabel(quantity, unit) {
  const n = Number(quantity);

  if (unit === 'porcija' || unit === 'porcije' || unit === 'porcij') {
    if (n === 1) return 'porcija';
    if (n >= 2 && n <= 4) return 'porcije';
    return 'porcij';
  }

  if (unit === 'kos' || unit === 'kosi' || unit === 'kosov') {
    if (n === 1) return 'kos';
    if (n >= 2 && n <= 4) return 'kosi';
    return 'kosov';
  }

  if (unit === 'cmok' || unit === 'cmoka' || unit === 'cmoki' || unit === 'cmokov') {
    if (n === 1) return 'cmok';
    if (n === 2) return 'cmoka';
    if (n >= 3 && n <= 4) return 'cmoki';
    return 'cmokov';
  }

  if (unit === 'hlebec' || unit === 'hlebca' || unit === 'hlebci' || unit === 'hlebcev') {
    if (n === 1) return 'hlebec';
    if (n === 2) return 'hlebca';
    if (n >= 3 && n <= 4) return 'hlebci';
    return 'hlebcev';
  }

  if (unit === 'zavitek' || unit === 'zavitka' || unit === 'zavitki' || unit === 'zavitkov') {
    if (n === 1) return 'zavitek';
    if (n === 2) return 'zavitka';
    if (n >= 3 && n <= 4) return 'zavitki';
    return 'zavitkov';
  }

  return unit;
}

function normalizeTag(tag) {
  const value = String(tag ?? '').trim();

  return recipeTagOptions.find((option) => option.toLowerCase() === value.toLowerCase()) || '';
}

export function normalizeRecipeDifficulty(value) {
  const text = String(value ?? '').trim();

  if (text === 'Enostavna' || text === 'Normalna' || text === 'Zahtevna') {
    return text;
  }

  return difficultyMap[text] || 'Normalna';
}

export function difficultyClass(value) {
  const difficulty = normalizeRecipeDifficulty(value);

  if (difficulty === 'Enostavna') {
    return 'is-easy';
  }

  if (difficulty === 'Zahtevna') {
    return 'is-hard';
  }

  return 'is-medium';
}

export function parseRecipeTags(value) {
  if (Array.isArray(value)) {
    return normalizeRecipeTags(value);
  }

  const text = String(value ?? '').trim();

  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return normalizeRecipeTags(parsed);
    }
  } catch (error) {
    // Fall through to support legacy comma-separated values.
  }

  return normalizeRecipeTags(text.split(/[,;\n]/));
}

export function normalizeRecipeTags(tags) {
  return Array.from(
    new Set(
      tags
        .map(normalizeTag)
        .filter(Boolean)
    )
  );
}

export function recipeHasTag(recipe, tag) {
  return parseRecipeTags(recipe?.tags).includes(tag);
}

export function recipeTimeMinutes(recipe) {
  if (recipe?.time_min !== undefined && recipe?.time_min !== null) {
    return Number(recipe.time_min || 0);
  }

  return Number(recipe?.prep_time_min || 0) + Number(recipe?.cook_time_min || 0);
}

export function recipeServingsText(recipe, locale = 'sl') {
  const quantity = recipe?.servings_quantity ?? recipe?.servings;

  if (quantity === undefined || quantity === null || quantity === '') {
    return '';
  }

  const unit = String(recipe?.servings_unit || '').trim();

  let label;
  if (locale === 'sl') {
    label = unit ? slServingsLabel(quantity, unit) : '';
  } else {
    label = servingUnitLabels[locale]?.[unit] || unit;
  }

  return [quantity, label].filter(Boolean).join(' ');
}
