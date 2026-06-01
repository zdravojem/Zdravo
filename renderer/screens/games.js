// ============================================================================
// Zdravo Jem — Games Module (Electron integration)
// Puzzle: "Od kmetije do krožnika"   Detective: "Tržnični detektiv"
// ============================================================================

// ---------------------------------------------------------------------------
// Image map (Unsplash URLs)
// ---------------------------------------------------------------------------
const IMGS = {
  apple:           'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200&h=200&fit=crop',
  carrot:          'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop',
  buckwheat:       'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop',
  milk:            'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop',
  honey:           'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=200&fit=crop',
  potato:          'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop',
  strawberry:      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop',
  herbs:           'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200&h=200&fit=crop',
  lettuce:         'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop',
  tomato:          'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop',
  farm:            'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=200&h=200&fit=crop',
  market:          'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=200&fit=crop',
  cooking:         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
  plate:           'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop',
  seed:            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop',
  harvest:         'https://images.unsplash.com/photo-1500076656116-558758f991c1?w=200&h=200&fit=crop',
  bee:             'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
  flower:          'https://images.unsplash.com/photo-1490750967868-88df5691cc47?w=200&h=200&fit=crop',
  cow:             'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&h=200&fit=crop',
  pancakes:        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
  bread:           'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
  salad:           'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
  soup:            'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop',
  lemon:           'https://images.unsplash.com/photo-1598487559178-daa14f4a0df1?w=200&h=200&fit=crop',
  pumpkin:         'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=200&h=200&fit=crop',
  chocolate:       'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=200&h=200&fit=crop',
  olive_oil:       'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
  cottage_cheese:  'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=200&h=200&fit=crop',
  puzzle_banner:   '../assets/images/games/puzzle-banner.png',
  detective_banner:'../assets/images/games/detective-banner.png',
  farm_plate_1:    '../assets/images/games/1.png',
  farm_plate_2:    '../assets/images/games/2.png',
  farm_plate_3:    '../assets/images/games/3.png',
  farm_plate_4:    '../assets/images/games/4.png',
  farm_plate_5:    '../assets/images/games/5.png',
  farm_plate_6:    '../assets/images/games/6.png',
  farm_plate_7:    '../assets/images/games/7.png',
  farm_plate_8:    '../assets/images/games/8.png',
  farm_plate_9:    '../assets/images/games/9.png'
};

// ---------------------------------------------------------------------------
// Difficulty config
// ---------------------------------------------------------------------------
const DIFF_CONFIG = {
  easy:   { time: 120, puzzlePrePlaced: 2, distractors: 0, qAnswers: 3, pCorrect: 50,  pCorrect2: 25, pWrong: -5,  pHint: -10, hintCost: '10' },
  medium: { time: 90,  puzzlePrePlaced: 0, distractors: 0, qAnswers: 4, pCorrect: 100, pCorrect2: 60, pWrong: -20, pHint: -30, hintCost: '30' },
  hard:   { time: 60,  puzzlePrePlaced: 0, distractors: 2, qAnswers: 4, pCorrect: 150, pCorrect2: 80, pWrong: -30, pHint: -50, hintCost: '50' }
};

// ---------------------------------------------------------------------------
// Localised strings
// ---------------------------------------------------------------------------
const GL = {
  sl: {
    correctMsg:    (pts) => `Odlično! +${pts} točk ⭐`,
    wrongMsg:      'Skoraj! Poskusi znova. 🤔',
    hintToast:     'Namig: poišči označen košček! 💡',
    snapGood:      (pts) => `+${pts} točk! 🎉`,
    snapBad:       'Poskusi znova! 🤔',
    distractor:    'Ta košček ne spada v sliko. 🚫',
    noHints:       'Ni več namigov',
    hintUsed:      'Namig porabljen',
    combo:         '🔥 Combo +100 točk!',
    revealAnswer:  'Pravilen odgovor je označen. 💡',
    recipeToast:   (r) => `Recept: ${r} 📖`,
    endMsg0:       'Dobro poskušanje!',
    endSub0:       'Poskusi znova, zmoreš!',
    endMsg40:      'Bravo! Zelo dobro ti gre.',
    endSub40:      'Kar nadaljuj!',
    endMsg75:      'Odlično!',
    endSub75:      'Pravi tržnični mojster!',
    pointsLabel:   'točk',
    pieces:        'Koščki',
    placed:        'koščkov sestavljenih',
    hint:          'Namig',
    restart:       'Znova',
    diffLabel:     'Izberi težavnost:',
    easy:          '🟢 Lahko',
    medium:        '🟡 Srednje',
    hard:          '🔴 Težje',
    startBtn:      'Začni igro 🚀',
    missionTitle:  '— Detektivske misije —',
    totalPoints:   'Skupaj točk',
    playAgain:     'Igraj znova',
    viewRecipe:    'Poglej recept',
    backToGames:   'Nazaj na igrice',
    leaveGame:     'Zapusti igro?',
    leaveMsg:      'Ali želiš zapustiti igro? Napredek ne bo shranjen.',
    leaveConfirm:  'Zapusti igro',
    leaveContinue: 'Nadaljuj igro',
    restartGame:   'Začni znova?',
    restartMsg:    'Ali želiš začeti znova? Trenutni rezultat bo izgubljen.',
    restartConfirm:'Potrdi',
    restartCancel: 'Prekliči'
  },
  en: {
    correctMsg:    (pts) => `Excellent! +${pts} points ⭐`,
    wrongMsg:      'Almost! Try again. 🤔',
    hintToast:     'Hint: find the highlighted piece! 💡',
    snapGood:      (pts) => `+${pts} points! 🎉`,
    snapBad:       'Try again! 🤔',
    distractor:    "This piece doesn't belong here. 🚫",
    noHints:       'No more hints',
    hintUsed:      'Hint used',
    combo:         '🔥 Combo +100 points!',
    revealAnswer:  'Correct answer is highlighted. 💡',
    recipeToast:   (r) => `Recipe: ${r} 📖`,
    endMsg0:       'Good try!',
    endSub0:       'Try again, you can do it!',
    endMsg40:      'Bravo! You are doing great.',
    endSub40:      'Keep it up!',
    endMsg75:      'Excellent!',
    endSub75:      'A true market master!',
    pointsLabel:   'points',
    pieces:        'Pieces',
    placed:        'pieces placed',
    hint:          'Hint',
    restart:       'Restart',
    diffLabel:     'Choose difficulty:',
    easy:          '🟢 Easy',
    medium:        '🟡 Medium',
    hard:          '🔴 Hard',
    startBtn:      'Start game 🚀',
    missionTitle:  '— Detective Missions —',
    totalPoints:   'Total points',
    playAgain:     'Play again',
    viewRecipe:    'View recipe',
    backToGames:   'Back to games',
    leaveGame:     'Leave game?',
    leaveMsg:      'Do you want to leave? Progress will not be saved.',
    leaveConfirm:  'Leave game',
    leaveContinue: 'Continue playing',
    restartGame:   'Start over?',
    restartMsg:    'Do you want to restart? Your current score will be lost.',
    restartConfirm:'Confirm',
    restartCancel: 'Cancel'
  }
};

// ---------------------------------------------------------------------------
// Puzzle scenarios
// ---------------------------------------------------------------------------
const PUZZLE_SCENARIOS = [
  { id:'apple', title:{sl:'Od kmetije do krožnika',en:'From Farm to Plate'}, img:IMGS.farm_plate_3, relatedRecipeId:'apple_strudel',
    edu:{sl:'Sestavi pot jabolk od sadovnjaka do domačega jabolčnega zavitka.',en:'Build the journey of apples from the orchard to homemade apple strudel.'},
    pieces:[
      {id:'p1',e:'🌳',img:IMGS.farm_plate_1,l:{sl:'Sadovnjak',en:'Orchard'},      pos:1,easyPre:true},
      {id:'p2',e:'🧺',img:IMGS.farm_plate_2,l:{sl:'Obiranje', en:'Picking'},      pos:2,easyPre:true},
      {id:'p3',e:'🍎',img:IMGS.farm_plate_3,l:{sl:'Košara',   en:'Basket'},       pos:3},
      {id:'p4',e:'🏪',img:IMGS.farm_plate_4,l:{sl:'Stojnica', en:'Market stall'}, pos:4},
      {id:'p5',e:'🍏',img:IMGS.farm_plate_5,l:{sl:'Jabolka',  en:'Apples'},       pos:5},
      {id:'p6',e:'🔪',img:IMGS.farm_plate_6,l:{sl:'Rezanje',  en:'Cutting'},      pos:6},
      {id:'p7',e:'🔥',img:IMGS.farm_plate_7,l:{sl:'Pečenje',  en:'Baking'},       pos:7},
      {id:'p8',e:'🥧',img:IMGS.farm_plate_8,l:{sl:'Zavitek',  en:'Strudel'},      pos:8},
      {id:'p9',e:'🍽️',img:IMGS.farm_plate_9,l:{sl:'Krožnik',  en:'Plate'},        pos:9}
    ],
    distractors:[{id:'d1',e:'🍕',img:IMGS.cooking,l:{sl:'Pizza',en:'Pizza'},isDistractor:true}]
  },
  { id:'carrot', title:{sl:'Od korenja do juhe',en:'From Carrot to Soup'}, img:IMGS.carrot, relatedRecipeId:'vegetable_soup',
    edu:{sl:'Korenje raste na polju in ga dodamo v juho.',en:'Carrots grow in the field and we add them to soup.'},
    pieces:[
      {id:'p1',e:'🌱',img:IMGS.seed,    l:{sl:'Seme',     en:'Seed'},      pos:1,easyPre:true},
      {id:'p2',e:'🚜',img:IMGS.farm,    l:{sl:'Kmetija',  en:'Farm'},      pos:2,easyPre:true},
      {id:'p3',e:'🥕',img:IMGS.carrot,  l:{sl:'Korenje',  en:'Carrot'},    pos:3},
      {id:'p4',e:'🧺',img:IMGS.harvest, l:{sl:'Pobiranje',en:'Harvesting'},pos:4},
      {id:'p5',e:'🏪',img:IMGS.market,  l:{sl:'Tržnica',  en:'Market'},    pos:5},
      {id:'p6',e:'🛒',img:IMGS.market,  l:{sl:'Nakup',    en:'Shopping'},  pos:6},
      {id:'p7',e:'🔪',img:IMGS.cooking, l:{sl:'Rezanje',  en:'Cutting'},   pos:7},
      {id:'p8',e:'🍳',img:IMGS.cooking, l:{sl:'Kuhanje',  en:'Cooking'},   pos:8},
      {id:'p9',e:'🍲',img:IMGS.soup,    l:{sl:'Juha',     en:'Soup'},      pos:9}
    ],
    distractors:[{id:'d1',e:'🍦',img:IMGS.plate,l:{sl:'Sladoled',en:'Ice cream'},isDistractor:true}]
  },
  { id:'strawberry', title:{sl:'Od jagod do sladice',en:'From Strawberries to Dessert'}, img:IMGS.strawberry, relatedRecipeId:'strawberry_dessert',
    edu:{sl:'Jagode rastejo poleti in jih naredimo v sladico.',en:'Strawberries grow in summer and we turn them into dessert.'},
    pieces:[
      {id:'p1',e:'🌱',img:IMGS.seed,          l:{sl:'Sadika',  en:'Seedling'},      pos:1,easyPre:true},
      {id:'p2',e:'☀️',img:IMGS.farm,          l:{sl:'Sonce',   en:'Sun'},           pos:2,easyPre:true},
      {id:'p3',e:'🍓',img:IMGS.strawberry,    l:{sl:'Jagode',  en:'Strawberries'},  pos:3},
      {id:'p4',e:'🧺',img:IMGS.harvest,       l:{sl:'Pobiranje',en:'Picking'},      pos:4},
      {id:'p5',e:'🏪',img:IMGS.market,        l:{sl:'Tržnica', en:'Market'},        pos:5},
      {id:'p6',e:'🛒',img:IMGS.market,        l:{sl:'Nakup',   en:'Shopping'},      pos:6},
      {id:'p7',e:'🧀',img:IMGS.cottage_cheese,l:{sl:'Skuta',   en:'Cottage cheese'},pos:7},
      {id:'p8',e:'🍯',img:IMGS.honey,         l:{sl:'Med',     en:'Honey'},         pos:8},
      {id:'p9',e:'🍮',img:IMGS.plate,         l:{sl:'Sladica', en:'Dessert'},       pos:9}
    ],
    distractors:[{id:'d1',e:'🌭',img:IMGS.cooking,l:{sl:'Hot dog',en:'Hot dog'},isDistractor:true}]
  },
  { id:'honey', title:{sl:'Od čebel do zajtrka',en:'From Bees to Breakfast'}, img:IMGS.honey, relatedRecipeId:'honey_breakfast',
    edu:{sl:'Čebele zberejo nektar in naredijo med za zajtrk.',en:'Bees collect nectar and make honey for breakfast.'},
    pieces:[
      {id:'p1',e:'🌸',img:IMGS.flower,    l:{sl:'Cvetje',   en:'Flowers'},  pos:1,easyPre:true},
      {id:'p2',e:'🐝',img:IMGS.bee,       l:{sl:'Čebela',   en:'Bee'},      pos:2,easyPre:true},
      {id:'p3',e:'🍯',img:IMGS.honey,     l:{sl:'Med',      en:'Honey'},    pos:3},
      {id:'p4',e:'🏚️',img:IMGS.farm,     l:{sl:'Čebelnjak',en:'Beehive'},  pos:4},
      {id:'p5',e:'🏪',img:IMGS.market,    l:{sl:'Tržnica',  en:'Market'},   pos:5},
      {id:'p6',e:'🛒',img:IMGS.market,    l:{sl:'Nakup',    en:'Shopping'}, pos:6},
      {id:'p7',e:'🥛',img:IMGS.milk,      l:{sl:'Jogurt',   en:'Yogurt'},   pos:7},
      {id:'p8',e:'🫐',img:IMGS.strawberry,l:{sl:'Jagodičje',en:'Berries'},  pos:8},
      {id:'p9',e:'🥣',img:IMGS.plate,     l:{sl:'Zajtrk',   en:'Breakfast'},pos:9}
    ],
    distractors:[{id:'d1',e:'🍟',img:IMGS.cooking,l:{sl:'Pomfrit',en:'Fries'},isDistractor:true}]
  },
  { id:'milk', title:{sl:'Od mleka do palačink',en:'From Milk to Pancakes'}, img:IMGS.milk, relatedRecipeId:'cottage_pancakes',
    edu:{sl:'Krava daje mleko, iz njega naredijo skuto za palačinke.',en:'The cow gives milk, from which cottage cheese is made for pancakes.'},
    pieces:[
      {id:'p1',e:'🐄',img:IMGS.cow,           l:{sl:'Krava',  en:'Cow'},           pos:1,easyPre:true},
      {id:'p2',e:'🥛',img:IMGS.milk,          l:{sl:'Mleko',  en:'Milk'},          pos:2,easyPre:true},
      {id:'p3',e:'🧀',img:IMGS.cottage_cheese,l:{sl:'Skuta',  en:'Cottage cheese'},pos:3},
      {id:'p4',e:'🏪',img:IMGS.market,        l:{sl:'Tržnica',en:'Market'},        pos:4},
      {id:'p5',e:'🛒',img:IMGS.market,        l:{sl:'Nakup',  en:'Shopping'},      pos:5},
      {id:'p6',e:'🥚',img:IMGS.cooking,       l:{sl:'Jajca',  en:'Eggs'},          pos:6},
      {id:'p7',e:'🌾',img:IMGS.buckwheat,     l:{sl:'Moka',   en:'Flour'},         pos:7},
      {id:'p8',e:'🍳',img:IMGS.cooking,       l:{sl:'Pečenje',en:'Baking'},        pos:8},
      {id:'p9',e:'🥞',img:IMGS.pancakes,      l:{sl:'Palačinke',en:'Pancakes'},    pos:9}
    ],
    distractors:[{id:'d1',e:'🌮',img:IMGS.cooking,l:{sl:'Takos',en:'Tacos'},isDistractor:true}]
  },
  { id:'tomato', title:{sl:'Od paradižnika do omake',en:'From Tomato to Sauce'}, img:IMGS.tomato, relatedRecipeId:'tomato_sauce',
    edu:{sl:'Paradižnik raste na vrtu in ga skuhamo v omako.',en:'Tomatoes grow in the garden and we cook them into sauce.'},
    pieces:[
      {id:'p1',e:'🌱',img:IMGS.seed,    l:{sl:'Sadika',    en:'Seedling'}, pos:1,easyPre:true},
      {id:'p2',e:'☀️',img:IMGS.farm,   l:{sl:'Zorenje',   en:'Ripening'}, pos:2,easyPre:true},
      {id:'p3',e:'🍅',img:IMGS.tomato,  l:{sl:'Paradižnik',en:'Tomato'},  pos:3},
      {id:'p4',e:'🧺',img:IMGS.harvest, l:{sl:'Pobiranje', en:'Picking'}, pos:4},
      {id:'p5',e:'🏪',img:IMGS.market,  l:{sl:'Tržnica',   en:'Market'},  pos:5},
      {id:'p6',e:'🛒',img:IMGS.market,  l:{sl:'Nakup',     en:'Shopping'},pos:6},
      {id:'p7',e:'🔪',img:IMGS.cooking, l:{sl:'Sekljanje', en:'Chopping'},pos:7},
      {id:'p8',e:'🍳',img:IMGS.cooking, l:{sl:'Kuhanje',   en:'Cooking'}, pos:8},
      {id:'p9',e:'🍝',img:IMGS.soup,    l:{sl:'Omaka',     en:'Sauce'},   pos:9}
    ],
    distractors:[{id:'d1',e:'🍦',img:IMGS.plate,l:{sl:'Sladoled',en:'Ice cream'},isDistractor:true}]
  },
  { id:'lettuce', title:{sl:'Od solate do sklede',en:'From Lettuce to Bowl'}, img:IMGS.lettuce, relatedRecipeId:'salad_bowl',
    edu:{sl:'Solata raste na vrtu spomladi in jo damo v skledo.',en:'Lettuce grows in the garden in spring and we put it in a bowl.'},
    pieces:[
      {id:'p1',e:'🌱',img:IMGS.seed,     l:{sl:'Seme',     en:'Seed'},    pos:1,easyPre:true},
      {id:'p2',e:'💧',img:IMGS.farm,     l:{sl:'Zalivanje',en:'Watering'},pos:2,easyPre:true},
      {id:'p3',e:'🥬',img:IMGS.lettuce,  l:{sl:'Solata',   en:'Lettuce'}, pos:3},
      {id:'p4',e:'✂️',img:IMGS.cooking, l:{sl:'Rezanje',  en:'Cutting'}, pos:4},
      {id:'p5',e:'🏪',img:IMGS.market,   l:{sl:'Tržnica',  en:'Market'},  pos:5},
      {id:'p6',e:'🛒',img:IMGS.market,   l:{sl:'Nakup',    en:'Shopping'},pos:6},
      {id:'p7',e:'🍅',img:IMGS.tomato,   l:{sl:'Paradižnik',en:'Tomato'},pos:7},
      {id:'p8',e:'🫒',img:IMGS.olive_oil,l:{sl:'Olje',     en:'Oil'},     pos:8},
      {id:'p9',e:'🥗',img:IMGS.salad,    l:{sl:'Solata',   en:'Salad'},   pos:9}
    ],
    distractors:[{id:'d1',e:'🍩',img:IMGS.plate,l:{sl:'Donut',en:'Donut'},isDistractor:true}]
  }
];

// ---------------------------------------------------------------------------
// Detective questions
// ---------------------------------------------------------------------------
const QUESTIONS = [
  { id:'q01', type:{sl:'KDO SEM',en:'WHO AM I'}, diff:'easy',
    title:{sl:'Kdo sem?',en:'Who am I?'},
    text:{sl:'Sem rumen in kisel. Iz mene stisnejo sok.',en:'I am yellow and sour. Juice is squeezed from me.'},
    img:IMGS.lemon,
    answers:[{l:{sl:'Limona',en:'Lemon'},img:IMGS.lemon,c:true},{l:{sl:'Banana',en:'Banana'},img:IMGS.farm,c:false},{l:{sl:'Korenje',en:'Carrot'},img:IMGS.carrot,c:false}],
    hint:{sl:'Raste v toplem podnebju in je zelo kisla.',en:'Grows in a warm climate and is very sour.'},
    explanation:{sl:'Limona je citrično sadje, bogato z vitaminom C.',en:'Lemon is a citrus fruit rich in vitamin C.'},
    recipe:'salad_bowl'
  },
  { id:'q02', type:{sl:'KDO SEM',en:'WHO AM I'}, diff:'easy',
    title:{sl:'Kdo sem?',en:'Who am I?'},
    text:{sl:'Sem rdeč, rastem na vrtu in me pogosto najdeš v solati.',en:'I am red, I grow in the garden and you often find me in salads.'},
    img:IMGS.tomato,
    answers:[{l:{sl:'Paradižnik',en:'Tomato'},img:IMGS.tomato,c:true},{l:{sl:'Jabolko',en:'Apple'},img:IMGS.apple,c:false},{l:{sl:'Jagode',en:'Strawberries'},img:IMGS.strawberry,c:false}],
    hint:{sl:'Pogosto ga dodamo v omako ali solato.',en:'Often added to sauce or salad.'},
    explanation:{sl:'Paradižnik je zelenjava, bogata z likopenom.',en:'Tomato is a vegetable rich in lycopene.'},
    recipe:'tomato_sauce'
  },
  { id:'q03', type:{sl:'KDO SEM',en:'WHO AM I'}, diff:'easy',
    title:{sl:'Kdo sem?',en:'Who am I?'},
    text:{sl:'Sem oranžen, rastem pod zemljo in zajčki me obožujejo.',en:'I am orange, I grow underground and rabbits love me.'},
    img:IMGS.carrot,
    answers:[{l:{sl:'Korenje',en:'Carrot'},img:IMGS.carrot,c:true},{l:{sl:'Krompir',en:'Potato'},img:IMGS.potato,c:false},{l:{sl:'Čebula',en:'Onion'},img:IMGS.harvest,c:false}],
    hint:{sl:'Koreninica, bogata z vitaminom A.',en:'A root vegetable, rich in vitamin A.'},
    explanation:{sl:'Korenje raste pod zemljo in je odličen vir vitaminov.',en:'Carrots grow underground and are an excellent source of vitamins.'},
    recipe:'vegetable_soup'
  },
  { id:'q04', type:{sl:'KJE RASTEM',en:'WHERE DO I GROW'}, diff:'easy',
    title:{sl:'Kje rastem?',en:'Where do I grow?'},
    text:{sl:'Med raste...',en:'Honey comes from...'},
    img:IMGS.honey,
    answers:[{l:{sl:'V čebelnjaku 🐝',en:'In a beehive 🐝'},img:IMGS.bee,c:true},{l:{sl:'Na drevesu',en:'On a tree'},img:IMGS.farm,c:false},{l:{sl:'Pod zemljo',en:'Underground'},img:IMGS.potato,c:false}],
    hint:{sl:'Čebele ga pridelujejo iz cvetnega prahu.',en:'Bees produce it from pollen.'},
    explanation:{sl:'Med pridelujejo čebele iz nektarja cvetlic.',en:'Honey is produced by bees from flower nectar.'},
    recipe:'honey_breakfast'
  },
  { id:'q05', type:{sl:'TRŽNICA',en:'MARKET'}, diff:'easy',
    title:{sl:'Kaj kupimo?',en:'What do we buy?'},
    text:{sl:'Kateri od teh izdelkov najdemo na lokalni tržnici?',en:'Which of these products do we find at the local market?'},
    img:IMGS.market,
    answers:[{l:{sl:'Domači med',en:'Local honey'},img:IMGS.honey,c:true},{l:{sl:'Čips',en:'Chips'},img:IMGS.potato,c:false},{l:{sl:'Kola',en:'Cola'},img:IMGS.cooking,c:false}],
    hint:{sl:'Tržnica prodaja domače, lokalno pridelane izdelke.',en:'The market sells homemade, locally grown products.'},
    explanation:{sl:'Domači med je tipičen tržnični izdelek.',en:'Local honey is a typical market product from local beekeepers.'},
    recipe:'honey_breakfast'
  },
  { id:'q06', type:{sl:'KAJ SKUHAMO',en:'WHAT CAN WE MAKE'}, diff:'easy',
    title:{sl:'Kaj skuhamo?',en:'What can we make?'},
    text:{sl:'Kaj lahko pripravimo iz jabolk?',en:'What can we make from apples?'},
    img:IMGS.apple,
    answers:[{l:{sl:'Jabolčni zavitek',en:'Apple strudel'},img:IMGS.bread,c:true},{l:{sl:'Paradižnikova juha',en:'Tomato soup'},img:IMGS.soup,c:false},{l:{sl:'Ajdova kaša',en:'Buckwheat porridge'},img:IMGS.buckwheat,c:false}],
    hint:{sl:'Jabolka so sladka in odlična za pecivo.',en:'Apples are sweet and great for pastries.'},
    explanation:{sl:'Iz jabolk lahko naredimo zavitek, sok ali kompot.',en:'From apples we can make strudel, juice or compote.'},
    recipe:'apple_strudel'
  },
  { id:'q07', type:{sl:'KAJ NE SPADA',en:'ODD ONE OUT'}, diff:'medium',
    title:{sl:'Kaj ne spada?',en:"What doesn't belong?"},
    text:{sl:'Katera sestavina NE spada v zelenjavno juho?',en:'Which ingredient does NOT belong in vegetable soup?'},
    img:IMGS.soup,
    answers:[{l:{sl:'Korenje',en:'Carrot'},img:IMGS.carrot,c:false},{l:{sl:'Čokolada',en:'Chocolate'},img:IMGS.chocolate,c:true},{l:{sl:'Krompir',en:'Potato'},img:IMGS.potato,c:false},{l:{sl:'Čebula',en:'Onion'},img:IMGS.harvest,c:false}],
    hint:{sl:'Juha je slana, ne sladka jed.',en:'Soup is a savoury dish, not a sweet one.'},
    explanation:{sl:'Čokolada je sladica in ne spada v zelenjavno juho.',en:'Chocolate is a dessert and does not belong in vegetable soup.'},
    recipe:'vegetable_soup'
  },
  { id:'q08', type:{sl:'KAJ MANJKA',en:'MISSING INGREDIENT'}, diff:'medium',
    title:{sl:'Kaj manjka?',en:"What's missing?"},
    text:{sl:'Ajdova skleda ima ajdo, korenje in peteršilj. Kaj dodamo za okus?',en:'The buckwheat bowl has buckwheat, carrot and parsley. What do we add for taste?'},
    img:IMGS.buckwheat,
    answers:[{l:{sl:'Olivno olje',en:'Olive oil'},img:IMGS.olive_oil,c:true},{l:{sl:'Sladkor',en:'Sugar'},img:IMGS.honey,c:false},{l:{sl:'Kečap',en:'Ketchup'},img:IMGS.tomato,c:false},{l:{sl:'Čokolado',en:'Chocolate'},img:IMGS.chocolate,c:false}],
    hint:{sl:'Ta sestavina je zdrava maščoba.',en:'This ingredient is a healthy fat.'},
    explanation:{sl:'Olivno olje je zdravo in doda skledi bogat okus.',en:'Olive oil is healthy and adds a rich flavour to the bowl.'},
    recipe:'buckwheat_bowl'
  },
  { id:'q09', type:{sl:'SEZONA',en:'SEASONAL'}, diff:'medium',
    title:{sl:'Sezonski detektiv',en:'Seasonal detective'},
    text:{sl:'Kateri pridelek je tipičen za poletno tržnico?',en:'Which produce is typical for a summer market?'},
    img:IMGS.strawberry,
    answers:[{l:{sl:'Jagode',en:'Strawberries'},img:IMGS.strawberry,c:true},{l:{sl:'Buča',en:'Pumpkin'},img:IMGS.pumpkin,c:false},{l:{sl:'Jabolka',en:'Apples'},img:IMGS.apple,c:false},{l:{sl:'Kostanj',en:'Chestnuts'},img:IMGS.harvest,c:false}],
    hint:{sl:'To rdeče sadje dozori poleti.',en:'This red fruit ripens in summer.'},
    explanation:{sl:'Jagode so tipičen poletni pridelek junija in julija.',en:'Strawberries are a typical summer crop in June and July.'},
    recipe:'strawberry_dessert'
  },
  { id:'q10', type:{sl:'KJE RASTEM',en:'WHERE DO I GROW'}, diff:'medium',
    title:{sl:'Kje rastem?',en:'Where do I grow?'},
    text:{sl:'Kje raste krompir?',en:'Where does the potato grow?'},
    img:IMGS.potato,
    answers:[{l:{sl:'Pod zemljo',en:'Underground'},img:IMGS.seed,c:true},{l:{sl:'Na drevesu',en:'On a tree'},img:IMGS.farm,c:false},{l:{sl:'Na grmu',en:'On a bush'},img:IMGS.herbs,c:false},{l:{sl:'V morju',en:'In the sea'},img:IMGS.lettuce,c:false}],
    hint:{sl:'Kopljemo ga iz tal.',en:'We dig it from the ground.'},
    explanation:{sl:'Krompir je gomolj, ki raste pod površino zemlje.',en:'The potato is a tuber that grows below the soil surface.'},
    recipe:'potato_dish'
  },
  { id:'q11', type:{sl:'KDO SEM',en:'WHO AM I'}, diff:'medium',
    title:{sl:'Kdo sem?',en:'Who am I?'},
    text:{sl:'Sem bela, tekoča in polna kalcija. Otroci me pijejo za močne kosti.',en:'I am white, liquid and full of calcium. Children drink me for strong bones.'},
    img:IMGS.milk,
    answers:[{l:{sl:'Mleko',en:'Milk'},img:IMGS.milk,c:true},{l:{sl:'Voda',en:'Water'},img:IMGS.farm,c:false},{l:{sl:'Jogurt',en:'Yogurt'},img:IMGS.cottage_cheese,c:false},{l:{sl:'Sok',en:'Juice'},img:IMGS.lemon,c:false}],
    hint:{sl:'Prihaja od krave in je osnova za sir.',en:'It comes from the cow and is the base for cheese.'},
    explanation:{sl:'Mleko je bogat vir kalcija in osnova za mlečne izdelke.',en:'Milk is a rich source of calcium and the basis for dairy products.'},
    recipe:'cottage_pancakes'
  },
  { id:'q12', type:{sl:'KAJ SKUHAMO',en:'WHAT CAN WE MAKE'}, diff:'medium',
    title:{sl:'Kaj skuhamo?',en:'What can we make?'},
    text:{sl:'Iz česa naredimo skutne palačinke?',en:'What do we use to make cottage cheese pancakes?'},
    img:IMGS.pancakes,
    answers:[{l:{sl:'Skuta + moka',en:'Cottage cheese + flour'},img:IMGS.cottage_cheese,c:true},{l:{sl:'Samo moka',en:'Flour only'},img:IMGS.buckwheat,c:false},{l:{sl:'Jajca + sladkor',en:'Eggs + sugar'},img:IMGS.cooking,c:false},{l:{sl:'Mleko + med',en:'Milk + honey'},img:IMGS.honey,c:false}],
    hint:{sl:'Skuta je bela mlečna sestavina.',en:'Cottage cheese is a white dairy ingredient.'},
    explanation:{sl:'Skutne palačinke se delajo iz skute, moke in jajc.',en:'Cottage cheese pancakes are made from cottage cheese, flour and eggs.'},
    recipe:'cottage_pancakes'
  },
  { id:'q15', type:{sl:'SEZONA',en:'SEASONAL'}, diff:'hard',
    title:{sl:'Jesenski detektiv',en:'Autumn detective'},
    text:{sl:'Katero sadje dozori jeseni in je v jabolčnem zavitku?',en:'Which fruit ripens in autumn and is used in apple strudel?'},
    img:IMGS.apple,
    answers:[{l:{sl:'Jabolka',en:'Apples'},img:IMGS.apple,c:true},{l:{sl:'Jagode',en:'Strawberries'},img:IMGS.strawberry,c:false},{l:{sl:'Melona',en:'Melon'},img:IMGS.lemon,c:false},{l:{sl:'Češnje',en:'Cherries'},img:IMGS.strawberry,c:false}],
    hint:{sl:'Raste na drevesu in je tipično jesensko sadje.',en:'Grows on a tree and is a typical autumn fruit.'},
    explanation:{sl:'Jabolka dozorijo jeseni in so eno najpogostejših sadij.',en:'Apples ripen in autumn and are one of the most common fruits.'},
    recipe:'apple_strudel'
  },
  { id:'q17', type:{sl:'KAJ MANJKA',en:'MISSING INGREDIENT'}, diff:'hard',
    title:{sl:'Kaj manjka?',en:"What's missing?"},
    text:{sl:'Paradižnikova juha ima paradižnik, čebulo in baziliko. Kaj doda kremastost?',en:'Tomato soup has tomato, onion and basil. What adds creaminess?'},
    img:IMGS.soup,
    answers:[{l:{sl:'Smetana',en:'Cream'},img:IMGS.milk,c:true},{l:{sl:'Jabolčni sok',en:'Apple juice'},img:IMGS.apple,c:false},{l:{sl:'Med',en:'Honey'},img:IMGS.honey,c:false},{l:{sl:'Jajce',en:'Egg'},img:IMGS.cooking,c:false}],
    hint:{sl:'To je mlečni izdelek, ki naredi juho gladko.',en:'This is a dairy product that makes soup smooth.'},
    explanation:{sl:'Smetana doda juhi kremasto teksturo.',en:'Cream adds a creamy texture to the soup.'},
    recipe:'tomato_sauce'
  },
  { id:'q19', type:{sl:'KJE RASTEM',en:'WHERE DO I GROW'}, diff:'hard',
    title:{sl:'Kje rastem?',en:'Where do I grow?'},
    text:{sl:'Ajda se prideluje...',en:'Buckwheat is cultivated...'},
    img:IMGS.buckwheat,
    answers:[{l:{sl:'Na njivi',en:'In a field'},img:IMGS.farm,c:true},{l:{sl:'V morju',en:'In the sea'},img:IMGS.lettuce,c:false},{l:{sl:'Na drevesu',en:'On a tree'},img:IMGS.apple,c:false},{l:{sl:'V gorah',en:'In the mountains'},img:IMGS.farm,c:false}],
    hint:{sl:'To je žito, ki ga žanjejo na poljih.',en:'This is a grain crop harvested in fields.'},
    explanation:{sl:'Ajda je žito, ki uspeva na njivah — tipičen slovenski pridelek.',en:'Buckwheat is a grain that thrives in fields — a typical Slovenian crop.'},
    recipe:'buckwheat_bowl'
  },
  { id:'q20', type:{sl:'LOKALNI DETEKTIV',en:'LOCAL DETECTIVE'}, diff:'hard',
    title:{sl:'Lokalni detektiv',en:'Local detective'},
    text:{sl:'Katera zelenjava je najpogosteje na tržnici jeseni?',en:'Which vegetable is most common at the market in autumn?'},
    img:IMGS.pumpkin,
    answers:[{l:{sl:'Buča',en:'Pumpkin'},img:IMGS.pumpkin,c:true},{l:{sl:'Jagode',en:'Strawberries'},img:IMGS.strawberry,c:false},{l:{sl:'Češnje',en:'Cherries'},img:IMGS.strawberry,c:false},{l:{sl:'Solata',en:'Lettuce'},img:IMGS.lettuce,c:false}],
    hint:{sl:'To je okrogla, oranžna zelenjava jeseni.',en:'This is a round, orange vegetable in autumn.'},
    explanation:{sl:'Buča je tipičen jesenski pridelek in osnova za juhe.',en:'Pumpkin is a typical autumn crop and the base for soups.'},
    recipe:'vegetable_soup'
  },
  { id:'q25', type:{sl:'KDO SEM',en:'WHO AM I'}, diff:'medium',
    title:{sl:'Kdo sem?',en:'Who am I?'},
    text:{sl:'Sem sladka, tekoča in zlate barve. Pridelajo me čebele.',en:'I am sweet, liquid and golden. Bees produce me.'},
    img:IMGS.honey,
    answers:[{l:{sl:'Med',en:'Honey'},img:IMGS.honey,c:true},{l:{sl:'Sirup',en:'Syrup'},img:IMGS.cooking,c:false},{l:{sl:'Sok',en:'Juice'},img:IMGS.lemon,c:false},{l:{sl:'Maslo',en:'Butter'},img:IMGS.milk,c:false}],
    hint:{sl:'Čebele ga pridelajo iz cvetnega nektarja.',en:'Bees produce it from flower nectar.'},
    explanation:{sl:'Med je naravno sladilo, ki ga pridelajo čebele.',en:'Honey is a natural sweetener produced by bees.'},
    recipe:'honey_breakfast'
  },
  { id:'q29', type:{sl:'KDO SEM',en:'WHO AM I'}, diff:'medium',
    title:{sl:'Kdo sem?',en:'Who am I?'},
    text:{sl:'Sem bela in kremasta. Iz mene delajo palačinke in sladice.',en:'I am white and creamy. I am used to make pancakes and desserts.'},
    img:IMGS.cottage_cheese,
    answers:[{l:{sl:'Skuta',en:'Cottage cheese'},img:IMGS.cottage_cheese,c:true},{l:{sl:'Moka',en:'Flour'},img:IMGS.buckwheat,c:false},{l:{sl:'Maslo',en:'Butter'},img:IMGS.milk,c:false},{l:{sl:'Jajce',en:'Egg'},img:IMGS.cooking,c:false}],
    hint:{sl:'Je mlečni izdelek, pridelan iz mleka.',en:'It is a dairy product made from milk.'},
    explanation:{sl:'Skuta je svež mlečni izdelek in osnova za palačinke.',en:'Cottage cheese is a fresh dairy product and the base for pancakes.'},
    recipe:'cottage_pancakes'
  }
];

// ---------------------------------------------------------------------------
// Module-level game state (lives outside React-style render cycle)
// ---------------------------------------------------------------------------
let _gameState = null;   // active game runtime state
let _timerInt  = null;   // setInterval handle
let _toastTimer = null;  // toast hide timer
let _dragData  = null;   // current drag payload
let _touchActive = false;
let _touchSlotTarget = null;
let _rootEl = null;      // bound DOM root

function _gl(locale) { return GL[locale] || GL.sl; }
function _lv(obj, locale) { return obj[locale] || obj.sl; }

function _clearTimer() {
  if (_timerInt) { clearInterval(_timerInt); _timerInt = null; }
}

// ---------------------------------------------------------------------------
// SELECT screen (game picker)
// ---------------------------------------------------------------------------
function renderSelect(locale) {
  const g = _gl(locale);
  return `
    <section class="gm-select">
      <div class="gm-select__brand">
        <img class="gm-select__brand-img" src="${IMGS.puzzle_banner}" alt="" onerror="this.style.display='none'">
        <div>
          <div class="gm-select__brand-title">ZDRAVO JEM</div>
          <div class="gm-select__brand-sub">Tržnica Sevnica</div>
        </div>
      </div>
      <div class="gm-select__hero">
        <h1 class="gm-select__title">${locale === 'en' ? 'Games' : 'Igrice'}</h1>
        <p class="gm-select__sub">${locale === 'en' ? 'Choose a game and start discovering the world of food!' : 'Izberi igro in začni odkrivati svet hrane!'}</p>
      </div>
      <div class="gm-cards">
        <button class="gm-card" data-gm-action="intro" data-game="puzzle">
          <img class="gm-card__img" src="${IMGS.puzzle_banner}" alt="puzzle" onerror="this.style.display='none'">
          <div class="gm-card__body">
            <h2 class="gm-card__title">${locale === 'en' ? 'From Farm to Plate' : 'Od kmetije do krožnika'}</h2>
            <p class="gm-card__desc">${locale === 'en' ? "Assemble the picture and discover food's journey from field to table." : 'Sestavi sliko in odkrij pot hrane od polja do mize.'}</p>
            <span class="gm-badge">${locale === 'en' ? '🧩 Puzzle' : '🧩 Sestavljanka'}</span>
          </div>
        </button>
        <button class="gm-card" data-gm-action="intro" data-game="detective">
          <img class="gm-card__img" src="${IMGS.detective_banner}" alt="detective" onerror="this.style.display='none'">
          <div class="gm-card__body">
            <h2 class="gm-card__title">${locale === 'en' ? 'Market Detective' : 'Tržnični detektiv'}</h2>
            <p class="gm-card__desc">${locale === 'en' ? 'Solve clues and find the right answer about market food!' : 'Reši namige in odkrij pravi odgovor o hrani s tržnice!'}</p>
            <span class="gm-badge">${locale === 'en' ? '🔍 Quiz' : '🔍 Kviz'}</span>
          </div>
        </button>
      </div>
    </section>`;
}

// ---------------------------------------------------------------------------
// INTRO screen (difficulty picker)
// ---------------------------------------------------------------------------
function renderIntro(game, locale) {
  const g = _gl(locale);
  const isPuzzle = game === 'puzzle';
  const title = isPuzzle
    ? (locale === 'en' ? 'From Farm to Plate' : 'Od kmetije do krožnika')
    : (locale === 'en' ? 'Market Detective' : 'Tržnični detektiv');
  const desc = isPuzzle
    ? (locale === 'en' ? "Assemble the picture and discover food's journey from field to table." : 'Sestavi sliko in odkrij pot hrane od polja do mize.')
    : (locale === 'en' ? 'Solve clues and find the right answer about market food!' : 'Reši namige in odkrij pravi odgovor o hrani s tržnice!');
  const diff = _gameState ? _gameState.difficulty : 'medium';
  return `
    <section class="gm-intro">
      <div class="gm-intro__header">
        <button class="gm-back-btn" data-gm-action="select">←</button>
        <span class="gm-intro__wordmark">ZDRAVO JEM</span>
      </div>
      <div class="gm-intro__body">
        <img class="gm-intro__img" src="${isPuzzle ? IMGS.puzzle_banner : IMGS.detective_banner}" alt="${title}" onerror="this.style.display='none'">
        <h1 class="gm-intro__title">${title}</h1>
        <p class="gm-intro__desc">${desc}</p>
        <p class="gm-diff-label">${g.diffLabel}</p>
        <div class="gm-diff-btns">
          <button class="gm-diff-btn ${diff==='easy'?'is-active':''}" data-gm-action="diff" data-diff="easy">${g.easy}</button>
          <button class="gm-diff-btn ${diff==='medium'?'is-active':''}" data-gm-action="diff" data-diff="medium">${g.medium}</button>
          <button class="gm-diff-btn ${diff==='hard'?'is-active':''}" data-gm-action="diff" data-diff="hard">${g.hard}</button>
        </div>
        <button class="gm-start-btn" data-gm-action="start">${g.startBtn}</button>
      </div>
    </section>`;
}

// ---------------------------------------------------------------------------
// PUZZLE screen render
// ---------------------------------------------------------------------------
function renderPuzzle(locale) {
  const gs = _gameState;
  const sc = gs.puzzle.scenario;
  const cfg = DIFF_CONFIG[gs.difficulty];
  const g = _gl(locale);
  const total = sc.pieces.length;
  const placed = gs.puzzle.placedCount;
  const pct = Math.round(placed / total * 100);

  // Build board slots HTML
  let boardHtml = '';
  for (let i = 1; i <= 9; i++) {
    const placedId = gs.puzzle.placed[i];
    const piece = placedId ? sc.pieces.find(p => p.id === placedId) : null;
    if (piece) {
      boardHtml += `
        <div class="gm-slot gm-slot--filled gm-slot--correct" data-pos="${i}">
          <img src="${piece.img}" alt="${_lv(piece.l, locale)}" onerror="this.style.display='none'">
          <div class="gm-slot__label">${_lv(piece.l, locale)}</div>
        </div>`;
    } else {
      boardHtml += `<div class="gm-slot" data-pos="${i}" data-gm-drop="${i}"><span class="gm-slot__num">${i}</span></div>`;
    }
  }

  // Build available pieces
  const prePlaceIds = cfg.puzzlePrePlaced > 0
    ? sc.pieces.filter(p => p.easyPre).slice(0, cfg.puzzlePrePlaced).map(p => p.id)
    : [];
  const available = sc.pieces.filter(p => !prePlaceIds.includes(p.id) && !gs.puzzle.placed[p.pos]);
  const distractors = cfg.distractors > 0 ? sc.distractors.slice(0, cfg.distractors) : [];
  const allPieces = [...available, ...distractors].sort(() => Math.random() - 0.5);

  let piecesHtml = allPieces.map(p => `
    <div class="gm-piece${p.isDistractor ? ' gm-piece--distractor' : ''}"
         data-piece-id="${p.id}"
         data-is-dist="${!!p.isDistractor}"
         draggable="true">
      <img src="${p.img}" alt="${_lv(p.l, locale)}" onerror="this.style.display='none'">
      <span class="gm-piece__label">${_lv(p.l, locale)}</span>
    </div>`).join('');

  const hintsLeft = gs.puzzle.hintsLeft;
  const hintDisabled = hintsLeft <= 0 ? 'gm-btn--disabled' : '';

  return `
    <section class="gm-puzzle">
      <div class="gm-header">
        <button class="gm-header__back" data-gm-action="confirm-back">←</button>
        <div class="gm-header__title">${_lv(sc.title, locale)}</div>
        <div class="gm-header__score">⭐ <span class="gm-score-val">${gs.score}</span></div>
        <div class="gm-header__timer${gs.timeLeft <= 10 ? ' is-urgent' : ''}" id="gm-timer-badge">
          ⏱ <span id="gm-time">${gs.timeLeft}</span>s
        </div>
      </div>
      <div class="gm-puzzle__content">
        <p class="gm-puzzle__subtitle">${_lv(sc.edu, locale)}</p>
        <div class="gm-puzzle__area">
          <div class="gm-board" id="gm-board">${boardHtml}</div>
          <div class="gm-pieces-panel">
            <h3 class="gm-pieces-panel__title">${g.pieces}</h3>
            <div id="gm-pieces-container">${piecesHtml}</div>
          </div>
        </div>
      </div>
      <div class="gm-puzzle__progress">
        <p class="gm-progress-text"><span id="gm-placed">${placed}</span> / <span>${total}</span> ${g.placed}</p>
        <div class="gm-progress-bar"><div class="gm-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="gm-puzzle__actions">
        <button class="gm-btn gm-btn--hint ${hintDisabled}" id="gm-hint-btn" data-gm-action="hint">
          💡 ${g.hint} (<span id="gm-hint-count">${hintsLeft}</span>)
        </button>
        <button class="gm-btn gm-btn--restart" data-gm-action="confirm-restart">
          🔄 ${g.restart}
        </button>
      </div>
      ${renderDragGhost()}
      ${renderToast()}
      ${renderModal('back', locale)}
      ${renderModal('restart', locale)}
    </section>`;
}

// ---------------------------------------------------------------------------
// DETECTIVE screen render
// ---------------------------------------------------------------------------
function renderDetective(locale) {
  const gs = _gameState;
  const g = _gl(locale);
  const cfg = DIFF_CONFIG[gs.difficulty];
  const q = gs.det.questions[gs.det.currentQ];
  const idx = gs.det.currentQ;

  // Mission dots
  let dotsHtml = '';
  for (let i = 0; i < 5; i++) {
    if (i > 0) dotsHtml += `<div class="gm-mission-line${i <= idx ? ' is-done' : ''}" id="gm-ml-${i}"></div>`;
    let cls = 'gm-mission-dot';
    let label = i + 1;
    if (i < idx) { cls += ' is-done'; label = '✓'; }
    else if (i === idx) cls += ' is-current';
    dotsHtml += `<div class="${cls}" id="gm-md-${i}">${label}</div>`;
  }
  dotsHtml += `<div class="gm-mission-line${idx >= 5 ? ' is-done' : ''}"></div>`;
  dotsHtml += `<div class="gm-mission-dot gm-mission-dot--reward">🎁</div>`;

  // Answer buttons
  let answers = [...q.answers].sort(() => Math.random() - 0.5);
  if (cfg.qAnswers === 3 && answers.length > 3) answers = answers.slice(0, 3);
  const gridCls = answers.length === 3 ? 'gm-answers--three' : '';
  const answersHtml = answers.map((a, ai) => `
    <button class="gm-answer-btn" data-gm-action="answer" data-answer-idx="${ai}" data-is-correct="${a.c}">
      <img class="gm-answer-btn__img" src="${a.img}" alt="${_lv(a.l, locale)}" onerror="this.style.display='none'">
      <span class="gm-answer-btn__label">${_lv(a.l, locale)}</span>
    </button>`).join('');

  return `
    <section class="gm-detective">
      <div class="gm-header">
        <button class="gm-header__back" data-gm-action="confirm-back">←</button>
        <div class="gm-header__title">${locale === 'en' ? 'Market Detective 🔍' : 'Tržnični detektiv 🔍'}</div>
        <div class="gm-header__score">⭐ <span class="gm-score-val">${gs.score}</span></div>
        <div class="gm-header__timer${gs.timeLeft <= 10 ? ' is-urgent' : ''}" id="gm-timer-badge">
          ⏱ <span id="gm-time">${gs.timeLeft}</span>s
        </div>
      </div>
      <div class="gm-detective__content">
        <div class="gm-combo-badge" id="gm-combo-badge" style="display:none">${g.combo}</div>
        <div class="gm-mission-bar">
          <div class="gm-mission-bar__title">${g.missionTitle}</div>
          <div class="gm-mission-dots" id="gm-mission-dots">${dotsHtml}</div>
        </div>
        <div class="gm-question-card">
          <img id="gm-q-img" class="gm-question-card__img" src="${q.img}" alt="" onerror="this.style.display='none'">
          <div class="gm-question-card__body">
            <div class="gm-question-type">${_lv(q.type, locale)}</div>
            <div class="gm-question-title">${_lv(q.title, locale)}</div>
            <div class="gm-question-text">${_lv(q.text, locale)}</div>
          </div>
        </div>
        <div class="gm-hint-area" id="gm-hint-area" style="display:none"></div>
        <div class="gm-answers ${gridCls}" id="gm-answers">${answersHtml}</div>
        <div class="gm-score-feedback" id="gm-score-feedback" style="display:none"></div>
        <div class="gm-explanation" id="gm-explanation" style="display:none"></div>
        <div class="gm-detective__actions">
          <button class="gm-btn gm-btn--hint" id="gm-det-hint-btn" data-gm-action="det-hint">
            💡 ${g.hint} -<span id="gm-det-hint-cost">${cfg.hintCost}</span>
          </button>
          <button class="gm-btn gm-btn--restart" data-gm-action="confirm-restart">🔄 ${g.restart}</button>
        </div>
      </div>
      ${renderToast()}
      ${renderModal('back', locale)}
      ${renderModal('restart', locale)}
    </section>`;
}

// ---------------------------------------------------------------------------
// END screen render
// ---------------------------------------------------------------------------
function renderEnd(locale) {
  const gs = _gameState;
  const g = _gl(locale);
  const pct = gs.endPct;
  let sticker, msg, sub;
  if (pct <= 40)      { sticker = '🌱'; msg = g.endMsg0;  sub = g.endSub0; }
  else if (pct <= 75) { sticker = '⭐'; msg = g.endMsg40; sub = g.endSub40; }
  else                { sticker = '🏆'; msg = g.endMsg75; sub = g.endSub75; }

  return `
    <section class="gm-end">
      <div class="gm-end__sticker">${sticker}</div>
      <div class="gm-end__pct">${pct}%</div>
      <div class="gm-end__msg">${msg}</div>
      <div class="gm-end__sub">${sub}</div>
      <div class="gm-end__score-box">
        <p>${g.totalPoints}</p>
        <div class="gm-end__score-big">${gs.score} ${g.pointsLabel}</div>
      </div>
      <div class="gm-end__buttons">
        <button class="gm-end-btn gm-end-btn--primary" data-gm-action="confirm-restart">🔄 ${g.playAgain}</button>
        <button class="gm-end-btn gm-end-btn--secondary" data-gm-action="go-select">🎮 ${g.backToGames}</button>
      </div>
      ${renderToast()}
      ${renderModal('restart', locale)}
    </section>`;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function renderDragGhost() {
  return `<div class="gm-drag-ghost" id="gm-drag-ghost" style="display:none">
    <img id="gm-ghost-img" src="" alt="" onerror="this.style.display='none'">
    <span class="gm-ghost-label" id="gm-ghost-label"></span>
  </div>`;
}

function renderToast() {
  return `<div class="gm-toast" id="gm-toast" style="opacity:0;pointer-events:none"></div>`;
}

function renderModal(type, locale) {
  const g = _gl(locale);
  if (type === 'back') {
    return `<div class="gm-modal-overlay" id="gm-modal-back" style="display:none">
      <div class="gm-modal">
        <h3>${g.leaveGame}</h3><p>${g.leaveMsg}</p>
        <div class="gm-modal__btns">
          <button class="gm-modal-btn gm-modal-btn--confirm" data-gm-action="do-back">${g.leaveConfirm}</button>
          <button class="gm-modal-btn gm-modal-btn--cancel" data-gm-action="close-modal-back">${g.leaveContinue}</button>
        </div>
      </div>
    </div>`;
  }
  return `<div class="gm-modal-overlay" id="gm-modal-restart" style="display:none">
    <div class="gm-modal">
      <h3>${g.restartGame}</h3><p>${g.restartMsg}</p>
      <div class="gm-modal__btns">
        <button class="gm-modal-btn gm-modal-btn--confirm" data-gm-action="do-restart">${g.restartConfirm}</button>
        <button class="gm-modal-btn gm-modal-btn--cancel" data-gm-action="close-modal-restart">${g.restartCancel}</button>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Main render export — called by app.js on every state change
// ---------------------------------------------------------------------------
export function render({ state }) {
  const locale = state.locale || 'sl';
  const activeGame = state.activeGame;

  // No active game → show game picker
  if (!activeGame) {
    return renderSelect(locale);
  }

  // Sync locale into game state if it exists
  if (_gameState) _gameState.locale = locale;

  // Route to the right sub-screen
  if (!_gameState || _gameState.subScreen === 'intro') {
    if (!_gameState) {
      _gameState = { subScreen: 'intro', game: activeGame, difficulty: 'medium', locale };
    }
    return renderIntro(_gameState.game, locale);
  }
  if (_gameState.subScreen === 'puzzle')    return renderPuzzle(locale);
  if (_gameState.subScreen === 'detective') return renderDetective(locale);
  if (_gameState.subScreen === 'end')       return renderEnd(locale);

  return renderSelect(locale);
}

// ---------------------------------------------------------------------------
// Cleanup — called by app.js when leaving the games screen
// ---------------------------------------------------------------------------
export function cleanup() {
  _clearTimer();
  _gameState = null;
  _dragData = null;
  _touchActive = false;
  _rootEl = null;
}

// ---------------------------------------------------------------------------
// Game logic helpers
// ---------------------------------------------------------------------------
function _addScore(delta) {
  _gameState.score = Math.max(0, _gameState.score + delta);
  const el = _rootEl && _rootEl.querySelector('.gm-score-val');
  if (el) el.textContent = _gameState.score;
}

function _showToast(msg, type) {
  const el = _rootEl && _rootEl.querySelector('#gm-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `gm-toast gm-toast--${type}`;
  el.style.opacity = '1';
  el.style.pointerEvents = 'none';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

function _startTimer(onTick, onExpire) {
  _clearTimer();
  _timerInt = setInterval(() => {
    _gameState.timeLeft--;
    const timeEl = _rootEl && _rootEl.querySelector('#gm-time');
    const badge  = _rootEl && _rootEl.querySelector('#gm-timer-badge');
    if (timeEl) timeEl.textContent = _gameState.timeLeft;
    if (badge) badge.classList.toggle('is-urgent', _gameState.timeLeft <= 10);
    if (onTick) onTick();
    if (_gameState.timeLeft <= 0) { _clearTimer(); onExpire(); }
  }, 1000);
}

function _showModal(id) {
  const el = _rootEl && _rootEl.querySelector(`#${id}`);
  if (el) el.style.display = 'flex';
}

function _hideModal(id) {
  const el = _rootEl && _rootEl.querySelector(`#${id}`);
  if (el) el.style.display = 'none';
}

// ---------------------------------------------------------------------------
// Puzzle logic
// ---------------------------------------------------------------------------
function _startPuzzle(actions) {
  const locale = _gameState.locale;
  const cfg = DIFF_CONFIG[_gameState.difficulty];
  let idx;
  do { idx = Math.floor(Math.random() * PUZZLE_SCENARIOS.length); }
  while (idx === (_gameState.lastPuzzleIdx || -1) && PUZZLE_SCENARIOS.length > 1);

  const sc = PUZZLE_SCENARIOS[idx];
  const prePlaceIds = cfg.puzzlePrePlaced > 0
    ? sc.pieces.filter(p => p.easyPre).slice(0, cfg.puzzlePrePlaced).map(p => p.id)
    : [];

  const placed = {};
  let placedCount = 0;
  prePlaceIds.forEach(pid => {
    const p = sc.pieces.find(x => x.id === pid);
    if (p) { placed[p.pos] = p.id; placedCount++; }
  });

  _gameState = {
    ..._gameState,
    subScreen: 'puzzle',
    score: 0,
    timeLeft: cfg.time,
    lastPuzzleIdx: idx,
    endRecipe: sc.relatedRecipeId,
    puzzle: { scenario: sc, placed, hintsLeft: 3, placedCount }
  };

  actions.goTo('games');
  _bindPuzzle(actions);
  _startTimer(null, () => _endGame(actions));
}

function _bindPuzzle(actions) {
  const locale = _gameState.locale;
  const sc = _gameState.puzzle.scenario;
  const cfg = DIFF_CONFIG[_gameState.difficulty];

  // Drag-and-drop on board slots
  const board = _rootEl.querySelector('#gm-board');
  if (!board) return;

  board.querySelectorAll('[data-gm-drop]').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => { e.preventDefault(); _onDrop(parseInt(slot.dataset.gmDrop), actions); });
  });

  // Piece drag start / touch
  _rootEl.querySelectorAll('.gm-piece').forEach(el => {
    const pid = el.dataset.pieceId;
    const isDist = el.dataset.isDist === 'true';
    const allPieces = [...sc.pieces, ...sc.distractors];
    const piece = allPieces.find(p => p.id === pid);
    if (!piece) return;

    el.addEventListener('dragstart', ev => _startDrag(piece, el, ev));
    el.addEventListener('dragend', () => _endDrag());
    el.addEventListener('touchstart', ev => _touchStart(piece, el, ev), { passive: false });
    el.addEventListener('touchmove', ev => _touchMove(ev), { passive: false });
    el.addEventListener('touchend', ev => _touchEnd(ev, actions));
  });
}

function _startDrag(piece, el, ev) {
  _dragData = { piece, el };
  el.classList.add('is-dragging');
  const ghost = _rootEl.querySelector('#gm-drag-ghost');
  const gImg  = _rootEl.querySelector('#gm-ghost-img');
  const gLbl  = _rootEl.querySelector('#gm-ghost-label');
  if (ghost) { ghost.style.display = 'flex'; }
  if (gImg)  { gImg.src = piece.img; gImg.style.display = 'block'; }
  if (gLbl)  { gLbl.textContent = _lv(piece.l, _gameState.locale); }
}

function _endDrag() {
  if (_dragData) _dragData.el.classList.remove('is-dragging');
  _dragData = null;
  const ghost = _rootEl && _rootEl.querySelector('#gm-drag-ghost');
  if (ghost) ghost.style.display = 'none';
}

function _touchStart(piece, el, ev) {
  ev.preventDefault();
  _dragData = { piece, el };
  _touchActive = true;
  el.classList.add('is-dragging');
  const ghost = _rootEl.querySelector('#gm-drag-ghost');
  const gImg  = _rootEl.querySelector('#gm-ghost-img');
  const gLbl  = _rootEl.querySelector('#gm-ghost-label');
  if (ghost) { ghost.style.display = 'flex'; }
  if (gImg)  { gImg.src = piece.img; gImg.style.display = 'block'; }
  if (gLbl)  { gLbl.textContent = _lv(piece.l, _gameState.locale); }
  const t = ev.touches[0];
  if (ghost) { ghost.style.left = t.clientX + 'px'; ghost.style.top = t.clientY + 'px'; }
}

function _touchMove(ev) {
  if (!_touchActive) return;
  ev.preventDefault();
  const t = ev.touches[0];
  const ghost = _rootEl && _rootEl.querySelector('#gm-drag-ghost');
  if (ghost) { ghost.style.left = t.clientX + 'px'; ghost.style.top = t.clientY + 'px'; }
  const el = document.elementFromPoint(t.clientX, t.clientY);
  _touchSlotTarget = el ? el.closest('[data-gm-drop]') : null;
}

function _touchEnd(ev, actions) {
  if (!_touchActive) return;
  _touchActive = false;
  const ghost = _rootEl && _rootEl.querySelector('#gm-drag-ghost');
  if (ghost) ghost.style.display = 'none';
  if (_dragData) _dragData.el.classList.remove('is-dragging');
  if (_touchSlotTarget) {
    const pos = parseInt(_touchSlotTarget.dataset.gmDrop);
    if (!isNaN(pos)) _onDrop(pos, actions);
  }
  _dragData = null;
  _touchSlotTarget = null;
}

function _onDrop(pos, actions) {
  if (!_dragData || _gameState.puzzle.placed[pos]) return;
  const piece = _dragData.piece;
  const sc = _gameState.puzzle.scenario;
  const locale = _gameState.locale;
  const g = _gl(locale);

  if (_dragData.el.dataset.isDist === 'true') {
    _showToast(g.distractor, 'bad');
    _addScore(-25);
    _endDrag();
    return;
  }

  const correctPiece = sc.pieces.find(p => p.pos === pos);
  if (correctPiece && correctPiece.id === piece.id) {
    // Correct placement
    _gameState.puzzle.placed[pos] = piece.id;
    _gameState.puzzle.placedCount++;

    const slot = _rootEl.querySelector(`[data-gm-drop="${pos}"]`);
    if (slot) {
      slot.innerHTML = `
        <img src="${piece.img}" alt="${_lv(piece.l, locale)}" onerror="this.style.display='none'">
        <div class="gm-slot__label">${_lv(piece.l, locale)}</div>`;
      slot.classList.add('gm-slot--filled', 'gm-slot--correct');
      slot.removeAttribute('data-gm-drop');
    }
    _dragData.el.remove();
    _addScore(100);
    _updatePuzzleProgress();
    _showToast(g.snapGood(100), 'good');

    if (_gameState.puzzle.placedCount === sc.pieces.length) {
      setTimeout(() => _endGame(actions, true), 500);
    }
  } else {
    // Wrong slot
    const slot = _rootEl.querySelector(`[data-gm-drop="${pos}"]`);
    if (slot) {
      slot.classList.add('gm-slot--shake');
      setTimeout(() => slot.classList.remove('gm-slot--shake'), 400);
    }
    _addScore(-25);
    _showToast(g.snapBad, 'bad');
  }
  _endDrag();
}

function _updatePuzzleProgress() {
  const sc = _gameState.puzzle.scenario;
  const placed = _gameState.puzzle.placedCount;
  const total = sc.pieces.length;
  const pct = Math.round(placed / total * 100);
  const placedEl = _rootEl && _rootEl.querySelector('#gm-placed');
  const fillEl   = _rootEl && _rootEl.querySelector('.gm-progress-fill');
  if (placedEl) placedEl.textContent = placed;
  if (fillEl)   fillEl.style.width = pct + '%';
}

function _useHint() {
  const gs = _gameState;
  const locale = gs.locale;
  const g = _gl(locale);
  if (gs.puzzle.hintsLeft <= 0) return;

  const sc = gs.puzzle.scenario;
  const unplaced = sc.pieces.filter(p => !Object.values(gs.puzzle.placed).includes(p.id));
  if (!unplaced.length) return;

  const target = unplaced[0];
  const slot = _rootEl.querySelector(`[data-gm-drop="${target.pos}"]`);
  const pieceEl = _rootEl.querySelector(`[data-piece-id="${target.id}"]`);

  if (slot)    { slot.classList.add('gm-slot--hint'); setTimeout(() => slot.classList.remove('gm-slot--hint'), 2600); }
  if (pieceEl) { pieceEl.classList.add('gm-piece--hint'); setTimeout(() => pieceEl.classList.remove('gm-piece--hint'), 2600); }

  gs.puzzle.hintsLeft--;
  _addScore(-50);

  const countEl = _rootEl.querySelector('#gm-hint-count');
  if (countEl) countEl.textContent = gs.puzzle.hintsLeft;

  if (gs.puzzle.hintsLeft === 0) {
    const btn = _rootEl.querySelector('#gm-hint-btn');
    if (btn) { btn.classList.add('gm-btn--disabled'); btn.textContent = `💡 ${g.noHints}`; }
  }
  _showToast(g.hintToast, 'good');
}

// ---------------------------------------------------------------------------
// Detective logic
// ---------------------------------------------------------------------------
function _startDetective(actions) {
  const cfg = DIFF_CONFIG[_gameState.difficulty];
  const pool = [...QUESTIONS].sort(() => Math.random() - 0.5);
  const qs = pool.slice(0, 5);

  _gameState = {
    ..._gameState,
    subScreen: 'detective',
    score: 0,
    timeLeft: cfg.time,
    endRecipe: qs[0] ? qs[0].recipe : 'honey_breakfast',
    det: { questions: qs, currentQ: 0, correct: 0, combo: 0, hintsUsed: 0, wrongAttempts: 0, hintUsedQ: false }
  };

  actions.goTo('games');
  _startTimer(null, () => _endGame(actions));
}

function _answerClick(isCorrect, btn, actions) {
  const gs = _gameState;
  const locale = gs.locale;
  const g = _gl(locale);
  const cfg = DIFF_CONFIG[gs.difficulty];
  const q = gs.det.questions[gs.det.currentQ];

  // Lock all buttons
  _rootEl.querySelectorAll('.gm-answer-btn').forEach(b => b.classList.add('is-locked'));

  if (isCorrect) {
    btn.classList.add('is-correct');
    const pts = gs.det.wrongAttempts === 0 ? cfg.pCorrect : cfg.pCorrect2;
    _addScore(pts);
    gs.det.correct++;
    gs.det.combo++;

    if (gs.det.combo >= 3) {
      _addScore(100);
      const comboBadge = _rootEl.querySelector('#gm-combo-badge');
      if (comboBadge) { comboBadge.textContent = g.combo; comboBadge.style.display = 'block'; }
    }

    _showDetFeedback(g.correctMsg(pts), 'good');
    _showExplanation(_lv(q.explanation, locale));
    gs.endRecipe = q.recipe;
    setTimeout(() => _advanceQ(actions), 2000);
  } else {
    btn.classList.add('is-wrong');
    gs.det.wrongAttempts++;
    gs.det.combo = 0;
    _addScore(cfg.pWrong);

    if (gs.det.wrongAttempts >= 2) {
      // Reveal correct answer
      _rootEl.querySelectorAll('.gm-answer-btn').forEach(b => {
        if (b.dataset.isCorrect === 'true') b.classList.add('is-correct');
      });
      _showDetFeedback(g.revealAnswer, 'bad');
      _showExplanation(_lv(q.explanation, locale));
      gs.endRecipe = q.recipe;
      setTimeout(() => _advanceQ(actions), 2500);
    } else {
      _showDetFeedback(g.wrongMsg, 'bad');
      btn.classList.add('is-greyed');
      // Unlock remaining non-wrong buttons
      _rootEl.querySelectorAll('.gm-answer-btn:not(.is-wrong):not(.is-greyed)').forEach(b => b.classList.remove('is-locked'));
    }
  }
}

function _advanceQ(actions) {
  const gs = _gameState;
  const next = gs.det.currentQ + 1;
  if (next >= 5) {
    _clearTimer();
    _endGame(actions);
  } else {
    gs.det.currentQ = next;
    gs.det.wrongAttempts = 0;
    gs.det.hintUsedQ = false;
    actions.goTo('games');
  }
}

function _showDetFeedback(msg, type) {
  const el = _rootEl && _rootEl.querySelector('#gm-score-feedback');
  if (!el) return;
  el.textContent = msg;
  el.className = `gm-score-feedback gm-score-feedback--${type}`;
  el.style.display = 'block';
}

function _showExplanation(text) {
  const el = _rootEl && _rootEl.querySelector('#gm-explanation');
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
}

function _useDetHint() {
  const gs = _gameState;
  if (gs.det.hintUsedQ) return;
  const locale = gs.locale;
  const g = _gl(locale);
  const cfg = DIFF_CONFIG[gs.difficulty];
  const q = gs.det.questions[gs.det.currentQ];

  gs.det.hintUsedQ = true;
  gs.det.hintsUsed++;
  _addScore(cfg.pHint);

  const ha = _rootEl.querySelector('#gm-hint-area');
  if (ha) { ha.textContent = '💡 ' + _lv(q.hint, locale); ha.style.display = 'block'; }

  const btn = _rootEl.querySelector('#gm-det-hint-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.textContent = `💡 ${g.hintUsed}`; }

  // Grey out one wrong answer
  const allBtns = [..._rootEl.querySelectorAll('.gm-answer-btn:not(.is-locked):not(.is-greyed)')];
  const wrongs = allBtns.filter(b => b.dataset.isCorrect !== 'true');
  if (wrongs.length > 0) wrongs[0].classList.add('is-greyed');
}

// ---------------------------------------------------------------------------
// End game
// ---------------------------------------------------------------------------
function _endGame(actions, puzzleCompleted) {
  _clearTimer();
  const gs = _gameState;
  let pct;
  if (gs.subScreen === 'puzzle') {
    const sc = gs.puzzle.scenario;
    pct = Math.round(gs.puzzle.placedCount / sc.pieces.length * 100);
    if (puzzleCompleted) _addScore(250);
  } else {
    pct = Math.round(gs.det.correct / 5 * 100);
    if (gs.det.hintsUsed === 0) _addScore(100);
    _addScore(150);
  }
  _gameState.subScreen = 'end';
  _gameState.endPct = pct;
  actions.goTo('games');
}

// ---------------------------------------------------------------------------
// bind — wires up all event listeners after render
// ---------------------------------------------------------------------------
export function bind({ state, actions, root }) {
  _rootEl = root;
  const locale = state.locale || 'sl';

  // Delegate all game actions via a single listener on root
  root.addEventListener('pointerdown', (ev) => {
    const target = ev.target.closest('[data-gm-action]');
    if (!target) return;
    const action = target.dataset.gmAction;

    // ---- SELECT screen ----
    if (action === 'intro') {
      const game = target.dataset.game;
      _gameState = { subScreen: 'intro', game, difficulty: 'medium', locale };
      actions.startGame(game);
      return;
    }

    // ---- INTRO screen ----
    if (action === 'select') {
      cleanup();
      actions.closeGame();
      return;
    }
    if (action === 'diff') {
      if (_gameState) _gameState.difficulty = target.dataset.diff;
      root.querySelectorAll('.gm-diff-btn').forEach(b => b.classList.toggle('is-active', b.dataset.diff === target.dataset.diff));
      return;
    }
    if (action === 'start') {
      if (!_gameState) return;
      if (_gameState.game === 'puzzle') _startPuzzle(actions);
      else _startDetective(actions);
      return;
    }

    // ---- PUZZLE / DETECTIVE shared ----
    if (action === 'confirm-back') { _showModal('gm-modal-back'); return; }
    if (action === 'confirm-restart') { _showModal('gm-modal-restart'); return; }
    if (action === 'close-modal-back') { _hideModal('gm-modal-back'); return; }
    if (action === 'close-modal-restart') { _hideModal('gm-modal-restart'); return; }

    if (action === 'do-back') {
      _hideModal('gm-modal-back');
      _clearTimer();
      _gameState = { subScreen: 'intro', game: _gameState.game, difficulty: _gameState.difficulty, locale };
      actions.goTo('games');
      return;
    }
    if (action === 'do-restart') {
      _hideModal('gm-modal-restart');
      _clearTimer();
      const game = _gameState.game;
      const diff = _gameState.difficulty;
      _gameState = { subScreen: 'intro', game, difficulty: diff, locale };
      if (game === 'puzzle') _startPuzzle(actions);
      else _startDetective(actions);
      return;
    }

    // ---- PUZZLE ----
    if (action === 'hint') {
      if (!target.classList.contains('gm-btn--disabled')) _useHint();
      return;
    }

    // ---- DETECTIVE ----
    if (action === 'answer') {
      if (target.classList.contains('is-locked') || target.classList.contains('is-greyed')) return;
      const isCorrect = target.dataset.isCorrect === 'true';
      _answerClick(isCorrect, target, actions);
      return;
    }
    if (action === 'det-hint') {
      _useDetHint();
      return;
    }

    // ---- END screen ----
    if (action === 'go-select') {
      cleanup();
      actions.closeGame();
      return;
    }
  });

  // After render, re-bind puzzle drag/drop if we're on the puzzle screen
  if (_gameState && _gameState.subScreen === 'puzzle') {
    _bindPuzzle(actions);
  }
}
