// send-recipe-email
//
// The kiosk used to be an Electron app, and its main process held the Gmail
// credentials and built the recipe email. A PWA runs entirely in the browser and
// can do neither, so that code moved here unchanged in behaviour: same image URL
// resolution and same HTML/plain-text layout. Gmail API OAuth is preferred,
// with the app-password SMTP path retained for installations without OAuth.
//
// Deploy:  supabase functions deploy send-recipe-email
// Secrets: supabase secrets set GMAIL_USER=... GMAIL_APP_PASSWORD=... \
//            GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... GMAIL_REFRESH_TOKEN=... \
//            R2_PUBLIC_BASE_URL=...
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

type JsonRecord = Record<string, unknown>;

type EmailIngredient = {
  id: string | number;
  name: string;
  image_path: string;
  imageUrl: string;
  amount: string | number;
  unit: string;
};

type EmailRecipe = {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  shareUrl: string;
  tip: string;
  prepTime: string | number;
  servings: string | number;
  difficulty: string;
  ingredients: EmailIngredient[];
  steps: string[];
};

// Comma-separated list of kiosk origins, or "*" while setting things up.
const ALLOWED_ORIGINS = (Deno.env.get('ZDRAVO_ALLOWED_ORIGINS') || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// The kiosk is a public page, so its anon key is public too and cannot act as a
// secret. What keeps this endpoint from being a general-purpose mailer is the
// shape of what it sends: always a recipe email, always fully HTML-escaped,
// with bounded sizes. Set ZDRAVO_EMAIL_SHARED_SECRET to additionally require an
// x-zdravo-secret header from callers you control.
const SHARED_SECRET = Deno.env.get('ZDRAVO_EMAIL_SHARED_SECRET') || '';

const MAX_INGREDIENTS = 60;
const MAX_STEPS = 60;
const MAX_TEXT = 4000;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);

  return {
    'access-control-allow-origin': allowed ? origin || '*' : ALLOWED_ORIGINS[0] || '',
    'access-control-allow-headers': 'authorization, apikey, content-type, x-zdravo-secret',
    'access-control-allow-methods': 'POST, OPTIONS',
    'vary': 'origin'
  };
}

function json(request: Request, body: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'content-type': 'application/json' }
  });
}

/* -------------------------------------------------------------------------
   Image URLs (ported from main.js)
   ------------------------------------------------------------------------- */

function env(...names: string[]): string {
  for (const name of names) {
    const value = (Deno.env.get(name) || '').trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function encodeStoragePath(imagePath: string): string {
  return String(imagePath || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function normalizePublicBaseUrl(value: string): string {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');

  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function safeFileName(value: unknown, fallback = 'item'): string {
  return (
    String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || fallback
  );
}

function r2ImageTemplateValue(template: string, item: JsonRecord = {}): string {
  const id = Number(item.id ?? item.ingredient_id);
  const recipeIndex = Number.isInteger(id) && id >= 76 && id <= 145 ? String(id - 75) : '';
  const ingredientIndex = Number.isInteger(id)
    ? String(id >= 222 && id <= 257 ? id - 116 : id >= 117 ? id - 116 : id >= 12 ? id - 11 : id)
    : '';
  const slug = safeFileName(item.slug ?? item.name ?? item.name_sl ?? item.title ?? item.id);
  const templateText = String(template || '');

  if (
    (templateText.includes('{recipe_index}') && !recipeIndex) ||
    (templateText.includes('{ingredient_index}') && !ingredientIndex) ||
    (templateText.includes('{id}') && !safeFileName(item.id ?? item.ingredient_id ?? '', ''))
  ) {
    return '';
  }

  return templateText
    .replace(/\{id\}/g, safeFileName(item.id ?? item.ingredient_id ?? '', ''))
    .replace(/\{recipe_index\}/g, safeFileName(recipeIndex, ''))
    .replace(/\{ingredient_index\}/g, safeFileName(ingredientIndex, ''))
    .replace(/\{slug\}/g, slug)
    .replace(/\{name\}/g, slug)
    .replace(/\{image_path\}/g, String(item.image_path || '').replace(/^\/+/, ''));
}

function publicR2ObjectUrl(prefix: string, imagePath: string): string {
  const r2BaseUrl = normalizePublicBaseUrl(
    env('R2_PUBLIC_BASE_URL', 'CF_PUBLIC_BASE_URL', 'S3_PUBLIC_BASE_URL', 'ZDRAVO_RECIPE_QR_PUBLIC_BASE_URL')
  );
  const normalizedPrefix = String(prefix || '').replace(/^\/+|\/+$/g, '');
  const normalizedPath = String(imagePath || '').trim().replace(/^\/+/, '');

  if (!r2BaseUrl || !normalizedPath || /^https?:\/\//i.test(normalizedPath)) {
    return /^https?:\/\//i.test(normalizedPath) ? normalizedPath : '';
  }

  return `${r2BaseUrl}/${[normalizedPrefix, normalizedPath].filter(Boolean).map(encodeStoragePath).join('/')}`;
}

// Paths that only make sense inside the kiosk bundle; an email client cannot
// resolve them, so they are treated as "no image" and replaced by a template.
function isLocalEmailImagePath(value: unknown): boolean {
  const pathValue = String(value ?? '').trim();

  return (
    !pathValue ||
    pathValue.startsWith('assets/') ||
    pathValue.startsWith('../') ||
    pathValue.startsWith('/synced-images/') ||
    pathValue.startsWith('zdravo-image:')
  );
}

function supabaseStorageUrl(bucket: string, imagePath: string): string {
  const supabaseUrl = env('SUPABASE_URL', 'VITE_SUPABASE_URL', 'VITE_PUBLIC_SUPABASE_URL').replace(/\/+$/, '');

  if (!supabaseUrl) {
    return '';
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(imagePath)}`;
}

function publicRecipeImageUrl(recipe: JsonRecord): string {
  const explicitUrl = String(recipe.image_url ?? recipe.imageUrl ?? recipe.image ?? '').trim();

  if (/^https?:\/\//i.test(explicitUrl)) {
    return explicitUrl;
  }

  const templatePath = r2ImageTemplateValue(
    env('R2_RECIPE_IMAGE_TEMPLATE', 'CF_R2_RECIPE_IMAGE_TEMPLATE', 'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_TEMPLATE') ||
      '{recipe_index}.png',
    recipe
  );
  const storedImagePath = String(recipe.image_path ?? explicitUrl ?? '').trim();
  const imagePath = String(isLocalEmailImagePath(storedImagePath) ? templatePath : storedImagePath || templatePath).trim();

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (isLocalEmailImagePath(imagePath)) {
    return '';
  }

  const prefix = (
    env('R2_RECIPE_IMAGE_PREFIX', 'CF_R2_RECIPE_IMAGE_PREFIX', 'ZDRAVO_RECIPE_QR_RECIPE_IMAGE_PREFIX') ||
    'epix-group_recipes-photo-1-70_2026-06-04_0734'
  ).replace(/^\/+|\/+$/g, '');

  return publicR2ObjectUrl(prefix, imagePath) || supabaseStorageUrl('recipe-images', imagePath);
}

function publicIngredientImageUrl(ingredient: JsonRecord): string {
  const explicitUrl = String(ingredient.image_url ?? ingredient.imageUrl ?? '').trim();

  if (/^https?:\/\//i.test(explicitUrl)) {
    return explicitUrl;
  }

  const templatePath = r2ImageTemplateValue(
    env(
      'R2_INGREDIENT_IMAGE_TEMPLATE',
      'CF_R2_INGREDIENT_IMAGE_TEMPLATE',
      'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_TEMPLATE'
    ) || '{ingredient_index}.png',
    ingredient
  );
  const storedImagePath = String(ingredient.image_path ?? explicitUrl ?? '').trim();
  const imagePath = String(isLocalEmailImagePath(storedImagePath) ? templatePath : storedImagePath || templatePath).trim();

  if (isLocalEmailImagePath(imagePath)) {
    return '';
  }

  const prefix = (
    env('R2_INGREDIENT_IMAGE_PREFIX', 'CF_R2_INGREDIENT_IMAGE_PREFIX', 'ZDRAVO_RECIPE_QR_INGREDIENT_IMAGE_PREFIX') ||
    'ingredient-images'
  ).replace(/^\/+|\/+$/g, '');

  return publicR2ObjectUrl(prefix, imagePath) || supabaseStorageUrl('ingredient-images', imagePath);
}

/* -------------------------------------------------------------------------
   Payload normalisation
   ------------------------------------------------------------------------- */

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(value: unknown): string {
  return String(value ?? '').slice(0, MAX_TEXT);
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return String(value)
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizeEmailIngredient(item: unknown): EmailIngredient {
  if (typeof item === 'string') {
    return { id: '', name: clamp(item), imageUrl: '', image_path: '', amount: '', unit: '' };
  }

  const source = (item || {}) as JsonRecord;
  const ingredient = {
    id: (source.id ?? source.ingredient_id ?? '') as string | number,
    name: clamp(source.name ?? source.name_sl ?? ''),
    image_path: String(source.image_path ?? ''),
    amount: clamp(source.amount ?? source.quantity ?? ''),
    unit: clamp(source.unit ?? '')
  };

  return { ...ingredient, imageUrl: publicIngredientImageUrl(ingredient as JsonRecord) };
}

function normalizeRecipeForEmail(recipe: JsonRecord = {}): EmailRecipe {
  const ingredients = parseJsonArray(recipe.ingredients).slice(0, MAX_INGREDIENTS).map(normalizeEmailIngredient);
  const steps = parseJsonArray(recipe.steps ?? recipe.steps_sl).slice(0, MAX_STEPS).map(clamp);

  return {
    id: (recipe.id ?? '') as string | number,
    title: clamp(recipe.title ?? recipe.name_sl ?? 'Recept'),
    description: clamp(recipe.description ?? recipe.description_sl ?? ''),
    imageUrl: publicRecipeImageUrl(recipe),
    shareUrl: String(recipe.qr_url ?? recipe.qrUrl ?? '').trim(),
    tip: clamp(recipe.dodatni_nasvet ?? recipe.additionalTip ?? ''),
    prepTime: clamp(recipe.prep_time ?? recipe.prepTime ?? recipe.time_min ?? recipe.prep_time_min ?? ''),
    servings: clamp(recipe.servings ?? recipe.servings_text ?? recipe.servings_quantity ?? ''),
    difficulty: clamp(recipe.difficulty ?? ''),
    ingredients,
    steps
  };
}

/* -------------------------------------------------------------------------
   Email templates (ported verbatim from main.js)
   ------------------------------------------------------------------------- */

const emailPalette = {
  page: '#fff7ea',
  card: '#fffdf8',
  soft: '#fff6e8',
  greenSoft: '#eff9e5',
  border: '#eadcc7',
  greenBorder: '#d2e7c1',
  title: '#20242a',
  body: '#4f5b4a',
  muted: '#829274',
  brown: '#b3906a',
  green: '#719b44'
};

function emailMetaCardHtml(label: string, value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return `
    <td width="33.33%" style="padding:0 4px 8px 0; vertical-align:top;">
      <div style="min-height:42px; border:1px solid ${emailPalette.border}; border-radius:12px; background:${emailPalette.card}; padding:9px 8px; text-align:center;">
        <div style="font-size:10px; line-height:1.2; color:${emailPalette.green}; font-weight:800; text-transform:uppercase; letter-spacing:.2px;">${escapeHtml(label)}</div>
        <div style="font-size:13px; line-height:1.25; color:#283126; font-weight:900; margin-top:3px;">${escapeHtml(value)}</div>
      </div>
    </td>
  `;
}

function prepTimeText(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const text = String(value).trim();
  return /\bmin\b/i.test(text) ? text : `${text} min`;
}

function emailIngredientCardsHtml(ingredients: EmailIngredient[]): string {
  if (!ingredients.length) {
    return `
      <tr>
        <td style="padding:12px; color:${emailPalette.body}; font-weight:700;">Sestavine niso navedene.</td>
      </tr>
    `;
  }

  const cells = ingredients.map((item) => {
    const amount = [item.amount, item.unit].filter(Boolean).join(' ').trim();
    const imageHtml = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" width="54" height="54" alt="${escapeHtml(item.name)}" style="display:block; width:54px; height:54px; border-radius:999px; object-fit:cover; border:0;" />`
      : `<div style="width:54px; height:54px; border-radius:999px; background:#eef3e8;"></div>`;

    return `
      <td width="50%" style="padding:5px; vertical-align:top;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0; min-height:76px; background:${emailPalette.soft}; border:1px solid #f1e2c8; border-radius:12px;">
          <tr>
            <td width="66" style="padding:10px 0 10px 10px; vertical-align:middle;">${imageHtml}</td>
            <td style="padding:10px 10px 10px 8px; vertical-align:middle;">
              <div style="color:#2d332d; font-size:13px; font-weight:800; line-height:1.2; word-break:normal; overflow-wrap:normal;">${escapeHtml(item.name)}</div>
              ${amount ? `<div style="margin-top:3px; color:${emailPalette.muted}; font-size:12px; font-weight:700; line-height:1.2;">${escapeHtml(amount)}</div>` : ''}
            </td>
          </tr>
        </table>
      </td>
    `;
  });

  const rows: string[] = [];

  for (let index = 0; index < cells.length; index += 2) {
    rows.push(`<tr>${cells[index]}${cells[index + 1] || '<td width="50%" style="padding:5px;"></td>'}</tr>`);
  }

  return rows.join('');
}

function emailMarketChipsHtml(ingredients: EmailIngredient[]): string {
  return ingredients
    .slice(0, 5)
    .map((item) => {
      const imageHtml = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" width="28" height="28" alt="${escapeHtml(item.name)}" style="display:block; width:28px; height:28px; border-radius:999px; object-fit:cover; border:0;" />`
        : `<span style="display:block; width:28px; height:28px; border-radius:999px; background:#f1e8d9;"></span>`;

      return `
      <td width="20%" style="padding:4px; vertical-align:top; text-align:center;">
        <div style="min-height:58px; padding:7px 4px; border:1px solid #ebdcc1; border-radius:10px; background:${emailPalette.card}; color:#5f5848; font-size:10px; font-weight:800; line-height:1.15;">
          <div style="display:inline-block; margin:0 auto 4px;">${imageHtml}</div>
          <div>${escapeHtml(item.name)}</div>
        </div>
      </td>
    `;
    })
    .join('');
}

function emailStepsHtml(steps: string[]): string {
  if (!steps.length) {
    return `<p style="margin:0; color:${emailPalette.body};">Koraki priprave niso navedeni.</p>`;
  }

  return steps
    .map(
      (step, index) => `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; border-bottom:${index === steps.length - 1 ? '0' : '1px solid #efe5d6'};">
      <tr>
        <td width="34" style="padding:10px 0; vertical-align:top;">
          <span style="display:inline-block; width:23px; height:23px; border-radius:999px; background:#eef7e7; color:${emailPalette.green}; font-size:12px; font-weight:900; line-height:23px; text-align:center;">${index + 1}</span>
        </td>
        <td style="padding:10px 0; color:#665f4e; font-size:14px; font-weight:600; line-height:1.55;">${escapeHtml(step)}</td>
      </tr>
    </table>
  `
    )
    .join('');
}

function buildRecipeEmailHtml(recipe: EmailRecipe): string {
  const imageHtml = recipe.imageUrl
    ? `
      <img src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}" width="640" height="230" style="display:block; width:100%; max-width:640px; height:230px; border:0; border-radius:16px 16px 0 0; object-fit:cover; object-position:center;" />
    `
    : `
      <div style="height:230px; border-radius:16px 16px 0 0; background:#f5efe1; color:${emailPalette.green}; padding:94px 24px; text-align:center; font-weight:800; box-sizing:border-box;">
        Slika recepta
      </div>
    `;
  const tipHtml = recipe.tip
    ? `
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:#f5fbef; border:1px solid #dcebcf; border-radius:18px;">
        <tr>
          <td style="padding:16px;">
            <h2 style="margin:0 0 8px; color:${emailPalette.title}; font-size:20px; line-height:1.15; font-weight:900;">Dodatni nasvet</h2>
            <p style="margin:0; color:#665f4e; font-size:14px; line-height:1.6;">${escapeHtml(recipe.tip)}</p>
          </td>
        </tr>
      </table>
    `
    : '';

  return `
    <!doctype html>
    <html>
      <body style="margin:0; padding:0; background:${emailPalette.page}; font-family:Arial, Helvetica, sans-serif; color:${emailPalette.title};">
        <div style="width:100%; background:${emailPalette.page}; padding:22px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:0 14px;">
                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 8px; color:#24251f; font-size:14px; font-weight:900;">Zdravo Jem</td>
                  </tr>
                  <tr>
                    <td>${imageHtml}</td>
                  </tr>
                </table>

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:-20px; background:${emailPalette.card}; border:1px solid ${emailPalette.border}; border-radius:18px; box-shadow:0 10px 24px rgba(68, 48, 22, 0.08);">
                  <tr>
                    <td style="padding:26px 20px 18px;">
                      <div style="color:${emailPalette.green}; font-size:11px; line-height:1; font-weight:900; text-transform:uppercase; letter-spacing:.4px; margin-bottom:8px;">Kuhinjski recept</div>
                      <h1 style="margin:0 0 10px; max-width:420px; color:${emailPalette.title}; font-size:34px; line-height:.98; font-weight:900;">${escapeHtml(recipe.title)}</h1>
                      ${recipe.description ? `<p style="margin:0; max-width:540px; color:${emailPalette.body}; font-size:14px; font-weight:700; line-height:1.45;">${escapeHtml(recipe.description)}</p>` : ''}
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:16px;">
                        <tr>
                          ${emailMetaCardHtml('Cas', prepTimeText(recipe.prepTime))}
                          ${emailMetaCardHtml('Porcije', recipe.servings)}
                          ${emailMetaCardHtml('Zahtevnost', recipe.difficulty)}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:${emailPalette.card}; border:1px solid ${emailPalette.border}; border-radius:18px; box-shadow:0 8px 18px rgba(68, 48, 22, 0.06);">
                  <tr>
                    <td style="padding:16px;">
                      <h2 style="margin:0 0 8px; color:${emailPalette.title}; font-size:21px; line-height:1.15; font-weight:900;">Sestavine</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        ${emailIngredientCardsHtml(recipe.ingredients)}
                      </table>
                    </td>
                  </tr>
                </table>

                ${
                  recipe.ingredients.length
                    ? `
                  <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:${emailPalette.greenSoft}; border:1px solid ${emailPalette.greenBorder}; border-radius:18px;">
                    <tr>
                      <td style="padding:16px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:8px;">
                          <tr>
                            <td style="color:${emailPalette.title}; font-size:20px; font-weight:900; line-height:1.15;">Sestavine iz tr&#382;nice</td>
                            <td align="right" style="color:#5d7b41; font-size:11px; font-weight:800;">Sve&#382;a izbira</td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                          <tr>${emailMarketChipsHtml(recipe.ingredients)}</tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                `
                    : ''
                }

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:separate; border-spacing:0; margin-top:14px; background:${emailPalette.card}; border:1px solid ${emailPalette.border}; border-radius:18px; box-shadow:0 8px 18px rgba(68, 48, 22, 0.06);">
                  <tr>
                    <td style="padding:16px;">
                      <h2 style="margin:0 0 8px; color:${emailPalette.title}; font-size:21px; line-height:1.15; font-weight:900;">Koraki</h2>
                      ${emailStepsHtml(recipe.steps)}
                    </td>
                  </tr>
                </table>

                ${tipHtml}

                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:collapse;">
                  <tr>
                    <td style="padding:18px 8px 0; text-align:center; color:#665f4e; font-size:12px; font-weight:700; line-height:1.4;">
                      Recept poslan z Zdravo Jem kioska &middot; Ob&#269;ina Sevnica
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
}

function buildRecipeEmailText(recipe: EmailRecipe): string {
  const metaLines = [
    prepTimeText(recipe.prepTime) ? `Priprava: ${prepTimeText(recipe.prepTime)}` : '',
    recipe.servings ? `Porcije: ${recipe.servings}` : '',
    recipe.difficulty ? `Zahtevnost: ${recipe.difficulty}` : '',
    recipe.shareUrl ? `Stran recepta: ${recipe.shareUrl}` : ''
  ].filter(Boolean);
  const ingredientLines = recipe.ingredients.length
    ? recipe.ingredients.map((item) => {
        const amount = [item.amount, item.unit].filter(Boolean).join(' ').trim();
        return `- ${item.name}${amount ? ` (${amount})` : ''}`;
      })
    : ['- Sestavine niso navedene.'];
  const stepLines = recipe.steps.length
    ? recipe.steps.map((step, index) => `${index + 1}. ${step}`)
    : ['1. Koraki priprave niso navedeni.'];

  return [
    'Zdravo Jem',
    'Lokalni recepti za zdrav kroznik',
    '',
    recipe.title,
    recipe.description,
    '',
    ...metaLines,
    '',
    'Sestavine:',
    ...ingredientLines,
    '',
    'Postopek:',
    ...stepLines,
    '',
    'Recept poslan z Zdravo Jem kioska - Obcina Sevnica'
  ]
    .filter((line) => line !== undefined && line !== null && line !== '')
    .join('\n');
}

function compactEmailText(value: string): string {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function compactEmailHtml(value: string): string {
  return String(value || '')
    .replace(/>\s+</g, '><')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* -------------------------------------------------------------------------
   Delivery
   ------------------------------------------------------------------------- */

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function encodeBase64Url(bytes: Uint8Array): string {
  return encodeBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeMimeBase64(value: string): string {
  return encodeBase64(new TextEncoder().encode(value)).match(/.{1,76}/g)?.join('\r\n') || '';
}

async function gmailAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error_description || payload?.error || 'Gmail token refresh failed');
    (error as Error & { code?: string }).code = payload?.error || '';
    throw error;
  }

  return payload.access_token as string;
}

async function sendWithGmailApi(
  accessToken: string,
  {
    gmailUser,
    toEmail,
    recipe,
    htmlBody,
    textBody
  }: {
    gmailUser: string;
    toEmail: string;
    recipe: EmailRecipe;
    htmlBody: string;
    textBody: string;
  }
): Promise<void> {
  const compactHtmlBody = compactEmailHtml(htmlBody);
  const compactTextBody = compactEmailText(textBody);
  const boundary = `zdravo-jem-${crypto.randomUUID()}`;
  const senderDomain = gmailUser.split('@')[1] || 'gmail.com';
  const subject = `Recept: ${recipe.title}`;
  const raw = encodeBase64Url(
    new TextEncoder().encode(
      [
        `From: "Zdravo Jem" <${gmailUser}>`,
        `Reply-To: ${gmailUser}`,
        `To: ${toEmail}`,
        `Subject: =?UTF-8?B?${encodeBase64(new TextEncoder().encode(subject))}?=`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: <${crypto.randomUUID()}@${senderDomain}>`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        encodeMimeBase64(compactTextBody),
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        encodeMimeBase64(compactHtmlBody),
        `--${boundary}--`,
        ''
      ].join('\r\n')
    )
  );

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!response.ok) {
    throw new Error(`Gmail send failed (${response.status}): ${await response.text()}`);
  }
}

// Gmail closes port 465 to some hosts and 587 to others; try both rather than
// letting a blocked port look like a bad password.
const SMTP_PORTS = [465, 587];

async function sendWithSmtp({
  gmailUser,
  gmailAppPassword,
  toEmail,
  recipe,
  htmlBody,
  textBody
}: {
  gmailUser: string;
  gmailAppPassword: string;
  toEmail: string;
  recipe: EmailRecipe;
  htmlBody: string;
  textBody: string;
}): Promise<void> {
  const compactHtmlBody = compactEmailHtml(htmlBody);
  const compactTextBody = compactEmailText(textBody);
  const failures: string[] = [];

  for (const port of SMTP_PORTS) {
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port,
        tls: port === 465,
        auth: { username: gmailUser, password: gmailAppPassword.replace(/\s+/g, '') }
      }
    });

    try {
      await client.send({
        from: `Zdravo Jem <${gmailUser}>`,
        to: toEmail,
        subject: `Recept: ${recipe.title}`,
        content: compactTextBody,
        html: compactHtmlBody
      });
      return;
    } catch (error) {
      failures.push(`port ${port}: ${(error as Error).message}`);
    } finally {
      await Promise.resolve(client.close()).catch(() => {});
    }
  }

  throw new Error(`SMTP delivery failed (${failures.join('; ')})`);
}

/**
 * Prefer Gmail API OAuth when configured. SMTP remains available for older
 * installations that only have an app password.
 */
async function deliver(options: {
  gmailUser: string;
  gmailAppPassword: string;
  gmailClientId: string;
  gmailClientSecret: string;
  gmailRefreshToken: string;
  toEmail: string;
  recipe: EmailRecipe;
  htmlBody: string;
  textBody: string;
}): Promise<void> {
  const { gmailClientId, gmailClientSecret, gmailRefreshToken } = options;

  if (gmailClientId && gmailClientSecret && gmailRefreshToken) {
    const accessToken = await gmailAccessToken(gmailClientId, gmailClientSecret, gmailRefreshToken);
    await sendWithGmailApi(accessToken, options);
    return;
  }

  const { gmailAppPassword } = options;

  if (gmailAppPassword) {
    await sendWithSmtp(options);
    return;
  }

  throw new Error(
    'No Gmail credentials are configured. Set GMAIL_APP_PASSWORD, or all three of ' +
      'GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN, as Supabase secrets ' +
      '(`supabase secrets set ...`). Values in .env.local are not visible to Edge Functions.'
  );
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return json(request, { success: false, error: 'Method not allowed' }, 405);
  }

  if (SHARED_SECRET && request.headers.get('x-zdravo-secret') !== SHARED_SECRET) {
    return json(request, { success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = (await request.json()) as { toEmail?: string; recipe?: JsonRecord };
    const toEmail = String(body?.toEmail ?? '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail) || toEmail.length > 254) {
      return json(request, { success: false, error: 'Vnesite veljaven e-poštni naslov.' }, 400);
    }

    const gmailUser = env('GMAIL_USER');
    const gmailAppPassword = env('GMAIL_APP_PASSWORD');
    const gmailClientId = env('GMAIL_CLIENT_ID');
    const gmailClientSecret = env('GMAIL_CLIENT_SECRET');
    const gmailRefreshToken = env('GMAIL_REFRESH_TOKEN');

    if (!gmailUser) {
      throw new Error('Gmail sender address is not configured.');
    }

    const recipe = normalizeRecipeForEmail(body?.recipe ?? {});
    const htmlBody = buildRecipeEmailHtml(recipe);
    const textBody = buildRecipeEmailText(recipe);

    await deliver({
      gmailAppPassword,
      gmailClientId,
      gmailClientSecret,
      gmailRefreshToken,
      gmailUser,
      htmlBody,
      recipe,
      textBody,
      toEmail
    });

    return json(request, { success: true });
  } catch (error) {
    console.error('Failed to send recipe email', error);

    const detail = error instanceof Error ? error.message : String(error ?? 'Unknown error');

    return json(
      request,
      {
        success: false,
        error: detail
          ? `Recepta ni bilo mogoče poslati. ${detail}`
          : 'Recepta ni bilo mogoče poslati. Poskusite znova pozneje.'
      },
      500
    );
  }
});
