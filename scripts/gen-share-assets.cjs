#!/usr/bin/env node

// Generates supabase/functions/recipe-qr-sync/share-assets.ts from the canonical
// recipe-share renderer, so the Edge Function embeds the exact same CSS + JS as
// `npm run recipe-qr:sync`. The assets are base64-encoded to avoid any
// template-literal / escaping issues inside the Deno function.
//
// Run this after editing recipe-share/app.js or recipe-share/styles.css:
//   node scripts/gen-share-assets.cjs

const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const shareDir = path.join(appDir, 'recipe-share');
const outFile = path.join(appDir, 'supabase', 'functions', 'recipe-qr-sync', 'share-assets.ts');

const cssBase64 = fs.readFileSync(path.join(shareDir, 'styles.css')).toString('base64');
const appJsBase64 = fs.readFileSync(path.join(shareDir, 'app.js')).toString('base64');

const contents = `// AUTO-GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-share-assets.cjs
// Source: recipe-share/styles.css and recipe-share/app.js
//
// These are base64-encoded so the Edge Function can inline them without any
// escaping. Decode with the helper in index.ts.

export const STYLES_CSS_B64 =
  '${cssBase64}';

export const APP_JS_B64 =
  '${appJsBase64}';
`;

fs.writeFileSync(outFile, contents);
console.log(`Wrote ${path.relative(appDir, outFile)} (css ${cssBase64.length} b64 chars, app.js ${appJsBase64.length} b64 chars)`);
