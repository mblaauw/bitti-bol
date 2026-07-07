import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.PORT || '3000', 10);
const MIME = {
  '.html': 'text/html', '.js': 'module', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Proxy API calls: /api/<encoded-target-url>
  if (req.url.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' });
      return void res.end();
    }
    const target = decodeURIComponent(req.url.slice(5));
    const hdrs = { 'accept': 'application/json' };
    if (req.headers.authorization) hdrs.authorization = req.headers.authorization;
    if (req.headers['content-type']) hdrs['content-type'] = req.headers['content-type'];
    const opts = { method: req.method, headers: hdrs };
    if (req.method !== 'GET' && req.method !== 'HEAD') opts.body = req;
    fetch(target, opts).then(r => {
      res.writeHead(r.status, { ...Object.fromEntries(r.headers), 'access-control-allow-origin': '*' });
      r.body.pipe(res);
    }).catch(e => {
      try { res.writeHead(502, { 'Content-Type': 'text/plain', 'access-control-allow-origin': '*' }); } catch {}
      res.end(String(e));
    });
    return;
  }

  // Serve static files
  const filePath = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => console.log(`Dev server + CORS proxy → http://localhost:${PORT}`));
