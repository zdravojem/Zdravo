const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const sourceDir = path.join(appDir, 'recipe-share');
const outputDir = path.resolve(process.env.ZDRAVO_RECIPE_SHARE_OUTPUT || path.join(appDir, 'dist', 'recipe-share'));

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};
  const content = fs.readFileSync(filePath, 'utf8');

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    values[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });

  return values;
}

function parseJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {};
  }
}

function readConfigFiles() {
  return [
    path.join(appDir, '..', 'admin', 'recipe-admin', '.env.local'),
    path.join(appDir, '.env.local'),
    path.join(appDir, '.env'),
    path.join(appDir, 'supabase-config.json')
  ].reduce((values, filePath) => {
    const nextValues = filePath.endsWith('.json') ? parseJsonFile(filePath) : parseEnvFile(filePath);
    return { ...values, ...nextValues };
  }, {});
}

function firstValue(values, names) {
  return names
    .map((name) => process.env[name] || values[name] || values[name[0].toLowerCase() + name.slice(1)])
    .find((value) => String(value || '').trim()) || '';
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.name === 'config.js') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function writeConfig(values) {
  const supabaseUrl = firstValue(values, [
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_PUBLIC_SUPABASE_URL',
    'url',
    'supabaseUrl'
  ]);
  const supabaseAnonKey = firstValue(values, [
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'anonKey',
    'supabaseAnonKey'
  ]);
  const recipeImageBucket = firstValue(values, ['RECIPE_IMAGE_BUCKET', 'recipeImageBucket']) || 'recipe-images';
  const ingredientImageBucket = firstValue(values, ['INGREDIENT_IMAGE_BUCKET', 'ingredientImageBucket']) || 'ingredient-images';
  const config = {
    supabaseUrl,
    supabaseAnonKey,
    recipeImageBucket,
    ingredientImageBucket
  };

  fs.writeFileSync(
    path.join(outputDir, 'config.js'),
    `window.ZDRAVO_RECIPE_SHARE_CONFIG = ${JSON.stringify(config, null, 2)};\n`
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Recipe share build completed, but Supabase URL/key are missing.');
    console.warn('Set SUPABASE_URL and SUPABASE_ANON_KEY before deploying.');
  }
}

fs.rmSync(outputDir, { recursive: true, force: true });
copyDirectory(sourceDir, outputDir);
writeConfig(readConfigFiles());

console.log(`Recipe share site built at ${outputDir}`);
