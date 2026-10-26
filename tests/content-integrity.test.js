// Content integrity: all three content modules match their approved,
// hash-pinned sources. Safety strings must appear VERBATIM in the frozen
// CSR-3 module file; script records must equal the CSR-2 source extraction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { framework, scriptsData, safetyCopy } from '../src/content.js';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const norm = (s) => s.replace(/’/g, "'");

test('CSR-1 framework: canonical wheel and cycle', () => {
  assert.equal(framework.source_sha256, '781a772f558abd2e285b3238d6a071a7ff40436c01394305edca2c0e7e409741');
  assert.equal(framework.wheel.length, 8);
  assert.equal(framework.wheel[7].display_name, 'Moral / Courage');
  assert.equal(framework.cycle.length, 9);
  assert.equal(framework.cycle[8].name, 'Confidence');
  assert.deepEqual(framework.wheel.map((s) => s.order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(framework.cycle.map((s) => s.order), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('CSR-1 source file hash is unchanged', () => {
  const spec = readFileSync('/home/hatch/workspace/goals/digital-products-business-30-day-launch-plan/files/ccc-framework-spec.json');
  assert.equal(sha(spec), framework.source_sha256);
});

test('CSR-2 scripts: 7 records, byte-equal to the frozen source extraction', () => {
  const srcPath = '/home/hatch/workspace/prototypes/confidence-moments-v0.2/data/scripts-data.js';
  const src = readFileSync(srcPath, 'utf8');
  assert.equal(sha(src), 'fc37a8474fc0cc84d1c9e338f079870d4aba3917e1635fdafaa1894ac72f1879');
  assert.equal(scriptsData.source_file_sha256, sha(src));
  const records = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
  assert.equal(JSON.stringify(records), JSON.stringify(scriptsData.records));
  for (const r of scriptsData.records) {
    assert.deepEqual(Object.keys(r).sort(),
      ['number', 'one_action', 'situation', 'source_reference', 'what_not_to_say', 'what_to_say']);
  }
});

test('CSR-3 safety copy: every string appears verbatim in the frozen module', () => {
  const modPath = '/home/hatch/workspace/goals/meta-global-ai-developer-hackathon-childhood-confidence-learning-lab/files/csr-3-safety-copy-module-v0.2-PROPOSED.md';
  const mod = readFileSync(modPath, 'utf8');
  assert.equal(sha(mod), '8cdbacf7548a7530f8385fea80e9ccac5cbfbe5a632500387b717a836995d9e5');
  assert.equal(safetyCopy.source_sha256, sha(mod));
  const frozen = norm(mod);
  const strings = [
    safetyCopy.badge, safetyCopy.a1.heading,
    ...Object.values(safetyCopy.a1.classes), safetyCopy.a1.body,
    ...safetyCopy.a1.resources, safetyCopy.a2,
    safetyCopy.b1, safetyCopy.b2, safetyCopy.b3, safetyCopy.b4,
  ];
  for (const s of strings) {
    assert.ok(frozen.includes(norm(s)), `string not verbatim in frozen module: ${s.slice(0, 60)}...`);
  }
});
