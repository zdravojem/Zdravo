#!/usr/bin/env node
// Static file server for local development.
//
//   npm start            -> http://localhost:4173
//   npm start -- --port 8080
//
// Service workers and installability require a secure context, which localhost
// counts as, so the full PWA behaviour can be exercised here. Production should
// be served by a real static host over HTTPS — see README.md.
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.join(__dirname, '..', 'public');
const portFlagIndex = process.argv.indexOf('--port');
const port = Number(portFlagIndex > -1 ? process.argv[portFlagIndex + 1] : process.env.PORT) || 4173;

const contentTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const candidate = path.join(root, decoded);
  const resolved = path.resolve(candidate);

  // Never serve outside public/, whatever the request says.
  if (!resolved.startsWith(path.resolve(root))) {
    return null;
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    const index = path.join(resolved, 'index.html');
    return fs.existsSync(index) ? index : null;
  }

  return fs.existsSync(resolved) ? resolved : null;
}

const server = http.createServer((request, response) => {
  const file = resolveFile(request.url) || path.join(root, 'index.html');

  if (!fs.existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('Not found');
    return;
  }

  const body = fs.readFileSync(file);

  response.writeHead(200, {
    'content-type': contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream',
    // The worker must always be revalidated or a stale one pins the whole app.
    'cache-control': file.endsWith('sw.js') || file.endsWith('env.js') ? 'no-cache' : 'no-store',
    'content-length': body.length
  });
  response.end(body);
});

server.listen(port, () => {
  console.log(`Zdravo Jem kiosk running at http://localhost:${port}`);

  if (!fs.existsSync(path.join(root, 'env.js'))) {
    console.warn('\n  public/env.js is missing — run `npm run env:build` first.\n');
  }
});
