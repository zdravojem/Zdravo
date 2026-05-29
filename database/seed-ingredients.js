const ingredients = [
  { name_sl: 'Krompir', category: 'zelenjava', emoji: '🥔' },
  { name_sl: 'Korenje', category: 'zelenjava', emoji: '🥕' },
  { name_sl: 'Čebula', category: 'zelenjava', emoji: '🧅' },
  { name_sl: 'Česen', category: 'zelenjava', emoji: '🧄' },
  { name_sl: 'Zelje', category: 'zelenjava', emoji: '🥬' },
  { name_sl: 'Bučke', category: 'zelenjava', emoji: '🥒' },
  { name_sl: 'Paprika', category: 'zelenjava', emoji: '🫑' },
  { name_sl: 'Paradižnik', category: 'zelenjava', emoji: '🍅' },
  { name_sl: 'Por', category: 'zelenjava', emoji: '🥬' },
  { name_sl: 'Repa', category: 'zelenjava', emoji: '🍠' },
  { name_sl: 'Pesa', category: 'zelenjava', emoji: '🥕' },
  { name_sl: 'Šparglji', category: 'zelenjava', emoji: '🥦' },
  { name_sl: 'Brokoli', category: 'zelenjava', emoji: '🥦' },
  { name_sl: 'Cvetača', category: 'zelenjava', emoji: '🥦' },
  { name_sl: 'Špinača', category: 'zelenjava', emoji: '🥬' },
  { name_sl: 'Jurčki', category: 'zelenjava', emoji: '🍄' },

  { name_sl: 'Govedina', category: 'meso_ribe', emoji: '🥩' },
  { name_sl: 'Svinjina', category: 'meso_ribe', emoji: '🥩' },
  { name_sl: 'Piščanec', category: 'meso_ribe', emoji: '🍗' },
  { name_sl: 'Postrv', category: 'meso_ribe', emoji: '🐟' },
  { name_sl: 'Kranjska klobasa', category: 'meso_ribe', emoji: '🌭' },
  { name_sl: 'Slanina', category: 'meso_ribe', emoji: '🥓' },
  { name_sl: 'Telečje meso', category: 'meso_ribe', emoji: '🥩' },
  { name_sl: 'Jagnjetina', category: 'meso_ribe', emoji: '🍖' },

  { name_sl: 'Mleko', category: 'mlecni', emoji: '🥛' },
  { name_sl: 'Jajca', category: 'mlecni', emoji: '🥚' },
  { name_sl: 'Sir (Tolminc)', category: 'mlecni', emoji: '🧀' },
  { name_sl: 'Kisla smetana', category: 'mlecni', emoji: '🥣' },
  { name_sl: 'Maslo', category: 'mlecni', emoji: '🧈' },
  { name_sl: 'Jogurt', category: 'mlecni', emoji: '🥣' },
  { name_sl: 'Skuta', category: 'mlecni', emoji: '🧀' },

  { name_sl: 'Ajda', category: 'zita', emoji: '🌾' },
  { name_sl: 'Koruza', category: 'zita', emoji: '🌽' },
  { name_sl: 'Pšenična moka', category: 'zita', emoji: '🌾' },
  { name_sl: 'Ječmen', category: 'zita', emoji: '🌾' },
  { name_sl: 'Fižol', category: 'zita', emoji: '🫘' },
  { name_sl: 'Leča', category: 'zita', emoji: '🫘' },
  { name_sl: 'Riž', category: 'zita', emoji: '🍚' },
  { name_sl: 'Kruh', category: 'zita', emoji: '🍞' },

  { name_sl: 'Jabolka', category: 'sadje', emoji: '🍎' },
  { name_sl: 'Hruške', category: 'sadje', emoji: '🍐' },
  { name_sl: 'Češnje', category: 'sadje', emoji: '🍒' },
  { name_sl: 'Borovnice', category: 'sadje', emoji: '🫐' },
  { name_sl: 'Maline', category: 'sadje', emoji: '🫐' },
  { name_sl: 'Slive', category: 'sadje', emoji: '🍑' },

  { name_sl: 'Sol', category: 'zacimbe', emoji: '🧂' },
  { name_sl: 'Poper', category: 'zacimbe', emoji: '🌶️' },
  { name_sl: 'Lovorov list', category: 'zacimbe', emoji: '🌿' },
  { name_sl: 'Timijan', category: 'zacimbe', emoji: '🌿' },
  { name_sl: 'Rožmarin', category: 'zacimbe', emoji: '🌿' },
  { name_sl: 'Peteršilj', category: 'zacimbe', emoji: '🌿' },
  { name_sl: 'Drobnjak', category: 'zacimbe', emoji: '🌿' },
  { name_sl: 'Meta', category: 'zacimbe', emoji: '🌿' }
];

module.exports = function seedIngredients(db) {
  const insert = db.prepare(
    'INSERT INTO ingredients (name_sl, category, emoji) VALUES (?, ?, ?)'
  );

  const insertMany = db.transaction((rows) => {
    rows.forEach((item) => {
      insert.run(item.name_sl, item.category, item.emoji);
    });
  });

  insertMany(ingredients);
};
