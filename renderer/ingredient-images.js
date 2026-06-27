const placeholderIngredientImage =
  'data:image/svg+xml,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="28" fill="#f5efe1"/>
      <circle cx="80" cy="76" r="34" fill="#d9e7b5"/>
      <path d="M52 94c15 20 41 20 56 0" fill="none" stroke="#6d7f38" stroke-width="10" stroke-linecap="round"/>
      <path d="M80 43c14-19 33-22 45-18-3 20-17 33-45 35" fill="#88aa45"/>
    </svg>
  `);

function syncedImageSrc(bucket, imagePath) {
  const normalizedPath = String(imagePath || '').trim();

  if (!normalizedPath || normalizedPath.startsWith('assets/')) {
    return '';
  }

  if (typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol)) {
    return `/synced-images/${bucket}/${normalizedPath
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/')}`;
  }

  return `zdravo-image://${bucket}/${normalizedPath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/')}`;
}

const orderedIngredientNames = [
  'ajdova kaša',
  'ajdova moka',
  'banana',
  'bbq omaka',
  'bela moka',
  'bela pšenična moka',
  'beli vinski kis',
  'belo vino',
  'borovnice',
  'buča',
  'buča hokaido',
  'bučke',
  'bučna semena',
  'bučno olje',
  'cimet',
  'cviček',
  'čebula',
  'česen',
  'češplje / slive',
  'drobnjak',
  'drobtine',
  'domače klobase',
  'fižol',
  'goveja juha',
  'goveja jušna osnova',
  'goveje kosti',
  'goveje meso',
  'grah',
  'gorčica',
  'hren',
  'jabolka',
  'jajca',
  'ješprenj',
  'jogurt',
  'jušna zelenjava',
  'kis',
  'kisla repa',
  'kisla smetana',
  'kislo zelje',
  'klobase',
  'koleraba',
  'korenček',
  'korenje',
  'koruzna moka',
  'koruzni zdrob / polenta',
  'krap',
  'krompir',
  'kruh',
  'kumina',
  'kvas',
  'limona',
  'maslo',
  'med',
  'mleko',
  'mleta rdeča paprika',
  'mleta sladka paprika',
  'mleto meso',
  'moka',
  'ocvirki',
  'olivno olje',
  'olje',
  'ovseni kosmiči',
  'panceta',
  'paradižnik',
  'pasiran paradižnik',
  'pečenica',
  'piščančje meso',
  'pirina moka',
  'por',
  'postrv',
  'prekajena slanina',
  'prekajeno meso',
  'prosena kaša',
  'pšenična moka',
  'pšenični zdrob',
  'rdeče vino',
  'rdeče zelje',
  'redkvice',
  'riž',
  'rum',
  'rumenjaki',
  'ržena moka',
  'sir',
  'skuta',
  'sladilo',
  'sladka smetana',
  'sladkor',
  'slanina',
  'slive',
  'sol',
  'smetana',
  'suh fižol',
  'suhe brusnice',
  'suhe slive',
  'suhi jurčki',
  'svinjska rebra',
  'svinjski vrat',
  'svinjski kare',
  'svež kruh',
  'sveže gobe',
  'vanilija',
  'vlečeno testo',
  'zajčje meso',
  'zelena',
  'zelje',
  'arašidovo maslo',
  'beljaki',
  'bourbon vanilijev sladkor',
  'cimetova palčka',
  'čokolada / sadni preliv',
  'gomoljna zelena',
  'gobe',
  'jušna osnova',
  'kakavova zrna',
  'limonin sok',
  'kokosov čips',
  'kokosova moka',
  'koromač',
  'lovorjev list',
  'majaron',
  'mast',
  'melisa',
  'mlada špinača',
  'muškatni orešček',
  'origano',
  'orehi',
  'paradižnikova mezga',
  'paradižnik',
  'pehtran',
  'piškotne drobtine',
  'poper',
  'peteršilj',
  'peteršiljeva korenina',
  'rjavi sladkor',
  'rožmarin',
  'rozine',
  'šetraj',
  'timijan',
  'vanilijev sladkor',
  'voda',
  'želatina'
];

function repairMojibake(value) {
  const text = String(value || '');

  if (!/[ÅÄ]/.test(text)) {
    return text;
  }

  try {
    const bytes = Array.from(text, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('');
    return decodeURIComponent(bytes);
  } catch {
    return text;
  }
}

function normalizeIngredientName(value) {
  return repairMojibake(value).trim().toLowerCase();
}

const directIngredientImageByName = new Map([
  ['ajda', 'ajda.jpg'],
  ['borovnice', 'borovnice.jpg'],
  ['brokoli', 'brokoli.jpg'],
  ['bučke', 'bucke.jpg'],
  ['čebula', 'cebula.jpg'],
  ['česen', 'cesen.jpg'],
  ['češnje', 'cesnje.jpg'],
  ['cvetača', 'cvetaca.jpg'],
  ['drobnjak', 'drobnjak.jpg'],
  ['fižol', 'fizol.jpg'],
  ['govedina', 'govedina.jpg'],
  ['hruške', 'hruske.jpg'],
  ['jabolka', 'jabolka.jpg'],
  ['jagode', 'jagode.jpg'],
  ['jajca', 'jajca.jpg'],
  ['jogurt', 'jogurt.jpg'],
  ['jurčki', 'jurcki.jpg'],
  ['kisla smetana', 'kisla-smetana.jpg'],
  ['korenje', 'korenje.jpg'],
  ['koruza', 'koruza.jpg'],
  ['krompir', 'krompir.jpg'],
  ['kruh', 'kruh.jpg'],
  ['maline', 'maline.jpg'],
  ['maslo', 'maslo.jpg'],
  ['med', 'med.jpg'],
  ['meta', 'meta.jpg'],
  ['mleko', 'mleko.jpg'],
  ['oljčno olje', 'oljcno-olje.jpg'],
  ['olivno olje', 'oljcno-olje.jpg'],
  ['paprika', 'paprika.jpg'],
  ['paradižnik', 'paradiznik.jpg'],
  ['pesa', 'pesa.jpg'],
  ['peteršilj', 'petersilj.jpg'],
  ['piščanec', 'piscanec.jpg'],
  ['piščančje meso', 'piscanec.jpg'],
  ['poper', 'poper.jpg'],
  ['por', 'por.jpg'],
  ['postrv', 'postrv.jpg'],
  ['pšenična moka', 'psenicna-moka.jpg'],
  ['moka', 'psenicna-moka.jpg'],
  ['repa', 'repa.jpg'],
  ['riž', 'riz.jpg'],
  ['rožmarin', 'rozmarin.jpg'],
  ['skuta', 'skuta.jpg'],
  ['slanina', 'slanina.jpg'],
  ['slive', 'slive.jpg'],
  ['sol', 'sol.jpg'],
  ['šparglji', 'sparglji.jpg'],
  ['špinača', 'spinaca.jpg'],
  ['svinjina', 'svinjina.jpg'],
  ['timijan', 'timijan.jpg'],
  ['zelje', 'zelje.jpg']
]);

function directIngredientImageSrc(ingredientOrName) {
  const normalizedName = normalizeIngredientName(ingredientOrName);
  const fileName = directIngredientImageByName.get(normalizedName);

  return fileName ? `../assets/images/ingredients/${fileName}` : '';
}

const orderedIngredientImageByName = orderedIngredientNames.reduce((imageByName, name, index) => {
  const normalizedName = normalizeIngredientName(name);

  if (!imageByName.has(normalizedName)) {
    imageByName.set(normalizedName, index + 1);
  }

  return imageByName;
}, new Map());

function imageIndexFromIdAndName(id, name) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return null;
  }

  if (numericId >= 222 && numericId <= 257) {
    return numericId - 116;
  }

  const normalizedName = normalizeIngredientName(name);
  const candidates = [numericId - 11, numericId - 116];

  return candidates.find((index) => {
    if (index < 1 || index > orderedIngredientNames.length) {
      return false;
    }

    return normalizeIngredientName(orderedIngredientNames[index - 1]) === normalizedName;
  }) || null;
}

function orderedIngredientImageSrc(ingredientOrName) {
  if (!ingredientOrName) {
    return '';
  }

  if (typeof ingredientOrName === 'object') {
    const ingredientName = ingredientOrName.name_sl || ingredientOrName.name;
    const idIndex = imageIndexFromIdAndName(ingredientOrName.id, ingredientName);

    if (idIndex) {
      return `../assets/images/ingredients/ordered/${idIndex}.png`;
    }

    const nameIndex = orderedIngredientImageByName.get(normalizeIngredientName(ingredientName));

    return nameIndex ? `../assets/images/ingredients/ordered/${nameIndex}.png` : '';
  }

  const index = orderedIngredientImageByName.get(normalizeIngredientName(ingredientOrName));

  return index ? `../assets/images/ingredients/ordered/${index}.png` : '';
}

export function ingredientImageSrc(ingredientOrName) {
  if (ingredientOrName && typeof ingredientOrName === 'object') {
    const ingredientName = ingredientOrName.name_sl || ingredientOrName.name;
    const syncedSrc = syncedImageSrc('ingredient-images', ingredientOrName.image_path);

    if (syncedSrc) {
      return syncedSrc;
    }

    if (ingredientOrName.image_path?.startsWith('assets/')) {
      return `../${ingredientOrName.image_path}`;
    }

    const orderedSrc = orderedIngredientImageSrc(ingredientOrName);

    if (orderedSrc) {
      return orderedSrc;
    }

    return directIngredientImageSrc(ingredientName) || placeholderIngredientImage;
  }

  return directIngredientImageSrc(ingredientOrName) || orderedIngredientImageSrc(ingredientOrName) || placeholderIngredientImage;
}
