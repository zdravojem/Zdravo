import { config, storageObjectUrl } from './data/config.js';

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

// See public/recipe-images.js — uploaded images now resolve to their public
// Supabase Storage URL instead of the Electron zdravo-image:// protocol.
function syncedImageSrc(bucket, imagePath) {
  const normalizedPath = String(imagePath || '').trim();

  if (!normalizedPath || normalizedPath.startsWith('assets/')) {
    return '';
  }

  return storageObjectUrl(bucket, normalizedPath);
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
  ['ajda', 'ajda.webp'],
  ['borovnice', 'borovnice.webp'],
  ['brokoli', 'brokoli.webp'],
  ['bučke', 'bucke.webp'],
  ['čebula', 'cebula.webp'],
  ['česen', 'cesen.webp'],
  ['češnje', 'cesnje.webp'],
  ['cvetača', 'cvetaca.webp'],
  ['drobnjak', 'drobnjak.webp'],
  ['fižol', 'fizol.webp'],
  ['govedina', 'govedina.webp'],
  ['hruške', 'hruske.webp'],
  ['jabolka', 'jabolka.webp'],
  ['jagode', 'jagode.webp'],
  ['jajca', 'jajca.webp'],
  ['jogurt', 'jogurt.webp'],
  ['jurčki', 'jurcki.webp'],
  ['kisla smetana', 'kisla-smetana.webp'],
  ['korenje', 'korenje.webp'],
  ['koruza', 'koruza.webp'],
  ['krompir', 'krompir.webp'],
  ['kruh', 'kruh.webp'],
  ['maline', 'maline.webp'],
  ['maslo', 'maslo.webp'],
  ['med', 'med.webp'],
  ['meta', 'meta.webp'],
  ['mleko', 'mleko.webp'],
  ['oljčno olje', 'oljcno-olje.webp'],
  ['olivno olje', 'oljcno-olje.webp'],
  ['paprika', 'paprika.webp'],
  ['paradižnik', 'paradiznik.webp'],
  ['pesa', 'pesa.webp'],
  ['peteršilj', 'petersilj.webp'],
  ['piščanec', 'piscanec.webp'],
  ['piščančje meso', 'piscanec.webp'],
  ['poper', 'poper.webp'],
  ['por', 'por.webp'],
  ['postrv', 'postrv.webp'],
  ['pšenična moka', 'psenicna-moka.webp'],
  ['moka', 'psenicna-moka.webp'],
  ['repa', 'repa.webp'],
  ['riž', 'riz.webp'],
  ['rožmarin', 'rozmarin.webp'],
  ['skuta', 'skuta.webp'],
  ['slanina', 'slanina.webp'],
  ['slive', 'slive.webp'],
  ['sol', 'sol.webp'],
  ['šparglji', 'sparglji.webp'],
  ['špinača', 'spinaca.webp'],
  ['svinjina', 'svinjina.webp'],
  ['timijan', 'timijan.webp'],
  ['zelje', 'zelje.webp']
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
      return `../assets/images/ingredients/ordered/${idIndex}.webp`;
    }

    const nameIndex = orderedIngredientImageByName.get(normalizeIngredientName(ingredientName));

    return nameIndex ? `../assets/images/ingredients/ordered/${nameIndex}.webp` : '';
  }

  const index = orderedIngredientImageByName.get(normalizeIngredientName(ingredientOrName));

  return index ? `../assets/images/ingredients/ordered/${index}.webp` : '';
}

export function ingredientImageSrc(ingredientOrName) {
  if (ingredientOrName && typeof ingredientOrName === 'object') {
    const ingredientName = ingredientOrName.name_sl || ingredientOrName.name;
    const syncedSrc = syncedImageSrc(config.ingredientImageBucket, ingredientOrName.image_path);

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
