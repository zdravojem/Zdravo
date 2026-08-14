#!/usr/bin/env node
// Bundles the npm `qrcode` browser build into a dependency-free ES module the
// PWA can import directly (public/vendor/qrcode.js). The Electron app used the
// same package in the main process, so QR codes stay byte-for-byte identical.
//
// Run after upgrading `qrcode`:  npm run vendor:qrcode
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const entry = path.join(root, 'node_modules', '.cache', 'zdravo-qr-entry.js');
const outfile = path.join(root, 'public', 'vendor', 'qrcode.js');

fs.mkdirSync(path.dirname(entry), { recursive: true });
fs.mkdirSync(path.dirname(outfile), { recursive: true });
fs.writeFileSync(entry, "import QRCode from 'qrcode';\nexport default QRCode;\n", 'utf8');

esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  minify: true,
  legalComments: 'none',
  banner: { js: '/* Bundled from npm `qrcode` (MIT). Regenerate with: npm run vendor:qrcode */' },
  outfile
});

console.log(`Wrote ${path.relative(root, outfile)} (${(fs.statSync(outfile).size / 1024).toFixed(1)} kB)`);
