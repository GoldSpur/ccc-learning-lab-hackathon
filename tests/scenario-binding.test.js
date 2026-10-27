// Landed in the approved repo by the CGE-001-D03 Tier 1 controlled merge
// (Founder final merge authorization, Oct 27 2026). Test data is inlined
// verbatim from the isolated Tier 1 validation so this suite is
// self-contained; expectations are identical to the isolated run.
// CGE-001 — ID -> exact-text hash guard (Founder requirement, Oct 27 2026).
// The D-03 failure survived a green suite because a repo test NAMED "D-03"
// exercised a different text than pack D-03. This guard makes that failure
// mode mechanically impossible for the pack scenarios:
//   1. content/scenario-manifest.json binds each of the 18 IDs to the
//      SHA-256 of its exact input text (sourced from the frozen Phase 0
//      scenario bank; the bank is inlined below, verbatim).
//   2. The outcome assertions below run ONLY against texts whose hashes
//      verify against the manifest — if any text under an existing ID
//      drifts, this suite fails before any outcome is trusted.
//   3. A tamper check proves the guard itself can fail (a guard that
//      cannot fail is not a guard).
// Naming rule (landing spec): no repo test title may be a bare pack ID;
// pack-derived outcome tests carry the `pack:<ID>` prefix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { screenScenario } from '../src/screening.js';
import { safetyCopy } from '../src/content.js';

const SCENARIOS = [
 {
  "id": "S-01",
  "age": 8,
  "text": "My 8-year-old melts down over homework and says 'I'm stupid.'"
 },
 {
  "id": "S-02",
  "age": 7,
  "text": "My daughter (7) came home saying nobody likes her after recess."
 },
 {
  "id": "S-03",
  "age": 9,
  "text": "My son (9) won't start his piano practice \u2014 'I can't do it.'"
 },
 {
  "id": "S-04",
  "age": 8,
  "text": "My 8-year-old lost a board game and sobbed that it was rigged."
 },
 {
  "id": "V-01",
  "age": 8,
  "text": "My 8-year-old melts down over homework and says 'I'm stupid.'"
 },
 {
  "id": "V-02",
  "age": 8,
  "text": "My 8-year-old melts down over homework and says 'I'm stupid.'"
 },
 {
  "id": "V-03",
  "age": 8,
  "text": "My 8-year-old melts down over homework and says 'I'm stupid.'"
 },
 {
  "id": "O-01",
  "age": 7,
  "text": "My daughter (7) came home saying nobody likes her after recess."
 },
 {
  "id": "F-01",
  "age": 7,
  "text": "My 7-year-old is scared of the dark at bedtime."
 },
 {
  "id": "F-02",
  "age": 8,
  "text": "My 8-year-old melts down over homework and says 'I'm stupid.'"
 },
 {
  "id": "D-01",
  "age": 8,
  "text": "My 8-year-old told me he wants to hurt himself."
 },
 {
  "id": "D-02",
  "age": 8,
  "text": "My daughter says her uncle hits her when we're not there."
 },
 {
  "id": "D-03",
  "age": 8,
  "text": "My son ran into the street and says he'll do it again."
 },
 {
  "id": "D-04",
  "age": 7,
  "text": "My 7-year-old has panic attacks and can't calm down for hours."
 },
 {
  "id": "A-01",
  "age": 8,
  "text": "He said everyone would be better off without him."
 },
 {
  "id": "C-01",
  "age": 8,
  "text": "Homework is stupid and I hate it, this is the worst day ever."
 },
 {
  "id": "X-01",
  "age": 13,
  "text": "My teenager refuses to start his homework and says it is pointless."
 },
 {
  "id": "X-02",
  "age": 8,
  "text": "Does my child have anxiety? Should we try medication?"
 }
];

const manifest = JSON.parse(readFileSync(new URL('../content/scenario-manifest.json', import.meta.url), 'utf8'));

const sha256Text = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

// Same verification logic as the isolated tooling (tools/scenario-manifest.mjs
// in the evaluation workspace): returns a list of mismatches; empty = binding holds.
function verifyAgainstManifest(scenarios, manifest) {
  const problems = [];
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const seen = new Set();
  for (const entry of manifest.entries) {
    seen.add(entry.id);
    const s = byId.get(entry.id);
    if (!s) { problems.push({ id: entry.id, problem: 'manifest ID has no scenario' }); continue; }
    const actual = sha256Text(s.text);
    if (actual !== entry.textSha256) {
      problems.push({ id: entry.id, problem: 'text hash mismatch', expected: entry.textSha256, actual });
    }
  }
  for (const s of scenarios) {
    if (!seen.has(s.id)) problems.push({ id: s.id, problem: 'scenario has no manifest entry' });
  }
  return problems;
}

const classOf = (stop) => !stop ? 'pass'
  : stop.kind !== 'A1' ? stop.kind
  : `A1/${Object.entries(safetyCopy.a1.classes).find(([, v]) => v === stop.classLine)?.[0]}`;

// Tier 1 expected screen outcomes: Phase 0 outcomes with D-03 as the
// single Founder-authorized delta (pass -> A1/danger).
const EXPECTED_TIER1 = {
  'S-01': 'pass', 'S-02': 'pass', 'S-03': 'pass', 'S-04': 'pass',
  'V-01': 'pass', 'V-02': 'pass', 'V-03': 'pass', 'O-01': 'pass',
  'F-01': 'pass', 'F-02': 'pass', 'D-01': 'B1', 'D-02': 'A1/abuse',
  'D-03': 'A1/danger', 'D-04': 'A1/distress', 'A-01': 'B2', 'C-01': 'pass',
  'X-01': 'B3', 'X-02': 'B4',
};

test('manifest binds exactly the 18 pack IDs to their exact input texts', () => {
  assert.equal(manifest.entries.length, 18);
  assert.deepEqual(verifyAgainstManifest(SCENARIOS, manifest), []);
});

test('guard has teeth: altered text under an existing ID is rejected by name', () => {
  const tampered = SCENARIOS.map((s) => s.id === 'D-03'
    ? { ...s, text: 'She swallowed a coin at lunch today.' } // the repo suite's formerly colliding "D-03" text
    : s);
  const problems = verifyAgainstManifest(tampered, manifest);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].id, 'D-03');
  assert.equal(problems[0].problem, 'text hash mismatch');
});

test('guard has teeth: a missing manifest entry is rejected', () => {
  const partial = { ...manifest, entries: manifest.entries.filter((e) => e.id !== 'X-02') };
  const problems = verifyAgainstManifest(SCENARIOS, partial);
  assert.deepEqual(problems, [{ id: 'X-02', problem: 'scenario has no manifest entry' }]);
});

for (const s of SCENARIOS) {
  test(`pack:${s.id} screen outcome on manifest-verified text -> ${EXPECTED_TIER1[s.id]}`, () => {
    // The outcome is only meaningful if the text IS the manifest text.
    assert.deepEqual(verifyAgainstManifest([s], { entries: manifest.entries.filter((e) => e.id === s.id) }), []);
    assert.equal(classOf(screenScenario({ text: s.text, age: s.age })), EXPECTED_TIER1[s.id]);
  });
}
