import http from 'node:http';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.PORT || '3000', 10);
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
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
    const opts = { method: req.method, headers: hdrs, duplex: 'half' };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      opts.body = Buffer.concat(chunks);
    }
    fetch(target, opts).then(r => {
      const h = Object.fromEntries(r.headers);
      delete h['content-encoding'];
      delete h['content-length'];
      delete h['transfer-encoding'];
      res.writeHead(r.status, { ...h, 'access-control-allow-origin': '*' });
      if (r.body) Readable.fromWeb(r.body).pipe(res);
      else res.end();
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
