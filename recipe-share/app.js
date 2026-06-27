(function () {
  const config = window.ZDRAVO_RECIPE_SHARE_CONFIG || {};
  const staticPayload = window.ZDRAVO_STATIC_RECIPE_PAYLOAD || null;
  const appRoot = document.getElementById('app');
  const urlParams = new URLSearchParams(window.location.search);
  const locale = staticPayload?.locale === 'en' || urlParams.get('locale') === 'en' ? 'en' : 'sl';
  const autoDownload = Boolean(staticPayload?.autoDownload) || urlParams.get('download') === '1' || recipePathParts().download;
  const state = {
    recipe: null,
    selectedIngredients: selectedIngredientsFromConfig(),
    servings: null,
    cssText: typeof window.ZDRAVO_RECIPE_SHARE_CSS === 'string' ? window.ZDRAVO_RECIPE_SHARE_CSS : ''
  };

  const copy = {
    en: {
      appTitle: 'Zdravo Jem',
      loading: 'Loading recipe...',
      configError: 'Recipe share is not configured.',
      notFound: 'Recipe not found.',
      loadError: 'Recipe could not be loaded.',
      eyebrow: 'Kitchen recipe',
      plateBadge: 'Zdravo plate',
      time: 'Time',
      difficulty: 'Difficulty',
      servings: 'Servings',
      ingredientMatch: 'Ingredient match',
      selected: 'selected',
      toGather: 'to gather',
      keepRecipe: 'Save this recipe',
      keepText: 'Download a copy for cooking, or send it to your inbox.',
      downloadTitle: 'Download HTML',
      downloadText: 'Save on this device',
      emailTitle: 'Send by email',
      emailText: 'Recipe to your inbox',
      suitableFor: 'Suitable for',
      preparationMethod: 'Preparation method',
      ingredients: 'Ingredients',
      marketIngredients: 'Market ingredients',
      marketBadge: 'Fresh picks',
      steps: 'Steps',
      additionalTip: 'Additional advice',
      ingredient: 'ingredient',
      ingredientsPlural: 'ingredients'
    },
    sl: {
      appTitle: 'Zdravo Jem',
      loading: 'Nalaganje recepta...',
      configError: 'Javna stran recepta ni nastavljena.',
      notFound: 'Recept ni najden.',
      loadError: 'Recepta ni bilo mogoce naloziti.',
      eyebrow: 'Kuhinjski recept',
      plateBadge: 'Zdravo kro&#382;nik',
      time: '&#268;as',
      difficulty: 'Zahtevnost',
      servings: 'Porcije',
      ingredientMatch: 'Ujemanje sestavin',
      selected: 'izbranih',
      toGather: 'za dodati',
      keepRecipe: 'Shrani recept',
      keepText: 'Prenesi kopijo za kuhanje ali si jo poslji na e-mail.',
      downloadTitle: 'Prenesi HTML',
      downloadText: 'Shrani na napravo',
      emailTitle: 'Po&#353;lji na e-mail',
      emailText: 'Recept v tvojem nabiralniku',
      suitableFor: 'Primerno za',
      preparationMethod: 'Na&#269;in priprave',
      ingredients: 'Sestavine',
      marketIngredients: 'Sestavine iz tr&#382;nice',
      marketBadge: 'Sveza izbira',
      steps: 'Koraki',
      additionalTip: 'Dodatni nasvet',
      ingredient: 'sestavina',
      ingredientsPlural: 'sestavin'
    }
  }[locale];

  const difficultyLabels = {
    en: {
      Enostavna: 'Easy',
      Normalna: 'Medium',
      Zahtevna: 'Hard'
    },
    sl: {
      Enostavna: 'Enostavna',
      Normalna: 'Normalna',
      Zahtevna: 'Zahtevna'
    }
  };

  const tagLabels = {
    en: {
      Zajtrk: 'Breakfast',
      Malica: 'Snack',
      Kosilo: 'Lunch',
      'Lahkotno kosilo': 'Light lunch',
      Vecerja: 'Dinner',
      Sladica: 'Dessert',
      Priloga: 'Side dish',
      Predjed: 'Starter',
      Enoloncnica: 'Stew',
      'Jed na zlico': 'Spoon dish',
      Prigrizek: 'Snack',
      'Praznicna jed': 'Holiday dish'
    }
  };

  function recipePathParts() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const recipesIndex = parts.indexOf('recipes');
    const recipeKey = recipesIndex >= 0 ? parts[recipesIndex + 1] : '';

    return {
      key: recipeKey || urlParams.get('id') || urlParams.get('slug') || '',
      download: recipesIndex >= 0 && parts[recipesIndex + 2] === 'download'
    };
  }

  function normalizeSupabaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function encodeStoragePath(imagePath) {
    return String(imagePath || '')
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTextBlock(value) {
    const text = String(value || '').trim();
    return text ? escapeHtml(text).replace(/\r?\n/g, '<br>') : '';
  }

  function normalizeName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function selectedIngredientsFromConfig() {
    if (Array.isArray(staticPayload?.selectedIngredients) && staticPayload.selectedIngredients.length) {
      return new Set(staticPayload.selectedIngredients.map(normalizeName).filter(Boolean));
    }

    const encoded = urlParams.get('selected');
    if (!encoded) {
      return new Set();
    }

    try {
      const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const bytes = Uint8Array.from(window.atob(padded), (char) => char.charCodeAt(0));
      const parsed = JSON.parse(new TextDecoder().decode(bytes));

      if (!Array.isArray(parsed)) {
        return new Set();
      }

      return new Set(parsed.map(normalizeName).filter(Boolean));
    } catch (error) {
      return new Set();
    }
  }

  function placeholderImage() {
    return 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
        <rect width="640" height="480" fill="#f5efe1"/>
        <circle cx="320" cy="220" r="92" fill="#d9e7b5"/>
        <path d="M244 276c42 58 110 58 152 0" fill="none" stroke="#6d7f38" stroke-width="24" stroke-linecap="round"/>
        <path d="M320 128c46-58 112-66 148-48-12 66-58 104-148 112" fill="#88aa45"/>
      </svg>
    `);
  }

  function storageImageUrl(bucket, imagePath) {
    const supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl);
    const normalizedPath = String(imagePath || '').trim();

    if (/^(data:|https?:\/\/)/i.test(normalizedPath)) {
      return normalizedPath;
    }

    if (!supabaseUrl || !normalizedPath || normalizedPath.startsWith('assets/')) {
      return placeholderImage();
    }

    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(normalizedPath)}`;
  }

  function recipeImageSrc(recipe) {
    return storageImageUrl(config.recipeImageBucket || 'recipe-images', recipe.image_path);
  }

  function ingredientImageSrc(ingredient) {
    return storageImageUrl(config.ingredientImageBucket || 'ingredient-images', ingredient.image_path);
  }

  async function supabaseRows(table, params) {
    const supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl);
    const anonKey = String(config.supabaseAnonKey || config.supabaseKey || '').trim();

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase config');
    }

    const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
    Object.entries(params || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${anonKey}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    return response.json();
  }

  async function loadRecipe() {
    if (staticPayload?.recipe) {
      return staticPayload.recipe;
    }

    const key = decodeURIComponent(recipePathParts().key || '').trim();

    if (!key) {
      throw new Error('Missing recipe key');
    }

    const isNumeric = /^\d+$/.test(key);
    const recipeRows = await supabaseRows('recipes', {
      select: '*',
      [isNumeric ? 'id' : 'slug']: `eq.${key}`,
      limit: '1'
    });
    const recipe = recipeRows[0];

    if (!recipe) {
      return null;
    }

    const links = await supabaseRows('recipe_ingredients', {
      select: 'recipe_id,ingredient_id,quantity,unit,is_optional',
      recipe_id: `eq.${recipe.id}`,
      order: 'ingredient_id.asc'
    });
    const ingredientIds = links
      .map((link) => Number(link.ingredient_id))
      .filter((id) => Number.isInteger(id));
    let ingredientRows = [];

    if (ingredientIds.length) {
      ingredientRows = await supabaseRows('ingredients', {
        select: 'id,name_sl,image_path',
        id: `in.(${ingredientIds.join(',')})`
      });
    }

    const ingredientsById = new Map(ingredientRows.map((ingredient) => [Number(ingredient.id), ingredient]));
    recipe.ingredients = links.map((link) => ({
      ...link,
      id: link.ingredient_id,
      name_sl: ingredientsById.get(Number(link.ingredient_id))?.name_sl || '',
      image_path: ingredientsById.get(Number(link.ingredient_id))?.image_path || ''
    })).filter((ingredient) => ingredient.name_sl);

    return recipe;
  }

  function recipeTitle(recipe) {
    return recipe.name_sl || '';
  }

  function recipeDescription(recipe) {
    return recipe.description_sl || '';
  }

  function recipeSteps(recipe) {
    try {
      const parsed = JSON.parse(recipe.steps_sl || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return String(recipe.steps_sl || '')
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean);
    }
  }

  function recipeTimeMinutes(recipe) {
    if (recipe.time_min !== undefined && recipe.time_min !== null) {
      return Number(recipe.time_min || 0);
    }

    return Number(recipe.prep_time_min || 0) + Number(recipe.cook_time_min || 0);
  }

  function slServingsLabel(quantity, unit) {
    const n = Number(quantity);

    if (unit === 'porcija' || unit === 'porcije' || unit === 'porcij') {
      if (n === 1) return 'porcija';
      if (n >= 2 && n <= 4) return 'porcije';
      return 'porcij';
    }

    if (unit === 'kos' || unit === 'kosi' || unit === 'kosov') {
      if (n === 1) return 'kos';
      if (n >= 2 && n <= 4) return 'kosi';
      return 'kosov';
    }

    return unit || '';
  }

  function recipeServingsText(recipe, quantityOverride) {
    const quantity = quantityOverride ?? recipe.servings_quantity ?? recipe.servings;
    if (quantity === undefined || quantity === null || quantity === '') {
      return '';
    }

    const unit = String(recipe.servings_unit || '').trim();
    const enUnits = {
      porcija: 'serving',
      porcije: 'servings',
      porcij: 'servings',
      kos: 'piece',
      kosi: 'pieces',
      kosov: 'pieces'
    };
    const label = locale === 'en'
      ? enUnits[unit] || unit
      : slServingsLabel(quantity, unit);

    return [formatServingQty(quantity), label].filter(Boolean).join(' ');
  }

  function formatServingQty(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return '0';
    return String(parseFloat(number.toFixed(2)));
  }

  function amountText(item, ratio = 1) {
    const quantity = item.quantity !== undefined && item.quantity !== null && item.quantity !== ''
      ? formatServingQty(Number(item.quantity) * ratio)
      : '';
    return [quantity, item.unit].filter(Boolean).join(' ').trim();
  }

  function parseTags(value) {
    const text = String(value || '').trim();
    if (!text) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag || '').trim()).filter(Boolean);
      }
    } catch (error) {
      // Fall back to simple separators.
    }

    return text.split(/[,;\n]/).map((tag) => tag.trim()).filter(Boolean);
  }

  function tagLabel(tag) {
    return tagLabels[locale]?.[tag] || tag;
  }

  function iconSvg(path) {
    return `
      <svg class="recipe-detail-icon" viewBox="0 0 24 24" aria-hidden="true">
        ${path}
      </svg>
    `;
  }

  function leafSvg(className) {
    return `
      <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19.5 5.2c-5.9 0-10.6 4.4-10.6 9.8 0 2.6 2.1 4.8 4.8 4.8 6.1 0 10.8-5.7 10.8-12.2 0-1.6-1.2-2.4-2.7-2.4-1.2 0-1.7 0-2.3 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8.2 18.2c3-1.4 6.3-4.7 8.7-9.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `;
  }

  function renderStatCard(icon, label, value, modifier) {
    if (!value) {
      return '';
    }

    return `
      <span class="recipe-stat-card ${modifier || ''}">
        ${iconSvg(icon)}
        <span class="recipe-stat-card__copy">
          <small>${label}</small>
          <strong>${value}</strong>
        </span>
      </span>
    `;
  }

  function renderServingsCard(recipe) {
    const quantity = recipe.servings_quantity ?? recipe.servings;
    if (quantity === undefined || quantity === null || quantity === '') return '';

    const current = state.servings || Number(quantity);

    return `
      <span class="recipe-stat-card recipe-stat-card--servings" data-default-servings="${Number(quantity)}">
        ${iconSvg('<path d="M7 3v8M11 3v8M9 3v18M17 3c1.5 2.2 1.5 5.6 0 8v10" />')}
        <span class="recipe-stat-card__copy">
          <small>${copy.servings}</small>
          <span class="recipe-servings-control">
            <button class="recipe-servings-btn" data-action="serving-dec" aria-label="-" type="button">-</button>
            <strong class="recipe-servings-val">${escapeHtml(recipeServingsText(recipe, current))}</strong>
            <button class="recipe-servings-btn" data-action="serving-inc" aria-label="+" type="button">+</button>
          </span>
        </span>
      </span>
    `;
  }

  function ingredientCountText(count) {
    if (locale === 'en') {
      return `${count} ${count === 1 ? copy.ingredient : copy.ingredientsPlural}`;
    }

    if (count === 1) return '1 sestavina';
    if (count === 2) return '2 sestavini';
    if (count === 3 || count === 4) return `${count} sestavine`;
    return `${count} sestavin`;
  }

  function currentServingRatio(recipe) {
    const defaultServings = Number(recipe.servings_quantity ?? recipe.servings);
    return defaultServings && state.servings ? state.servings / defaultServings : 1;
  }

  function renderRecipe(recipe) {
    const ingredients = recipe.ingredients || [];
    const steps = recipeSteps(recipe);
    const ratio = currentServingRatio(recipe);
    const availableCount = ingredients.filter((item) => state.selectedIngredients.has(normalizeName(item.name_sl))).length;
    const missingCount = Math.max(ingredients.length - availableCount, 0);
    const matchPercent = ingredients.length ? Math.round((availableCount / ingredients.length) * 100) : 0;
    const marketList = ingredients.slice(0, 5);
    const tags = parseTags(recipe.tags);
    const preparationMethod = formatTextBlock(recipe.nacin_priprave);
    const additionalTip = formatTextBlock(recipe.dodatni_nasvet);
    const title = recipeTitle(recipe);
    const description = recipeDescription(recipe);
    const difficulty = difficultyLabels[locale]?.[recipe.difficulty] || recipe.difficulty || '';

    document.documentElement.lang = locale;
    document.title = `${title || copy.appTitle} - ${copy.appTitle}`;

    appRoot.innerHTML = `
      <section class="screen screen--detail">
        <div class="recipe-sheet">
          <header class="recipe-sheet__topbar">
            <button class="recipe-back" data-action="download" aria-label="${copy.downloadTitle}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
              </svg>
            </button>
            <span>${copy.ingredients}</span>
            <strong>${leafSvg('brand-leaf')}${copy.appTitle.toUpperCase()}</strong>
          </header>

          <div class="recipe-sheet__scroll">
            <section class="recipe-hero">
              <img class="recipe-hero__image" src="${recipeImageSrc(recipe)}" alt="${escapeHtml(title)}" />
              <div class="recipe-hero__shade" aria-hidden="true"></div>
              <div class="recipe-hero__badge">
                ${leafSvg('recipe-hero__leaf')}
                <span>${copy.plateBadge}</span>
              </div>
              <div class="recipe-hero__copy">
                <span class="recipe-hero__eyebrow">${copy.eyebrow}</span>
                <h1>${escapeHtml(title)}</h1>
                <p>${escapeHtml(description)}</p>
              </div>
            </section>

            <div class="recipe-stat-grid">
              ${renderStatCard('<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />', copy.time, `${recipeTimeMinutes(recipe)} min`, 'recipe-stat-card--time')}
              ${renderStatCard('<path d="M12 3l2.2 5.5 5.8.4-4.5 3.7 1.4 5.7L12 15.2 7.1 18.3l1.4-5.7L4 8.9l5.8-.4L12 3z" />', copy.difficulty, difficulty, 'recipe-stat-card--difficulty')}
              ${renderServingsCard(recipe)}
            </div>

            <section class="recipe-match-panel" style="--recipe-match: ${matchPercent}%">
              <div class="recipe-section-title">
                <h2>${copy.ingredientMatch}</h2>
                <span aria-hidden="true">${leafSvg('recipe-section-leaf')}</span>
              </div>
              <div class="recipe-match-meter" aria-hidden="true"><span></span></div>
              <div class="recipe-match-summary">
                <strong>${availableCount}/${ingredients.length}</strong>
                <span>${copy.selected}</span>
                <em>${missingCount} ${copy.toGather}</em>
              </div>
            </section>

            ${tags.length || preparationMethod ? `
              <section class="recipe-card-panel recipe-suitability-panel">
                ${tags.length ? `
                  <div class="recipe-section-title">
                    <h2>${copy.suitableFor}</h2>
                    <span aria-hidden="true">${leafSvg('recipe-section-leaf')}</span>
                  </div>
                  <div class="recipe-suitability-tags">
                    ${tags.map((tag) => `<span>${escapeHtml(tagLabel(tag))}</span>`).join('')}
                  </div>
                ` : ''}
                ${preparationMethod ? `
                  <h2 class="${tags.length ? 'recipe-suitability-panel__prep-heading' : ''}">${copy.preparationMethod}</h2>
                  <p class="recipe-text-panel__body">${preparationMethod}</p>
                ` : ''}
              </section>
            ` : ''}

            <section class="recipe-card-panel recipe-ingredients-panel">
              <div class="recipe-ingredients-heading">
                <h2>${copy.ingredients}</h2>
                <span>${ingredientCountText(ingredients.length)}</span>
              </div>
              <div class="recipe-ingredient-grid">
                ${ingredients.map((item) => {
                  const hasIt = state.selectedIngredients.has(normalizeName(item.name_sl));
                  const amount = amountText(item, ratio);
                  return `
                    <div class="recipe-ingredient-tile ${hasIt ? 'is-available' : 'is-missing'}">
                      <span class="recipe-ingredient-photo">
                        <img src="${ingredientImageSrc(item)}" alt="${escapeHtml(item.name_sl)}" loading="lazy" />
                      </span>
                      <span class="recipe-ingredient-copy">
                        <strong>${escapeHtml(item.name_sl)}</strong>
                        ${amount ? `<em>${escapeHtml(amount)}</em>` : ''}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </section>

            <section class="recipe-market-panel">
              <div class="recipe-market-title">
                <h2>${copy.marketIngredients}</h2>
                <span>${copy.marketBadge}</span>
              </div>
              <div class="recipe-market-row">
                ${marketList.map((item) => `
                  <div class="recipe-market-chip">
                    <span class="recipe-market-chip__photo">
                      <img src="${ingredientImageSrc(item)}" alt="${escapeHtml(item.name_sl)}" loading="lazy" />
                    </span>
                    ${escapeHtml(item.name_sl)}
                  </div>
                `).join('')}
              </div>
            </section>

            <section class="recipe-card-panel recipe-prep-panel">
              <h2>${copy.steps}</h2>
              <div class="recipe-prep-list">
                ${steps.map((step, index) => `
                  <div class="recipe-prep-step">
                    <span class="recipe-prep-number">${index + 1}</span>
                    ${iconSvg('<path d="M5 12h14M7 8h10M8 16h8" />')}
                    <p>${escapeHtml(step)}</p>
                  </div>
                `).join('')}
              </div>
            </section>

            ${additionalTip ? `
              <section class="recipe-card-panel recipe-tip-panel">
                <div class="recipe-section-title">
                  <h2>${copy.additionalTip}</h2>
                  <span aria-hidden="true">${leafSvg('recipe-section-leaf')}</span>
                </div>
                <p>${additionalTip}</p>
              </section>
            ` : ''}
          </div>
        </div>
      </section>
    `;
  }

  function setStatus(message) {
    appRoot.innerHTML = `
      <section class="screen screen--standard">
        <div class="empty-state">
          <h1>${message}</h1>
        </div>
      </section>
    `;
  }

  function mailtoUrl() {
    const recipe = state.recipe;
    const steps = recipeSteps(recipe);
    const ingredientLines = (recipe.ingredients || []).map((item) => {
      const amount = amountText(item, currentServingRatio(recipe));
      return `- ${item.name_sl}${amount ? ` (${amount})` : ''}`;
    });
    const body = [
      recipeTitle(recipe),
      recipeDescription(recipe),
      '',
      copy.ingredients,
      ...ingredientLines,
      '',
      copy.steps,
      ...steps.map((step, index) => `${index + 1}. ${step}`)
    ].filter(Boolean).join('\n');

    return `mailto:?subject=${encodeURIComponent(recipeTitle(recipe))}&body=${encodeURIComponent(body)}`;
  }

  function safeFileName(value) {
    return String(value || 'recipe')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'recipe';
  }

  async function stylesheetText() {
    if (state.cssText) {
      return state.cssText;
    }

    const inlineStyle = document.getElementById('zdravo-recipe-inline-style');
    if (inlineStyle?.textContent) {
      state.cssText = inlineStyle.textContent;
      return state.cssText;
    }

    try {
      const response = await fetch('./styles.css', { cache: 'force-cache' });
      state.cssText = response.ok ? await response.text() : '';
    } catch (error) {
      state.cssText = '';
    }

    return state.cssText;
  }

  async function downloadStandaloneHtml() {
    if (!state.recipe) {
      return;
    }

    const css = await stylesheetText();
    const screen = appRoot.querySelector('.screen--detail');
    const html = `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3b6d11" />
    <title>${escapeHtml(recipeTitle(state.recipe))} - ${copy.appTitle}</title>
    <style>${css}</style>
  </head>
  <body data-screen="detail">
    <div class="app-root">${screen ? screen.outerHTML : ''}</div>
  </body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${safeFileName(state.recipe.slug || state.recipe.id || recipeTitle(state.recipe))}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  function bind() {
    appRoot.onclick = (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) {
        return;
      }

      const action = target.dataset.action;

      if (action === 'download') {
        downloadStandaloneHtml();
        return;
      }

      if (action === 'email') {
        window.location.href = mailtoUrl();
        return;
      }

      if (action === 'serving-dec' || action === 'serving-inc') {
        const current = state.servings || Number(state.recipe.servings_quantity ?? state.recipe.servings) || 1;
        state.servings = action === 'serving-dec' ? Math.max(1, current - 1) : current + 1;
        renderRecipe(state.recipe);
      }
    };
  }

  function fitAppScale() {
    const styles = getComputedStyle(document.documentElement);
    const baseH = parseFloat(styles.getPropertyValue('--app-base-h')) || 854;
    const scale = window.innerHeight / baseH;
    const logicalWidth = window.innerWidth / scale;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--app-scale', String(scale));
    rootStyle.setProperty('--app-logical-w', logicalWidth + 'px');
  }

  async function init() {
    fitAppScale();
    window.addEventListener('resize', fitAppScale);
    window.addEventListener('orientationchange', fitAppScale);
    document.documentElement.lang = locale;
    setStatus(copy.loading);

    if (!staticPayload?.recipe && (!normalizeSupabaseUrl(config.supabaseUrl) || !String(config.supabaseAnonKey || config.supabaseKey || '').trim())) {
      setStatus(copy.configError);
      return;
    }

    try {
      state.recipe = await loadRecipe();

      if (!state.recipe) {
        setStatus(copy.notFound);
        return;
      }

      state.servings = Number(state.recipe.servings_quantity ?? state.recipe.servings) || null;
      renderRecipe(state.recipe);
      bind();

      if (autoDownload) {
        const downloadKey = `zdravo-download:${state.recipe.id}:${window.location.search}`;
        if (!window.sessionStorage.getItem(downloadKey)) {
          window.sessionStorage.setItem(downloadKey, '1');
          window.setTimeout(downloadStandaloneHtml, 600);
        }
      }
    } catch (error) {
      console.warn(error);
      setStatus(error.message === 'Missing Supabase config' ? copy.configError : copy.loadError);
    }
  }

  init();
})();
