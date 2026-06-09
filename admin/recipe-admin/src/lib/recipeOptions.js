export const recipeDifficultyOptions = ['Enostavna', 'Normalna', 'Zahtevna']

export const recipeServingUnitOptions = [
  'porcije',
  'hlebec',
  'potica',
  'ocvirkovka',
  'cmoki',
  'kosi',
  'zavitek',
]

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
  'Prazni\u010dna jed',
]

const legacyDifficultyMap = {
  1: 'Enostavna',
  2: 'Normalna',
  3: 'Zahtevna',
}

function normalizeTag(tag) {
  const value = String(tag ?? '').trim()

  return recipeTagOptions.find((option) => option.toLowerCase() === value.toLowerCase()) || ''
}

export function normalizeRecipeDifficulty(value) {
  const text = String(value ?? '').trim()

  if (recipeDifficultyOptions.includes(text)) {
    return text
  }

  return legacyDifficultyMap[text] || recipeDifficultyOptions[0]
}

export function normalizeRecipeServingUnit(value) {
  const text = String(value ?? '').trim()

  return recipeServingUnitOptions.includes(text) ? text : recipeServingUnitOptions[0]
}

export function parseRecipeTags(value) {
  if (Array.isArray(value)) {
    return normalizeRecipeTags(value)
  }

  const text = String(value ?? '').trim()

  if (!text) {
    return []
  }

  try {
    const parsed = JSON.parse(text)

    if (Array.isArray(parsed)) {
      return normalizeRecipeTags(parsed)
    }
  } catch {
    // Fall through to support legacy comma-separated values.
  }

  return normalizeRecipeTags(text.split(/[,;\n]/))
}

export function normalizeRecipeTags(tags) {
  return Array.from(
    new Set(
      tags
        .map(normalizeTag)
        .filter(Boolean),
    ),
  )
}

export function serializeRecipeTags(tags) {
  const normalizedTags = normalizeRecipeTags(tags)

  return normalizedTags.length ? JSON.stringify(normalizedTags) : null
}
