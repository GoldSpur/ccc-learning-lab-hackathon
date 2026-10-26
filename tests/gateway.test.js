import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BudgetLedger, LedgerError, HARD_NANO, WARN_NANO } from '../src/ledger.js';
import { buildPayload, callModel, createMockTransport, createLiveTransport, MODEL_ID } from '../src/gateway.js';
import { runScenario, applyOverride } from '../src/pipeline.js';
import { scriptsData } from '../src/content.js';

const tmpLedger = () => new BudgetLedger(join(mkdtempSync(join(tmpdir(), 'ccc-ledger-')), 'ledger.json'));
const AT1 = {
  spoke_id: 'spoke-learning',
  stage_ids: ['stage-connection', 'stage-attempt', 'stage-struggle', 'stage-support'],
  stuck_point_anchor: 'struggle-support',
  script_number: 1,
  rationale_codes: ['homework-self-talk'],
};
const okTransport = () => createMockTransport(async () => ({
  proposal: AT1, usage: { input_tokens: 900, output_tokens: 120 },
}));

test('boundary: a reservation exactly at the hard stop is permitted; one nanodollar over is rejected', () => {
  const ledger = tmpLedger();
  ledger.reserve({ session: 't', worstNano: HARD_NANO });
  assert.throws(() => ledger.reserve({ session: 't', worstNano: 1 }), LedgerError);
  const fresh = tmpLedger();
  assert.throws(() => fresh.reserve({ session: 't', worstNano: HARD_NANO + 1 }), LedgerError);
});

test('soft warning flag fires past $75 committed', () => {
  const ledger = tmpLedger();
  const r = ledger.reserve({ session: 't', worstNano: WARN_NANO + 1 });
  assert.equal(r.warn, true);
});

test('unknown usage reconciles at the worst case', async () => {
  const ledger = tmpLedger();
  const transport = createMockTransport(async () => ({ proposal: AT1 })); // no usage reported
  const res = await callModel({ scenarioText: 'fictional homework moment', transport, ledger, session: 't' });
  assert.equal(res.mode, 'MOCK');
  assert.equal(ledger.state.entries[0].status, 'settled-worst-case');
  assert.equal(ledger.state.entries[0].chargedNano, ledger.state.entries[0].estimatedNano);
});

test('timeout charges the worst case and returns labeled FALLBACK', async () => {
  const ledger = tmpLedger();
  const transport = createMockTransport(() => new Promise(() => {})); // never resolves
  const res = await callModel({ scenarioText: 'fictional', transport, ledger, session: 't', timeoutMs: 50 });
  assert.deepEqual({ mode: res.mode, reason: res.reason }, { mode: 'FALLBACK', reason: 'api-failure' });
  assert.equal(ledger.state.entries[0].status, 'settled-worst-case');
});

test('concurrency: parallel calls never overspend the aggregate ceiling', async () => {
  const ledger = tmpLedger();
  const results = await Promise.all(
    Array.from({ length: 40 }, () =>
      callModel({ scenarioText: 'fictional scenario '.repeat(30), transport: okTransport(), ledger, session: 't' })),
  );
  assert.ok(ledger.committedNano() <= HARD_NANO);
  const settled = ledger.state.entries.filter((e) => e.status !== 'reserved');
  assert.equal(settled.length, ledger.state.entries.length); // nothing left dangling
  assert.ok(results.some((r) => r.mode === 'MOCK'));
});

test('fail closed: a corrupt ledger blocks reservation', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ccc-ledger-'));
  const path = join(dir, 'ledger.json');
  writeFileSync(path, '{not json');
  assert.throws(() => new BudgetLedger(path), LedgerError);
});

test('fail closed: gateway returns FALLBACK when accounting is unavailable', async () => {
  const broken = { reserve() { throw new LedgerError('down'); } };
  const res = await callModel({ scenarioText: 'fictional', transport: okTransport(), ledger: broken, session: 't' });
  assert.equal(res.mode, 'FALLBACK');
  assert.equal(res.reason, 'budget-hard-stop');
});

test('kill switch rejects before any dispatch', async () => {
  process.env.CCC_KILL_SWITCH = '1';
  try {
    let called = false;
    const transport = createMockTransport(async () => { called = true; return { proposal: AT1 }; });
    const res = await callModel({ scenarioText: 'fictional', transport, ledger: tmpLedger(), session: 't' });
    assert.equal(res.reason, 'kill-switch');
    assert.equal(called, false);
  } finally {
    delete process.env.CCC_KILL_SWITCH;
  }
});

test('data minimization: the payload carries no script content and pins the Standard model', () => {
  const payload = buildPayload('My fictional 8-year-old struggles with homework.');
  const raw = JSON.stringify(payload);
  for (const r of scriptsData.records) {
    assert.ok(!raw.includes(r.what_to_say), 'payload leaked script body');
    assert.ok(!raw.includes(r.one_action), 'payload leaked script action');
  }
  assert.equal(payload.model, MODEL_ID);
  assert.equal(MODEL_ID, 'muse-spark-1.3');
  assert.ok(!raw.toLowerCase().includes('contributor'));
});

test('live transport is disabled in B1', async () => {
  await assert.rejects(() => createLiveTransport().send({}), /disabled/);
});

test('pipeline: AT1 mocked run yields GUIDANCE with script #1 and a MOCK label', async () => {
  const out = await runScenario(
    { text: 'My fictional 8-year-old tears up his worksheet and says "I\'m stupid."', age: 8 },
    { transport: okTransport(), ledger: tmpLedger(), session: 't' },
  );
  assert.equal(out.outcome, 'GUIDANCE');
  assert.equal(out.label, 'MOCK');
  assert.equal(out.script.number, 1);
});

test('pipeline: a safety stop fires before the model and cannot be bypassed', async () => {
  let calls = 0;
  const transport = createMockTransport(async () => { calls++; return { proposal: AT1 }; });
  const out = await runScenario(
    { text: 'My son told me he wants to kill himself.', age: 8 },
    { transport, ledger: tmpLedger(), session: 't' },
  );
  assert.equal(out.outcome, 'STOP');
  assert.equal(out.stop.kind, 'B1');
  assert.equal(calls, 0); // the model was never called
});

test('pipeline: an invalid model proposal becomes labeled FALLBACK, never guidance', async () => {
  const bad = createMockTransport(async () => ({
    proposal: { ...AT1, stage_ids: ['stage-stuck-point'] }, usage: { input_tokens: 10, output_tokens: 10 },
  }));
  const out = await runScenario(
    { text: 'A fictional child avoids trying new games.', age: 8 },
    { transport: bad, ledger: tmpLedger(), session: 't' },
  );
  assert.equal(out.outcome, 'FALLBACK');
  assert.equal(out.reason, 'validation-failed');
});

test('parent override: canonical re-mapping passes; non-canonical fails', () => {
  assert.equal(applyOverride(AT1, { spoke_id: 'spoke-social' }).ok, true);
  assert.equal(applyOverride(AT1, { spoke_id: 'spoke-smartness' }).ok, false);
});
