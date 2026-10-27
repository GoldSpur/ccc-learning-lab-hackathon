// Staging hardening tests (judge-access phase): rate limits, per-identity
// quotas, the simulated budget hard-stop under load, metadata-only logging,
// and the disabled live transport at the server boundary. All local.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRateLimiter, createQuota } from '../web/ratelimit.mjs';
import { BudgetLedger, HARD_NANO, estimateWorstNano } from '../src/ledger.js';
import { runScenario } from '../src/pipeline.js';
import { createMockTransport, MAX_OUTPUT_TOKENS } from '../src/gateway.js';

test('rate limiter: allows the configured burst, then denies until the window resets', () => {
  const rl = createRateLimiter({ windowMs: 60_000, max: 3 });
  const t0 = 1_000_000;
  assert.equal(rl.check('id-a', t0).allowed, true);
  assert.equal(rl.check('id-a', t0 + 1).allowed, true);
  assert.equal(rl.check('id-a', t0 + 2).allowed, true);
  assert.equal(rl.check('id-a', t0 + 3).allowed, false);
  assert.equal(rl.check('id-b', t0 + 3).allowed, true); // identities are independent
  assert.equal(rl.check('id-a', t0 + 60_001).allowed, true); // window reset
});

test('quota: caps per identity over the long window', () => {
  const q = createQuota({ windowMs: 86_400_000, limit: 2 });
  const t0 = 5_000_000;
  assert.equal(q.check('judge-1', t0).allowed, true);
  assert.equal(q.check('judge-1', t0 + 1000).allowed, true);
  assert.equal(q.check('judge-1', t0 + 2000).allowed, false);
  assert.equal(q.check('judge-2', t0 + 2000).allowed, true);
});

test('SIMULATED BUDGET HARD STOP: after simulated judge traffic fills the ceiling, the next run falls back and the model is never called', async () => {
  const ledger = new BudgetLedger(join(mkdtempSync(join(tmpdir(), 'ccc-stage-')), 'ledger.json'));
  // Simulate prior judge traffic: reserve worst-case amounts until the next
  // AT1-sized reservation would cross the $120 aggregate ceiling.
  // Fill in $10 worst-case chunks (aggregated simulated judge traffic) so
  // the ceiling is reached in a dozen reservations, not thousands.
  const chunk = 10_000_000_000; // $10 in nanodollars
  const at1Worst = estimateWorstNano({ inputTokens: 400, maxOutputTokens: MAX_OUTPUT_TOKENS });
  let fills = 0;
  for (;;) {
    try {
      const r = ledger.reserve({ session: 'simulated-judges', worstNano: chunk });
      ledger.reconcile(r.id, chunk);
      fills++;
    } catch { break; }
  }
  assert.ok(fills >= 10, `expected the ceiling to take many fills, got ${fills}`);
  assert.ok(ledger.committedNano() <= HARD_NANO);
  assert.ok(ledger.committedNano() + at1Worst > HARD_NANO, 'ledger should be within one call of the ceiling');

  let modelCalls = 0;
  const transport = createMockTransport(async () => { modelCalls++; return { proposal: null, usage: {} }; });
  const out = await runScenario(
    { text: 'Fictional scenario: an 8-year-old doing homework says "I\'m stupid" and wants to quit.', age: 8 },
    { transport, ledger, session: 'late-judge' });
  assert.equal(out.outcome, 'FALLBACK');
  assert.equal(out.reason, 'budget-hard-stop');
  assert.equal(modelCalls, 0); // no call leaves after the stop
});

// --- Server boundary (spawned, real HTTP) ---
const PORT = 8419;
let child; let logs = '';
before(async () => {
  child = spawn('node', ['web/server.mjs', String(PORT)], { cwd: new URL('..', import.meta.url).pathname, env: { ...process.env } });
  child.stdout.on('data', (d) => { logs += d; });
  child.stderr.on('data', (d) => { logs += d; });
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/healthz`); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('server did not start');
});
after(() => { child?.kill('SIGKILL'); });

test('server: healthz reports live disabled; security headers present', async () => {
  const r = await fetch(`http://127.0.0.1:${PORT}/healthz`);
  const body = await r.json();
  assert.equal(body.live, 'disabled');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok((r.headers.get('content-security-policy') || '').includes("default-src 'self'"));
});

test('server: the run rate limit engages under rapid requests', async () => {
  const statuses = [];
  for (let i = 0; i < 34; i++) {
    const r = await fetch(`http://127.0.0.1:${PORT}/api/run`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ presetId: 'at1' }) });
    statuses.push(r.status);
  }
  assert.ok(statuses.slice(0, 30).every((s) => s === 200), `first 30 should pass: ${statuses.slice(0, 5)}`);
  assert.ok(statuses.slice(30).every((s) => s === 429), `beyond 30/min should be 429: ${statuses.slice(30)}`);
});

test('server: access logs are metadata-only — scenario text never appears', async () => {
  const marker = 'UNIQUE-MARKER-plum-hedgehog-7411';
  await fetch(`http://127.0.0.1:${PORT}/api/run`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: `My child ${marker} said he is afraid of the dark.`, age: 8 }) });
  await new Promise((r) => setTimeout(r, 250));
  assert.ok(!logs.includes(marker), 'scenario text leaked into server logs');
  assert.ok(!logs.includes('afraid of the dark'), 'scenario fragment leaked into server logs');
});
