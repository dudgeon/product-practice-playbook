// Minimal zero-dependency static server for previewing dist/ locally.
//   node scripts/serve.mjs   (or: npm run serve)  →  http://localhost:8080/

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const send = (res, code, type, body) => {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(ROOT, urlPath);
  if (!fp.startsWith(ROOT)) return send(res, 403, 'text/plain', 'Forbidden');

  try {
    if (fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  } catch {
    /* fall through to readFile error handling */
  }

  fs.readFile(fp, (err, data) => {
    if (err) {
      const notFound = path.join(ROOT, '404.html');
      if (fs.existsSync(notFound)) return send(res, 404, TYPES['.html'], fs.readFileSync(notFound));
      return send(res, 404, 'text/plain', 'Not found');
    }
    send(res, 200, TYPES[path.extname(fp)] || 'application/octet-stream', data);
  });
});

server.listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}/`));
