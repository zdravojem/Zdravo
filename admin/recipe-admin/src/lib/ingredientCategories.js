export const ingredientCategories = [
  { value: 'sadje', label: 'Sadje' },
  { value: 'zelenjava', label: 'Zelenjava' },
  { value: 'meso_in_mesni_izdelki', label: 'Meso in mesni izdelki' },
  { value: 'ribe', label: 'Ribe' },
  { value: 'jajca', label: 'Jajca' },
  { value: 'mlecni_izdelki', label: 'Mlečni izdelki' },
  { value: 'strocnice', label: 'Stročnice' },
  { value: 'gobe', label: 'Gobe' },
  { value: 'vlozena_kisana_zelenjava', label: 'Vložena / kisana zelenjava' },
  { value: 'zita_kase_zdrobi', label: 'Žita, kaše in zdrobi' },
  { value: 'moka', label: 'Moka' },
  { value: 'pekovski_izdelki_testo_kvas', label: 'Pekovski izdelki, testo, kvas' },
  { value: 'olja_in_mascobe', label: 'Olja in maščobe' },
  { value: 'zacimbe_in_zelisca', label: 'Začimbe in zelišča' },
  { value: 'omake_kis_dodatki', label: 'Omake, kis in dodatki' },
  { value: 'sladila', label: 'Sladila' },
  { value: 'juhe_in_osnove', label: 'Juhe in osnove' },
  { value: 'semena', label: 'Semena' },
  { value: 'pijace_alkohol_za_kuhanje', label: 'Pijače / alkohol (za kuhanje)' },
]

const labelsByValue = new Map(
  ingredientCategories.map((category) => [category.value, category.label]),
)

const legacyCategoryMap = {
  meso_ribe: 'meso_in_mesni_izdelki',
  mlecni: 'mlecni_izdelki',
  zita: 'zita_kase_zdrobi',
  zacimbe: 'zacimbe_in_zelisca',
}

const categoryByIngredientName = {
  fizol: 'strocnice',
  jagode: 'sadje',
  jajca: 'jajca',
  jurcki: 'gobe',
  kruh: 'pekovski_izdelki_testo_kvas',
  leca: 'strocnice',
  maslo: 'olja_in_mascobe',
  med: 'sladila',
  'oljcno-olje': 'olja_in_mascobe',
  postrv: 'ribe',
  'psenicna-moka': 'moka',
}

const slovenianCharacters = {
  š: 's',
  Š: 's',
  č: 'c',
  Č: 'c',
  ž: 'z',
  Ž: 'z',
}

function ingredientNameKey(name) {
  return String(name ?? '')
    .replace(
      /[šŠčČžŽ]/g,
      (character) => slovenianCharacters[character],
    )
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeIngredientCategory(category, ingredientName = '') {
  const nameCategory = categoryByIngredientName[ingredientNameKey(ingredientName)]

  if (nameCategory) {
    return nameCategory
  }

  return legacyCategoryMap[category] || category || ingredientCategories[0].value
}

export function ingredientCategoryLabel(category, ingredientName = '') {
  const normalizedCategory = normalizeIngredientCategory(category, ingredientName)

  return labelsByValue.get(normalizedCategory) || category || ''
}
