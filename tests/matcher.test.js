// Regression tests for deterministic LOCAL script selection (Founder
// decision, Oct 26, 2026). All mocked; no live calls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { matchScript, MATCH_RULES } from '../src/matcher.js';
import { runScenario } from '../src/pipeline.js';
import { BudgetLedger } from '../src/ledger.js';
import { createMockTransport, buildPayload } from '../src/gateway.js';
import { getScript } from '../src/content.js';

const tmpLedger = () => new BudgetLedger(join(mkdtempSync(join(tmpdir(), 'ccc-ledger-')), 'ledger.json'));
const AT1_TEXT = 'Fictional scenario: an 8-year-old doing homework says "I\'m stupid" and wants to quit.';
// The exact canonical proposal returned by the third live smoke test
// (Oct 26, 2026): validated LIVE, with script_number null.
const SMOKE3_PROPOSAL = {
  spoke_id: 'spoke-learning',
  stage_ids: ['stage-attempt', 'stage-struggle'],
  stuck_point_anchor: 'struggle-support',
  script_number: null,
  rationale_codes: [],
};
const mockWith = (proposal) => createMockTransport(async () => ({
  proposal, usage: { input_tokens: 314, output_tokens: 841, cached_input_tokens: 0 },
}));

test('AT1 rule: the "I\'m stupid" utterance selects Script #1 via R1', () => {
  const m = matchScript(AT1_TEXT);
  assert.equal(m.status, 'matched');
  assert.equal(m.script_number, 1);
  assert.deepEqual(m.rule_ids, ['R1-stupid-utterance']);
  assert.equal(m.tier, 'utterance');
});

test('each approved situation selects its own script', () => {
  const cases = [
    ['My daughter whispered "nobody likes me" at dinner.', 2],
    ['He said "I don\'t want to try. I\'ll be bad at it."', 3],
    ['She stared at the puzzle and said "I can\'t do it."', 4],
    ['He lost the game and shouted that this is rigged.', 5],
    ['My son got in trouble at school again today.', 6],
    ['Every morning she cries "I don\'t want to go to school."', 7],
  ];
  for (const [text, n] of cases) {
    const m = matchScript(text);
    assert.equal(m.status, 'matched', text);
    assert.equal(m.script_number, n, text);
  }
});

test('non-match: an unmatched situation produces no match (bedtime fear, F-01)', () => {
  assert.equal(matchScript('My 7-year-old is afraid of the dark at bedtime and wants the hall light on.').status, 'none');
  assert.equal(matchScript('We are planning a birthday party with a dinosaur cake.').status, 'none');
});

test('ambiguous: two different utterances in one scenario -> ambiguous, never a guess', () => {
  const m = matchScript('He said "I\'m stupid" at homework, and this morning he said "I don\'t want to go to school."');
  assert.equal(m.status, 'ambiguous');
  assert.deepEqual([...m.candidates].sort(), [1, 7]);
});

test('utterance signals outrank context signals', () => {
  const m = matchScript('He lost the game at recess, then said "I\'m stupid" doing homework.');
  assert.equal(m.status, 'matched');
  assert.equal(m.script_number, 1);
});

test('a match can never be forced from a spoke or stage: the matcher reads text alone', () => {
  assert.equal(matchScript.length, 1); // exactly one parameter: the text
  const m = matchScript('He is building connection and working through struggle toward a small win in his learning.');
  assert.equal(m.status, 'none');
});

test('rule table is auditable: seven rules, one per approved script, each with a basis', () => {
  assert.equal(MATCH_RULES.length, 7);
  assert.deepEqual(MATCH_RULES.map((r) => r.script_number), [1, 2, 3, 4, 5, 6, 7]);
  for (const r of MATCH_RULES) assert.ok(r.basis.includes('Appendix B'), r.rule_id);
});

test('payload proof: no script content and no situation labels ever enter the model payload', () => {
  const raw = JSON.stringify(buildPayload(AT1_TEXT)).toLowerCase();
  const forbidden = [
    'nobody likes me', 'be bad at it', 'this is rigged', 'trouble at school',
    "you're not stupid", 'separate identity from the moment', 'rigged',
  ];
  for (const f of forbidden) assert.ok(!raw.includes(f), `payload leaked: ${f}`);
  for (let n = 1; n <= 7; n++) {
    const s = getScript(n);
    assert.ok(!raw.includes(s.what_to_say.slice(2, 30).toLowerCase()), `payload leaked script #${n} content`);
  }
  const gatewaySrc = readFileSync(new URL('../src/gateway.js', import.meta.url), 'utf8');
  assert.ok(!gatewaySrc.includes('matcher'), 'gateway must not import the local matcher');
});

test('pipeline: local match overrides the model script_number in both directions', async () => {
  // Model proposes the WRONG number; the text rules select #1.
  const wrong = await runScenario({ text: AT1_TEXT, age: 8 },
    { transport: mockWith({ ...SMOKE3_PROPOSAL, script_number: 3 }), ledger: tmpLedger(), session: 't' });
  assert.equal(wrong.outcome, 'GUIDANCE');
  assert.equal(wrong.script.number, 1);
  // Model proposes #1; the text matches nothing -> honest fallback.
  const forced = await runScenario({ text: 'My 7-year-old is afraid of the dark at bedtime.', age: 8 },
    { transport: mockWith({ ...SMOKE3_PROPOSAL, script_number: 1 }), ledger: tmpLedger(), session: 't' });
  assert.equal(forced.outcome, 'FALLBACK');
  assert.equal(forced.reason, 'no-script-match');
});

test('pipeline: ambiguous text falls back with candidates, never guidance', async () => {
  const out = await runScenario(
    { text: 'He said "I\'m stupid" and "I don\'t want to go to school."', age: 8 },
    { transport: mockWith(SMOKE3_PROPOSAL), ledger: tmpLedger(), session: 't' });
  assert.equal(out.outcome, 'FALLBACK');
  assert.equal(out.reason, 'ambiguous-script-match');
  assert.deepEqual([...out.candidates].sort(), [1, 7]);
});

test('AT1 DEMO PATH: recorded smoke-3 proposal -> validation -> local Script #1 -> verbatim guidance', async () => {
  const out = await runScenario({ text: AT1_TEXT, age: 8 },
    { transport: mockWith(SMOKE3_PROPOSAL), ledger: tmpLedger(), session: 'demo' });
  assert.equal(out.outcome, 'GUIDANCE');
  assert.equal(out.label, 'MOCK');
  assert.deepEqual(out.match.rule_ids, ['R1-stupid-utterance']);
  const approved = getScript(1);
  assert.equal(out.script.number, 1);
  // Guidance is the approved Appendix B record, served locally and verbatim.
  assert.equal(out.script.what_to_say, approved.what_to_say);
  assert.equal(out.script.what_not_to_say, approved.what_not_to_say);
  assert.equal(out.script.one_action, approved.one_action);
  assert.ok(out.script.what_to_say.includes("You're not stupid"));
});
