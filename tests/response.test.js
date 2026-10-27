// Regression tests for the response-extraction correction (Oct 26, 2026).
// Born from the first smoke test: a live reply whose content was not bare
// JSON collapsed to a null proposal with no diagnostics. All mocked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractContent, extractProposal, mapUsage } from '../src/response.js';
import { validateProposal } from '../src/validator.js';

const GOOD = {
  spoke_id: 'spoke-learning',
  stage_ids: ['stage-connection', 'stage-attempt', 'stage-struggle', 'stage-support'],
  stuck_point_anchor: 'struggle-support',
  script_number: 1,
  rationale_codes: ['homework-self-talk'],
};
const GOOD_TEXT = JSON.stringify(GOOD);
const envelope = (content) => ({
  model: 'muse-spark-1.3',
  choices: [{ finish_reason: 'stop', message: { role: 'assistant', content } }],
  usage: { prompt_tokens: 900, completion_tokens: 120, prompt_tokens_details: { cached_tokens: 300 } },
});

test('bare JSON content extracts and validates (AT1 shape)', () => {
  const env = extractContent(envelope(GOOD_TEXT));
  assert.equal(env.ok, true);
  assert.equal(env.shape.content_chars, GOOD_TEXT.length);
  const ex = extractProposal(env.content);
  assert.equal(ex.ok, true);
  assert.equal(ex.format, 'bare');
  assert.deepEqual(ex.proposal, GOOD);
  assert.equal(validateProposal(ex.proposal).ok, true);
});

test('fenced JSON (```json) extracts as a formatting difference, not a failure', () => {
  const ex = extractProposal('```json\n' + GOOD_TEXT + '\n```');
  assert.equal(ex.ok, true);
  assert.equal(ex.format, 'fenced');
  assert.deepEqual(ex.proposal, GOOD);
  assert.equal(validateProposal(ex.proposal).ok, true);
});

test('extra prose around the JSON object extracts as embedded', () => {
  const ex = extractProposal('Here is the classification: ' + GOOD_TEXT + ' Hope that helps.');
  assert.equal(ex.ok, true);
  assert.equal(ex.format, 'embedded');
  assert.equal(validateProposal(ex.proposal).ok, true);
});

test('malformed JSON is a parse failure, never a proposal', () => {
  const ex = extractProposal('{"spoke_id": "spoke-learning", "stage_ids": [}');
  assert.equal(ex.ok, false);
  assert.equal(ex.stage, 'parse');
});

test('non-JSON model text is a parse failure', () => {
  const ex = extractProposal('I think this is about learning confidence.');
  assert.equal(ex.ok, false);
  assert.equal(ex.stage, 'parse');
});

test('JSON that is not an object is a parse failure', () => {
  const ex = extractProposal('["spoke-learning"]');
  assert.equal(ex.ok, false);
  assert.equal(ex.error, 'json-not-an-object');
});

test('empty content is a parse failure', () => {
  const ex = extractProposal('   ');
  assert.equal(ex.ok, false);
  assert.equal(ex.error, 'empty-content');
});

test('missing fields: extraction succeeds, the VALIDATOR rejects (schema class)', () => {
  const partial = JSON.stringify({ spoke_id: 'spoke-learning' });
  const ex = extractProposal(partial);
  assert.equal(ex.ok, true);
  const verdict = validateProposal(ex.proposal);
  assert.equal(verdict.ok, false);
  assert.ok(verdict.errors.length > 0);
});

test('invalid canonical IDs: extraction succeeds, the VALIDATOR rejects (canonical class)', () => {
  const bogus = JSON.stringify({ ...GOOD, spoke_id: 'spoke-bogus' });
  const ex = extractProposal(bogus);
  assert.equal(ex.ok, true);
  const verdict = validateProposal(ex.proposal);
  assert.equal(verdict.ok, false);
  assert.ok(verdict.errors.some((e) => e.includes('spoke_id')));
});

test('extra keys are not stripped or forgiven: the VALIDATOR rejects them', () => {
  const extra = JSON.stringify({ ...GOOD, confidence_tip: 'invented' });
  const ex = extractProposal(extra);
  assert.equal(ex.ok, true);
  assert.equal(validateProposal(ex.proposal).ok, false);
});

test('envelope without choices is an envelope failure', () => {
  const env = extractContent({ model: 'muse-spark-1.3' });
  assert.equal(env.ok, false);
  assert.equal(env.stage, 'envelope');
});

test('envelope carrying an HTTP status is an envelope failure', () => {
  const env = extractContent({ http_status: 500, error_body: 'x' });
  assert.equal(env.ok, false);
  assert.equal(env.error, 'http-500');
});

test('usage mapping feeds the ledger shape (incl. cached tokens)', () => {
  assert.deepEqual(mapUsage(envelope(GOOD_TEXT)), {
    input_tokens: 900,
    output_tokens: 120,
    cached_input_tokens: 300,
  });
  assert.deepEqual(mapUsage({}), { input_tokens: 0, output_tokens: 0, cached_input_tokens: 0 });
});
