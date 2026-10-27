// Demo / staging server for the judge-facing Learning Lab.
// Serves the static UI and the demo API, which runs the real pipeline with
// mocked/recorded transports. There is deliberately no live-model path in
// this server, and startup verifies the shipped live transport is disabled.
//
// Staging hardening (judge-access checklist):
// - Rate limit per identity (Access email when behind Cloudflare Access,
//   else client IP): 30 runs/min, 120 requests/min overall.
// - Per-identity quota: 200 demo runs per 24 h.
// - Metadata-only access log: timestamp, method, path, status, latency and
//   a HASH of the identity. Request bodies and scenario text are never
//   logged (checklist: logs contain no prompt or scenario text).
// - Security headers on every response.
//
// Usage: node web/server.mjs [port]   (default 8377, binds 127.0.0.1)
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDemo, getContent, indexHtml } from './app.mjs';
import { createRateLimiter, createQuota } from './ratelimit.mjs';
import { createLiveTransport } from '../src/gateway.js';

// Startup self-check: the shipped live transport must be disabled. In the
// shipped gateway, send() rejects with the disabled error before any
// network activity, so this probe can never become a live call.
let liveDisabled = false;
try { await createLiveTransport().send({}); } catch (err) { liveDisabled = /disabled/.test(String(err?.message)); }
if (!liveDisabled) { console.error('FATAL: live transport is not disabled'); process.exit(1); }

const here = dirname(fileURLToPath(import.meta.url));
const ledgerPath = join(here, '..', 'runtime', 'demo-ledger.json');
mkdirSync(dirname(ledgerPath), { recursive: true });
const demo = createDemo({ ledgerPath });
const html = indexHtml();
const port = Number(process.argv[2] ?? 8377);
const behindAccess = process.env.CCC_BEHIND_ACCESS === '1';

const runLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const allLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
const runQuota = createQuota({ windowMs: 24 * 60 * 60 * 1000, limit: 200 });

const identityOf = (req) => (behindAccess && req.headers['cf-access-authenticated-user-email'])
  ? `access:${req.headers['cf-access-authenticated-user-email']}`
  : `ip:${req.socket.remoteAddress ?? 'unknown'}`;
const idHash = (id) => createHash('sha256').update(id).digest('hex').slice(0, 8);

const HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
};

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'content-type': type, ...HEADERS });
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
  const started = Date.now();
  const path = new URL(req.url, 'http://localhost').pathname;
  const identity = identityOf(req);
  let status = 200;
  try {
    if (!allLimiter.check(identity).allowed) { status = 429; return send(res, 429, { error: 'rate limit — slow down and retry shortly' }); }
    if (req.method === 'GET' && path === '/') return send(res, 200, html, 'text/html; charset=utf-8');
    if (req.method === 'GET' && path === '/healthz') return send(res, 200, { ok: true, live: 'disabled', mode: behindAccess ? 'staging-behind-access' : 'local' });
    if (req.method === 'GET' && path === '/api/content') return send(res, 200, getContent());
    if (req.method === 'POST' && path === '/api/run') {
      if (!runLimiter.check(identity).allowed) { status = 429; return send(res, 429, { error: 'rate limit — too many runs; retry shortly' }); }
      if (!runQuota.check(identity).allowed) { status = 429; return send(res, 429, { error: 'daily demo quota reached for this identity' }); }
      return send(res, 200, await demo.run(await readBody(req)));
    }
    if (req.method === 'POST' && path === '/api/override') return send(res, 200, demo.override(await readBody(req)));
    status = 404;
    return send(res, 404, { error: 'not found' });
  } catch (err) {
    status = 400;
    return send(res, 400, { error: String(err?.message ?? err) });
  } finally {
    // Metadata only — never bodies, never scenario text.
    console.log(JSON.stringify({ ts: new Date().toISOString(), method: req.method, path, status, ms: Date.now() - started, id: idHash(identity) }));
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Learning Lab demo at http://127.0.0.1:${port} (mocked/recorded transports only; live transport disabled — verified at startup)`);
});
