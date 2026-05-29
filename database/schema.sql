PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY,
  name_sl TEXT NOT NULL,
  description_sl TEXT,
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  servings INTEGER,
  difficulty INTEGER CHECK(difficulty IN (1,2,3)),
  season TEXT CHECK(season IN ('pomlad','poletje','jesen','zima','vse')),
  is_vegetarian INTEGER DEFAULT 0,
  is_vegan INTEGER DEFAULT 0,
  is_gluten_free INTEGER DEFAULT 0,
  is_lactose_free INTEGER DEFAULT 0,
  is_heart_healthy INTEGER DEFAULT 0,
  is_quick INTEGER DEFAULT 0,
  steps_sl TEXT,
  image_path TEXT,
  slug TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY,
  name_sl TEXT NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT
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
