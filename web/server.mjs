// Local demo server for the judge-facing Learning Lab (B2).
// Binds to 127.0.0.1 only; serves the static UI and the demo API, which runs
// the real pipeline with mocked/recorded transports. There is deliberately
// no live-model path in this server.
// Usage: node web/server.mjs [port]   (default 8377)
import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDemo, getContent, indexHtml } from './app.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ledgerPath = join(here, '..', 'runtime', 'demo-ledger.json');
mkdirSync(dirname(ledgerPath), { recursive: true });
const demo = createDemo({ ledgerPath });
const html = indexHtml();
const port = Number(process.argv[2] ?? 8377);

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'content-type': type });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  req.on('data', (c) => { size += c.length; if (size > 64_000) reject(new Error('body too large')); chunks.push(c); });
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new Error('invalid json')); } });
  req.on('error', reject);
});

createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') return send(res, 200, html, 'text/html; charset=utf-8');
    if (req.method === 'GET' && req.url === '/api/content') return send(res, 200, getContent());
    if (req.method === 'POST' && req.url === '/api/run') return send(res, 200, await demo.run(await readBody(req)));
    if (req.method === 'POST' && req.url === '/api/override') return send(res, 200, demo.override(await readBody(req)));
    return send(res, 404, { error: 'not found' });
  } catch (err) {
    return send(res, 400, { error: String(err?.message ?? err) });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Learning Lab demo at http://127.0.0.1:${port} (mocked/recorded transports only)`);
});
