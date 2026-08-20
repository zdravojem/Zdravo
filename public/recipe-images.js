import { config, storageObjectUrl } from './data/config.js';

// Images uploaded through the admin app live in Supabase Storage. The Electron
// build mirrored them to disk and served them over a zdravo-image:// protocol;
// the PWA links straight to the public object URL and lets the service worker
// cache it. Recipes that carry no uploaded image still fall back to the bundled
// artwork below, exactly as before.
function syncedImageSrc(bucket, imagePath) {
  const normalizedPath = String(imagePath || '').trim();

  if (!normalizedPath || normalizedPath.startsWith('assets/')) {
    return '';
  }

  return storageObjectUrl(bucket, normalizedPath);
}

const orderedRecipeSlugs = [
  'skutni-struklji-s-pregreto-smetano',
  'kruh-z-ocvirki',
  'ocvirkovka',
  'kisla-repa-z-ocvirki',
  'repa-s-fizolom',
  'svinjska-pecenka-krskopoljski-prasic',
  'pecena-postrv-z-zelisci',
  'krap-s-krompirjem-v-pecici',
  'ricet-jesprenj-s-prekajenim-mesom',
  'krompirjevi-zganci',
  'ajdovi-zganci-z-ocvirki',
  'domaci-ajdov-kruh',
  'skutni-struklji',
  'pehtranovi-struklji',
  'ajdovi-struklji',
  'matevz',
  'fizolova-juha',
  'prezganka',
  'mlecni-mocnik',
  'usukan-zarostan-mocnik',
  'ajdova-kasa-z-gobami',
  'duseno-rdece-zelje',
  'krompirjeva-solata-z-bucnim-oljem',
  'prazen-krompir',
  'kruhovi-cmoki',
  'domace-klobase-s-hrenom',
  'goveji-golaz-s-cvickom',
  'korenckova-potica',
  'poprtnik',
  'pehtranova-potica',
  'orehova-potica',
  'krompirjev-kruh',
  'koruzni-kruh',
  'domaci-rzeni-kruh',
  'domaci-beli-kruh',
  'ajdova-pogaca-s-skuto',
  'cebulna-pogaca-s-slanino',
  'jablocni-zavitek',
  'skutni-zavitek',
  'bucni-zavitek-s-skuto',
  'pecena-jabolka-z-orehi-in-medom',
  'cespljevi-cmoki',
  'jablocni-kompot-z-medom-in-cimetom',
  'prosena-kasa-z-mlekom',
  'ajdova-kasa-s-skuto-in-mlekom',
  'gobova-juha-z-jurcki',
  'goveja-juha-z-domacimi-rezanci',
  'piscancja-obara-z-zlicniki',
  'zajcja-obara',
  'pecena-svinjska-rebrca',
  'pecenica-s-kislim-zeljem',
  'domaci-pecen-piscanec',
  'polnjene-paprike-v-paradiznikovi-omaki',
  'sarma',
  'duseno-sladko-zelje',
  'zeljnata-solata-s-fizolom',
  'bucna-juha-s-semeni',
  'solata-z-ajdovo-kaso-skuto-in-sezonsko-zelenjavo',
  'polpeti-iz-buck-in-krompirja',
  'skutni-namaz-z-zelisci',
  'jogurtova-strjenka-z-medom-in-sezonskim-sadjem',
  'telecja-obara',
  'domaci-mlinci',
  'slani-krompirjev-mocnik-z-drobnjakom',
  'precmuh-fizol-z-jablocno-cezano',
  'ovsena-kasa-s-sadjem',
  'domace-klobase-s-hrenom-in-trdo-kuhanim-jajcem',
  'duseno-rdece-zelje-z-jabolki',
  'pecena-prosena-kasa-s-suhimi-slivami',
  'fizolova-juha-z-rezanci'
];

const orderedRecipeImageBySlug = new Map(
  orderedRecipeSlugs.map((slug, index) => [slug, index + 1])
);

function orderedRecipeImageSrc(recipeOrSlug) {
  if (!recipeOrSlug) {
    return '';
  }

  if (typeof recipeOrSlug === 'object') {
    const slug = String(recipeOrSlug.slug || '').trim().toLowerCase();
    const slugIndex = orderedRecipeImageBySlug.get(slug);

    if (slugIndex) {
      return `../assets/images/recipes/ordered/${slugIndex}.webp`;
    }

    const id = Number(recipeOrSlug.id);

    if (Number.isInteger(id) && id >= 76 && id <= 145) {
      return `../assets/images/recipes/ordered/${id - 75}.webp`;
    }

    return '';
  }

  const slug = String(recipeOrSlug || '').trim().toLowerCase();
  const index = orderedRecipeImageBySlug.get(slug);

  return index ? `../assets/images/recipes/ordered/${index}.webp` : '';
}

// Recipe photos are shown at two very different sizes: a ~315 px card in the
// home and results grids, and a ~1000 px hero on the detail screen. Serving the
// hero-sized file to a grid of 70 cards costs both bandwidth and — more visibly
// on kiosk hardware — decode time, so scripts/optimize-images.cjs also writes a
// 720 px "-card" copy of every bundled recipe photo.
//
// Images uploaded through the admin app have no such copy (Supabase Storage
// cannot resize on the free plan), so they fall back to the full-size file.
function cardVariant(src) {
  return src.startsWith('../assets/') ? src.replace(/\.webp$/, '-card.webp') : src;
}

/**
 * @param {object|string} recipeOrSlug
 * @param {{ variant?: 'card' }} [options] pass variant: 'card' for grid tiles.
 */
export function recipeImageSrc(recipeOrSlug, options = {}) {
  const src = resolveRecipeImageSrc(recipeOrSlug);
  return options.variant === 'card' ? cardVariant(src) : src;
}

function resolveRecipeImageSrc(recipeOrSlug) {
  if (recipeOrSlug && typeof recipeOrSlug === 'object') {
    const syncedSrc = syncedImageSrc(config.recipeImageBucket, recipeOrSlug.image_path);

    if (syncedSrc) {
      return syncedSrc;
    }

    if (recipeOrSlug.image_path?.startsWith('assets/')) {
      return `../${recipeOrSlug.image_path}`;
    }

    const orderedSrc = orderedRecipeImageSrc(recipeOrSlug);

    if (orderedSrc) {
      return orderedSrc;
    }

    return `../assets/images/recipes/${String(recipeOrSlug.slug || '').trim()}.webp`;
  }

  const orderedSrc = orderedRecipeImageSrc(recipeOrSlug);

  if (orderedSrc) {
    return orderedSrc;
  }

  return `../assets/images/recipes/${String(recipeOrSlug || '').trim()}.webp`;
}
