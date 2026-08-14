#!/usr/bin/env node
// Converts the bundled artwork to WebP at the sizes the kiosk actually displays.
//
//   npm run images:optimize -- --dry-run    report what would change
//   npm run images:optimize                 convert in place
//   npm run images:optimize -- --from-git   re-derive from the original PNGs
//
// The images were authored for a Windows installer, where 600 MB of lossless
// PNG cost nothing and every file was read straight off the disk. Over a
// network both the bytes and the decode time are paid on screen, and the
// originals were badly oversized for their slots: a 1254x1254 category tile is
// drawn at 158 CSS px, which is 63x more pixels than the screen can show.
//
// SIZES below records the widest each folder is ever drawn, measured in the
// running app, doubled for a 4K portrait kiosk, then rounded up. Recipe photos
// are the one folder used at two very different sizes — a 315px card and a
// ~1000px detail hero — so they keep the large file and gain a card variant.
//
// --from-git re-encodes from the original PNGs still in git history rather than
// from the current WebP files, avoiding a second generation of lossy encoding.
// Use it when changing a size; the plain run is for newly added artwork.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const imagesDir = path.join(root, 'public', 'assets', 'images');
const dryRun = process.argv.includes('--dry-run');
const fromGit = process.argv.includes('--from-git');

// Chosen by inspection against the originals: at 84 the flat-colour game
// illustrations show no visible ringing and the food photography is
// indistinguishable.
const WEBP_QUALITY = 84;

// Longest edge, and any extra variants, per folder. First match wins.
const SIZES = [
  // Drawn at most 206 CSS px (ingredients screen category strip).
  { folder: 'categories/ordered', maxEdge: 480 },
  // Drawn at most 144 CSS px (detail screen ingredient chips).
  { folder: 'ingredients/ordered', maxEdge: 480 },
  // 315 px as a results/home card, ~1000 px as the detail hero.
  { folder: 'recipes/ordered', maxEdge: 1440, variants: [{ suffix: '-card', maxEdge: 720 }] },
  { folder: 'recipes', maxEdge: 1440, variants: [{ suffix: '-card', maxEdge: 720 }] },
  // Games render full-bleed boards and puzzle pieces; leave them large.
  { folder: '', maxEdge: 1440 }
];

const SOURCE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function policyFor(file) {
  const relative = path.relative(imagesDir, path.dirname(file)).split(path.sep).join('/');
  return SIZES.find((rule) => rule.folder === '' || relative === rule.folder || relative.startsWith(`${rule.folder}/`));
}

// The pre-conversion PNGs are still in git; reading them avoids re-encoding an
// already lossy WebP when a size changes.
function originalBytes(file) {
  const relative = path.relative(path.join(root, 'public'), file).split(path.sep).join('/');
  const withoutVariant = relative.replace(/-card\.webp$/, '.webp');

  for (const extension of ['.png', '.jpg', '.jpeg']) {
    const candidate = `HEAD:${withoutVariant.replace(/\.webp$/, extension)}`;
    try {
      return execFileSync('git', ['show', candidate], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
    } catch (error) {
      // Try the next extension.
    }
  }

  return null;
}

async function encode(source, target, maxEdge) {
  const buffer = await sharp(source)
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6, alphaQuality: 100 })
    .toBuffer();

  if (!dryRun) {
    fs.writeFileSync(target, buffer);
  }

  return buffer.length;
}

(async () => {
  if (!fs.existsSync(imagesDir)) {
    console.error(`No such directory: ${imagesDir}`);
    process.exit(1);
  }

  const files = walk(imagesDir)
    .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .filter((file) => !/-card\.webp$/.test(file));

  let before = 0;
  let after = 0;
  let variants = 0;
  let regenerated = 0;
  const byFolder = {};

  for (const file of files) {
    const policy = policyFor(file);
    const base = file.slice(0, -path.extname(file).length);
    const target = `${base}.webp`;

    try {
      const source = fromGit ? originalBytes(file) || file : file;
      regenerated += fromGit && Buffer.isBuffer(source) ? 1 : 0;

      const folder = path.relative(imagesDir, path.dirname(file)).split(path.sep).join('/') || '.';
      const bucket = byFolder[folder] || (byFolder[folder] = { after: 0, before: 0, edge: policy.maxEdge, n: 0 });
      const wasBytes = fs.statSync(file).size;
      const nowBytes = await encode(source, target, policy.maxEdge);

      before += wasBytes;
      after += nowBytes;
      bucket.before += wasBytes;
      bucket.after += nowBytes;
      bucket.n += 1;

      if (path.extname(file).toLowerCase() !== '.webp' && !dryRun) {
        fs.unlinkSync(file);
      }

      for (const variant of policy.variants || []) {
        const variantBytes = await encode(source, `${base}${variant.suffix}.webp`, variant.maxEdge);
        after += variantBytes;
        bucket.after += variantBytes;
        variants += 1;
      }
    } catch (error) {
      console.error(`  failed: ${path.relative(root, file)} — ${error.message.split('\n')[0]}`);
    }
  }

  const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;

  console.log('folder'.padEnd(30), 'n'.padStart(4), 'edge'.padStart(5), 'before'.padStart(9), 'after'.padStart(9));
  Object.entries(byFolder)
    .sort((a, b) => b[1].before - a[1].before)
    .forEach(([folder, b]) =>
      console.log(folder.padEnd(30), String(b.n).padStart(4), String(b.edge).padStart(5), mb(b.before).padStart(9), mb(b.after).padStart(9))
    );
  console.log('');

  console.log(
    `${dryRun ? '[dry run] ' : ''}${files.length} images (+${variants} card variants): ` +
      `${mb(before)} -> ${mb(after)}` +
      (fromGit ? `, ${regenerated} re-encoded from the original PNGs` : '')
  );

  if (dryRun) {
    console.log('Nothing was written. Re-run without --dry-run to convert.');
  }
})();
