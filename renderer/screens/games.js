// ============================================================================
// Zdravo Jem — Games Module (Electron integration)
// Puzzle: "Od kmetije do krožnika"   Detective: "Tržnični detektiv"
// ============================================================================

import { ingredientImageSrc as iImg } from '../ingredient-images.js';

// ---------------------------------------------------------------------------
// Image map (game assets only — ingredient images use iImg() directly)
// ---------------------------------------------------------------------------
const IMGS = {
  logo: '../assets/images/home-games/zdravojemlong.png',
  puzzle_banner: '../assets/images/games/puzzle-banner.png',
  detective_banner: '../assets/images/games/detective-banner.png',
  detective_header: '../assets/images/games/detective/header.png',
  detective_leaf: '../assets/images/games/detective/leaf-left.png',
  detective_divider: '../assets/images/games/detective/divider.png',
  detective_mascot: '../assets/images/games/detective/mascot.png',
  detective_reward: '../assets/images/games/detective/reward.png',
  puzzle_header:   '../assets/images/games/header.png',
  farm_plate_1: '../assets/images/games/1.png',
  farm_plate_2: '../assets/images/games/2.png',
  farm_plate_3: '../assets/images/games/3.png',
  farm_plate_4: '../assets/images/games/4.png',
  farm_plate_5: '../assets/images/games/5.png',
  farm_plate_6: '../assets/images/games/6.png',
  farm_plate_7: '../assets/images/games/7.png',
  farm_plate_8: '../assets/images/games/8.png',
  farm_plate_9: '../assets/images/games/9.png',
  strawberry_plate_1: '../assets/images/games/strawberry-journey-1.png',
  strawberry_plate_2: '../assets/images/games/strawberry-journey-2.png',
  strawberry_plate_3: '../assets/images/games/strawberry-journey-3.png',
  strawberry_plate_4: '../assets/images/games/strawberry-journey-4.png',
  strawberry_plate_5: '../assets/images/games/strawberry-journey-5.png',
  strawberry_plate_6: '../assets/images/games/strawberry-journey-6.png',
  strawberry_plate_7: '../assets/images/games/strawberry-journey-7.png',
  strawberry_plate_8: '../assets/images/games/strawberry-journey-8.png',
  strawberry_plate_9: '../assets/images/games/strawberry-journey-9.png'
};

// ---------------------------------------------------------------------------
// Difficulty config
// ---------------------------------------------------------------------------
const DIFF_CONFIG = {
  easy: { time: 120, puzzlePrePlaced: 2, distractors: 0, qAnswers: 3, pCorrect: 50, pCorrect2: 25, pWrong: -5, pHint: -10, hintCost: '10' },
  medium: { time: 90, puzzlePrePlaced: 0, distractors: 0, qAnswers: 4, pCorrect: 100, pCorrect2: 60, pWrong: -20, pHint: -30, hintCost: '30' },
  hard: { time: 60, puzzlePrePlaced: 0, distractors: 2, qAnswers: 4, pCorrect: 150, pCorrect2: 80, pWrong: -30, pHint: -50, hintCost: '50' }
};

// ---------------------------------------------------------------------------
// Localised strings
// ---------------------------------------------------------------------------
const GL = {
  sl: {
    correctMsg: (pts) => `Odlično! +${pts} točk`,
    wrongMsg: 'Skoraj! Poskusi znova.',
    hintToast: 'Namig: poišči označen košček!',
    snapGood: (pts) => `+${pts} točk!`,
    snapBad: 'Poskusi znova!',
    distractor: 'Ta košček ne spada v sliko.',
    noHints: 'Ni več namigov',
    hintUsed: 'Namig porabljen',
    combo: 'Combo +100 točk!',
    revealAnswer: 'Pravilen odgovor je označen.',
    recipeToast: (r) => `Recept: ${r}`,
    endMsg0: 'Dobro si poskusil! Poskusi znova.',
    endSub0: '',
    endMsg40: 'Bravo! Dobro ti gre.',
    endSub40: '',
    endMsg75: 'Odlično! Pravi tržnični mojster.',
    endSub75: '',
    pointsLabel: 'točk',
    pieces: 'Koščki',
    placed: 'koščkov sestavljenih',
    hint: 'Namig',
    restart: 'Znova',
    diffLabel: 'Izberi težavnost:',
    easy: 'Lahko',
    medium: 'Srednje',
    hard: 'Težje',
    startBtn: 'Začni igro',
    missionTitle: '— Detektivske misije —',
    totalPoints: 'Skupaj točk',
    playAgain: 'Igraj znova',
    viewRecipe: 'Poglej povezan recept',
    backToGames: 'Nazaj na igrice',
    leaveGame: 'Zapusti igro?',
    leaveMsg: 'Ali želiš zapustiti igro? Napredek ne bo shranjen.',
    leaveConfirm: 'Zapusti igro',
    leaveContinue: 'Nadaljuj igro',
    restartGame: 'Začni znova?',
    restartMsg: 'Ali želiš začeti znova? Trenutni rezultat bo izgubljen.',
    restartConfirm: 'Začni znova',
    restartCancel: 'Nadaljuj igro',
    puzzleComplete: 'Sestavljanka je končana!',
    puzzleCompleteTitle: 'Končano',
    puzzleCompleteEmpty: 'Vsi koščki so že na mestu.'
  },
  en: {
    correctMsg: (pts) => `Excellent! +${pts} points`,
    wrongMsg: 'Almost! Try again.',
    hintToast: 'Hint: find the highlighted piece!',
    snapGood: (pts) => `+${pts} points!`,
    snapBad: 'Try again!',
    distractor: "This piece doesn't belong here.",
    noHints: 'No more hints',
    hintUsed: 'Hint used',
    combo: 'Combo +100 points!',
    revealAnswer: 'Correct answer is highlighted.',
    recipeToast: (r) => `Recipe: ${r}`,
    endMsg0: 'Good try! Try again.',
    endSub0: '',
    endMsg40: 'Bravo! You are doing well.',
    endSub40: '',
    endMsg75: 'Excellent! A true market master.',
    endSub75: '',
    pointsLabel: 'points',
    pieces: 'Pieces',
    placed: 'pieces placed',
    hint: 'Hint',
    restart: 'Restart',
    diffLabel: 'Choose difficulty:',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    startBtn: 'Start game',
    missionTitle: '— Detective Missions —',
    totalPoints: 'Total points',
    playAgain: 'Play again',
    viewRecipe: 'View related recipe',
    backToGames: 'Back to games',
    leaveGame: 'Leave game?',
    leaveMsg: 'Do you want to leave the game? Progress will not be saved.',
    leaveConfirm: 'Leave game',
    leaveContinue: 'Continue game',
    restartGame: 'Start over?',
    restartMsg: 'Do you want to start again? The current score will be lost.',
    restartConfirm: 'Start again',
    restartCancel: 'Continue game',
    puzzleComplete: 'Puzzle complete!',
    puzzleCompleteTitle: 'Done',
    puzzleCompleteEmpty: 'All pieces are in place.'
  }
};

// ---------------------------------------------------------------------------
// Puzzle scenarios
// ---------------------------------------------------------------------------
const PUZZLE_SCENARIOS = [
  {
    id: 'apple', title: { sl: 'Od kmetije do krožnika', en: 'From Farm to Plate' }, img: IMGS.farm_plate_3, relatedRecipeId: 'apple_strudel',
    edu: { sl: 'Sestavi sliko in odkrij pot hrane.', en: 'Build the journey of apples from the orchard to homemade apple strudel.' },
    pieces: [
      { id: 'p1', e: '🌳', img: IMGS.farm_plate_1, l: { sl: 'Sadovnjak', en: 'Orchard' }, pos: 1, easyPre: true },
      { id: 'p2', e: '🧺', img: IMGS.farm_plate_2, l: { sl: 'Obiranje', en: 'Picking' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🍎', img: IMGS.farm_plate_3, l: { sl: 'Košara', en: 'Basket' }, pos: 3 },
      { id: 'p4', e: '🏪', img: IMGS.farm_plate_4, l: { sl: 'Stojnica', en: 'Market stall' }, pos: 4 },
      { id: 'p5', e: '🍏', img: IMGS.farm_plate_5, l: { sl: 'Jabolka', en: 'Apples' }, pos: 5 },
      { id: 'p6', e: '🔪', img: IMGS.farm_plate_6, l: { sl: 'Rezanje', en: 'Cutting' }, pos: 6 },
      { id: 'p7', e: '🔥', img: IMGS.farm_plate_7, l: { sl: 'Pečenje', en: 'Baking' }, pos: 7 },
      { id: 'p8', e: '🥧', img: IMGS.farm_plate_8, l: { sl: 'Zavitek', en: 'Strudel' }, pos: 8 },
      { id: 'p9', e: '🍽️', img: IMGS.farm_plate_9, l: { sl: 'Krožnik', en: 'Plate' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🍕', img: iImg('sol'), l: { sl: 'Pizza', en: 'Pizza' }, isDistractor: true }]
  },
  {
    id: 'carrot', title: { sl: 'Od korenja do juhe', en: 'From Carrot to Soup' }, img: iImg('korenje'), relatedRecipeId: 'vegetable_soup',
    edu: { sl: 'Korenje raste na polju in ga dodamo v juho.', en: 'Carrots grow in the field and we add them to soup.' },
    pieces: [
      { id: 'p1', e: '🌱', img: iImg('bučna semena'), l: { sl: 'Seme', en: 'Seed' }, pos: 1, easyPre: true },
      { id: 'p2', e: '🚜', img: iImg('korenje'), l: { sl: 'Kmetija', en: 'Farm' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🥕', img: iImg('korenje'), l: { sl: 'Korenje', en: 'Carrot' }, pos: 3 },
      { id: 'p4', e: '🧺', img: iImg('korenje'), l: { sl: 'Pobiranje', en: 'Harvesting' }, pos: 4 },
      { id: 'p5', e: '🏪', img: iImg('jušna zelenjava'), l: { sl: 'Tržnica', en: 'Market' }, pos: 5 },
      { id: 'p6', e: '🛒', img: iImg('jušna zelenjava'), l: { sl: 'Nakup', en: 'Shopping' }, pos: 6 },
      { id: 'p7', e: '🔪', img: iImg('korenje'), l: { sl: 'Rezanje', en: 'Cutting' }, pos: 7 },
      { id: 'p8', e: '🍳', img: iImg('jušna zelenjava'), l: { sl: 'Kuhanje', en: 'Cooking' }, pos: 8 },
      { id: 'p9', e: '🍲', img: iImg('jušna zelenjava'), l: { sl: 'Juha', en: 'Soup' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🍦', img: iImg('sladkor'), l: { sl: 'Sladoled', en: 'Ice cream' }, isDistractor: true }]
  },
  {
    id: 'strawberry', title: { sl: 'Od jagod do sladice', en: 'From Strawberries to Dessert' }, img: IMGS.strawberry_plate_9, relatedRecipeId: 'strawberry_dessert',
    edu: { sl: 'Sestavi pot jagod od nasada do sladice za družino.', en: 'Build the journey of strawberries from the field to a family dessert.' },
    pieces: [
      { id: 'p1', e: '🌱', img: IMGS.strawberry_plate_1, l: { sl: 'Nasad', en: 'Field' }, pos: 1, easyPre: true },
      { id: 'p2', e: '🧺', img: IMGS.strawberry_plate_2, l: { sl: 'Obiranje', en: 'Picking' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🍓', img: IMGS.strawberry_plate_3, l: { sl: 'Košara', en: 'Basket' }, pos: 3 },
      { id: 'p4', e: '🏪', img: IMGS.strawberry_plate_4, l: { sl: 'Stojnica', en: 'Market stall' }, pos: 4 },
      { id: 'p5', e: '🛒', img: IMGS.strawberry_plate_5, l: { sl: 'Nakup', en: 'Shopping' }, pos: 5 },
      { id: 'p6', e: '🥣', img: IMGS.strawberry_plate_6, l: { sl: 'Mešanje', en: 'Mixing' }, pos: 6 },
      { id: 'p7', e: '🧀', img: IMGS.strawberry_plate_7, l: { sl: 'Skuta', en: 'Cottage cheese' }, pos: 7 },
      { id: 'p8', e: '🍨', img: IMGS.strawberry_plate_8, l: { sl: 'Sladica', en: 'Dessert' }, pos: 8 },
      { id: 'p9', e: '🍽️', img: IMGS.strawberry_plate_9, l: { sl: 'Družina', en: 'Family table' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🌭', img: iImg('sol'), l: { sl: 'Hot dog', en: 'Hot dog' }, isDistractor: true }]
  },
  {
    id: 'honey', title: { sl: 'Od čebel do zajtrka', en: 'From Bees to Breakfast' }, img: iImg('med'), relatedRecipeId: 'honey_breakfast',
    edu: { sl: 'Čebele zberejo nektar in naredijo med za zajtrk.', en: 'Bees collect nectar and make honey for breakfast.' },
    pieces: [
      { id: 'p1', e: '🌸', img: iImg('med'), l: { sl: 'Cvetje', en: 'Flowers' }, pos: 1, easyPre: true },
      { id: 'p2', e: '🐝', img: iImg('med'), l: { sl: 'Čebela', en: 'Bee' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🍯', img: iImg('med'), l: { sl: 'Med', en: 'Honey' }, pos: 3 },
      { id: 'p4', e: '🏚️', img: iImg('med'), l: { sl: 'Čebelnjak', en: 'Beehive' }, pos: 4 },
      { id: 'p5', e: '🏪', img: iImg('jušna zelenjava'), l: { sl: 'Tržnica', en: 'Market' }, pos: 5 },
      { id: 'p6', e: '🛒', img: iImg('jušna zelenjava'), l: { sl: 'Nakup', en: 'Shopping' }, pos: 6 },
      { id: 'p7', e: '🥛', img: iImg('jogurt'), l: { sl: 'Jogurt', en: 'Yogurt' }, pos: 7 },
      { id: 'p8', e: '🫐', img: iImg('borovnice'), l: { sl: 'Jagodičje', en: 'Berries' }, pos: 8 },
      { id: 'p9', e: '🥣', img: iImg('med'), l: { sl: 'Zajtrk', en: 'Breakfast' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🍟', img: iImg('sol'), l: { sl: 'Pomfrit', en: 'Fries' }, isDistractor: true }]
  },
  {
    id: 'milk', title: { sl: 'Od mleka do palačink', en: 'From Milk to Pancakes' }, img: iImg('mleko'), relatedRecipeId: 'cottage_pancakes',
    edu: { sl: 'Krava daje mleko, iz njega naredijo skuto za palačinke.', en: 'The cow gives milk, from which cottage cheese is made for pancakes.' },
    pieces: [
      { id: 'p1', e: '🐄', img: iImg('mleko'), l: { sl: 'Krava', en: 'Cow' }, pos: 1, easyPre: true },
      { id: 'p2', e: '🥛', img: iImg('mleko'), l: { sl: 'Mleko', en: 'Milk' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🧀', img: iImg('skuta'), l: { sl: 'Skuta', en: 'Cottage cheese' }, pos: 3 },
      { id: 'p4', e: '🏪', img: iImg('jušna zelenjava'), l: { sl: 'Tržnica', en: 'Market' }, pos: 4 },
      { id: 'p5', e: '🛒', img: iImg('jušna zelenjava'), l: { sl: 'Nakup', en: 'Shopping' }, pos: 5 },
      { id: 'p6', e: '🥚', img: iImg('jajca'), l: { sl: 'Jajca', en: 'Eggs' }, pos: 6 },
      { id: 'p7', e: '🌾', img: iImg('moka'), l: { sl: 'Moka', en: 'Flour' }, pos: 7 },
      { id: 'p8', e: '🍳', img: iImg('skuta'), l: { sl: 'Pečenje', en: 'Baking' }, pos: 8 },
      { id: 'p9', e: '🥞', img: iImg('skuta'), l: { sl: 'Palačinke', en: 'Pancakes' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🌮', img: iImg('sol'), l: { sl: 'Takos', en: 'Tacos' }, isDistractor: true }]
  },
  {
    id: 'tomato', title: { sl: 'Od paradižnika do omake', en: 'From Tomato to Sauce' }, img: iImg('paradižnik'), relatedRecipeId: 'tomato_sauce',
    edu: { sl: 'Paradižnik raste na vrtu in ga skuhamo v omako.', en: 'Tomatoes grow in the garden and we cook them into sauce.' },
    pieces: [
      { id: 'p1', e: '🌱', img: iImg('paradižnik'), l: { sl: 'Sadika', en: 'Seedling' }, pos: 1, easyPre: true },
      { id: 'p2', e: '☀️', img: iImg('paradižnik'), l: { sl: 'Zorenje', en: 'Ripening' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🍅', img: iImg('paradižnik'), l: { sl: 'Paradižnik', en: 'Tomato' }, pos: 3 },
      { id: 'p4', e: '🧺', img: iImg('paradižnik'), l: { sl: 'Pobiranje', en: 'Picking' }, pos: 4 },
      { id: 'p5', e: '🏪', img: iImg('jušna zelenjava'), l: { sl: 'Tržnica', en: 'Market' }, pos: 5 },
      { id: 'p6', e: '🛒', img: iImg('jušna zelenjava'), l: { sl: 'Nakup', en: 'Shopping' }, pos: 6 },
      { id: 'p7', e: '🔪', img: iImg('paradižnik'), l: { sl: 'Sekljanje', en: 'Chopping' }, pos: 7 },
      { id: 'p8', e: '🍳', img: iImg('pasiran paradižnik'), l: { sl: 'Kuhanje', en: 'Cooking' }, pos: 8 },
      { id: 'p9', e: '🍝', img: iImg('pasiran paradižnik'), l: { sl: 'Omaka', en: 'Sauce' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🍦', img: iImg('sladkor'), l: { sl: 'Sladoled', en: 'Ice cream' }, isDistractor: true }]
  },
  {
    id: 'lettuce', title: { sl: 'Od solate do sklede', en: 'From Lettuce to Bowl' }, img: iImg('kislo zelje'), relatedRecipeId: 'salad_bowl',
    edu: { sl: 'Solata raste na vrtu spomladi in jo damo v skledo.', en: 'Lettuce grows in the garden in spring and we put it in a bowl.' },
    pieces: [
      { id: 'p1', e: '🌱', img: iImg('bučna semena'), l: { sl: 'Seme', en: 'Seed' }, pos: 1, easyPre: true },
      { id: 'p2', e: '💧', img: iImg('kislo zelje'), l: { sl: 'Zalivanje', en: 'Watering' }, pos: 2, easyPre: true },
      { id: 'p3', e: '🥬', img: iImg('kislo zelje'), l: { sl: 'Solata', en: 'Lettuce' }, pos: 3 },
      { id: 'p4', e: '✂️', img: iImg('kislo zelje'), l: { sl: 'Rezanje', en: 'Cutting' }, pos: 4 },
      { id: 'p5', e: '🏪', img: iImg('jušna zelenjava'), l: { sl: 'Tržnica', en: 'Market' }, pos: 5 },
      { id: 'p6', e: '🛒', img: iImg('jušna zelenjava'), l: { sl: 'Nakup', en: 'Shopping' }, pos: 6 },
      { id: 'p7', e: '🍅', img: iImg('paradižnik'), l: { sl: 'Paradižnik', en: 'Tomato' }, pos: 7 },
      { id: 'p8', e: '🫒', img: iImg('olivno olje'), l: { sl: 'Olje', en: 'Oil' }, pos: 8 },
      { id: 'p9', e: '🥗', img: iImg('kislo zelje'), l: { sl: 'Solata', en: 'Salad' }, pos: 9 }
    ],
    distractors: [{ id: 'd1', e: '🍩', img: iImg('sladkor'), l: { sl: 'Donut', en: 'Donut' }, isDistractor: true }]
  }
];

const PICTURE_PUZZLE_ROTATION = ['apple'];

// ---------------------------------------------------------------------------
// Detective questions
// ---------------------------------------------------------------------------
const QUESTIONS = [
  // ===== EASY =====
  {
    id: 'L01', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je glavna sestavina?', en: 'What is the main ingredient?' },
    text: { sl: 'Katera sestavina je glavna v jedi »Pečena postrv z zelišči«?', en: 'What is the main ingredient in "Baked trout with herbs"?' },
    img: iImg('postrv'),
    answers: [{ l: { sl: 'Postrv', en: 'Trout' }, img: iImg('postrv'), c: true }, { l: { sl: 'Jabolka', en: 'Apples' }, img: iImg('jabolka'), c: false }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Zelje', en: 'Cabbage' }, img: iImg('zelje'), c: false }],
    hint: { sl: 'Iščemo ribo, ki se peče z limono in zelišči.', en: 'We are looking for a fish baked with lemon and herbs.' },
    explanation: { sl: 'Postrv je sladkovodna riba in glavna sestavina te jedi.', en: 'Trout is a freshwater fish and the main ingredient of this dish.' },
    recipe: 'pecena_postrv'
  },
  {
    id: 'L02', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je glavna sestavina?', en: 'What is the main ingredient?' },
    text: { sl: 'Katera sestavina je glavna v jabolčnem zavitku?', en: 'What is the main ingredient in apple strudel?' },
    img: iImg('jabolka'),
    answers: [{ l: { sl: 'Jabolka', en: 'Apples' }, img: iImg('jabolka'), c: true }, { l: { sl: 'Banana', en: 'Banana' }, img: iImg('banana'), c: false }, { l: { sl: 'Borovnice', en: 'Blueberries' }, img: iImg('borovnice'), c: false }, { l: { sl: 'Slive', en: 'Plums' }, img: iImg('slive'), c: false }],
    hint: { sl: 'Ime jedi ti skoraj pove odgovor.', en: 'The name of the dish almost tells you the answer.' },
    explanation: { sl: 'Jabolka so glavna sestavina jabolčnega zavitka.', en: 'Apples are the main ingredient of apple strudel.' },
    recipe: 'jabolcni_zavitek'
  },
  {
    id: 'L03', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je glavna sestavina?', en: 'What is the main ingredient?' },
    text: { sl: 'Katera sestavina je glavna v fižolovi juhi?', en: 'What is the main ingredient in bean soup?' },
    img: iImg('fižol'),
    answers: [{ l: { sl: 'Fižol', en: 'Beans' }, img: iImg('fižol'), c: true }, { l: { sl: 'Korenje', en: 'Carrot' }, img: iImg('korenje'), c: false }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: false }, { l: { sl: 'Jajca', en: 'Eggs' }, img: iImg('jajca'), c: false }],
    hint: { sl: 'Gre za stročnico, ki jo pogosto namakamo pred kuhanjem.', en: 'It is a legume that we often soak before cooking.' },
    explanation: { sl: 'Fižol je stročnica in osnova fižolove juhe.', en: 'Beans are a legume and the main ingredient of bean soup.' },
    recipe: 'fizolova_juha'
  },
  {
    id: 'L04', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je glavna sestavina?', en: 'What is the main ingredient?' },
    text: { sl: 'Katera sestavina je glavna v bučni juhi?', en: 'What is the main ingredient in pumpkin soup?' },
    img: iImg('buča hokaido'),
    answers: [{ l: { sl: 'Buča hokaido', en: 'Hokaido pumpkin' }, img: iImg('buča hokaido'), c: true }, { l: { sl: 'Zelje', en: 'Cabbage' }, img: iImg('zelje'), c: false }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Paradižnik', en: 'Tomato' }, img: iImg('paradižnik'), c: false }],
    hint: { sl: 'Juha je oranžne barve in je pripravljena iz buče.', en: 'The soup is orange and made from pumpkin.' },
    explanation: { sl: 'Buča hokaido je osnovna sestavina te kremne juhe.', en: 'Hokaido pumpkin is the main ingredient of this creamy soup.' },
    recipe: 'bucna_juha'
  },
  {
    id: 'L05', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je glavna sestavina?', en: 'What is the main ingredient?' },
    text: { sl: 'Katera sestavina je glavna v krompirjevi solati?', en: 'What is the main ingredient in potato salad?' },
    img: iImg('krompir'),
    answers: [{ l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: true }, { l: { sl: 'Ajdova kaša', en: 'Buckwheat' }, img: iImg('ajdova kaša'), c: false }, { l: { sl: 'Skuta', en: 'Cottage cheese' }, img: iImg('skuta'), c: false }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }],
    hint: { sl: 'Sestavina je že v imenu jedi.', en: 'The ingredient is already in the name of the dish.' },
    explanation: { sl: 'Krompir je glavna sestavina krompirjeve solate.', en: 'Potato is the main ingredient of potato salad.' },
    recipe: 'krompirjeva_solata'
  },
  {
    id: 'L06', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je osnova namaza?', en: 'What is the base of the spread?' },
    text: { sl: 'Katera sestavina je osnova skutnega namaza?', en: 'What is the base ingredient of cottage cheese spread?' },
    img: iImg('skuta'),
    answers: [{ l: { sl: 'Skuta', en: 'Cottage cheese' }, img: iImg('skuta'), c: true }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: false }, { l: { sl: 'Sladkor', en: 'Sugar' }, img: iImg('sladkor'), c: false }, { l: { sl: 'Maslo', en: 'Butter' }, img: iImg('maslo'), c: false }],
    hint: { sl: 'Gre za belo mlečno sestavino, ki jo namažemo na kruh.', en: 'It is a white dairy ingredient that we spread on bread.' },
    explanation: { sl: 'Skuta je osnova tega svežega namaza z zelišči.', en: 'Cottage cheese is the base of this fresh herb spread.' },
    recipe: 'skutni_namaz'
  },
  {
    id: 'L07', type: { sl: 'KAJ NE SPADA', en: 'ODD ONE OUT' }, diff: 'easy',
    title: { sl: 'Kaj ne spada zraven?', en: "What doesn't belong?" },
    text: { sl: 'Katera sestavina se NE postreže kot običajna priloga k domačim klobasam?', en: 'Which ingredient is NOT served as a typical side with homemade sausages?' },
    img: iImg('domače klobase'),
    answers: [{ l: { sl: 'Hren', en: 'Horseradish' }, img: iImg('hren'), c: false }, { l: { sl: 'Gorčica', en: 'Mustard' }, img: iImg('gorčica'), c: false }, { l: { sl: 'Svež kruh', en: 'Fresh bread' }, img: iImg('svež kruh'), c: false }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: true }],
    hint: { sl: 'Tri možnosti so običajne priloge h klobasam, ena pa ne spada zraven.', en: 'Three options are typical sides for sausages, one does not belong.' },
    explanation: { sl: 'Mleko ni tipična priloga k klobasam, medtem ko so hren, gorčica in kruh.', en: 'Milk is not a typical side for sausages, whereas horseradish, mustard and bread are.' },
    recipe: 'domace_klobase'
  },
  {
    id: 'L08', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera sestavina osladi?', en: 'Which ingredient sweetens?' },
    text: { sl: 'Katera sestavina naravno osladi pečena jabolka?', en: 'Which ingredient naturally sweetens baked apples?' },
    img: iImg('med'),
    answers: [{ l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: true }, { l: { sl: 'Sol', en: 'Salt' }, img: iImg('sol'), c: false }, { l: { sl: 'Kis', en: 'Vinegar' }, img: iImg('kis'), c: false }, { l: { sl: 'Česen', en: 'Garlic' }, img: iImg('česen'), c: false }],
    hint: { sl: 'To sladilo pridelujejo čebele.', en: 'This sweetener is produced by bees.' },
    explanation: { sl: 'Med je naravno sladilo, ki ga pridelajo čebele.', en: 'Honey is a natural sweetener produced by bees.' },
    recipe: 'pecena_jabolka'
  },
  {
    id: 'L09', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je tekočina?', en: 'What is the liquid?' },
    text: { sl: 'Katera sestavina se uporabi kot tekočina pri proseni kaši?', en: 'Which ingredient is used as the liquid in millet porridge?' },
    img: iImg('mleko'),
    answers: [{ l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: true }, { l: { sl: 'Belo vino', en: 'White wine' }, img: iImg('belo vino'), c: false }, { l: { sl: 'Kis', en: 'Vinegar' }, img: iImg('kis'), c: false }, { l: { sl: 'Olje', en: 'Oil' }, img: iImg('olje'), c: false }],
    hint: { sl: 'Jed je mlečna in primerna za zajtrk.', en: 'The dish is dairy-based and suitable for breakfast.' },
    explanation: { sl: 'Mleko doda proseni kaši kremasto teksturo.', en: 'Milk adds a creamy texture to millet porridge.' },
    recipe: 'prosena_kasa'
  },
  {
    id: 'L10', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je osnova omake?', en: 'What is the base of the sauce?' },
    text: { sl: 'Katera sestavina je osnova omake pri polnjenih paprikah?', en: 'What is the base of the sauce in stuffed peppers?' },
    img: iImg('pasiran paradižnik'),
    answers: [{ l: { sl: 'Pasiran paradižnik', en: 'Strained tomatoes' }, img: iImg('pasiran paradižnik'), c: true }, { l: { sl: 'Bučno olje', en: 'Pumpkin oil' }, img: iImg('bučno olje'), c: false }, { l: { sl: 'Kisla repa', en: 'Sour turnip' }, img: iImg('kisla repa'), c: false }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: false }],
    hint: { sl: 'V imenu jedi se skriva, kakšna omaka spremlja paprike.', en: 'The name of the dish hints at what sauce accompanies the peppers.' },
    explanation: { sl: 'Pasiran paradižnik je osnova omake pri polnjenih paprikah.', en: 'Strained tomatoes are the base of the sauce in stuffed peppers.' },
    recipe: 'polnjene_paprike'
  },
  {
    id: 'L11', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera daje domač okus?', en: 'Which gives a homemade taste?' },
    text: { sl: 'Katera sestavina daje kruhu značilen domač okus?', en: 'Which ingredient gives bread its characteristic homemade taste?' },
    img: iImg('ocvirki'),
    answers: [{ l: { sl: 'Ocvirki', en: 'Cracklings' }, img: iImg('ocvirki'), c: true }, { l: { sl: 'Jabolka', en: 'Apples' }, img: iImg('jabolka'), c: false }, { l: { sl: 'Jogurt', en: 'Yogurt' }, img: iImg('jogurt'), c: false }, { l: { sl: 'Slive', en: 'Plums' }, img: iImg('slive'), c: false }],
    hint: { sl: 'To so hrustljavi koščki, povezani s svinjsko mastjo.', en: 'These are crispy pieces associated with lard.' },
    explanation: { sl: 'Ocvirki so hrustljavi in dajo kruhu bogat domač okus.', en: 'Cracklings are crispy and give bread a rich homemade flavour.' },
    recipe: 'kruh_z_ocvirki'
  },
  {
    id: 'L12', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je tipična priloga?', en: 'What is the typical side dish?' },
    text: { sl: 'Katera sestavina se pri tej jedi postreže s pečenico?', en: 'Which ingredient is served alongside roast pork in this dish?' },
    img: iImg('kislo zelje'),
    answers: [{ l: { sl: 'Kislo zelje', en: 'Sauerkraut' }, img: iImg('kislo zelje'), c: true }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }, { l: { sl: 'Ajdova kaša', en: 'Buckwheat' }, img: iImg('ajdova kaša'), c: false }, { l: { sl: 'Skuta', en: 'Cottage cheese' }, img: iImg('skuta'), c: false }],
    hint: { sl: 'Gre za kisano zelenjavo, pogosto zimsko prilogo.', en: 'It is a fermented vegetable, often a winter side dish.' },
    explanation: { sl: 'Kislo zelje je tipična zimska priloga k pečenici.', en: 'Sauerkraut is a typical winter side dish served with roast pork.' },
    recipe: 'pecenica_s_kislim_zeljem'
  },
  {
    id: 'L13', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera je osnova kaše?', en: 'What is the base of the porridge?' },
    text: { sl: 'Katera sestavina je osnova ovsene kaše?', en: 'What is the base ingredient of oatmeal?' },
    img: iImg('ovseni kosmiči'),
    answers: [{ l: { sl: 'Ovseni kosmiči', en: 'Oat flakes' }, img: iImg('ovseni kosmiči'), c: true }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Zelje', en: 'Cabbage' }, img: iImg('zelje'), c: false }, { l: { sl: 'Klobase', en: 'Sausages' }, img: iImg('klobase'), c: false }],
    hint: { sl: 'Pogosto jih jemo za zajtrk z mlekom ali sadjem.', en: 'We often eat them for breakfast with milk or fruit.' },
    explanation: { sl: 'Ovseni kosmiči so osnova ovsene kaše.', en: 'Oat flakes are the base of oatmeal.' },
    recipe: 'ovsena_kasa'
  },
  {
    id: 'L14', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera naredi nadev sočen?', en: 'Which makes the filling juicy?' },
    text: { sl: 'Katera sestavina naredi nadev v korenčkovi potici bolj sočen?', en: 'Which ingredient makes the filling in carrot potica more juicy?' },
    img: iImg('korenje'),
    answers: [{ l: { sl: 'Korenje', en: 'Carrot' }, img: iImg('korenje'), c: true }, { l: { sl: 'Buča', en: 'Pumpkin' }, img: iImg('buča'), c: false }, { l: { sl: 'Jabolka', en: 'Apples' }, img: iImg('jabolka'), c: false }, { l: { sl: 'Slive', en: 'Plums' }, img: iImg('slive'), c: false }],
    hint: { sl: 'Ime potice ti pomaga najti odgovor.', en: 'The name of the potica helps you find the answer.' },
    explanation: { sl: 'Korenje naredi nadev v korenčkovi potici sočen in sladkast.', en: 'Carrot makes the filling in carrot potica juicy and slightly sweet.' },
    recipe: 'korenckova_potica'
  },
  {
    id: 'L15', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'easy',
    title: { sl: 'Katera se skuha v trdo?', en: 'Which is hard-boiled?' },
    text: { sl: 'Katera sestavina se v tej jedi skuha v trdo?', en: 'Which ingredient is hard-boiled in this dish?' },
    img: iImg('jajca'),
    answers: [{ l: { sl: 'Jajca', en: 'Eggs' }, img: iImg('jajca'), c: true }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Riž', en: 'Rice' }, img: iImg('riž'), c: false }, { l: { sl: 'Buča', en: 'Pumpkin' }, img: iImg('buča'), c: false }],
    hint: { sl: 'Običajno jih olupimo in prerežemo.', en: 'We usually peel and cut them in half.' },
    explanation: { sl: 'Jajca se skuhajo v trdo in so tipična sestavina h klobasam s hrenom.', en: 'Eggs are hard-boiled and a typical accompaniment to sausages with horseradish.' },
    recipe: 'domace_klobase_s_hrenom'
  },

  // ===== MEDIUM =====
  {
    id: 'M01', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je žitna osnova?', en: 'What is the grain base?' },
    text: { sl: 'Katera sestavina je značilna žitna osnova ričeta?', en: 'What is the characteristic grain base of ričet stew?' },
    img: iImg('ješprenj'),
    answers: [{ l: { sl: 'Ješprenj', en: 'Pearl barley' }, img: iImg('ješprenj'), c: true }, { l: { sl: 'Prosena kaša', en: 'Millet' }, img: iImg('prosena kaša'), c: false }, { l: { sl: 'Riž', en: 'Rice' }, img: iImg('riž'), c: false }, { l: { sl: 'Ovseni kosmiči', en: 'Oat flakes' }, img: iImg('ovseni kosmiči'), c: false }],
    hint: { sl: 'Gre za oluščen ječmen, ki se uporablja v enolončnicah.', en: 'It is hulled barley used in one-pot stews.' },
    explanation: { sl: 'Ješprenj je oluščen ječmen in žitna osnova ričeta.', en: 'Pearl barley is hulled barley and the grain base of ričet stew.' },
    recipe: 'ricet'
  },
  {
    id: 'M02', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je skupaj s krompirjem?', en: 'What goes alongside potato?' },
    text: { sl: 'Katera sestavina je skupaj s krompirjem glavna v matevžu?', en: 'Which ingredient is the main one alongside potato in matevž?' },
    img: iImg('fižol'),
    answers: [{ l: { sl: 'Fižol', en: 'Beans' }, img: iImg('fižol'), c: true }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }, { l: { sl: 'Ajdova moka', en: 'Buckwheat flour' }, img: iImg('ajdova moka'), c: false }, { l: { sl: 'Zelje', en: 'Cabbage' }, img: iImg('zelje'), c: false }],
    hint: { sl: 'Matevž je pretlačena domača jed iz dveh nasitnih sestavin.', en: 'Matevž is a mashed homemade dish made from two filling ingredients.' },
    explanation: { sl: 'Matevž je pretlačen fižol s krompirjem, tipična slovenska jed.', en: 'Matevž is mashed beans with potato, a typical Slovenian dish.' },
    recipe: 'matevz'
  },
  {
    id: 'M03', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera dá gozdni okus?', en: 'Which gives a forest flavour?' },
    text: { sl: 'Katera sestavina daje ajdovi kaši z gobami izrazit gozdni okus?', en: 'Which ingredient gives buckwheat with mushrooms its distinct forest flavour?' },
    img: iImg('sveže gobe'),
    answers: [{ l: { sl: 'Sveže gobe', en: 'Fresh mushrooms' }, img: iImg('sveže gobe'), c: true }, { l: { sl: 'Panceta', en: 'Pancetta' }, img: iImg('panceta'), c: false }, { l: { sl: 'Korenje', en: 'Carrot' }, img: iImg('korenje'), c: false }, { l: { sl: 'Por', en: 'Leek' }, img: iImg('por'), c: false }],
    hint: { sl: 'Iščemo sestavino, ki je povezana z gozdom in jurčki.', en: 'We are looking for an ingredient associated with the forest and porcini.' },
    explanation: { sl: 'Sveže gobe dajejo ajdovi kaši intenziven, gozdni okus.', en: 'Fresh mushrooms give buckwheat its intense, forest flavour.' },
    recipe: 'ajdova_kasa_z_gobami'
  },
  {
    id: 'M04', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera dá lokalno noto?', en: 'Which gives a local character?' },
    text: { sl: 'Katera sestavina daje golažu lokalno dolenjsko noto?', en: 'Which ingredient gives the goulash a local Dolenjska character?' },
    img: iImg('cviček'),
    answers: [{ l: { sl: 'Cviček', en: 'Cviček wine' }, img: iImg('cviček'), c: true }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: false }, { l: { sl: 'Kis', en: 'Vinegar' }, img: iImg('kis'), c: false }, { l: { sl: 'Olje', en: 'Oil' }, img: iImg('olje'), c: false }],
    hint: { sl: 'Gre za lokalno vino, povezano z Dolenjsko.', en: 'It is a local wine associated with the Dolenjska region.' },
    explanation: { sl: 'Cviček je lokalno dolenjsko vino, ki golažu doda posebno aromo.', en: 'Cviček is a local Dolenjska wine that adds a special aroma to goulash.' },
    recipe: 'goveji_golaz'
  },
  {
    id: 'M05', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera se zmeša s krompirjem?', en: 'Which is mixed with potato?' },
    text: { sl: 'Katera sestavina se pri krompirjevih žgancih zmeša s krompirjem?', en: 'Which ingredient is mixed with potato in potato žganci?' },
    img: iImg('moka'),
    answers: [{ l: { sl: 'Moka', en: 'Flour' }, img: iImg('moka'), c: true }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }, { l: { sl: 'Jogurt', en: 'Yogurt' }, img: iImg('jogurt'), c: false }, { l: { sl: 'Paradižnik', en: 'Tomato' }, img: iImg('paradižnik'), c: false }],
    hint: { sl: 'Iz nje nastane gosta masa za žgance.', en: 'It creates the thick dough for žganci.' },
    explanation: { sl: 'Moka se zmeša s krompirjem in naredi gosto maso za žgance.', en: 'Flour is mixed with potato to create the thick dough for žganci.' },
    recipe: 'krompirjevi_zganci'
  },
  {
    id: 'M06', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera dá svežost?', en: 'Which adds freshness?' },
    text: { sl: 'Katera sestavina se pri pečeni postrvi uporabi za svež okus?', en: 'Which ingredient is used to give baked trout a fresh taste?' },
    img: iImg('limona'),
    answers: [{ l: { sl: 'Limona', en: 'Lemon' }, img: iImg('limona'), c: true }, { l: { sl: 'Cimet', en: 'Cinnamon' }, img: iImg('cimet'), c: false }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: false }],
    hint: { sl: 'Riba se pogosto pokapa ali obloži z njo.', en: 'The fish is often drizzled with or laid on top of it.' },
    explanation: { sl: 'Limona doda pečeni postrvi svež, kisel okus.', en: 'Lemon adds a fresh, tart taste to baked trout.' },
    recipe: 'pecena_postrv'
  },
  {
    id: 'M07', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera se poveže z bučo?', en: 'Which is combined with pumpkin?' },
    text: { sl: 'Katera sestavina se v nadevu poveže z bučo?', en: 'Which ingredient is combined with pumpkin in the filling?' },
    img: iImg('skuta'),
    answers: [{ l: { sl: 'Skuta', en: 'Cottage cheese' }, img: iImg('skuta'), c: true }, { l: { sl: 'Mleto meso', en: 'Minced meat' }, img: iImg('mleto meso'), c: false }, { l: { sl: 'Fižol', en: 'Beans' }, img: iImg('fižol'), c: false }, { l: { sl: 'Kvas', en: 'Yeast' }, img: iImg('kvas'), c: false }],
    hint: { sl: 'Nadev je bučno-mlečen in kremast.', en: 'The filling is pumpkin-dairy and creamy.' },
    explanation: { sl: 'Skuta se poveže z bučo in naredi kremast nadev za zavitek.', en: 'Cottage cheese is combined with pumpkin to make a creamy strudel filling.' },
    recipe: 'bucni_zavitek'
  },
  {
    id: 'M08', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera doda sladkobo?', en: 'Which adds sweetness?' },
    text: { sl: 'Katera sestavina rdečemu zelju doda naravno sladkobo?', en: 'Which ingredient adds natural sweetness to red cabbage?' },
    img: iImg('jabolka'),
    answers: [{ l: { sl: 'Jabolka', en: 'Apples' }, img: iImg('jabolka'), c: true }, { l: { sl: 'Česen', en: 'Garlic' }, img: iImg('česen'), c: false }, { l: { sl: 'Sol', en: 'Salt' }, img: iImg('sol'), c: false }, { l: { sl: 'Kis', en: 'Vinegar' }, img: iImg('kis'), c: false }],
    hint: { sl: 'Gre za sadje, ki se pogosto uporablja pri rdečem zelju.', en: 'It is a fruit often used with red cabbage.' },
    explanation: { sl: 'Jabolka dodajo rdečemu zelju naravno sladkobo in svežino.', en: 'Apples add natural sweetness and freshness to red cabbage.' },
    recipe: 'duseno_rdece_zelje'
  },
  {
    id: 'M09', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je osnova polpetov?', en: 'What is the base of the patties?' },
    text: { sl: 'Katera sestavina je skupaj s krompirjem osnova teh polpetov?', en: 'Which ingredient is the base of these patties alongside potato?' },
    img: iImg('bučke'),
    answers: [{ l: { sl: 'Bučke', en: 'Zucchini' }, img: iImg('bučke'), c: true }, { l: { sl: 'Fižol', en: 'Beans' }, img: iImg('fižol'), c: false }, { l: { sl: 'Mleko', en: 'Milk' }, img: iImg('mleko'), c: false }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }],
    hint: { sl: 'Sestavina se nariba in zmeša s krompirjem.', en: 'The ingredient is grated and mixed with potato.' },
    explanation: { sl: 'Bučke se naribo in zmešajo s krompirjem za osnovo polpetov.', en: 'Zucchini is grated and mixed with potato to form the base of the patties.' },
    recipe: 'polpeti_iz_bucki'
  },
  {
    id: 'M10', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je v nadevu?', en: 'What is in the filling?' },
    text: { sl: 'Katera sestavina je glavna v nadevu skutnih štrukljev?', en: 'What is the main ingredient in the filling of cottage cheese štruklji?' },
    img: iImg('skuta'),
    answers: [{ l: { sl: 'Skuta', en: 'Cottage cheese' }, img: iImg('skuta'), c: true }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Postrv', en: 'Trout' }, img: iImg('postrv'), c: false }, { l: { sl: 'Riž', en: 'Rice' }, img: iImg('riž'), c: false }],
    hint: { sl: 'Ime jedi ti pove, kateri nadev je najpomembnejši.', en: 'The name of the dish tells you which filling is most important.' },
    explanation: { sl: 'Skuta je osnovna sestavina nadeva pri skutnih štrukljih.', en: 'Cottage cheese is the main filling ingredient in cottage cheese štruklji.' },
    recipe: 'skutni_struklji'
  },
  {
    id: 'M11', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera doda topel vonj?', en: 'Which adds a warm scent?' },
    text: { sl: 'Katera sestavina kompotu doda topel sladek vonj?', en: 'Which ingredient adds a warm, sweet scent to the compote?' },
    img: iImg('cimet'),
    answers: [{ l: { sl: 'Cimet', en: 'Cinnamon' }, img: iImg('cimet'), c: true }, { l: { sl: 'Kumina', en: 'Cumin' }, img: iImg('kumina'), c: false }, { l: { sl: 'Česen', en: 'Garlic' }, img: iImg('česen'), c: false }, { l: { sl: 'Drobnjak', en: 'Chives' }, img: iImg('drobnjak'), c: false }],
    hint: { sl: 'Pogosto ga dodajamo jabolčnim sladicam.', en: 'We often add it to apple desserts.' },
    explanation: { sl: 'Cimet doda kompotu topel, sladkast vonj in okus.', en: 'Cinnamon adds a warm, sweet scent and flavour to the compote.' },
    recipe: 'jabolcni_kompot'
  },
  {
    id: 'M12', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je zelenjavni del?', en: 'What is the vegetable part?' },
    text: { sl: 'Katera sestavina iz seznama najbolj ustreza zelenjavnemu delu obare?', en: 'Which ingredient from the list best represents the vegetable part of the stew?' },
    img: iImg('jušna zelenjava'),
    answers: [{ l: { sl: 'Jušna zelenjava', en: 'Soup vegetables' }, img: iImg('jušna zelenjava'), c: true }, { l: { sl: 'Borovnice', en: 'Blueberries' }, img: iImg('borovnice'), c: false }, { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }, { l: { sl: 'Bučno olje', en: 'Pumpkin oil' }, img: iImg('bučno olje'), c: false }],
    hint: { sl: 'Obaro pripravimo z mesom in zelenjavnim delom.', en: 'The stew is made with meat and a vegetable part.' },
    explanation: { sl: 'Jušna zelenjava je zelenjavni del obare in doda jedi okus.', en: 'Soup vegetables are the vegetable part of the stew and add flavour.' },
    recipe: 'telecja_obara'
  },
  {
    id: 'M13', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je osnova cmoka?', en: 'What is the base of the dumpling?' },
    text: { sl: 'Katera sestavina, najbolje starejša oziroma suha, je osnova za kruhove cmoke?', en: 'Which ingredient, ideally older or dried, is the base for bread dumplings?' },
    img: iImg('kruh'),
    answers: [{ l: { sl: 'Kruh', en: 'Bread' }, img: iImg('kruh'), c: true }, { l: { sl: 'Slive', en: 'Plums' }, img: iImg('slive'), c: false }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Krap', en: 'Carp' }, img: iImg('krap'), c: false }],
    hint: { sl: 'To je dober način uporabe kruha, ki je ostal.', en: 'It is a good way to use leftover bread.' },
    explanation: { sl: 'Kruh, predvsem starejši, je osnova za kruhove cmoke.', en: 'Bread, especially older bread, is the base for bread dumplings.' },
    recipe: 'kruhovi_cmoki'
  },
  {
    id: 'M14', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je mlečna osnova?', en: 'What is the dairy base?' },
    text: { sl: 'Katera sestavina je mlečna osnova jogurtove strjenke?', en: 'What is the dairy base of yogurt panna cotta?' },
    img: iImg('jogurt'),
    answers: [{ l: { sl: 'Jogurt', en: 'Yogurt' }, img: iImg('jogurt'), c: true }, { l: { sl: 'Čebula', en: 'Onion' }, img: iImg('čebula'), c: false }, { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false }, { l: { sl: 'Postrv', en: 'Trout' }, img: iImg('postrv'), c: false }],
    hint: { sl: 'Ime sladice ti pomaga najti odgovor.', en: 'The name of the dessert helps you find the answer.' },
    explanation: { sl: 'Jogurt je mlečna osnova strjenke in ji dá svežo kiselkastost.', en: 'Yogurt is the dairy base of the panna cotta and gives it a fresh tanginess.' },
    recipe: 'jogurtova_strjenka'
  },
  {
    id: 'M15', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'medium',
    title: { sl: 'Katera je glavna v obari?', en: 'What is the main ingredient in the stew?' },
    text: { sl: 'Katera sestavina je glavna v zajčji obari?', en: 'What is the main ingredient in rabbit stew?' },
    img: iImg('zajčje meso'),
    answers: [{ l: { sl: 'Zajčje meso', en: 'Rabbit meat' }, img: iImg('zajčje meso'), c: true }, { l: { sl: 'Piščančje meso', en: 'Chicken meat' }, img: iImg('piščančje meso'), c: false }, { l: { sl: 'Goveje meso', en: 'Beef' }, img: iImg('goveje meso'), c: false }, { l: { sl: 'Krap', en: 'Carp' }, img: iImg('krap'), c: false }],
    hint: { sl: 'Ime jedi pove, katero meso uporabimo.', en: 'The name of the dish tells you which meat to use.' },
    explanation: { sl: 'Zajčje meso je glavna sestavina zajčje obare.', en: 'Rabbit meat is the main ingredient of rabbit stew.' },
    recipe: 'zajcja_obara'
  },

  // ===== HARD =====
  {
    id: 'T01', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katero namočimo pred kuhanjem?', en: 'Which do we soak before cooking?' },
    text: { sl: 'Katero sestavino pri fižolovi juhi običajno namočimo pred kuhanjem?', en: 'Which ingredient in bean soup do we usually soak before cooking?' },
    img: iImg('suh fižol'),
    answers: [{ l: { sl: 'Suh fižol', en: 'Dried beans' }, img: iImg('suh fižol'), c: true }, { l: { sl: 'Ješprenj', en: 'Pearl barley' }, img: iImg('ješprenj'), c: false }, { l: { sl: 'Ajdova kaša', en: 'Buckwheat' }, img: iImg('ajdova kaša'), c: false }, { l: { sl: 'Prosena kaša', en: 'Millet' }, img: iImg('prosena kaša'), c: false }],
    hint: { sl: 'Suha stročnica se tako hitreje skuha.', en: 'The dried legume cooks faster this way.' },
    explanation: { sl: 'Suh fižol namočimo, da se hitreje skuha in je lažje prebavljiv.', en: 'Dried beans are soaked so they cook faster and are easier to digest.' },
    recipe: 'fizolova_juha'
  },
  {
    id: 'T02', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katero najprej poparimo?', en: 'Which do we scald first?' },
    text: { sl: 'Katero sestavino pri ajdovem kruhu najprej poparimo?', en: 'Which ingredient in buckwheat bread do we scald first?' },
    img: iImg('ajdova moka'),
    answers: [{ l: { sl: 'Ajdova moka', en: 'Buckwheat flour' }, img: iImg('ajdova moka'), c: true }, { l: { sl: 'Koruzna moka', en: 'Corn flour' }, img: iImg('koruzna moka'), c: false }, { l: { sl: 'Pšenična moka', en: 'Wheat flour' }, img: iImg('pšenična moka'), c: false }, { l: { sl: 'Ržena moka', en: 'Rye flour' }, img: iImg('ržena moka'), c: false }],
    hint: { sl: 'To je moka z izrazitim domačim okusom.', en: 'This flour has a distinctive homemade taste.' },
    explanation: { sl: 'Ajdova moka se popari za boljšo teksturo in okus domačega kruha.', en: 'Buckwheat flour is scalded for better texture and flavour of the bread.' },
    recipe: 'domaci_ajdov_kruh'
  },
  {
    id: 'T03', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je nežna med peko?', en: 'Which is delicate during baking?' },
    text: { sl: 'Katera sestavina je nežna in jo moramo med peko previdno obračati?', en: 'Which ingredient is delicate and must be carefully turned during baking?' },
    img: iImg('postrv'),
    answers: [{ l: { sl: 'Postrv', en: 'Trout' }, img: iImg('postrv'), c: true }, { l: { sl: 'Krap', en: 'Carp' }, img: iImg('krap'), c: false }, { l: { sl: 'Piščančje meso', en: 'Chicken meat' }, img: iImg('piščančje meso'), c: false }, { l: { sl: 'Zajčje meso', en: 'Rabbit meat' }, img: iImg('zajčje meso'), c: false }],
    hint: { sl: 'Gre za ribo, ki se lahko hitro raztrga.', en: 'It is a fish that can easily fall apart.' },
    explanation: { sl: 'Postrv je nežna riba, ki jo med peko previdno obračamo.', en: 'Trout is a delicate fish that must be carefully turned during baking.' },
    recipe: 'pecena_postrv'
  },
  {
    id: 'T04', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je ovoj za nadev?', en: 'Which serves as a wrapper?' },
    text: { sl: 'Katera sestavina pri sarmi služi kot ovoj za nadev?', en: 'Which ingredient in sarma serves as a wrapper for the filling?' },
    img: iImg('kislo zelje'),
    answers: [{ l: { sl: 'Kislo zelje', en: 'Sauerkraut' }, img: iImg('kislo zelje'), c: true }, { l: { sl: 'Mleta rdeča paprika', en: 'Ground red pepper' }, img: iImg('mleta rdeča paprika'), c: false }, { l: { sl: 'Vlečeno testo', en: 'Pulled dough' }, img: iImg('vlečeno testo'), c: false }, { l: { sl: 'Bučke', en: 'Zucchini' }, img: iImg('bučke'), c: false }],
    hint: { sl: 'Pri tej jedi nadev zavijemo v liste.', en: 'In this dish we wrap the filling in leaves.' },
    explanation: { sl: 'Listi kislega zelja se uporabijo kot ovoj za nadev pri sarmi.', en: 'Sauerkraut leaves are used as a wrapper for the filling in sarma.' },
    recipe: 'sarma'
  },
  {
    id: 'T05', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera se napne med kuhanjem?', en: 'Which expands during cooking?' },
    text: { sl: 'Katera sestavina se v nadevu med kuhanjem napne, zato paprik ne napolnimo do vrha?', en: 'Which ingredient in the filling expands during cooking, so we do not fill the peppers to the top?' },
    img: iImg('riž'),
    answers: [{ l: { sl: 'Riž', en: 'Rice' }, img: iImg('riž'), c: true }, { l: { sl: 'Ješprenj', en: 'Pearl barley' }, img: iImg('ješprenj'), c: false }, { l: { sl: 'Prosena kaša', en: 'Millet' }, img: iImg('prosena kaša'), c: false }, { l: { sl: 'Ajdova kaša', en: 'Buckwheat' }, img: iImg('ajdova kaša'), c: false }],
    hint: { sl: 'Pri kuhanju vpije tekočino in poveča volumen.', en: 'During cooking it absorbs liquid and increases in volume.' },
    explanation: { sl: 'Riž se pri kuhanju napne in poveča volumen nadeva.', en: 'Rice expands during cooking and increases the volume of the filling.' },
    recipe: 'polnjene_paprike'
  },
  {
    id: 'T06', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katero pražimo, da porjavi?', en: 'Which do we toast until browned?' },
    text: { sl: 'Katero sestavino pri prežganki pražimo, da porjavi, vendar se ne zažge?', en: 'Which ingredient in prežganka do we toast until browned but not burnt?' },
    img: iImg('moka'),
    answers: [{ l: { sl: 'Moka', en: 'Flour' }, img: iImg('moka'), c: true }, { l: { sl: 'Drobtine', en: 'Breadcrumbs' }, img: iImg('drobtine'), c: false }, { l: { sl: 'Pšenični zdrob', en: 'Wheat semolina' }, img: iImg('pšenični zdrob'), c: false }, { l: { sl: 'Koruzni zdrob / polenta', en: 'Cornmeal / polenta' }, img: iImg('koruzni zdrob / polenta'), c: false }],
    hint: { sl: 'Če se zažge, je juha grenka.', en: 'If it burns, the soup becomes bitter.' },
    explanation: { sl: 'Moka se praži do zlato rjave barve in je osnova prežganke.', en: 'Flour is toasted to golden brown and is the base of prežganka soup.' },
    recipe: 'prezganka'
  },
  {
    id: 'T07', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je osnova žgancev?', en: 'What is the base of žganci?' },
    text: { sl: 'Katera sestavina je glavna osnova ajdovih žgancev?', en: 'What is the main base of buckwheat žganci?' },
    img: iImg('ajdova moka'),
    answers: [{ l: { sl: 'Ajdova moka', en: 'Buckwheat flour' }, img: iImg('ajdova moka'), c: true }, { l: { sl: 'Koruzna moka', en: 'Corn flour' }, img: iImg('koruzna moka'), c: false }, { l: { sl: 'Bela moka', en: 'White flour' }, img: iImg('bela moka'), c: false }, { l: { sl: 'Pšenična moka', en: 'Wheat flour' }, img: iImg('pšenična moka'), c: false }],
    hint: { sl: 'Iz nje nastanejo značilni domači žganci.', en: 'It is used to make the characteristic homemade žganci.' },
    explanation: { sl: 'Ajdova moka je osnova ajdovih žgancev, tipične slovenske jedi.', en: 'Buckwheat flour is the base of buckwheat žganci, a typical Slovenian dish.' },
    recipe: 'ajdovi_zganci'
  },
  {
    id: 'T08', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera se marinira pred peko?', en: 'Which is marinated before baking?' },
    text: { sl: 'Katera sestavina se pred peko marinira z limono, česnom in začimbami?', en: 'Which ingredient is marinated with lemon, garlic and spices before baking?' },
    img: iImg('krap'),
    answers: [{ l: { sl: 'Krap', en: 'Carp' }, img: iImg('krap'), c: true }, { l: { sl: 'Postrv', en: 'Trout' }, img: iImg('postrv'), c: false }, { l: { sl: 'Goveje meso', en: 'Beef' }, img: iImg('goveje meso'), c: false }, { l: { sl: 'Piščančje meso', en: 'Chicken meat' }, img: iImg('piščančje meso'), c: false }],
    hint: { sl: 'Gre za sladkovodno ribo.', en: 'It is a freshwater fish.' },
    explanation: { sl: 'Krap se pred peko marinira za boljši okus in mehkobo.', en: 'Carp is marinated before baking for better flavour and tenderness.' },
    recipe: 'krap_s_krompirjem'
  },
  {
    id: 'T09', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je mesni del juhe?', en: 'What is the meat part of the soup?' },
    text: { sl: 'Katera sestavina je mesni del, ki se kuha v goveji juhi?', en: 'Which ingredient is the meat component cooked in beef soup?' },
    img: iImg('goveje meso'),
    answers: [{ l: { sl: 'Goveje meso', en: 'Beef' }, img: iImg('goveje meso'), c: true }, { l: { sl: 'Piščančje meso', en: 'Chicken meat' }, img: iImg('piščančje meso'), c: false }, { l: { sl: 'Zajčje meso', en: 'Rabbit meat' }, img: iImg('zajčje meso'), c: false }, { l: { sl: 'Svinjski vrat', en: 'Pork neck' }, img: iImg('svinjski vrat'), c: false }],
    hint: { sl: 'Ime juhe ti pomaga najti odgovor.', en: 'The name of the soup helps you find the answer.' },
    explanation: { sl: 'Goveje meso je mesni del goveje juhe z domačimi rezanci.', en: 'Beef is the meat component of beef soup with homemade noodles.' },
    recipe: 'goveja_juha'
  },
  {
    id: 'T10', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera se mora ohladiti?', en: 'Which must cool down first?' },
    text: { sl: 'Katera sestavina se mora pred dodajanjem jajc nekoliko ohladiti?', en: 'Which ingredient must cool down a little before eggs are added?' },
    img: iImg('prosena kaša'),
    answers: [{ l: { sl: 'Prosena kaša', en: 'Millet porridge' }, img: iImg('prosena kaša'), c: true }, { l: { sl: 'Ajdova kaša', en: 'Buckwheat porridge' }, img: iImg('ajdova kaša'), c: false }, { l: { sl: 'Ovseni kosmiči', en: 'Oat flakes' }, img: iImg('ovseni kosmiči'), c: false }, { l: { sl: 'Ješprenj', en: 'Pearl barley' }, img: iImg('ješprenj'), c: false }],
    hint: { sl: 'Če je prevroča, se jajca lahko prehitro zakrknejo.', en: 'If it is too hot, the eggs can scramble too quickly.' },
    explanation: { sl: 'Prosena kaša se mora ohladiti, da se jajca ne zakrknejo pri dodajanju.', en: 'Millet porridge must cool so the eggs do not scramble when added.' },
    recipe: 'pecena_prosena_kasa'
  },
  {
    id: 'T11', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katero je lažje vmešati zmehčano?', en: 'Which is easier to mix when softened?' },
    text: { sl: 'Katero sestavino je lažje vmešati, če jo najprej nežno zmehčamo?', en: 'Which ingredient is easier to mix in if we first gently soften it?' },
    img: iImg('med'),
    answers: [{ l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: true }, { l: { sl: 'Sladkor', en: 'Sugar' }, img: iImg('sladkor'), c: false }, { l: { sl: 'Sladilo', en: 'Sweetener' }, img: iImg('sladilo'), c: false }, { l: { sl: 'Vanilija', en: 'Vanilla' }, img: iImg('vanilija'), c: false }],
    hint: { sl: 'Če je trda, se težje enakomerno poveže z jogurtom.', en: 'If it is hard, it is more difficult to mix evenly with yogurt.' },
    explanation: { sl: 'Med zmehčamo, da ga lažje enakomerno vmešamo v jogurtovo strjenko.', en: 'Honey is softened so it can be mixed evenly into the yogurt panna cotta.' },
    recipe: 'jogurtova_strjenka'
  },
  {
    id: 'T12', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katero nadomestimo pri otroški različici?', en: 'Which do we replace for children?' },
    text: { sl: 'Katero sestavino lahko pri otroški različici nadomestimo z vodo ali jušno osnovo?', en: 'Which ingredient can be replaced with water or stock in the children\'s version?' },
    img: iImg('rdeče vino'),
    answers: [{ l: { sl: 'Rdeče vino', en: 'Red wine' }, img: iImg('rdeče vino'), c: true }, { l: { sl: 'Belo vino', en: 'White wine' }, img: iImg('belo vino'), c: false }, { l: { sl: 'Beli vinski kis', en: 'White wine vinegar' }, img: iImg('beli vinski kis'), c: false }, { l: { sl: 'Olje', en: 'Oil' }, img: iImg('olje'), c: false }],
    hint: { sl: 'Pri otrocih se alkoholna sestavina raje izpusti.', en: 'For children, the alcoholic ingredient is preferably omitted.' },
    explanation: { sl: 'Rdeče vino se v otroški različici nadomesti z vodo ali jušno osnovo.', en: 'Red wine is replaced with water or stock in the children\'s version.' },
    recipe: 'duseno_rdece_zelje'
  },
  {
    id: 'T13', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je osnova testa?', en: 'What is the base of the dough?' },
    text: { sl: 'Katera sestavina je osnova testa za domače mlince?', en: 'What is the base ingredient of the dough for homemade mlinci?' },
    img: iImg('moka'),
    answers: [{ l: { sl: 'Moka', en: 'Flour' }, img: iImg('moka'), c: true }, { l: { sl: 'Drobtine', en: 'Breadcrumbs' }, img: iImg('drobtine'), c: false }, { l: { sl: 'Pšenični zdrob', en: 'Wheat semolina' }, img: iImg('pšenični zdrob'), c: false }, { l: { sl: 'Koruzni zdrob / polenta', en: 'Cornmeal / polenta' }, img: iImg('koruzni zdrob / polenta'), c: false }],
    hint: { sl: 'Iz nje zamesimo testo, ki ga razvaljamo in spečemo.', en: 'We knead it into dough that we roll out and bake.' },
    explanation: { sl: 'Moka je osnova testa za mlince, ki jih razvaljamo in spečemo.', en: 'Flour is the base of mlinci dough that is rolled out and baked.' },
    recipe: 'domaci_mlinci'
  },
  {
    id: 'T14', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je mlečna osnova namaza?', en: 'What is the dairy base of the spread?' },
    text: { sl: 'Katera sestavina se v namazu pretlači kot glavna mlečna osnova?', en: 'Which ingredient is mashed as the main dairy base of the spread?' },
    img: iImg('skuta'),
    answers: [{ l: { sl: 'Skuta', en: 'Cottage cheese' }, img: iImg('skuta'), c: true }, { l: { sl: 'Jogurt', en: 'Yogurt' }, img: iImg('jogurt'), c: false }, { l: { sl: 'Kisla smetana', en: 'Sour cream' }, img: iImg('kisla smetana'), c: false }, { l: { sl: 'Sir', en: 'Cheese' }, img: iImg('sir'), c: false }],
    hint: { sl: 'Namaz je pripravljen zelo hitro in se namaže na kruh.', en: 'The spread is prepared very quickly and spread on bread.' },
    explanation: { sl: 'Skuta je pretlačena mlečna osnova skutnega namaza z zelišči.', en: 'Cottage cheese is the mashed dairy base of the herb cottage cheese spread.' },
    recipe: 'skutni_namaz'
  },
  {
    id: 'T15', type: { sl: 'RECEPT', en: 'RECIPE' }, diff: 'hard',
    title: { sl: 'Katera je mesna osnova nadeva?', en: 'What is the meat base of the filling?' },
    text: { sl: 'Katera sestavina je mesna osnova nadeva za polnjene paprike?', en: 'Which ingredient is the meat base of the filling for stuffed peppers?' },
    img: iImg('mleto meso'),
    answers: [{ l: { sl: 'Mleto meso', en: 'Minced meat' }, img: iImg('mleto meso'), c: true }, { l: { sl: 'Goveje meso', en: 'Beef' }, img: iImg('goveje meso'), c: false }, { l: { sl: 'Piščančje meso', en: 'Chicken meat' }, img: iImg('piščančje meso'), c: false }, { l: { sl: 'Zajčje meso', en: 'Rabbit meat' }, img: iImg('zajčje meso'), c: false }],
    hint: { sl: 'Nadev mora biti dovolj droben, da z njim napolnimo paprike.', en: 'The filling must be fine enough to fill the peppers.' },
    explanation: { sl: 'Mleto meso je mesna osnova nadeva za polnjene paprike.', en: 'Minced meat is the meat base of the filling for stuffed peppers.' },
    recipe: 'polnjene_paprike'
  }
];

const DETECTIVE_EXTRA_ANSWERS = [
  { l: { sl: 'Korenje', en: 'Carrot' }, img: iImg('korenje'), c: false },
  { l: { sl: 'Jabolko', en: 'Apple' }, img: iImg('jabolka'), c: false },
  { l: { sl: 'Jagode', en: 'Strawberries' }, img: iImg('jagode'), c: false },
  { l: { sl: 'Krompir', en: 'Potato' }, img: iImg('krompir'), c: false },
  { l: { sl: 'Kislo zelje', en: 'Sauerkraut' }, img: iImg('kislo zelje'), c: false },
  { l: { sl: 'Med', en: 'Honey' }, img: iImg('med'), c: false }
];

// ---------------------------------------------------------------------------
// Module-level game state (lives outside React-style render cycle)
// ---------------------------------------------------------------------------
let _gameState = null;   // active game runtime state
let _timerInt = null;   // setInterval handle
let _toastTimer = null;  // toast hide timer
let _dragData = null;   // current drag payload
let _dragActive = false;
let _dropSlotTarget = null;
let _rootEl = null;      // bound DOM root
let _boundRoot = null;
let _boundPointerHandler = null;
let _lastPuzzleScenarioId = null;
let _lastPicturePuzzleSource = null;
let _lastDetectiveQuestionIds = [];
let _puzzleStartToken = 0;
const _lastPuzzlePrePlaceKeys = new Map();
const PICTURE_PUZZLE_GRIDS = {
  easy: { rows: 3, cols: 3 },
  medium: { rows: 3, cols: 3 },
  hard: { rows: 4, cols: 4 }
};
const PICTURE_PUZZLE_CELL_PX = 180;
const PICTURE_PUZZLE_ASPECT = 338 / 410;
const FARM_TO_PLATE_PUZZLE_IMAGES = Array.from(
  { length: 50 },
  (_, index) => `../assets/images/games/farm-to-plate-puzzle/farm-to-plate-${String(index + 1).padStart(2, '0')}.png`
);

function _gl(locale) { return GL[locale] || GL.sl; }
function _lv(obj, locale) { return obj[locale] || obj.sl; }

let _ingredientByName = new Map();

const DETECTIVE_INGREDIENT_ALIASES = new Map([
  ['jabolko', 'jabolka'],
  ['solata', 'kislo zelje']
]);

function _ingredientLookupKey(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function _rememberGameIngredients(state) {
  const groups = state && state.ingredientsByCategory ? Object.values(state.ingredientsByCategory) : [];
  const ingredients = groups.flat().filter(Boolean);

  _ingredientByName = ingredients.reduce((byName, ingredient) => {
    const name = ingredient.name_sl || ingredient.name;
    const key = _ingredientLookupKey(name);

    if (key && !byName.has(key)) {
      byName.set(key, ingredient);
    }

    return byName;
  }, new Map());
}

function _ingredientPageImageSrc(name, fallbackSrc = '') {
  const key = _ingredientLookupKey(name);
  const alias = DETECTIVE_INGREDIENT_ALIASES.get(key);
  const ingredient = _ingredientByName.get(key) || _ingredientByName.get(_ingredientLookupKey(alias));

  if (ingredient) {
    return iImg(ingredient);
  }

  return iImg(alias || name) || fallbackSrc;
}

function _detectiveAnswerImageSrc(answer) {
  return _ingredientPageImageSrc(answer.ingredientName || _lv(answer.l, 'sl'), answer.img);
}

function _detectiveQuestionImageSrc(question) {
  const correctAnswer = question.answers.find((answer) => answer.c) || question.answers[0];
  return correctAnswer ? _detectiveAnswerImageSrc(correctAnswer) : question.img;
}

function _puzzleGrid(sc) {
  const grid = sc && sc.grid ? sc.grid : null;
  return {
    rows: Math.max(1, parseInt(grid && grid.rows, 10) || 3),
    cols: Math.max(1, parseInt(grid && grid.cols, 10) || 3)
  };
}

function _puzzleTotal(sc) {
  const grid = _puzzleGrid(sc);
  return grid.rows * grid.cols;
}

function _puzzleGridForDifficulty(difficulty) {
  return PICTURE_PUZZLE_GRIDS[difficulty] || PICTURE_PUZZLE_GRIDS.medium;
}

function _pieceLabel(piece, locale) {
  if (!piece) return '';
  if (piece.alt) return piece.alt;
  return _lv(piece.l || { sl: '', en: '' }, locale);
}

function _escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function _slotCornerClass(pos, grid) {
  const row = Math.floor((pos - 1) / grid.cols);
  const col = (pos - 1) % grid.cols;
  const classes = [];
  if (row === 0 && col === 0) classes.push('gm-slot--corner-tl');
  if (row === 0 && col === grid.cols - 1) classes.push('gm-slot--corner-tr');
  if (row === grid.rows - 1 && col === 0) classes.push('gm-slot--corner-bl');
  if (row === grid.rows - 1 && col === grid.cols - 1) classes.push('gm-slot--corner-br');
  return classes.join(' ');
}

function _jigsawImgStyle(piece) {
  const shape = piece && piece.shape;
  if (!shape) return '';
  const left = -(shape.padX / shape.tileW) * 100;
  const top = -(shape.padY / shape.tileH) * 100;
  const width = (shape.canvasW / shape.tileW) * 100;
  const height = (shape.canvasH / shape.tileH) * 100;
  return ` style="--gm-piece-left:${left}%;--gm-piece-top:${top}%;--gm-piece-width:${width}%;--gm-piece-height:${height}%;"`;
}

function _renderPieceImage(piece, locale, inSlot) {
  const cls = piece.shape
    ? (inSlot ? ' class="gm-jigsaw-img"' : ' class="gm-piece__img gm-piece__img--jigsaw"')
    : '';
  const style = inSlot ? _jigsawImgStyle(piece) : '';
  return `<img${cls} src="${piece.img}" alt="${_escapeHtml(_pieceLabel(piece, locale))}"${style} draggable="false" onerror="this.style.display='none'">`;
}

function _puzzleTrayPieces(gs, cfg) {
  const sc = gs.puzzle.scenario;
  const prePlaceIds = gs.puzzle.prePlaceIds || [];
  const available = sc.pieces.filter(p => !prePlaceIds.includes(p.id) && !gs.puzzle.placed[p.pos]);
  const distractors = cfg.distractors > 0 ? (sc.distractors || []).slice(0, cfg.distractors) : [];
  const pieces = [...available, ...distractors];
  const key = pieces.map(piece => piece.id).sort().join('|');

  if (gs.puzzle.trayKey !== key) {
    gs.puzzle.trayOrder = _shuffle(pieces).map(piece => piece.id);
    gs.puzzle.trayKey = key;
  }

  const byId = new Map(pieces.map(piece => [piece.id, piece]));
  return (gs.puzzle.trayOrder || [])
    .map(id => byId.get(id))
    .filter(Boolean);
}

function _drawImageCover(ctx, img, width, height) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const sourceAspect = iw / ih;
  const targetAspect = width / height;
  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;

  if (sourceAspect > targetAspect) {
    sw = ih * targetAspect;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / targetAspect;
    sy = (ih - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
}

function _makeJigsawEdges(rows, cols) {
  const vertical = Array.from({ length: rows }, () =>
    Array.from({ length: Math.max(0, cols - 1) }, () => (Math.random() > 0.5 ? 1 : -1))
  );
  const horizontal = Array.from({ length: Math.max(0, rows - 1) }, () =>
    Array.from({ length: cols }, () => (Math.random() > 0.5 ? 1 : -1))
  );

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      top: row === 0 ? 0 : -horizontal[row - 1][col],
      right: col === cols - 1 ? 0 : vertical[row][col],
      bottom: row === rows - 1 ? 0 : horizontal[row][col],
      left: col === 0 ? 0 : -vertical[row][col - 1]
    }))
  );
}

function _drawJigsawEdge(ctx, sx, sy, ex, ey, nx, ny, sign, depth) {
  if (!sign) {
    ctx.lineTo(ex, ey);
    return;
  }

  const dx = ex - sx;
  const dy = ey - sy;
  const point = (t, out) => ({
    x: sx + dx * t + nx * out,
    y: sy + dy * t + ny * out
  });
  const out = sign * depth;
  const p0 = point(0.31, 0);
  const c1 = point(0.38, 0);
  const c2 = point(0.37, out);
  const mid = point(0.5, out);
  const c3 = point(0.63, out);
  const c4 = point(0.62, 0);
  const p1 = point(0.69, 0);

  ctx.lineTo(p0.x, p0.y);
  ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, mid.x, mid.y);
  ctx.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, p1.x, p1.y);
  ctx.lineTo(ex, ey);
}

function _buildJigsawPath(ctx, x, y, width, height, edges, depth) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  _drawJigsawEdge(ctx, x, y, x + width, y, 0, -1, edges.top, depth);
  _drawJigsawEdge(ctx, x + width, y, x + width, y + height, 1, 0, edges.right, depth);
  _drawJigsawEdge(ctx, x + width, y + height, x, y + height, 0, 1, edges.bottom, depth);
  _drawJigsawEdge(ctx, x, y + height, x, y, -1, 0, edges.left, depth);
  ctx.closePath();
}

function _loadPuzzleSourceImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load puzzle image'));
    img.src = src;
  });
}

function _cutImageIntoJigsawPieces(img, options) {
  const grid = options.grid || PICTURE_PUZZLE_GRIDS.medium;
  const rows = grid.rows;
  const cols = grid.cols;
  const targetAspect = Math.max(0.35, Math.min(2.4, options.aspect || 1));
  const cellAspect = targetAspect * rows / cols;
  let tileW = PICTURE_PUZZLE_CELL_PX;
  let tileH = PICTURE_PUZZLE_CELL_PX;

  if (cellAspect >= 1) {
    tileW = Math.round(tileH * cellAspect);
  } else {
    tileH = Math.round(tileW / cellAspect);
  }

  const puzzleW = tileW * cols;
  const puzzleH = tileH * rows;
  const pad = Math.round(Math.min(tileW, tileH) * 0.23);
  const tabDepth = Math.round(pad * 0.86);
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = puzzleW;
  sourceCanvas.height = puzzleH;
  _drawImageCover(sourceCanvas.getContext('2d'), img, puzzleW, puzzleH);

  const edges = _makeJigsawEdges(rows, cols);
  const pieces = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pos = row * cols + col + 1;
      const canvas = document.createElement('canvas');
      canvas.width = tileW + pad * 2;
      canvas.height = tileH + pad * 2;
      const ctx = canvas.getContext('2d');
      const pieceEdges = edges[row][col];

      ctx.save();
      _buildJigsawPath(ctx, pad, pad, tileW, tileH, pieceEdges, tabDepth);
      ctx.clip();
      ctx.drawImage(sourceCanvas, -col * tileW + pad, -row * tileH + pad);
      ctx.restore();

      ctx.save();
      _buildJigsawPath(ctx, pad, pad, tileW, tileH, pieceEdges, tabDepth);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(3, Math.round(Math.min(tileW, tileH) * 0.018));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(76, 53, 29, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      pieces.push({
        id: `${options.idPrefix || 'piece'}-${pos}`,
        pos,
        img: canvas.toDataURL('image/png'),
        alt: `${options.name || 'Puzzle'} piece ${pos}`,
        l: { sl: String(pos), en: String(pos) },
        shape: {
          tileW,
          tileH,
          padX: pad,
          padY: pad,
          canvasW: canvas.width,
          canvasH: canvas.height
        }
      });
    }
  }

  return {
    grid,
    pieces,
    preview: sourceCanvas.toDataURL('image/png')
  };
}

function _pickFarmToPlatePuzzleImage() {
  const freshImages = FARM_TO_PLATE_PUZZLE_IMAGES.filter((src) => src !== _lastPicturePuzzleSource);
  const pool = freshImages.length ? freshImages : FARM_TO_PLATE_PUZZLE_IMAGES;
  const source = pool[Math.floor(Math.random() * pool.length)] || IMGS.puzzle_banner;
  _lastPicturePuzzleSource = source;
  return source;
}

async function _buildPicturePuzzleScenario(sc, difficulty, source) {
  const grid = _puzzleGridForDifficulty(difficulty);
  let img;

  try {
    img = await _loadPuzzleSourceImage(source);
  } catch (error) {
    console.warn('Puzzle image failed, falling back to puzzle banner', error);
    img = await _loadPuzzleSourceImage(IMGS.puzzle_banner);
  }

  const cut = _cutImageIntoJigsawPieces(img, {
    aspect: PICTURE_PUZZLE_ASPECT,
    grid,
    idPrefix: `${sc.id}-${grid.rows}x${grid.cols}`,
    name: _lv(sc.title, 'en')
  });

  return {
    ...sc,
    img: cut.preview,
    pieces: cut.pieces,
    distractors: [],
    grid: cut.grid,
    jigsaw: true
  };
}

function _shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function _pickPrePlacedPuzzleIds(sc, count) {
  if (!count) return [];
  const clampedCount = Math.min(count, sc.pieces.length);
  let ids = _shuffle(sc.pieces).slice(0, clampedCount).map((piece) => piece.id);
  const previousKey = _lastPuzzlePrePlaceKeys.get(sc.id);
  const keyFor = (pieceIds) => pieceIds.slice().sort().join('|');

  if (previousKey && sc.pieces.length > clampedCount && keyFor(ids) === previousKey) {
    const previousIds = new Set(previousKey.split('|'));
    const freshPieces = sc.pieces.filter((piece) => !previousIds.has(piece.id));
    ids = _shuffle(freshPieces).slice(0, clampedCount).map((piece) => piece.id);
  }

  _lastPuzzlePrePlaceKeys.set(sc.id, keyFor(ids));
  return ids;
}

function _pickPuzzleScenario() {
  const rotation = PICTURE_PUZZLE_ROTATION
    .map((id) => PUZZLE_SCENARIOS.find((scenario) => scenario.id === id))
    .filter(Boolean);
  const pool = rotation.length ? rotation : PUZZLE_SCENARIOS;
  if (!_lastPuzzleScenarioId) {
    return pool[0];
  }

  const currentIndex = pool.findIndex((scenario) => scenario.id === _lastPuzzleScenarioId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % pool.length : 0;
  return pool[nextIndex] || pool[0];
}

function _pickDetectiveQuestions() {
  const previous = new Set(_lastDetectiveQuestionIds);
  const fresh = QUESTIONS.filter((question) => !previous.has(question.id));
  const pool = fresh.length >= 10 ? fresh : QUESTIONS;
  return _shuffle(pool).slice(0, 10);
}

function _detectiveAnswerKey(answer) {
  return _lv(answer.l, 'sl').toLowerCase();
}

function _detectiveAnswerPool(question) {
  const answers = [...question.answers];
  const usedLabels = new Set(answers.map(_detectiveAnswerKey));
  DETECTIVE_EXTRA_ANSWERS.forEach((answer) => {
    const label = _detectiveAnswerKey(answer);
    if (answers.length < 4 && !usedLabels.has(label)) {
      answers.push({ ...answer });
      usedLabels.add(label);
    }
  });
  return answers;
}

function _detectiveAnswers(question) {
  const answers = _detectiveAnswerPool(question);
  const det = _gameState && _gameState.det;

  if (det && question && question.id) {
    if (!det.answerOrders) det.answerOrders = {};
    if (!det.answerOrders[question.id]) {
      det.answerOrders[question.id] = _shuffle(answers).slice(0, 4).map(_detectiveAnswerKey);
    }

    const byKey = new Map(answers.map((answer) => [_detectiveAnswerKey(answer), answer]));
    return det.answerOrders[question.id]
      .map((key) => byKey.get(key))
      .filter(Boolean);
  }

  return _shuffle(answers).slice(0, 4);
}

function _formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function _clearTimer() {
  if (_timerInt) { clearInterval(_timerInt); _timerInt = null; }
}

const GM_ICONS = {
  star: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3.5l3.8 7.7 8.5 1.2-6.1 6 1.4 8.4L16 22.8 8.4 26.8l1.4-8.4-6.1-6 8.5-1.2L16 3.5z" />
    </svg>`,
  clock: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M16 9v8l6 3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`,
  bulb: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4a8 8 0 0 0-4.8 14.4c1.2.9 1.8 2 1.8 3.6h6c0-1.6.6-2.7 1.8-3.6A8 8 0 0 0 16 4z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
      <path d="M12.5 25h7M13.5 28h5M16 1.8v2M5.8 7.2l1.5 1.5M26.2 7.2l-1.5 1.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
    </svg>`,
  restart: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>`,
  search: `
    <svg class="gm-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>`,
  puzzle: `
    <svg class="gm-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 4 H9 A2 2 0 0 1 13 4 H18 V9 A2 2 0 0 0 18 13 V18 H4 Z" />
    </svg>`
};

function renderPuzzleBrand() {
  return `
    <div class="gm-header__brand" aria-label="Zdravo Jem">
      <img class="gm-brand-logo" src="${IMGS.logo}" alt="Zdravo Jem" draggable="false" onerror="this.style.display='none'">
    </div>`;
}

// ---------------------------------------------------------------------------
// SELECT screen (game picker)
// ---------------------------------------------------------------------------
function renderSelect(locale) {
  const g = _gl(locale);
  return `
    <section class="gm-select">
      <div class="gm-select__brand">
        <img class="gm-select__brand-img" src="${IMGS.logo}" alt="Zdravo Jem" onerror="this.style.display='none'">
      </div>
      <div class="gm-select__hero">
        <h1 class="gm-select__title">${locale === 'en' ? 'Games' : 'Igre'}</h1>
        <p class="gm-select__sub">${locale === 'en' ? 'Choose a game and start discovering the world of food!' : 'Izberi igro in začni odkrivati svet hrane!'}</p>
      </div>
      <div class="gm-cards">
        <button class="gm-card" data-gm-action="intro" data-game="puzzle">
          <img class="gm-card__img" src="${IMGS.puzzle_banner}" alt="puzzle" onerror="this.style.display='none'">
          <div class="gm-card__body">
            <h2 class="gm-card__title">${locale === 'en' ? 'From Farm to Plate' : 'Od kmetije do krožnika'}</h2>
            <p class="gm-card__desc">${locale === 'en' ? "Assemble the picture and discover food's journey from field to table." : 'Sestavi sliko in odkrij pot hrane od polja do mize.'}</p>
            <span class="gm-badge">${GM_ICONS.puzzle}${locale === 'en' ? 'Puzzle' : 'Sestavljanka'}</span>
          </div>
        </button>
        <button class="gm-card" data-gm-action="intro" data-game="detective">
          <img class="gm-card__img" src="${IMGS.detective_banner}" alt="detective" onerror="this.style.display='none'">
          <div class="gm-card__body">
            <h2 class="gm-card__title">${locale === 'en' ? 'Market Detective' : 'Tržnični detektiv'}</h2>
            <p class="gm-card__desc">${locale === 'en' ? 'Solve clues and find the right answer about market food!' : 'Reši namige in odkrij pravi odgovor o hrani s tržnice!'}</p>
            <span class="gm-badge">${GM_ICONS.search}${locale === 'en' ? 'Quiz' : 'Kviz'}</span>
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
  const isStarting = !!(_gameState && _gameState.isStarting);
  return `
    <section class="gm-intro">
      <div class="gm-intro__header">
        <button class="gm-back-btn" data-gm-action="select">←</button>
        <img class="gm-intro__logo" src="${IMGS.logo}" alt="Zdravo Jem" draggable="false" onerror="this.style.display='none'">
      </div>
      <div class="gm-intro__body">
        <img class="gm-intro__img" src="${isPuzzle ? IMGS.puzzle_banner : IMGS.detective_banner}" alt="${title}" onerror="this.style.display='none'">
        <h1 class="gm-intro__title">${title}</h1>
        <p class="gm-intro__desc">${desc}</p>
        <p class="gm-diff-label">${g.diffLabel}</p>
        <div class="gm-diff-btns">
          <button class="gm-diff-btn ${diff === 'easy' ? 'is-active' : ''}" data-gm-action="diff" data-diff="easy" ${isStarting ? 'disabled' : ''}>${g.easy}</button>
          <button class="gm-diff-btn ${diff === 'medium' ? 'is-active' : ''}" data-gm-action="diff" data-diff="medium" ${isStarting ? 'disabled' : ''}>${g.medium}</button>
          <button class="gm-diff-btn ${diff === 'hard' ? 'is-active' : ''}" data-gm-action="diff" data-diff="hard" ${isStarting ? 'disabled' : ''}>${g.hard}</button>
        </div>
        <button class="gm-start-btn ${isStarting ? 'gm-btn--disabled' : ''}" data-gm-action="start" ${isStarting ? 'disabled' : ''}>${g.startBtn}</button>
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
  const grid = _puzzleGrid(sc);
  const total = _puzzleTotal(sc);
  const placed = gs.puzzle.placedCount;
  const pct = Math.round(placed / total * 100);
  const completed = !!gs.puzzle.completed;
  const isJigsawPuzzle = !!sc.jigsaw;
  const piecesTitle = completed ? g.puzzleCompleteTitle : g.pieces;
  const hintLabel = completed ? g.puzzleCompleteTitle : g.hint;

  // Build board slots HTML
  let boardHtml = '';
  for (let i = 1; i <= total; i++) {
    const placedId = gs.puzzle.placed[i];
    const piece = placedId ? sc.pieces.find(p => p.id === placedId) : null;
    const cornerClass = _slotCornerClass(i, grid);
    const slotClasses = [
      'gm-slot',
      `gm-slot--pos-${i}`,
      cornerClass,
      isJigsawPuzzle ? 'gm-slot--jigsaw' : ''
    ].filter(Boolean).join(' ');
    if (piece) {
      boardHtml += `
        <div class="${slotClasses} gm-slot--filled gm-slot--correct" data-pos="${i}">
          ${_renderPieceImage(piece, locale, true)}
          <div class="gm-slot__label">${_escapeHtml(_pieceLabel(piece, locale))}</div>
        </div>`;
    } else {
      boardHtml += `<div class="${slotClasses}" data-pos="${i}" data-gm-drop="${i}"><span class="gm-slot__num">${i}</span></div>`;
    }
  }

  // Build available pieces
  const allPieces = _puzzleTrayPieces(gs, cfg);
  const hasRemainingPieces = allPieces.length > 0;

  let piecesHtml = hasRemainingPieces
    ? allPieces.map(p => `
      <div class="gm-piece gm-piece--pos-${p.pos || 0}${p.shape ? ' gm-piece--jigsaw' : ''}${p.isDistractor ? ' gm-piece--distractor' : ''}"
           data-piece-id="${p.id}"
           data-is-dist="${!!p.isDistractor}"
           draggable="false">
        ${_renderPieceImage(p, locale, false)}
        <span class="gm-piece__label">${_escapeHtml(_pieceLabel(p, locale))}</span>
      </div>`).join('')
    : (completed ? `<div class="gm-pieces-empty">${g.puzzleCompleteEmpty}</div>` : '');

  const hintsLeft = gs.puzzle.hintsLeft;
  const hintDisabled = hintsLeft <= 0 || completed ? 'gm-btn--disabled' : '';
  const progressDots = Array.from({ length: total }, (_, index) => {
    const dotClass = index < placed ? ' is-filled' : '';
    return `<span class="gm-progress-dot${dotClass}" aria-hidden="true"></span>`;
  }).join('');

  return `
    <section class="gm-puzzle${isJigsawPuzzle ? ' gm-puzzle--jigsaw' : ''}${grid.cols === 4 ? ' gm-puzzle--grid-4' : ''}">
      <div class="gm-header">
        ${renderPuzzleBrand()}
        <div class="gm-header__controls">
        <button class="gm-header__back" data-gm-action="confirm-back">
          <span class="gm-header__back-arrow" aria-hidden="true">&larr;</span>
          <span>${locale === 'en' ? 'Back' : 'Nazaj'}</span>
        </button>
        <div class="gm-header__score">
          <span class="gm-header__icon gm-header__icon--star">${GM_ICONS.star}</span>
          <span class="gm-score-val">${gs.score}</span>
        </div>
        <div class="gm-header__timer${gs.timeLeft <= 10 ? ' is-urgent' : ''}" id="gm-timer-badge">
          <span class="gm-header__icon gm-header__icon--clock">${GM_ICONS.clock}</span>
          <span id="gm-time">${_formatTime(gs.timeLeft)}</span>
        </div>
        </div>
      </div>
      <div class="gm-puzzle__content">
<img class="gm-puzzle-banner" src="${IMGS.puzzle_header}" alt="${_lv(sc.title, locale)}" draggable="false" onerror="this.style.display='none'">
        ${completed ? `<div class="gm-puzzle__complete">${g.puzzleComplete}</div>` : ''}
        <div class="gm-puzzle__area">
          <div class="gm-board${isJigsawPuzzle ? ' gm-board--jigsaw' : ''}" id="gm-board" style="--gm-grid-cols:${grid.cols};--gm-grid-rows:${grid.rows};">${boardHtml}</div>
          <div class="gm-pieces-panel">
            <h3 class="gm-pieces-panel__title">${completed && !hasRemainingPieces ? piecesTitle : g.pieces}</h3>
            <div id="gm-pieces-container">${piecesHtml}</div>
          </div>
        </div>
      </div>
      <div class="gm-puzzle__progress">
        <div class="gm-progress-card">
          <p class="gm-progress-text">
            <strong><span id="gm-placed">${placed}</span> / <span>${total}</span></strong>
            <small>${g.placed}</small>
          </p>
          <div class="gm-progress-dots" aria-hidden="true">${progressDots}</div>
          <div class="gm-progress-bar"><div class="gm-progress-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      <div class="gm-puzzle__actions">
        <button class="gm-btn gm-btn--hint ${hintDisabled}" id="gm-hint-btn" data-gm-action="hint">
          ${GM_ICONS.bulb}
          ${completed ? `${hintLabel}` : `${g.hint}<span class="gm-hint-count-wrap">(<span id="gm-hint-count">${hintsLeft}</span>)</span>`}
        </button>
        <button class="gm-btn gm-btn--restart" data-gm-action="confirm-restart">
          ${GM_ICONS.restart}
          ${g.restart}
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
function renderDetectiveLegacy(locale) {
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
  dotsHtml += `<div class="gm-mission-dot gm-mission-dot--reward"></div>`;

  // Answer buttons
  let answers = [...q.answers].sort(() => Math.random() - 0.5);
  if (cfg.qAnswers === 3 && answers.length > 3) answers = answers.slice(0, 3);
  const gridCls = answers.length === 3 ? 'gm-answers--three' : '';
  const answersHtml = answers.map((a, ai) => `
    <button class="gm-answer-btn" data-gm-action="answer" data-answer-idx="${ai}" data-is-correct="${a.c}">
      <img class="gm-answer-btn__img" src="${_detectiveAnswerImageSrc(a)}" alt="${_lv(a.l, locale)}" draggable="false" onerror="this.style.display='none'">
      <span class="gm-answer-btn__label">${_lv(a.l, locale)}</span>
    </button>`).join('');

  return `
    <section class="gm-detective">
      <div class="gm-header">
        <button class="gm-header__back" data-gm-action="confirm-back">←</button>
        <div class="gm-header__title">${locale === 'en' ? 'Market Detective 🔍' : 'Tržnični detektiv 🔍'}</div>
        <div class="gm-header__score"><span class="gm-score-val">${gs.score}</span></div>
        <div class="gm-header__timer${gs.timeLeft <= 10 ? ' is-urgent' : ''}" id="gm-timer-badge">
          ⏱ <span id="gm-time">${_formatTime(gs.timeLeft)}</span>
        </div>
      </div>
      <div class="gm-detective__content">
        <div class="gm-combo-badge" id="gm-combo-badge" style="display:none">${g.combo}</div>
        <div class="gm-mission-bar">
          <div class="gm-mission-bar__title">${g.missionTitle}</div>
          <div class="gm-mission-dots" id="gm-mission-dots">${dotsHtml}</div>
        </div>
        <div class="gm-question-card">
          <img id="gm-q-img" class="gm-question-card__img" src="${_detectiveQuestionImageSrc(q)}" alt="" onerror="this.style.display='none'">
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
            ${g.hint} -<span id="gm-det-hint-cost">${cfg.hintCost}</span>
          </button>
          <button class="gm-btn gm-btn--restart" data-gm-action="confirm-restart">${g.restart}</button>
        </div>
      </div>
      ${renderToast()}
      ${renderModal('back', locale)}
      ${renderModal('restart', locale)}
    </section>`;
}

// Reference-style DETECTIVE screen render
function renderDetective(locale) {
  const gs = _gameState;
  const g = _gl(locale);
  const cfg = DIFF_CONFIG[gs.difficulty];
  const q = gs.det.questions[gs.det.currentQ];
  const idx = gs.det.currentQ;
  const totalRiddles = gs.det.questions.length;
  const missionNodes = 5;
  const riddlesPerNode = Math.max(1, Math.ceil(totalRiddles / missionNodes));
  const activeMissionNode = Math.min(missionNodes - 1, Math.floor(idx / riddlesPerNode));
  const completedMissionNodes = Math.min(missionNodes, Math.floor(idx / riddlesPerNode));
  const progressPct = Math.round((idx / totalRiddles) * 100);
  const questionHeading = locale === 'en' ? 'Who am I?' : 'Kdo sem?';
  const missionTitle = locale === 'en' ? 'Detective missions' : 'Detektivske misije';

  const missionSteps = Array.from({ length: missionNodes }, (_, i) => {
    const stateClass = i < completedMissionNodes ? ' done' : i === activeMissionNode ? ' current' : ' todo';
    const label = i < 2
      ? (locale === 'en' ? 'Easy' : 'Lahko')
      : i < 4
        ? (locale === 'en' ? 'Medium' : 'Srednje')
        : (locale === 'en' ? 'Hard' : 'Te&#382;je');
    const line = i < missionNodes - 1
      ? `<div class="gm-mission-line${i < completedMissionNodes - 1 ? ' done-line' : ''}"></div>`
      : '';
    return `
      <div class="gm-mission-col">
        <div class="gm-mission-step${stateClass}">
          ${i < completedMissionNodes ? '&#10003;' : i + 1}
        </div>
        <div class="gm-mission-label">${label}</div>
      </div>
      ${line}`;
  }).join('');

  const answersHtml = _detectiveAnswers(q).map((a, ai) => `
    <button class="gm-answer-btn" data-gm-action="answer" data-answer-idx="${ai}" data-is-correct="${a.c}">
      <span class="gm-answer-btn__photo">
        <img class="gm-answer-btn__img" src="${_detectiveAnswerImageSrc(a)}" alt="${_lv(a.l, locale)}" draggable="false" onerror="this.style.display='none'">
      </span>
      <span class="gm-answer-btn__label">${_lv(a.l, locale)}</span>
      <span class="gm-answer-btn__leaf" aria-hidden="true"></span>
    </button>`).join('');

  return `
    <section class="gm-detective">
      <div class="gm-detective__content">
        <button class="gm-det-back" data-gm-action="confirm-back" aria-label="${locale === 'en' ? 'Back' : 'Nazaj'}">&#8592;</button>
        <img class="gm-det-header-img" src="${IMGS.detective_header}" alt="" draggable="false" onerror="this.style.display='none'">

        <div class="gm-det-stats">
          <div class="gm-det-stat gm-det-stat--time" id="gm-timer-badge">
            <span class="gm-det-clock" aria-hidden="true"></span>
            <span>
              <b>${locale === 'en' ? 'TIME' : '&#268;AS'}</b>
              <strong id="gm-time">${_formatTime(gs.timeLeft)}</strong>
            </span>
          </div>
          <div class="gm-det-stat gm-det-stat--progress">
            <b>${locale === 'en' ? 'PROGRESS' : 'NAPREDEK'}</b>
            <div class="gm-det-progress"><span style="width:${progressPct}%"></span></div>
            <small>${idx} / ${totalRiddles}</small>
          </div>
          <div class="gm-det-stat gm-det-stat--score">
            <span>
              <b>${locale === 'en' ? 'POINTS' : 'TO&#268;KE'}</b>
              <strong class="gm-score-val">${gs.score}</strong>
            </span>
          </div>
        </div>

        <article class="gm-question-card">
          <div class="gm-question-lens" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 21 21" />
            </svg>
          </div>
          <div class="gm-question-title">${questionHeading}</div>
          <div class="gm-question-divider" aria-hidden="true"><img src="${IMGS.detective_divider}" alt="" draggable="false" onerror="this.style.display='none'"></div>
          <div class="gm-question-text">${_lv(q.text, locale)}</div>
          <span class="gm-question-leaf gm-question-leaf--left" aria-hidden="true"><img src="${IMGS.detective_leaf}" alt="" draggable="false" onerror="this.style.display='none'"></span>
          <span class="gm-question-leaf gm-question-leaf--right" aria-hidden="true"><img src="${IMGS.detective_leaf}" alt="" draggable="false" onerror="this.style.display='none'"></span>
        </article>

        <div class="gm-hint-area" id="gm-hint-area" style="display:none"></div>
        <div class="gm-answers" id="gm-answers">${answersHtml}</div>

        <div class="gm-det-bottom-row">
          <button class="gm-det-hint-btn" id="gm-det-hint-btn" data-gm-action="det-hint">
            <span class="gm-det-bulb" aria-hidden="true"></span>
            <strong>${g.hint}</strong>
            <small>-${cfg.hintCost} ${g.pointsLabel}</small>
          </button>
          <div class="gm-score-feedback" id="gm-score-feedback" style="display:none"></div>
          <button class="gm-det-super-btn" data-gm-action="confirm-restart">
            <span class="gm-det-super-star" aria-hidden="true">&#9733;</span>
            <span>
              <strong>${g.restart}</strong>
              <small>${locale === 'en' ? 'new mystery' : 'nova uganka'}</small>
            </span>
          </button>
          <img class="gm-det-buddy" src="${IMGS.detective_mascot}" alt="" draggable="false" onerror="this.style.display='none'">
        </div>

        <div class="gm-explanation" id="gm-explanation" style="display:none"></div>
        <div class="gm-combo-badge" id="gm-combo-badge" style="display:none">${g.combo}</div>

        <div class="gm-mission-bar">
          <div class="gm-mission-bar__title">${missionTitle}</div>
          <div class="gm-mission-dots" id="gm-mission-dots">
            ${missionSteps}
            <div class="gm-mission-reward">
              <img class="gm-mission-reward-img" src="${IMGS.detective_reward}" alt="" draggable="false" onerror="this.style.display='none'">
              <strong>${locale === 'en' ? 'REWARD<br>at the end!' : 'NAGRADA<br>na koncu poti!'}</strong>
            </div>
          </div>
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
  const showRecipeButton = gs.game !== 'puzzle' && !!gs.endRecipe;
  let msg, sub, tone;
  if (pct <= 40) { msg = g.endMsg0; sub = g.endSub0; tone = 'try'; }
  else if (pct <= 75) { msg = g.endMsg40; sub = g.endSub40; tone = 'bravo'; }
  else { msg = g.endMsg75; sub = g.endSub75; tone = 'master'; }

  return `
    <section class="gm-end">
      <div class="gm-end__overlay" role="dialog" aria-modal="true" aria-live="polite">
        <div class="gm-end__sticker" aria-hidden="true"><img class="gm-end__logo" src="${IMGS.logo}" alt="Zdravo Jem" onerror="this.style.display='none'"></div>
        <div class="gm-end__pct">${pct}%</div>
        <div class="gm-end__msg">${msg}</div>
        ${sub ? `<div class="gm-end__sub">${sub}</div>` : ''}
        <div class="gm-end__score-box">
          <p>${g.totalPoints}</p>
          <div class="gm-end__score-big">${gs.score} ${g.pointsLabel}</div>
        </div>
        <div class="gm-end__buttons">
          <button class="gm-end-btn gm-end-btn--primary" data-gm-action="confirm-restart"><span class="gm-end-btn__mark gm-end-btn__mark--icon" aria-hidden="true">${GM_ICONS.restart}</span>${g.playAgain}</button>
          <button class="gm-end-btn gm-end-btn--secondary" data-gm-action="go-select"><span class="gm-end-btn__mark gm-end-btn__mark--games" aria-hidden="true"></span>${g.backToGames}</button>
        </div>
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
      <div class="gm-modal" role="dialog" aria-modal="true">
        <h3>${g.leaveGame}</h3><p>${g.leaveMsg}</p>
        <div class="gm-modal__btns">
          <button class="gm-modal-btn gm-modal-btn--cancel" data-gm-action="close-modal-back">${g.leaveContinue}</button>
          <button class="gm-modal-btn gm-modal-btn--confirm" data-gm-action="do-back">${g.leaveConfirm}</button>
        </div>
      </div>
    </div>`;
  }
  return `<div class="gm-modal-overlay" id="gm-modal-restart" style="display:none">
    <div class="gm-modal" role="dialog" aria-modal="true">
      <h3>${g.restartGame}</h3><p>${g.restartMsg}</p>
      <div class="gm-modal__btns">
        <button class="gm-modal-btn gm-modal-btn--cancel" data-gm-action="close-modal-restart">${g.restartCancel}</button>
        <button class="gm-modal-btn gm-modal-btn--confirm" data-gm-action="do-restart">${g.restartConfirm}</button>
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
  _rememberGameIngredients(state);

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
  if (_gameState.subScreen === 'puzzle') return renderPuzzle(locale);
  if (_gameState.subScreen === 'detective') return renderDetective(locale);
  if (_gameState.subScreen === 'end') return renderEnd(locale);

  return renderSelect(locale);
}

// ---------------------------------------------------------------------------
// Cleanup — called by app.js when leaving the games screen
// ---------------------------------------------------------------------------
export function cleanup() {
  _puzzleStartToken++;
  _clearTimer();
  if (_boundRoot && _boundPointerHandler) {
    _boundRoot.removeEventListener('pointerdown', _boundPointerHandler);
  }
  _boundRoot = null;
  _boundPointerHandler = null;
  _gameState = null;
  _dragData = null;
  _dragActive = false;
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
    const badge = _rootEl && _rootEl.querySelector('#gm-timer-badge');
    if (timeEl) timeEl.textContent = _formatTime(_gameState.timeLeft);
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

function _isTimedGameActive() {
  if (!_gameState) return false;
  if (_gameState.subScreen === 'puzzle') {
    return !!_gameState.puzzle && !_gameState.puzzle.completed;
  }
  return _gameState.subScreen === 'detective';
}

function _openModal(id) {
  if (_isTimedGameActive()) {
    _clearTimer();
  }
  _showModal(id);
}

function _closeModal(id, actions) {
  _hideModal(id);
  if (_isTimedGameActive() && _gameState.timeLeft > 0) {
    const onExpire = _gameState.subScreen === 'detective'
      ? () => _handleDetectiveTimeout(actions)
      : () => _endGame(actions);
    _startTimer(null, onExpire);
  }
}

// ---------------------------------------------------------------------------
// Puzzle logic
// ---------------------------------------------------------------------------
async function _startPuzzle(actions) {
  if (!_gameState || _gameState.isStarting) return;

  const difficulty = _gameState.difficulty;
  const cfg = DIFF_CONFIG[difficulty];
  const baseScenario = _pickPuzzleScenario();
  const source = _pickFarmToPlatePuzzleImage();
  const startToken = ++_puzzleStartToken;
  const idx = PUZZLE_SCENARIOS.findIndex((scenario) => scenario.id === baseScenario.id);
  _lastPuzzleScenarioId = baseScenario.id;
  _gameState = { ..._gameState, isStarting: true };

  const startBtn = _rootEl && _rootEl.querySelector('.gm-start-btn');
  if (startBtn) {
    startBtn.classList.add('gm-btn--disabled');
    startBtn.disabled = true;
  }
  if (_rootEl) {
    _rootEl.querySelectorAll('.gm-diff-btn').forEach((button) => {
      button.disabled = true;
    });
  }

  let sc;
  try {
    sc = await _buildPicturePuzzleScenario(baseScenario, difficulty, source);
  } catch (error) {
    console.warn('Failed to build picture puzzle, using scenario pieces', error);
    sc = baseScenario;
  }

  if (!_gameState || _gameState.game !== 'puzzle' || _puzzleStartToken !== startToken) return;

  const prePlaceIds = _pickPrePlacedPuzzleIds(sc, cfg.puzzlePrePlaced);

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
    endRecipe: null,
    isStarting: false,
    puzzle: { scenario: sc, placed, prePlaceIds, hintsLeft: 3, placedCount, completed: false }
  };

  actions.goTo('games');
  _bindPuzzle(actions);
  _startTimer(null, () => _endGame(actions));
}

function _bindPuzzle(actions) {
  const sc = _gameState.puzzle.scenario;

  const board = _rootEl.querySelector('#gm-board');
  if (!board) return;

  // Piece drag, unified across mouse/touch/pen via Pointer Events. Native
  // HTML5 drag-and-drop (dragstart/dragover/drop) isn't used because legacy
  // Touch Events don't fire reliably on all Windows touchscreen digitizers,
  // while Pointer Events do — see setupInfiniteCarousel in home.js for the
  // same pattern.
  _rootEl.querySelectorAll('.gm-piece').forEach(el => {
    const pid = el.dataset.pieceId;
    const allPieces = [...sc.pieces, ...(sc.distractors || [])];
    const piece = allPieces.find(p => p.id === pid);
    if (!piece) return;

    el.addEventListener('pointerdown', ev => _pointerDragStart(piece, el, ev));
    el.addEventListener('pointermove', _pointerDragMove);
    el.addEventListener('pointerup', ev => _pointerDragEnd(ev, actions));
    el.addEventListener('pointercancel', ev => _pointerDragEnd(ev, actions));
  });
}

function _endDrag() {
  if (_dragData) _dragData.el.classList.remove('is-dragging');
  _dragData = null;
  const ghost = _rootEl && _rootEl.querySelector('#gm-drag-ghost');
  if (ghost) ghost.style.display = 'none';
}

// A CSS transform (or filter) on ANY ancestor makes that ancestor the
// containing block for a position:fixed descendant, per spec. #gm-drag-ghost
// sits inside .gm-puzzle, which itself is centered with
// `left:50%; transform:translateX(-50%)` (see "Keep every game screen in the
// same portrait panel" in games.css) — that's the ghost's real containing
// block, not .app-root. Walk up to find whichever ancestor actually applies.
function _fixedContainingBlock(el) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    if (cs.transform !== 'none' || cs.filter !== 'none') {
      return node;
    }
    node = node.parentElement;
  }
  return document.documentElement;
}

// Pointer coordinates are in untransformed viewport space, so convert them
// into the containing block's local space, otherwise the ghost drifts away
// from the finger/cursor whenever an ancestor is scaled and/or translated.
function _positionGhost(ghost, clientX, clientY) {
  if (!ghost) return;
  const cb = _fixedContainingBlock(ghost);
  if (cb && cb.offsetWidth) {
    const rect = cb.getBoundingClientRect();
    const scale = rect.width / cb.offsetWidth || 1;
    ghost.style.left = ((clientX - rect.left) / scale) + 'px';
    ghost.style.top = ((clientY - rect.top) / scale) + 'px';
  } else {
    ghost.style.left = clientX + 'px';
    ghost.style.top = clientY + 'px';
  }
}

// Pointer Events cover mouse, touch and pen with one code path. Legacy Touch
// Events (touchstart/touchmove/touchend) don't fire reliably on every Windows
// touchscreen digitizer, which is why touch dragging could silently fail
// while mouse dragging worked.
function _pointerDragStart(piece, el, ev) {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  ev.preventDefault();
  _dragData = { piece, el };
  _dragActive = true;
  el.classList.add('is-dragging');
  el.setPointerCapture?.(ev.pointerId);
  const ghost = _rootEl.querySelector('#gm-drag-ghost');
  const gImg = _rootEl.querySelector('#gm-ghost-img');
  const gLbl = _rootEl.querySelector('#gm-ghost-label');
  if (ghost) { ghost.style.display = 'flex'; ghost.classList.toggle('is-jigsaw', !!piece.shape); }
  if (gImg) { gImg.src = piece.img; gImg.style.display = 'block'; }
  if (gLbl) { gLbl.textContent = _pieceLabel(piece, _gameState.locale); }
  _positionGhost(ghost, ev.clientX, ev.clientY);
}

function _pointerDragMove(ev) {
  if (!_dragActive) return;
  ev.preventDefault();
  const ghost = _rootEl && _rootEl.querySelector('#gm-drag-ghost');
  _positionGhost(ghost, ev.clientX, ev.clientY);
  const el = document.elementFromPoint(ev.clientX, ev.clientY);
  _dropSlotTarget = el ? el.closest('[data-gm-drop]') : null;
}

function _pointerDragEnd(ev, actions) {
  if (!_dragActive) return;
  _dragActive = false;
  if (_dragData && _dragData.el.hasPointerCapture?.(ev.pointerId)) {
    _dragData.el.releasePointerCapture(ev.pointerId);
  }
  const ghost = _rootEl && _rootEl.querySelector('#gm-drag-ghost');
  if (ghost) ghost.style.display = 'none';
  if (_dragData) _dragData.el.classList.remove('is-dragging');
  if (_dropSlotTarget) {
    const pos = parseInt(_dropSlotTarget.dataset.gmDrop);
    if (!isNaN(pos)) _onDrop(pos, actions);
  }
  _dragData = null;
  _dropSlotTarget = null;
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
        ${_renderPieceImage(piece, locale, true)}
        <div class="gm-slot__label">${_escapeHtml(_pieceLabel(piece, locale))}</div>`;
      slot.classList.add('gm-slot--filled', 'gm-slot--correct');
      if (piece.shape) slot.classList.add('gm-slot--jigsaw');
      slot.removeAttribute('data-gm-drop');
    }
    _dragData.el.remove();
    _addScore(100);
    _updatePuzzleProgress();
    const isPuzzleComplete = _gameState.puzzle.placedCount === sc.pieces.length;
    _showToast(isPuzzleComplete ? g.puzzleComplete : g.snapGood(100), 'good');

    if (isPuzzleComplete) {
      _gameState.puzzle.completed = true;
      _clearTimer();

      const timerBadge = _rootEl.querySelector('#gm-timer-badge');
      if (timerBadge) timerBadge.classList.remove('is-urgent');

      const bannerEl = _rootEl.querySelector('.gm-puzzle-banner');
      if (bannerEl) {
        let completeBanner = _rootEl.querySelector('.gm-puzzle__complete');
        if (!completeBanner) {
          completeBanner = document.createElement('div');
          completeBanner.className = 'gm-puzzle__complete';
          bannerEl.insertAdjacentElement('afterend', completeBanner);
        }
        completeBanner.textContent = g.puzzleComplete;
      }

      const hintBtn = _rootEl.querySelector('#gm-hint-btn');
      if (hintBtn) {
        hintBtn.classList.add('gm-btn--disabled');
        hintBtn.innerHTML = `${GM_ICONS.bulb}${g.puzzleCompleteTitle}`;
      }

      const piecesContainer = _rootEl.querySelector('#gm-pieces-container');
      const hasRemainingPieces = !!(piecesContainer && piecesContainer.querySelector('.gm-piece'));

      const titleEl = _rootEl.querySelector('.gm-pieces-panel__title');
      if (titleEl && !hasRemainingPieces) titleEl.textContent = g.puzzleCompleteTitle;

      if (piecesContainer && !hasRemainingPieces) {
        piecesContainer.innerHTML = `<div class="gm-pieces-empty">${g.puzzleCompleteEmpty}</div>`;
      }

      setTimeout(() => {
        if (_gameState && _gameState.subScreen === 'puzzle' && _gameState.puzzle.completed) {
          _endGame(actions, true);
        }
      }, 900);
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
  const fillEl = _rootEl && _rootEl.querySelector('.gm-progress-fill');
  if (placedEl) placedEl.textContent = placed;
  if (fillEl) fillEl.style.width = pct + '%';
  if (_rootEl) {
    _rootEl.querySelectorAll('.gm-progress-dot').forEach((dot, index) => {
      dot.classList.toggle('is-filled', index < placed);
    });
  }
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

  if (slot) { slot.classList.add('gm-slot--hint'); setTimeout(() => slot.classList.remove('gm-slot--hint'), 2600); }
  if (pieceEl) { pieceEl.classList.add('gm-piece--hint'); setTimeout(() => pieceEl.classList.remove('gm-piece--hint'), 2600); }

  gs.puzzle.hintsLeft--;
  _addScore(-50);

  const countEl = _rootEl.querySelector('#gm-hint-count');
  if (countEl) countEl.textContent = gs.puzzle.hintsLeft;

  if (gs.puzzle.hintsLeft === 0) {
    const btn = _rootEl.querySelector('#gm-hint-btn');
    if (btn) { btn.classList.add('gm-btn--disabled'); btn.innerHTML = `${GM_ICONS.bulb}${g.noHints}`; }
  }
  _showToast(g.hintToast, 'good');
}

// ---------------------------------------------------------------------------
// Detective logic
// ---------------------------------------------------------------------------
function _startDetective(actions) {
  const cfg = DIFF_CONFIG[_gameState.difficulty];
  const qs = _pickDetectiveQuestions();
  _lastDetectiveQuestionIds = qs.map((question) => question.id);

  _gameState = {
    ..._gameState,
    subScreen: 'detective',
    score: 0,
    timeLeft: cfg.time,
    endRecipe: qs[0] ? qs[0].recipe : 'honey_breakfast',
    det: { questions: qs, currentQ: 0, correct: 0, combo: 0, hintsUsed: 0, wrongAttempts: 0, hintUsedQ: false, answerOrders: {} }
  };

  actions.goTo('games');
  _startTimer(null, () => _handleDetectiveTimeout(actions));
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
    _updateDetectiveProgress(gs.det.currentQ + 1);

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
  if (next >= gs.det.questions.length) {
    _clearTimer();
    _endGame(actions);
  } else {
    const cfg = DIFF_CONFIG[gs.difficulty];
    gs.det.currentQ = next;
    gs.timeLeft = cfg.time;
    gs.det.wrongAttempts = 0;
    gs.det.hintUsedQ = false;
    actions.goTo('games');
    _startTimer(null, () => _handleDetectiveTimeout(actions));
  }
}

function _handleDetectiveTimeout(actions) {
  const gs = _gameState;
  if (!gs || gs.subScreen !== 'detective') return;

  const q = gs.det.questions[gs.det.currentQ];
  const locale = gs.locale;
  const g = _gl(locale);

  _rootEl.querySelectorAll('.gm-answer-btn').forEach((button) => {
    button.classList.add('is-locked');
    if (button.dataset.isCorrect === 'true') button.classList.add('is-correct');
  });

  gs.det.combo = 0;
  gs.endRecipe = q.recipe;
  _showDetFeedback(g.revealAnswer, 'bad');
  _showExplanation(_lv(q.explanation, locale));
  setTimeout(() => _advanceQ(actions), 1800);
}

function _showDetFeedback(msg, type) {
  const el = _rootEl && _rootEl.querySelector('#gm-score-feedback');
  if (!el) return;
  const cleanMsg = String(msg || '').replace(/[^\p{L}\p{N}\p{P}\p{Zs}+-]/gu, '').trim();
  const pointsMatch = String(msg).match(/\+(\d+)/);
  el.className = `gm-score-feedback gm-score-feedback--${type}`;
  const scoreText = pointsMatch
    ? `+${pointsMatch[1]} ${_gl(_gameState.locale).pointsLabel}`.toUpperCase()
    : '';

  if (type === 'good') {
    el.innerHTML = `
      <span class="gm-score-feedback__title">SUPER!</span>
      ${scoreText ? `<span class="gm-score-feedback__points">${_escapeHtml(scoreText)}</span>` : ''}
    `;
  } else {
    el.textContent = cleanMsg;
  }

  el.style.display = type === 'good' ? 'grid' : 'flex';
}

function _updateDetectiveProgress(completedCount) {
  const gs = _gameState;
  if (!gs || !gs.det) return;

  const total = gs.det.questions.length;
  const clamped = Math.max(0, Math.min(total, completedCount));
  const progressFill = _rootEl && _rootEl.querySelector('.gm-det-progress span');
  const progressLabel = _rootEl && _rootEl.querySelector('.gm-det-stat--progress small');

  if (progressFill) progressFill.style.width = `${Math.round((clamped / total) * 100)}%`;
  if (progressLabel) progressLabel.textContent = `${clamped} / ${total}`;
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
  if (ha) { ha.textContent = _lv(q.hint, locale); ha.style.display = 'flex'; }
  if (ha) { ha.textContent = _lv(q.hint, locale); }

  const btn = _rootEl.querySelector('#gm-det-hint-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.textContent = g.hintUsed; }
  if (btn) {
    btn.innerHTML = `<span class="gm-det-bulb" aria-hidden="true"></span><strong>${g.hintUsed}</strong>`;
  }

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
    pct = Math.round(gs.det.correct / gs.det.questions.length * 100);
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

  if (_boundRoot && _boundPointerHandler) {
    _boundRoot.removeEventListener('pointerdown', _boundPointerHandler);
  }

  // Delegate all game actions via a single listener on root
  _boundPointerHandler = (ev) => {
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
      if (_gameState && _gameState.isStarting) return;
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
    if (action === 'confirm-back') { _openModal('gm-modal-back'); return; }
    if (action === 'confirm-restart') { _openModal('gm-modal-restart'); return; }
    if (action === 'close-modal-back') { _closeModal('gm-modal-back', actions); return; }
    if (action === 'close-modal-restart') { _closeModal('gm-modal-restart', actions); return; }

    if (action === 'do-back') {
      _hideModal('gm-modal-back');
      cleanup();
      actions.closeGame();
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
    if (action === 'view-recipe') {
      const recipeKey = _gameState && _gameState.endRecipe;
      if (!_gameState || _gameState.game === 'puzzle' || !recipeKey) return;
      cleanup();
      if (actions.openGameRecipe) {
        actions.openGameRecipe(recipeKey);
      } else {
        actions.closeGame();
      }
      return;
    }

    if (action === 'go-select') {
      cleanup();
      actions.closeGame();
      return;
    }
  };
  _boundRoot = root;
  root.addEventListener('pointerdown', _boundPointerHandler);

  // After render, re-bind puzzle drag/drop if we're on the puzzle screen
  if (_gameState && _gameState.subScreen === 'puzzle') {
    _bindPuzzle(actions);
  }
}
