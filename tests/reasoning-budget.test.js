// Regression tests for the Founder-approved reasoning-budget correction
// (Oct 26, 2026): reasoning_effort pinned low, output cap 400 -> 2048 via the
// canonical max_completion_tokens, worst-case reservations recalculated, and
// reasoning-exhausted envelopes diagnosed end-to-end. All mocked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPayload, callModel, createMockTransport, MODEL_ID, MAX_OUTPUT_TOKENS, REASONING_EFFORT } from '../src/gateway.js';
import { BudgetLedger, LedgerError, HARD_NANO, estimateWorstNano, actualNano } from '../src/ledger.js';
import { extractContent, extractProposal, mapUsage } from '../src/response.js';
import { runScenario } from '../src/pipeline.js';

const AT1_TEXT = 'Fictional scenario: an 8-year-old doing homework says "I\'m stupid" and wants to quit.';
const GOOD = {
  spoke_id: 'spoke-learning',
  stage_ids: ['stage-connection', 'stage-attempt', 'stage-struggle', 'stage-support'],
  stuck_point_anchor: 'struggle-support',
  script_number: 1,
  rationale_codes: ['homework-self-talk'],
};
const tmpLedger = () => new BudgetLedger(join(mkdtempSync(join(tmpdir(), 'ccc-ledger-')), 'ledger.json'));

test('payload pins: model, low reasoning effort, canonical cap field at 2048', () => {
  const payload = buildPayload(AT1_TEXT);
  assert.equal(payload.model, 'muse-spark-1.3');
  assert.equal(MODEL_ID, 'muse-spark-1.3');
  assert.equal(payload.reasoning_effort, 'low');
  assert.equal(REASONING_EFFORT, 'low');
  assert.equal(payload.max_completion_tokens, 2048);
  assert.equal(MAX_OUTPUT_TOKENS, 2048);
  assert.equal('max_tokens' in payload, false);
  assert.equal('max_output_tokens' in payload, false);
  const raw = JSON.stringify(payload).toLowerCase();
  assert.equal(raw.includes('contributor'), false);
});

test('worst-case reservation uses the new cap and the conservative input estimate', async () => {
  const payload = buildPayload(AT1_TEXT);
  const estInput = Math.ceil(JSON.stringify(payload).length / 4);
  const expected = estimateWorstNano({ inputTokens: estInput, maxOutputTokens: 2048 });
  const ledger = tmpLedger();
  const transport = createMockTransport(async () => ({ proposal: GOOD, usage: { input_tokens: 314, output_tokens: 200, cached_input_tokens: 0 } }));
  const res = await callModel({ scenarioText: AT1_TEXT, transport, ledger, session: 'test' });
  assert.equal(res.mode, 'MOCK');
  const entries = JSON.parse(readFileSync(ledger.path, 'utf8')).entries;
  assert.equal(entries[0].estimatedNano, expected);
  // The figure the Founder approved: ~$0.0092 per call worst case.
  assert.ok(expected > 9_000_000 && expected < 9_400_000, `expected ~9.19M nano, got ${expected}`);
});

test('hard-stop boundary at the new worst case: exactly at the ceiling passes, one nano over fails', () => {
  const worst = estimateWorstNano({ inputTokens: 395, maxOutputTokens: 2048 });
  const atCeiling = tmpLedger();
  const seedA = atCeiling.reserve({ session: 'seed', worstNano: HARD_NANO - worst });
  atCeiling.reconcile(seedA.id, HARD_NANO - worst);
  const ok = atCeiling.reserve({ session: 'test', worstNano: worst });
  assert.ok(ok.id);
  const overCeiling = tmpLedger();
  const seedB = overCeiling.reserve({ session: 'seed', worstNano: HARD_NANO - worst + 1 });
  overCeiling.reconcile(seedB.id, HARD_NANO - worst + 1);
  assert.throws(() => overCeiling.reserve({ session: 'test', worstNano: worst }), LedgerError);
});

test('AT1 guidance path through the corrected extraction layer (fenced reply, stop)', async () => {
  const canned = {
    model: 'muse-spark-1.3',
    choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: '```json\n' + JSON.stringify(GOOD) + '\n```' } }],
    usage: { prompt_tokens: 314, completion_tokens: 260, completion_tokens_details: { reasoning_tokens: 140 } },
  };
  const transport = {
    kind: 'mock',
    async send() {
      const env = extractContent(canned);
      const ex = extractProposal(env.content);
      return { proposal: ex.ok ? ex.proposal : null, usage: mapUsage(canned) };
    },
  };
  const res = await runScenario({ age: 8, text: AT1_TEXT }, { transport, ledger: tmpLedger(), session: 'test' });
  assert.equal(res.outcome, 'GUIDANCE');
  assert.equal(res.script.number, 1);
  assert.equal(res.label, 'MOCK');
});

test('reasoning-exhausted reply end-to-end: labeled FALLBACK, charged at actual usage', async () => {
  const exhausted = {
    model: 'muse-spark-1.3',
    choices: [{ finish_reason: 'length', message: { role: 'assistant', content: null } }],
    usage: { prompt_tokens: 314, completion_tokens: 2048, completion_tokens_details: { reasoning_tokens: 2048 } },
  };
  const transport = {
    kind: 'mock',
    async send() {
      const env = extractContent(exhausted);
      assert.equal(env.ok, false);
      assert.equal(env.shape.finish_reason, 'length');
      return { proposal: null, usage: mapUsage(exhausted) };
    },
  };
  const ledger = tmpLedger();
  const res = await runScenario({ age: 8, text: AT1_TEXT }, { transport, ledger, session: 'test' });
  assert.equal(res.outcome, 'FALLBACK');
  const usage = mapUsage(exhausted);
  assert.equal(usage.reasoning_tokens, 2048);
  assert.equal(ledger.committedNano(), actualNano(usage));
});
