#!/usr/bin/env node
// Generates the PWA icon set from the existing brand icon so the installed app
// uses the same artwork as the Electron build did.
//
//   npm run icons:build
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const source = path.join(root, 'public', 'assets', 'icons', 'zdravo-jem-icon.png');
const outDir = path.join(root, 'public', 'assets', 'icons');

// Matches --green-dark in public/styles/base.css, so the maskable safe-zone
// padding reads as part of the artwork rather than as a letterbox.
const maskableBackground = { r: 0x1a, g: 0x2e, b: 0x0a, alpha: 1 };

async function writeSquare(size, file) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, file));
}

async function writeMaskable(size, file) {
  // Android masks crop to a circle of ~80% of the icon; keep the logo inside it.
  const inner = Math.round(size * 0.72);
  const logo = await sharp(source).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: maskableBackground } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, file));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  await writeSquare(192, 'pwa-192.png');
  await writeSquare(512, 'pwa-512.png');
  await writeMaskable(512, 'pwa-maskable-512.png');
  await writeSquare(180, 'apple-touch-icon.png');
  console.log('Wrote pwa-192.png, pwa-512.png, pwa-maskable-512.png, apple-touch-icon.png');
})();
