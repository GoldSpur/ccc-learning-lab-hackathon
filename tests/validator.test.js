import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProposal } from '../src/validator.js';

const good = {
  spoke_id: 'spoke-learning',
  stage_ids: ['stage-connection', 'stage-attempt', 'stage-struggle', 'stage-support'],
  stuck_point_anchor: 'struggle-support',
  script_number: 1,
  rationale_codes: ['homework-self-talk'],
};

test('accepts a canonical proposal (AT1 shape)', () => {
  assert.equal(validateProposal(good).ok, true);
});

test('V-01: rejects the stuck point presented as a stage', () => {
  const v = validateProposal({ ...good, stage_ids: ['stage-connection', 'stage-stuck-point'] });
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /stuck/i.test(e)));
});

test('V-02: rejects any snapshot-to-spoke mapping', () => {
  const v = validateProposal({ ...good, snapshot_spoke: 'spoke-learning' });
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /snapshot/i.test(e)));
});

test('V-03: rejects a model-invented framework definition', () => {
  const v = validateProposal({ ...good, spoke_definition: 'Learning means being smart.' });
  assert.equal(v.ok, false);
});

test('rejects unknown spoke, stage, and script', () => {
  assert.equal(validateProposal({ ...good, spoke_id: 'spoke-smartness' }).ok, false);
  assert.equal(validateProposal({ ...good, stage_ids: ['stage-winning'] }).ok, false);
  assert.equal(validateProposal({ ...good, script_number: 42 }).ok, false);
});

test('rejects out-of-order stages and a bad stuck-point anchor', () => {
  assert.equal(validateProposal({ ...good, stage_ids: ['stage-support', 'stage-attempt'] }).ok, false);
  assert.equal(validateProposal({ ...good, stuck_point_anchor: 'attempt' }).ok, false);
});

test('accepts script_number null (no match -> honest fallback upstream)', () => {
  assert.equal(validateProposal({ ...good, script_number: null }).ok, true);
});
