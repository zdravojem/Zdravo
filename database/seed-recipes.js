const recipes = [
  {
    name_sl: 'Žganci',
    description_sl: 'Preprosti ajdovi žganci z maslom.',
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 3,
    difficulty: 1,
    season: 'vse',
    is_vegetarian: 1,
    is_vegan: 0,
    is_gluten_free: 1,
    is_lactose_free: 0,
    is_heart_healthy: 1,
    is_quick: 1,
    slug: 'zganci',
    steps: [
      'V loncu zavremo vodo in dodamo sol.',
      'V vrelo vodo vsujemo ajdovo moko in pustimo, da se prepoji.',
      'Maso premešamo in drobimo z vilicami.',
      'Žgance zabelimo z maslom in postrežemo.'
    ],
    ingredients: [
      { name_sl: 'Ajda', quantity: '300', unit: 'g' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' },
      { name_sl: 'Maslo', quantity: '30', unit: 'g' }
    ]
  },
  {
    name_sl: 'Bujta repa',
    description_sl: 'Krepka repa s svinjino in slanino.',
    prep_time_min: 20,
    cook_time_min: 60,
    servings: 4,
    difficulty: 2,
    season: 'zima',
    is_vegetarian: 0,
    is_vegan: 0,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'bujta-repa',
    steps: [
      'Svinjino in slanino narežemo na kose.',
      'Na hitro popražimo čebulo in česen.',
      'Dodamo repo, meso in lovorov list.',
      'Zalijemo z vodo in kuhamo do mehkega.'
    ],
    ingredients: [
      { name_sl: 'Repa', quantity: '500', unit: 'g' },
      { name_sl: 'Svinjina', quantity: '300', unit: 'g' },
      { name_sl: 'Slanina', quantity: '80', unit: 'g' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Česen', quantity: '2', unit: 'stroka' },
      { name_sl: 'Lovorov list', quantity: '2', unit: 'lista' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' },
      { name_sl: 'Poper', quantity: '1', unit: 'ščepec' }
    ]
  },
  {
    name_sl: 'Prekmurska gibanica',
    description_sl: 'Sladica s skuto in sadjem.',
    prep_time_min: 35,
    cook_time_min: 45,
    servings: 6,
    difficulty: 3,
    season: 'vse',
    is_vegetarian: 1,
    is_vegan: 0,
    is_gluten_free: 0,
    is_lactose_free: 0,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'prekmurska-gibanica',
    steps: [
      'Zamesimo testo iz moke, jajc in mleka.',
      'Nadev pripravimo iz skute in narezanih jabolk.',
      'Sloje zlagamo v pekač in prelijemo z maslom.',
      'Pečemo do zlatorjave barve.'
    ],
    ingredients: [
      { name_sl: 'Pšenična moka', quantity: '400', unit: 'g' },
      { name_sl: 'Jajca', quantity: '3', unit: 'kos' },
      { name_sl: 'Maslo', quantity: '80', unit: 'g' },
      { name_sl: 'Mleko', quantity: '200', unit: 'ml' },
      { name_sl: 'Skuta', quantity: '300', unit: 'g' },
      { name_sl: 'Jabolka', quantity: '2', unit: 'kos' },
      { name_sl: 'Slive', quantity: '4', unit: 'kos' }
    ]
  },
  {
    name_sl: 'Kranjska juha',
    description_sl: 'Gosta juha s klobaso in zelenjavo.',
    prep_time_min: 15,
    cook_time_min: 35,
    servings: 4,
    difficulty: 1,
    season: 'jesen',
    is_vegetarian: 0,
    is_vegan: 0,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'kranjska-juha',
    steps: [
      'Na olju popražimo čebulo in česen.',
      'Dodamo krompir in korenje ter zalijemo z vodo.',
      'V juho dodamo narezano klobaso.',
      'Kuhamo do mehkega in potresemo s peteršiljem.'
    ],
    ingredients: [
      { name_sl: 'Kranjska klobasa', quantity: '1', unit: 'kos' },
      { name_sl: 'Krompir', quantity: '400', unit: 'g' },
      { name_sl: 'Korenje', quantity: '2', unit: 'kos' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Česen', quantity: '2', unit: 'stroka' },
      { name_sl: 'Peteršilj', quantity: '1', unit: 'šopek' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' }
    ]
  },
  {
    name_sl: 'Jota',
    description_sl: 'Kisla enolončnica z zeljem in fižolom.',
    prep_time_min: 20,
    cook_time_min: 50,
    servings: 4,
    difficulty: 2,
    season: 'zima',
    is_vegetarian: 1,
    is_vegan: 1,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 1,
    is_quick: 0,
    slug: 'jota',
    steps: [
      'Fižol skuhamo do mehkega.',
      'Na čebuli prepražimo česen in dodamo zelje.',
      'Vmešamo krompir in lovorov list ter zalijemo z vodo.',
      'Kuhamo, da se okusi povežejo.'
    ],
    ingredients: [
      { name_sl: 'Zelje', quantity: '400', unit: 'g' },
      { name_sl: 'Fižol', quantity: '200', unit: 'g' },
      { name_sl: 'Krompir', quantity: '300', unit: 'g' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Česen', quantity: '2', unit: 'stroka' },
      { name_sl: 'Lovorov list', quantity: '2', unit: 'lista' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' }
    ]
  },
  {
    name_sl: 'Potica',
    description_sl: 'Klasična potica z jabolčnim nadevom.',
    prep_time_min: 40,
    cook_time_min: 45,
    servings: 8,
    difficulty: 3,
    season: 'zima',
    is_vegetarian: 1,
    is_vegan: 0,
    is_gluten_free: 0,
    is_lactose_free: 0,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'potica',
    steps: [
      'Zamesimo testo iz moke, jajc, mleka in masla.',
      'Testo razvaljamo in obložimo z jabolčnim nadevom.',
      'Zavijemo v potico in pustimo, da naraste.',
      'Pečemo do zlatorjave barve.'
    ],
    ingredients: [
      { name_sl: 'Pšenična moka', quantity: '450', unit: 'g' },
      { name_sl: 'Jajca', quantity: '3', unit: 'kos' },
      { name_sl: 'Maslo', quantity: '90', unit: 'g' },
      { name_sl: 'Mleko', quantity: '250', unit: 'ml' },
      { name_sl: 'Jabolka', quantity: '3', unit: 'kos' }
    ]
  },
  {
    name_sl: 'Ajdovi žganci s skuto',
    description_sl: 'Ajdovi žganci s kremo iz skute.',
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 3,
    difficulty: 1,
    season: 'vse',
    is_vegetarian: 1,
    is_vegan: 0,
    is_gluten_free: 1,
    is_lactose_free: 0,
    is_heart_healthy: 1,
    is_quick: 1,
    slug: 'ajdovi-zganci-s-skuto',
    steps: [
      'Ajdo skuhamo v osoljeni vodi.',
      'Žgance premešamo in drobimo.',
      'Skuto zmešamo z malo mleka za kremasto teksturo.',
      'Žgance prelijemo s skuto in postrežemo.'
    ],
    ingredients: [
      { name_sl: 'Ajda', quantity: '250', unit: 'g' },
      { name_sl: 'Skuta', quantity: '200', unit: 'g' },
      { name_sl: 'Maslo', quantity: '40', unit: 'g' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' }
    ]
  },
  {
    name_sl: 'Štruklji',
    description_sl: 'Mehki skutini štruklji.',
    prep_time_min: 25,
    cook_time_min: 35,
    servings: 4,
    difficulty: 2,
    season: 'vse',
    is_vegetarian: 1,
    is_vegan: 0,
    is_gluten_free: 0,
    is_lactose_free: 0,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'struklji',
    steps: [
      'Pripravimo testo iz moke in jajc.',
      'Skuto zmešamo s kislo smetano.',
      'Nadev razporedimo po testu in zavijemo.',
      'Štruklje kuhamo in postrežemo z maslom.'
    ],
    ingredients: [
      { name_sl: 'Pšenična moka', quantity: '300', unit: 'g' },
      { name_sl: 'Jajca', quantity: '2', unit: 'kos' },
      { name_sl: 'Skuta', quantity: '250', unit: 'g' },
      { name_sl: 'Kisla smetana', quantity: '150', unit: 'g' },
      { name_sl: 'Maslo', quantity: '30', unit: 'g' },
      { name_sl: 'Sol', quantity: '1', unit: 'ščepec' }
    ]
  },
  {
    name_sl: 'Ričet',
    description_sl: 'Ječmenova enolončnica s fižolom.',
    prep_time_min: 20,
    cook_time_min: 70,
    servings: 5,
    difficulty: 2,
    season: 'jesen',
    is_vegetarian: 0,
    is_vegan: 0,
    is_gluten_free: 0,
    is_lactose_free: 1,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'ricet',
    steps: [
      'Ječmen in fižol namočimo in splaknemo.',
      'Na čebuli popražimo slanino in česen.',
      'Dodamo korenje, ječmen in fižol ter zalijemo z vodo.',
      'Kuhamo do mehkega in začinimo z lovorom.'
    ],
    ingredients: [
      { name_sl: 'Ječmen', quantity: '200', unit: 'g' },
      { name_sl: 'Fižol', quantity: '150', unit: 'g' },
      { name_sl: 'Korenje', quantity: '2', unit: 'kos' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Česen', quantity: '2', unit: 'stroka' },
      { name_sl: 'Slanina', quantity: '80', unit: 'g' },
      { name_sl: 'Lovorov list', quantity: '2', unit: 'lista' }
    ]
  },
  {
    name_sl: 'Goveja juha z rezanci',
    description_sl: 'Bistra goveja juha z domačimi rezanci.',
    prep_time_min: 20,
    cook_time_min: 90,
    servings: 6,
    difficulty: 2,
    season: 'zima',
    is_vegetarian: 0,
    is_vegan: 0,
    is_gluten_free: 0,
    is_lactose_free: 1,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'goveja-juha-z-rezanci',
    steps: [
      'Govedino kuhamo z zelenjavo do mehke.',
      'Rezance pripravimo iz moke in jajc.',
      'Rezance skuhamo posebej.',
      'Juho postrežemo z rezanci in peteršiljem.'
    ],
    ingredients: [
      { name_sl: 'Govedina', quantity: '400', unit: 'g' },
      { name_sl: 'Korenje', quantity: '2', unit: 'kos' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Por', quantity: '1', unit: 'kos' },
      { name_sl: 'Peteršilj', quantity: '1', unit: 'šopek' },
      { name_sl: 'Pšenična moka', quantity: '150', unit: 'g' },
      { name_sl: 'Jajca', quantity: '1', unit: 'kos' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' }
    ]
  },
  {
    name_sl: 'Krompirjev golaž',
    description_sl: 'Zelenjavni golaž s krompirjem in papriko.',
    prep_time_min: 15,
    cook_time_min: 25,
    servings: 4,
    difficulty: 1,
    season: 'jesen',
    is_vegetarian: 1,
    is_vegan: 1,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 1,
    is_quick: 1,
    slug: 'krompirjev-golaz',
    steps: [
      'Na čebuli popražimo česen.',
      'Dodamo papriko, paradižnik in krompir.',
      'Začinimo s timijanom, soljo in poprom.',
      'Dušimo, dokler se krompir ne zmehča.'
    ],
    ingredients: [
      { name_sl: 'Krompir', quantity: '500', unit: 'g' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Česen', quantity: '2', unit: 'stroka' },
      { name_sl: 'Paprika', quantity: '2', unit: 'kos' },
      { name_sl: 'Paradižnik', quantity: '2', unit: 'kos' },
      { name_sl: 'Timijan', quantity: '1', unit: 'šopek' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' },
      { name_sl: 'Poper', quantity: '1', unit: 'ščepec' }
    ]
  },
  {
    name_sl: 'Postrv na žaru',
    description_sl: 'Postrv z zelišči in začimbami.',
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 2,
    difficulty: 1,
    season: 'poletje',
    is_vegetarian: 0,
    is_vegan: 0,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 1,
    is_quick: 1,
    slug: 'postrv-na-zaru',
    steps: [
      'Postrv očistimo in osušimo.',
      'Ribo natremo s soljo, poprom in rožmarinom.',
      'Postrv spečemo na vročem žaru.',
      'Postrežemo s svežimi zelišči.'
    ],
    ingredients: [
      { name_sl: 'Postrv', quantity: '1', unit: 'kos' },
      { name_sl: 'Rožmarin', quantity: '1', unit: 'šopek' },
      { name_sl: 'Sol', quantity: '1', unit: 'žlička' },
      { name_sl: 'Poper', quantity: '1', unit: 'ščepec' }
    ]
  },
  {
    name_sl: 'Ajdova skleda z zelenjavo',
    description_sl: 'Hitra, barvita in hranljiva ajdova skleda z zelenjavo.',
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 3,
    difficulty: 1,
    season: 'vse',
    is_vegetarian: 1,
    is_vegan: 1,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 1,
    is_quick: 1,
    slug: 'ajdova-kasa-z-jurcki',
    steps: [
      'Ajdo speremo in skuhamo v osoljeni vodi.',
      'Korenje, papriko, paradižnik in koruzo na hitro prepražimo.',
      'Dodamo ajdo, peteršilj in meto ter vse skupaj premešamo.',
      'Začinimo z oljčnim oljem, soljo in poprom ter postrežemo.'
    ],
    ingredients: [
      { name_sl: 'Ajda', quantity: '200', unit: 'g' },
      { name_sl: 'Korenje', quantity: '2', unit: 'kos' },
      { name_sl: 'Paprika', quantity: '1', unit: 'kos' },
      { name_sl: 'Paradižnik', quantity: '2', unit: 'kos' },
      { name_sl: 'Koruza', quantity: '100', unit: 'g' },
      { name_sl: 'Oljčno olje', quantity: '30', unit: 'ml' },
      { name_sl: 'Peteršilj', quantity: '1', unit: 'šopek' },
      { name_sl: 'Meta', quantity: '1', unit: 'šopek' }
    ]
  },
  {
    name_sl: 'Kislo zelje z mesom',
    description_sl: 'Dušeno zelje s svinjino.',
    prep_time_min: 20,
    cook_time_min: 60,
    servings: 4,
    difficulty: 2,
    season: 'zima',
    is_vegetarian: 0,
    is_vegan: 0,
    is_gluten_free: 1,
    is_lactose_free: 1,
    is_heart_healthy: 0,
    is_quick: 0,
    slug: 'kislo-zelje-z-mesom',
    steps: [
      'Svinjino in slanino narežemo na kose.',
      'Na čebuli popražimo meso in česen.',
      'Dodamo zelje in lovorov list.',
      'Dušimo do mehkega in začinimo s poprom.'
    ],
    ingredients: [
      { name_sl: 'Zelje', quantity: '500', unit: 'g' },
      { name_sl: 'Svinjina', quantity: '300', unit: 'g' },
      { name_sl: 'Slanina', quantity: '80', unit: 'g' },
      { name_sl: 'Čebula', quantity: '1', unit: 'kos' },
      { name_sl: 'Česen', quantity: '2', unit: 'stroka' },
      { name_sl: 'Lovorov list', quantity: '2', unit: 'lista' },
      { name_sl: 'Poper', quantity: '1', unit: 'ščepec' }
    ]
  },
  {
    name_sl: 'Flancati',
    description_sl: 'Hrustljavo ocvrto testo.',
    prep_time_min: 20,
    cook_time_min: 20,
    servings: 6,
    difficulty: 2,
    season: 'vse',
    is_vegetarian: 1,
    is_vegan: 0,
    is_gluten_free: 0,
    is_lactose_free: 0,
    is_heart_healthy: 0,
    is_quick: 1,
    slug: 'flancati',
    steps: [
      'Zamesimo testo iz moke, jajc, mleka in masla.',
      'Testo tanko razvaljamo in narežemo.',
      'Kose na hitro ocvremo in odcedimo.',
      'Postrežemo še tople.'
    ],
    ingredients: [
      { name_sl: 'Pšenična moka', quantity: '300', unit: 'g' },
      { name_sl: 'Jajca', quantity: '2', unit: 'kos' },
      { name_sl: 'Maslo', quantity: '50', unit: 'g' },
      { name_sl: 'Mleko', quantity: '120', unit: 'ml' },
      { name_sl: 'Sol', quantity: '1', unit: 'ščepec' }
    ]
  }
];

module.exports = function seedRecipes(db) {
  const insertRecipe = db.prepare(
    `INSERT INTO recipes (
      name_sl,
      description_sl,
      prep_time_min,
      cook_time_min,
      servings,
      difficulty,
      season,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      is_lactose_free,
      is_heart_healthy,
      is_quick,
      steps_sl,
      image_path,
      slug
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertLink = db.prepare(
    `INSERT INTO recipe_ingredients (
      recipe_id,
      ingredient_id,
      quantity,
      unit,
      is_optional
    ) VALUES (?, ?, ?, ?, ?)`
  );

  const findIngredientId = db.prepare(
    'SELECT id FROM ingredients WHERE name_sl = ? LIMIT 1'
  );

  const insertAll = db.transaction((rows) => {
    rows.forEach((recipe) => {
      const imagePath = `assets/images/recipes/${recipe.slug}.jpg`;
      const result = insertRecipe.run(
        recipe.name_sl,
        recipe.description_sl,
        recipe.prep_time_min,
        recipe.cook_time_min,
        recipe.servings,
        recipe.difficulty,
        recipe.season,
        recipe.is_vegetarian,
        recipe.is_vegan,
        recipe.is_gluten_free,
        recipe.is_lactose_free,
        recipe.is_heart_healthy,
        recipe.is_quick,
        JSON.stringify(recipe.steps),
        imagePath,
        recipe.slug
      );

      const recipeId = result.lastInsertRowid;
      recipe.ingredients.forEach((ingredient) => {
        const row = findIngredientId.get(ingredient.name_sl);
        if (!row) {
          return;
        }
        insertLink.run(
          recipeId,
          row.id,
          ingredient.quantity,
          ingredient.unit,
          ingredient.is_optional ? 1 : 0
        );
      });
    });
  });

  insertAll(recipes);
};
