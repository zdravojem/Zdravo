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
      return `../assets/images/recipes/ordered/${slugIndex}.png`;
    }

    const id = Number(recipeOrSlug.id);

    if (Number.isInteger(id) && id >= 76 && id <= 145) {
      return `../assets/images/recipes/ordered/${id - 75}.png`;
    }

    return '';
  }

  const slug = String(recipeOrSlug || '').trim().toLowerCase();
  const index = orderedRecipeImageBySlug.get(slug);

  return index ? `../assets/images/recipes/ordered/${index}.png` : '';
}

export function recipeImageSrc(recipeOrSlug) {
  if (recipeOrSlug && typeof recipeOrSlug === 'object') {
    const syncedSrc = syncedImageSrc('recipe-images', recipeOrSlug.image_path);

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

    return `../assets/images/recipes/${String(recipeOrSlug.slug || '').trim()}.jpg`;
  }

  const orderedSrc = orderedRecipeImageSrc(recipeOrSlug);

  if (orderedSrc) {
    return orderedSrc;
  }

  return `../assets/images/recipes/${String(recipeOrSlug || '').trim()}.jpg`;
}
