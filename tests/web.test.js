// B2 judge-facing demo tests — the web layer runs the real pipeline with
// mocked/recorded transports. No live calls exist in this layer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDemo, getContent, RECORDED_LIVE_PROPOSAL } from '../web/app.mjs';

const demo = () => createDemo({ ledgerPath: join(mkdtempSync(join(tmpdir(), 'ccc-demo-')), 'ledger.json') });

test('content: canonical Wheel (8) and Cycle (9), badge, acknowledgment, 8 presets', () => {
  const c = getContent();
  assert.equal(c.wheel.length, 8);
  assert.equal(c.wheel[7].display_name, 'Moral / Courage');
  assert.equal(c.cycle.length, 9);
  assert.equal(c.cycle[8].name, 'Confidence');
  assert.ok(c.badge.includes('PROVISIONAL'));
  assert.equal(c.presets.length, 8);
  assert.equal(c.provenance.scripts_sha256.length, 64);
});

test('AT1 preset: recorded live proposal -> GUIDANCE, Script #1, labeled, traced', async () => {
  const out = await demo().run({ presetId: 'at1' });
  assert.equal(out.outcome, 'GUIDANCE');
  assert.equal(out.label, 'RECORDED LIVE');
  assert.equal(out.script.number, 1);
  assert.deepEqual(out.match.rule_ids, ['R1-stupid-utterance']);
  assert.ok(out.trace.some((t) => t.step.includes('Budget')));
  assert.ok(out.trace.some((t) => t.step.includes('validation') && t.status === 'pass'));
});

test('nobody-likes-me preset: GUIDANCE with Script #2', async () => {
  const out = await demo().run({ presetId: 'nobody-likes-me' });
  assert.equal(out.outcome, 'GUIDANCE');
  assert.equal(out.script.number, 2);
});

test('model-mistake preset: invalid proposal -> validation FALLBACK with the error visible', async () => {
  const out = await demo().run({ presetId: 'model-mistake' });
  assert.equal(out.outcome, 'FALLBACK');
  assert.equal(out.reason, 'validation-failed');
  assert.ok(out.trace.some((t) => t.status === 'fail'));
});

test('mixed-signals preset: ambiguous FALLBACK with candidates', async () => {
  const out = await demo().run({ presetId: 'mixed-signals' });
  assert.equal(out.outcome, 'FALLBACK');
  assert.equal(out.reason, 'ambiguous-script-match');
  assert.deepEqual([...out.candidates].sort(), [1, 7]);
});

test('bedtime preset: no-match FALLBACK, no script invented', async () => {
  const out = await demo().run({ presetId: 'bedtime-dark' });
  assert.equal(out.outcome, 'FALLBACK');
  assert.equal(out.reason, 'no-script-match');
  assert.equal(out.script, null);
});

test('safety preset: B1 STOP, exact provisional badge, no proposal reaches the page', async () => {
  const out = await demo().run({ presetId: 'safety-test' });
  assert.equal(out.outcome, 'STOP');
  assert.equal(out.stop.kind, 'B1');
  assert.ok(out.trace[0].detail.includes('Model calls: 0'));
});

test('age-13 preset: B3 scope STOP', async () => {
  const out = await demo().run({ presetId: 'age-13' });
  assert.equal(out.outcome, 'STOP');
  assert.equal(out.stop.kind, 'B3');
});

test('free text runs the real deterministic layers only (no model call)', async () => {
  const d = demo();
  const matched = await d.run({ text: 'My son said "I can\'t do it" and cried.', age: 8 });
  assert.equal(matched.mode, 'deterministic-only');
  assert.equal(matched.outcome, 'NEEDS-MODEL');
  assert.equal(matched.match.script_number, 4);
  const stopped = await d.run({ text: 'My son told me he wants to kill himself.', age: 8 });
  assert.equal(stopped.outcome, 'STOP');
  assert.equal(stopped.stop.kind, 'B1');
});

test('override: canonical spoke re-validates; stops and invalid proposals cannot be overridden', async () => {
  const d = demo();
  const ok = d.override({ proposal: RECORDED_LIVE_PROPOSAL, spoke_id: 'spoke-social' });
  assert.equal(ok.ok, true);
  assert.equal(ok.proposal.spoke_id, 'spoke-social');
  const bad = d.override({ proposal: RECORDED_LIVE_PROPOSAL, spoke_id: 'spoke-smartness' });
  assert.equal(bad.ok, false);
  const stopAttempt = d.override({ proposal: null, spoke_id: 'spoke-social' });
  assert.equal(stopAttempt.ok, false);
  assert.ok(stopAttempt.errors[0].includes('cannot be overridden'));
});
