PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY,
  name_sl TEXT NOT NULL,
  description_sl TEXT,
  servings_quantity INTEGER,
  steps_sl TEXT,
  image_path TEXT,
  slug TEXT UNIQUE,
  created_at TEXT,
  updated_at TEXT,
  time_min INTEGER,
  difficulty TEXT CHECK(difficulty IN ('Enostavna','Normalna','Zahtevna') OR difficulty IS NULL),
  tags TEXT,
  servings_unit TEXT,
  nacin_priprave TEXT,
  dodatni_nasvet TEXT,
  qr_url TEXT
);

CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY,
  name_sl TEXT NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT,
  image_path TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity TEXT,
  unit TEXT,
  is_optional INTEGER DEFAULT 0,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
