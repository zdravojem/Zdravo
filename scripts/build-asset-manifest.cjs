#!/usr/bin/env node
// Writes public/assets-manifest.json — the list of artwork the service worker
// downloads into the cache after it activates.
//
//   npm run assets:manifest
//
// The Electron build read every image straight off the disk, so screens simply
// rendered. A PWA only matches that if the bytes are already local, which means
// the worker has to pull the whole set once and keep it. The manifest is what
// tells it what "the whole set" is.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const assetsDir = path.join(publicDir, 'assets');
const outfile = path.join(publicDir, 'assets-manifest.json');

const CACHEABLE = new Set(['.webp', '.png', '.jpg', '.jpeg', '.svg', '.woff2']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

const files = walk(assetsDir)
  .filter((file) => CACHEABLE.has(path.extname(file).toLowerCase()))
  .map((file) => `/${path.relative(publicDir, file).split(path.sep).join('/')}`)
  .sort();

const bytes = files.reduce((total, file) => total + fs.statSync(path.join(publicDir, file.slice(1))).size, 0);

fs.writeFileSync(
  outfile,
  `${JSON.stringify({ bytes, files, generated: 'scripts/build-asset-manifest.cjs' }, null, 2)}\n`,
  'utf8'
);

console.log(
  `Wrote ${path.relative(root, outfile)}: ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB`
);
