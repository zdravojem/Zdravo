const categoryLabels = {
  sl: {
    zelenjava: 'Zelenjava',
    meso_ribe: 'Meso & Ribe',
    mlecni: 'Mlečni',
    zita: 'Žita',
    sadje: 'Sadje',
    zacimbe: 'Začimbe'
  },
  en: {
    zelenjava: 'Vegetables',
    meso_ribe: 'Meat & Fish',
    mlecni: 'Dairy',
    zita: 'Grains',
    sadje: 'Fruit',
    zacimbe: 'Herbs & Spices'
  }
};

const preferenceLabels = {
  sl: {
    vegetarian: 'Vegetarijansko',
    vegan: 'Vegansko',
    glutenFree: 'Brez glutena',
    lactoseFree: 'Brez laktoze',
    heartHealthy: 'Zdravo srce',
    quick: 'Hitri recepti'
  },
  en: {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten free',
    lactoseFree: 'Lactose free',
    heartHealthy: 'Heart healthy',
    quick: 'Quick recipes'
  }
};

const preferenceDb = {
  vegetarian: 'is_vegetarian',
  vegan: 'is_vegan',
  glutenFree: 'is_gluten_free',
  lactoseFree: 'is_lactose_free',
  heartHealthy: 'is_heart_healthy',
  quick: 'is_quick'
};

const languageNames = {
  sl: 'Slovenščina',
  en: 'English'
};

const seasons = {
  sl: {
    pomlad: 'Pomlad',
    poletje: 'Poletje',
    jesen: 'Jesen',
    zima: 'Zima',
    vse: 'Vse leto'
  },
  en: {
    pomlad: 'Spring',
    poletje: 'Summer',
    jesen: 'Autumn',
    zima: 'Winter',
    vse: 'All year'
  }
};

const difficulties = {
  sl: {
    1: 'Enostavno',
    2: 'Srednje',
    3: 'Zahtevno'
  },
  en: {
    1: 'Easy',
    2: 'Medium',
    3: 'Challenging'
  }
};

const units = {
  sl: {
    piece: 'kos',
    pieces: 'kos',
    clove: 'stroka',
    cloves: 'stroka',
    leaf: 'lista',
    leaves: 'lista',
    bunch: 'šopek',
    pinch: 'ščepec',
    teaspoon: 'žlička',
    tbsp: 'žlica'
  },
  en: {
    piece: 'piece',
    pieces: 'pieces',
    clove: 'clove',
    cloves: 'cloves',
    leaf: 'leaf',
    leaves: 'leaves',
    bunch: 'bunch',
    pinch: 'pinch',
    teaspoon: 'teaspoon',
    tbsp: 'tablespoon'
  }
};

const ingredients = {
  sl: {
    Krompir: 'Krompir',
    Korenje: 'Korenje',
    Čebula: 'Čebula',
    Česen: 'Česen',
    Zelje: 'Zelje',
    Bučke: 'Bučke',
    Paprika: 'Paprika',
    Paradižnik: 'Paradižnik',
    Por: 'Por',
    Repa: 'Repa',
    Pesa: 'Pesa',
    Šparglji: 'Šparglji',
    Brokoli: 'Brokoli',
    Cvetača: 'Cvetača',
    Špinača: 'Špinača',
    Jurčki: 'Jurčki',
    Govedina: 'Govedina',
    Svinjina: 'Svinjina',
    Piščanec: 'Piščanec',
    Postrv: 'Postrv',
    'Kranjska klobasa': 'Kranjska klobasa',
    Slanina: 'Slanina',
    'Telečje meso': 'Telečje meso',
    Jagnjetina: 'Jagnjetina',
    Mleko: 'Mleko',
    Jajca: 'Jajca',
    'Sir (Tolminc)': 'Sir (Tolminc)',
    'Kisla smetana': 'Kisla smetana',
    Maslo: 'Maslo',
    Jogurt: 'Jogurt',
    Skuta: 'Skuta',
    Ajda: 'Ajda',
    Koruza: 'Koruza',
    'Pšenična moka': 'Pšenična moka',
    Ječmen: 'Ječmen',
    Fižol: 'Fižol',
    Leča: 'Leča',
    Riž: 'Riž',
    Kruh: 'Kruh',
    Jabolka: 'Jabolka',
    Hruške: 'Hruške',
    Češnje: 'Češnje',
    Borovnice: 'Borovnice',
    Maline: 'Maline',
    Jagode: 'Jagode',
    Slive: 'Slive',
    Sol: 'Sol',
    Poper: 'Poper',
    'Lovorov list': 'Lovorov list',
    Timijan: 'Timijan',
    Rožmarin: 'Rožmarin',
    Peteršilj: 'Peteršilj',
    Drobnjak: 'Drobnjak',
    Meta: 'Meta'
  },
  en: {
    Krompir: 'Potato',
    Korenje: 'Carrot',
    Čebula: 'Onion',
    Česen: 'Garlic',
    Zelje: 'Cabbage',
    Bučke: 'Zucchini',
    Paprika: 'Pepper',
    Paradižnik: 'Tomato',
    Por: 'Leek',
    Repa: 'Turnip',
    Pesa: 'Beetroot',
    Šparglji: 'Asparagus',
    Brokoli: 'Broccoli',
    Cvetača: 'Cauliflower',
    Špinača: 'Spinach',
    Jurčki: 'Porcini mushrooms',
    Govedina: 'Beef',
    Svinjina: 'Pork',
    Piščanec: 'Chicken',
    Postrv: 'Trout',
    'Kranjska klobasa': 'Carniolan sausage',
    Slanina: 'Bacon',
    'Telečje meso': 'Veal',
    Jagnjetina: 'Lamb',
    Mleko: 'Milk',
    Jajca: 'Eggs',
    'Sir (Tolminc)': 'Cheese (Tolminc)',
    'Kisla smetana': 'Sour cream',
    Maslo: 'Butter',
    Jogurt: 'Yogurt',
    Skuta: 'Curd cheese',
    Ajda: 'Buckwheat',
    Koruza: 'Corn',
    'Pšenična moka': 'Wheat flour',
    Ječmen: 'Barley',
    Fižol: 'Beans',
    Leča: 'Lentils',
    Riž: 'Rice',
    Kruh: 'Bread',
    Jabolka: 'Apples',
    Hruške: 'Pears',
    Češnje: 'Cherries',
    Borovnice: 'Blueberries',
    Maline: 'Raspberries',
    Jagode: 'Strawberries',
    Slive: 'Plums',
    Sol: 'Salt',
    Poper: 'Pepper',
    'Lovorov list': 'Bay leaf',
    Timijan: 'Thyme',
    Rožmarin: 'Rosemary',
    Peteršilj: 'Parsley',
    Drobnjak: 'Chives',
    Meta: 'Mint'
  }
};

const recipes = {
  sl: {
    zganci: {
      title: 'Žganci',
      description: 'Preprosti ajdovi žganci z maslom.',
      steps: [
        'V loncu zavremo vodo in dodamo sol.',
        'V vrelo vodo vsujemo ajdovo moko in pustimo, da se prepoji.',
        'Maso premešamo in drobimo z vilicami.',
        'Žgance zabelimo z maslom in postrežemo.'
      ]
    },
    'bujta-repa': {
      title: 'Bujta repa',
      description: 'Krepka repa s svinjino in slanino.',
      steps: [
        'Svinjino in slanino narežemo na kose.',
        'Na hitro popražimo čebulo in česen.',
        'Dodamo repo, meso in lovorov list.',
        'Zalijemo z vodo in kuhamo do mehkega.'
      ]
    },
    'prekmurska-gibanica': {
      title: 'Prekmurska gibanica',
      description: 'Sladica s skuto in sadjem.',
      steps: [
        'Zamesimo testo iz moke, jajc in mleka.',
        'Nadev pripravimo iz skute in narezanih jabolk.',
        'Sloje zlagamo v pekač in prelijemo z maslom.',
        'Pečemo do zlatorjave barve.'
      ]
    },
    'kranjska-juha': {
      title: 'Kranjska juha',
      description: 'Gosta juha s klobaso in zelenjavo.',
      steps: [
        'Na olju popražimo čebulo in česen.',
        'Dodamo krompir in korenje ter zalijemo z vodo.',
        'V juho dodamo narezano klobaso.',
        'Kuhamo do mehkega in potresemo s peteršiljem.'
      ]
    },
    jota: {
      title: 'Jota',
      description: 'Kisla enolončnica z zeljem in fižolom.',
      steps: [
        'Fižol skuhamo do mehkega.',
        'Na čebuli prepražimo česen in dodamo zelje.',
        'Vmešamo krompir in lovorov list ter zalijemo z vodo.',
        'Kuhamo, da se okusi povežejo.'
      ]
    },
    potica: {
      title: 'Potica',
      description: 'Klasična potica z jabolčnim nadevom.',
      steps: [
        'Zamesimo testo iz moke, jajc, mleka in masla.',
        'Testo razvaljamo in obložimo z jabolčnim nadevom.',
        'Zavijemo v potico in pustimo, da naraste.',
        'Pečemo do zlatorjave barve.'
      ]
    },
    'ajdovi-zganci-s-skuto': {
      title: 'Ajdovi žganci s skuto',
      description: 'Ajdovi žganci s kremo iz skute.',
      steps: [
        'Ajdo skuhamo v osoljeni vodi.',
        'Žgance premešamo in drobimo.',
        'Skuto zmešamo z malo mleka za kremasto teksturo.',
        'Žgance prelijemo s skuto in postrežemo.'
      ]
    },
    struklji: {
      title: 'Štruklji',
      description: 'Mehki skutini štruklji.',
      steps: [
        'Pripravimo testo iz moke in jajc.',
        'Skuto zmešamo s kislo smetano.',
        'Nadev razporedimo po testu in zavijemo.',
        'Štruklje kuhamo in postrežemo z maslom.'
      ]
    },
    ricet: {
      title: 'Ričet',
      description: 'Ječmenova enolončnica s fižolom.',
      steps: [
        'Ječmen in fižol namočimo in splaknemo.',
        'Na čebuli popražimo slanino in česen.',
        'Dodamo korenje, ječmen in fižol ter zalijemo z vodo.',
        'Kuhamo do mehkega in začinimo z lovorom.'
      ]
    },
    'goveja-juha-z-rezanci': {
      title: 'Goveja juha z rezanci',
      description: 'Bistra goveja juha z domačimi rezanci.',
      steps: [
        'Govedino kuhamo z zelenjavo do mehke.',
        'Rezance pripravimo iz moke in jajc.',
        'Rezance skuhamo posebej.',
        'Juho postrežemo z rezanci in peteršiljem.'
      ]
    },
    'krompirjev-golaz': {
      title: 'Krompirjev golaž',
      description: 'Zelenjavni golaž s krompirjem in papriko.',
      steps: [
        'Na čebuli popražimo česen.',
        'Dodamo papriko, paradižnik in krompir.',
        'Začinimo s timijanom, soljo in poprom.',
        'Dušimo, dokler se krompir ne zmehča.'
      ]
    },
    'postrv-na-zaru': {
      title: 'Postrv na žaru',
      description: 'Postrv z zelišči in začimbami.',
      steps: [
        'Postrv očistimo in osušimo.',
        'Ribo natremo s soljo, poprom in rožmarinom.',
        'Postrv spečemo na vročem žaru.',
        'Postrežemo s svežimi zelišči.'
      ]
    },
    'ajdova-kasa-z-jurcki': {
      title: 'Ajdova kaša z jurčki',
      description: 'Ajdova kaša z gozdnimi jurčki.',
      steps: [
        'Ajdo speremo in skuhamo do mehkega.',
        'Na čebuli popražimo jurčke in česen.',
        'Kašo zmešamo z jurčki in začinimo.',
        'Postrežemo s peteršiljem.'
      ]
    },
    'kislo-zelje-z-mesom': {
      title: 'Kislo zelje z mesom',
      description: 'Dušeno zelje s svinjino.',
      steps: [
        'Svinjino in slanino narežemo na kose.',
        'Na čebuli popražimo meso in česen.',
        'Dodamo zelje in lovorov list.',
        'Dušimo do mehkega in začinimo s poprom.'
      ]
    },
    flancati: {
      title: 'Flancati',
      description: 'Hrustljavo ocvrto testo.',
      steps: [
        'Zamesimo testo iz moke, jajc, mleka in masla.',
        'Testo tanko razvaljamo in narežemo.',
        'Kose na hitro ocvremo in odcedimo.',
        'Postrežemo še tople.'
      ]
    }
  },
  en: {
    zganci: {
      title: 'Buckwheat Žganci',
      description: 'Simple buckwheat žganci with butter.',
      steps: [
        'Bring water to a boil in a pot and add salt.',
        'Stir buckwheat flour into the boiling water and let it absorb.',
        'Mix the dough and break it apart with a fork.',
        'Finish the žganci with butter and serve.'
      ]
    },
    'bujta-repa': {
      title: 'Bujta Repa',
      description: 'Hearty turnip stew with pork and bacon.',
      steps: [
        'Cut the pork and bacon into pieces.',
        'Quickly sauté the onion and garlic.',
        'Add the turnip, meat, and bay leaf.',
        'Cover with water and cook until tender.'
      ]
    },
    'prekmurska-gibanica': {
      title: 'Prekmurje Layer Cake',
      description: 'A dessert with curd cheese and fruit.',
      steps: [
        'Knead a dough from flour, eggs, and milk.',
        'Prepare the filling with curd cheese and sliced apples.',
        'Layer everything in a baking tray and drizzle with butter.',
        'Bake until golden brown.'
      ]
    },
    'kranjska-juha': {
      title: 'Carniolan Soup',
      description: 'A thick soup with sausage and vegetables.',
      steps: [
        'Sauté the onion and garlic in oil.',
        'Add potatoes and carrots, then cover with water.',
        'Add sliced sausage to the soup.',
        'Cook until tender and sprinkle with parsley.'
      ]
    },
    jota: {
      title: 'Jota',
      description: 'A sour stew with cabbage and beans.',
      steps: [
        'Cook the beans until tender.',
        'Sauté garlic on onion and add the cabbage.',
        'Stir in potatoes and bay leaf, then cover with water.',
        'Cook until the flavors come together.'
      ]
    },
    potica: {
      title: 'Potica',
      description: 'A classic potica with apple filling.',
      steps: [
        'Knead a dough from flour, eggs, milk, and butter.',
        'Roll out the dough and spread the apple filling over it.',
        'Roll it into a loaf and let it rise.',
        'Bake until golden brown.'
      ]
    },
    'ajdovi-zganci-s-skuto': {
      title: 'Buckwheat Žganci with Curd Cheese',
      description: 'Buckwheat žganci with a curd cheese cream.',
      steps: [
        'Cook the buckwheat in salted water.',
        'Stir and break up the žganci.',
        'Mix the curd cheese with a little milk for a creamy texture.',
        'Pour the curd cheese over the žganci and serve.'
      ]
    },
    struklji: {
      title: 'Struklji',
      description: 'Soft curd cheese struklji.',
      steps: [
        'Prepare a dough from flour and eggs.',
        'Mix the curd cheese with sour cream.',
        'Spread the filling over the dough and roll it up.',
        'Cook the struklji and serve with butter.'
      ]
    },
    ricet: {
      title: 'Barley Stew',
      description: 'A barley stew with beans.',
      steps: [
        'Soak and rinse the barley and beans.',
        'Sauté bacon and garlic on the onion.',
        'Add carrots, barley, and beans, then cover with water.',
        'Cook until tender and season with bay leaf.'
      ]
    },
    'goveja-juha-z-rezanci': {
      title: 'Beef Soup with Noodles',
      description: 'Clear beef soup with homemade noodles.',
      steps: [
        'Cook the beef with vegetables until tender.',
        'Make the noodles from flour and eggs.',
        'Cook the noodles separately.',
        'Serve the soup with noodles and parsley.'
      ]
    },
    'krompirjev-golaz': {
      title: 'Potato Goulash',
      description: 'A vegetable goulash with potatoes and peppers.',
      steps: [
        'Sauté the garlic on onion.',
        'Add the peppers, tomatoes, and potatoes.',
        'Season with thyme, salt, and pepper.',
        'Simmer until the potatoes are tender.'
      ]
    },
    'postrv-na-zaru': {
      title: 'Grilled Trout',
      description: 'Trout with herbs and spices.',
      steps: [
        'Clean and dry the trout.',
        'Rub the fish with salt, pepper, and rosemary.',
        'Grill the trout over a hot fire.',
        'Serve with fresh herbs.'
      ]
    },
    'ajdova-kasa-z-jurcki': {
      title: 'Buckwheat Porridge with Porcini',
      description: 'Buckwheat porridge with forest porcini mushrooms.',
      steps: [
        'Rinse the buckwheat and cook until tender.',
        'Sauté the porcini mushrooms and garlic on onion.',
        'Mix the porridge with the mushrooms and season.',
        'Serve with parsley.'
      ]
    },
    'kislo-zelje-z-mesom': {
      title: 'Braised Sauerkraut with Meat',
      description: 'Braised cabbage with pork.',
      steps: [
        'Cut the pork and bacon into pieces.',
        'Sauté the meat and garlic on the onion.',
        'Add the cabbage and bay leaf.',
        'Braise until tender and season with pepper.'
      ]
    },
    flancati: {
      title: 'Flancati',
      description: 'Crispy fried dough.',
      steps: [
        'Knead a dough from flour, eggs, milk, and butter.',
        'Roll the dough thinly and cut it into pieces.',
        'Quickly fry the pieces and drain them.',
        'Serve while still warm.'
      ]
    }
  }
};

const copy = {
  sl: {
    appTitle: 'Zdravo Jem',
    languageSelector: 'Izbira jezika',
    startLabel: 'Dotaknite se zaslona za začetek',
    welcomeSubtitle: 'Kulinarični pomočnik',
    homeIntro: 'Izberi izdelke s tržnice in odkrij, kaj lahko pripraviš.',
    homeMarketTitle: 'Izberi izdelke',
    homeMarketBadge: 'Na voljo na tržnici',
    homeRecipesTitle: 'Predlogi receptov',
    homeGamesTitle: 'Igrice',
    homeNavHome: 'Domov',
    homeNavItems: 'Izdelki',
    homeNavRecipes: 'Recepti',
    homeNavGames: 'Igrice',
    fundingLabel: 'Sofinancira Evropska unija',
    home: 'Domov',
    back: 'Nazaj',
    next: 'Naprej →',
    findRecipes: 'Poišči recepte →',
    ingredientsTitle: 'Katera živila imate doma?',
    ingredientsSubtitle: 'Izberite sestavine, ki jih želite uporabiti',
    preferencesTitle: 'Vaše prehranske preference',
    preferencesSubtitle: 'Izberite, kar velja za vas (neobvezno)',
    resultsTitle: 'Predlagani recepti za vas',
    resultsEmpty: 'Brez omejitev',
    resultsNoMatches: 'Ni receptov, ki bi ustrezali izbranim sestavinam in preferencam.',
    resultsFound: (count) => `Najdenih ${count} receptov`,
    selectedCount: (count) => {
      const label = count === 1 ? 'sestavina' : count === 2 ? 'sestavini' : count === 3 || count === 4 ? 'sestavine' : 'sestavin';
      return `Izbrano: ${count} ${label}`;
    },
    missingIngredients: (items) => `Manjka vam: ${items}`,
    viewRecipe: 'Poglej recept →',
    unavailableRecipe: 'Recept ni na voljo',
    ingredientsHeading: 'Sestavine',
    stepsHeading: 'Postopek',
    cookingTime: 'Čas priprave',
    servings: 'Porcije',
    difficulty: 'Težavnost',
    missingLabel: 'manjka',
    imageAltSuffix: 'slika recepta'
  },
  en: {
    appTitle: 'Zdravo Jem',
    languageSelector: 'Language selection',
    startLabel: 'Tap the screen to begin',
    welcomeSubtitle: 'Cooking assistant',
    homeIntro: 'Choose items from the market and discover what you can cook.',
    homeMarketTitle: 'Choose items',
    homeMarketBadge: 'Available at the market',
    homeRecipesTitle: 'Recipe ideas',
    homeGamesTitle: 'Games',
    homeNavHome: 'Home',
    homeNavItems: 'Items',
    homeNavRecipes: 'Recipes',
    homeNavGames: 'Games',
    fundingLabel: 'Co-funded by the European Union',
    home: 'Home',
    back: 'Back',
    next: 'Next →',
    findRecipes: 'Find recipes →',
    ingredientsTitle: 'What ingredients do you have at home?',
    ingredientsSubtitle: 'Select the ingredients you want to use',
    preferencesTitle: 'Your dietary preferences',
    preferencesSubtitle: 'Choose what applies to you (optional)',
    resultsTitle: 'Suggested recipes for you',
    resultsEmpty: 'No restrictions',
    resultsNoMatches: 'No recipes match the selected ingredients and preferences.',
    resultsFound: (count) => `${count} recipes found`,
    selectedCount: (count) => `${count} ingredient${count === 1 ? '' : 's'} selected`,
    missingIngredients: (items) => `Missing: ${items}`,
    viewRecipe: 'View recipe →',
    unavailableRecipe: 'Recipe unavailable',
    ingredientsHeading: 'Ingredients',
    stepsHeading: 'Method',
    cookingTime: 'Prep time',
    servings: 'Servings',
    difficulty: 'Difficulty',
    missingLabel: 'missing',
    imageAltSuffix: 'recipe image'
  }
};

function getLocale(value) {
  return value === 'en' ? 'en' : 'sl';
}

function countUnit(quantity, unit, locale) {
  const normalizedUnit = String(unit || '').trim();
  if (!normalizedUnit) {
    return '';
  }

  if (locale === 'sl') {
    return normalizedUnit;
  }

  const numericQuantity = Number(String(quantity).replace(',', '.'));
  const plural = Number.isFinite(numericQuantity) && numericQuantity !== 1;

  switch (normalizedUnit) {
    case 'kos':
      return plural ? units.en.pieces : units.en.piece;
    case 'stroka':
    case 'strok':
      return plural ? units.en.cloves : units.en.clove;
    case 'lista':
      return plural ? units.en.leaves : units.en.leaf;
    case 'šopek':
      return units.en.bunch;
    case 'ščepec':
      return units.en.pinch;
    case 'žlička':
      return units.en.teaspoon;
    case 'žlica':
      return units.en.tbsp;
    default:
      return normalizedUnit;
  }
}

function getRecipeCopy(locale, recipe) {
  const recipeLocale = recipes[getLocale(locale)][recipe.slug] || {};
  return {
    title: recipeLocale.title || recipe.name_sl,
    description: recipeLocale.description || recipe.description_sl || '',
    steps: recipeLocale.steps || JSON.parse(recipe.steps_sl || '[]')
  };
}

export function buildUi(locale) {
  const normalizedLocale = getLocale(locale);
  const localeCopy = copy[normalizedLocale];

  return {
    locale: normalizedLocale,
    languageNames,
    categories: Object.entries(categoryLabels[normalizedLocale]).map(([key, label]) => ({
      key,
      label,
      emoji: {
        zelenjava: '🥬',
        meso_ribe: '🍖',
        mlecni: '🧀',
        zita: '🌾',
        sadje: '🍎',
        zacimbe: '🌿'
      }[key]
    })),
    preferences: Object.entries(preferenceLabels[normalizedLocale]).map(([key, label]) => ({
      key,
      label,
      db: preferenceDb[key],
      emoji: {
        vegetarian: '🌿',
        vegan: '🌱',
        glutenFree: '🚫🌾',
        lactoseFree: '🥛',
        heartHealthy: '❤️',
        quick: '⚡'
      }[key]
    })),
    copy: localeCopy,
    translateCategory(key) {
      return categoryLabels[normalizedLocale][key] || key;
    },
    translatePreference(key) {
      return preferenceLabels[normalizedLocale][key] || key;
    },
    translateSeason(season) {
      return seasons[normalizedLocale][season] || season;
    },
    translateDifficulty(level) {
      return difficulties[normalizedLocale][level] || '';
    },
    translateIngredient(name) {
      return ingredients[normalizedLocale][name] || name;
    },
    translateUnit(quantity, unit) {
      return countUnit(quantity, unit, normalizedLocale);
    },
    translateRecipe(recipe) {
      return getRecipeCopy(normalizedLocale, recipe);
    },
    recipeImageAlt(recipe) {
      const translated = getRecipeCopy(normalizedLocale, recipe);
      return `${translated.title} ${localeCopy.imageAltSuffix}`;
    }
  };
}
