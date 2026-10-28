// D2 presentation tests — guided seven-step rail + animated wheel gating.
// Deterministic and offline: reads the served HTML (and web/app.mjs for the
// label assignment) and asserts the D2 presentation rules statically, the
// same way the D1 presentation tests inspect the shipped page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'web', 'index.html'), 'utf8');
const app = readFileSync(join(root, 'web', 'app.mjs'), 'utf8');
// Static markup = everything before the main inline script.
const markup = html.slice(0, html.indexOf('<script>\nconst $'));

test('d2: initial wheel state carries the illustrative label (not an AI result)', () => {
  assert.ok(markup.includes('id="wheelChip"'), 'wheel state chip present in the initial markup');
  assert.ok(markup.includes('Illustrative example'), 'illustrative label present before any run');
  assert.ok(markup.includes('This is not an AI result'), 'explicit not-an-AI-result wording');
  assert.ok(html.includes("selectSpoke('spoke-emotional')"), 'Emotional is the illustrative highlight on load');
  assert.ok(html.includes("'illustrative'"), 'reset path restores the illustrative chip kind');
});

test('d2: the seven rail steps exist in order with their titles', () => {
  assert.ok(markup.includes('id="demoRail"'), 'rail present in markup');
  const titles = [
    'Understand the framework',
    'Explore a fictional scenario',
    'See the AI interpretation',
    'See independent validation',
    'Receive approved guidance',
    'Keep the parent in control',
    'Show the evidence',
  ];
  let pos = -1;
  titles.forEach((title, i) => {
    const at = markup.indexOf(`data-step="${i + 1}"`, pos + 1);
    assert.ok(at > pos, `step ${i + 1} marker present in order`);
    assert.ok(markup.includes(title), `step title "${title}" present`);
    pos = at;
  });
  assert.ok(markup.includes('id="railTraceDetails"'), 'evidence trace is expandable in the rail');
});

test('d2: rail runs the existing AT1 preset and carries its recorded-live provenance', () => {
  assert.ok(html.includes("run({ presetId: 'at1' })"), 'rail Run button triggers the existing at1 preset');
  assert.ok(html.includes("CONTENT.presets.find(p => p.id === 'at1')"), 'rail scenario text is filled from the preset itself, unchanged');
  const at = markup.indexOf('RECORDED LIVE');
  assert.ok(at > 0, 'rail names the recorded label');
  assert.ok(markup.slice(Math.max(0, at - 160), at).includes('this scenario'), 'RECORDED LIVE in the rail is tied to the guided scenario');
  assert.ok(html.includes('Recorded live Oct 26, 2026 · Muse Spark 1.3 Standard'), 'rail carries the recorded date and source');
});

test('d2: RECORDED LIVE is assigned only to AT1 in the demo logic', () => {
  assert.ok(app.includes("preset.id === 'at1' ? 'RECORDED LIVE' : 'MOCK'"), 'label assignment restricts RECORDED LIVE to at1');
});

test('d2: preset button title is parent-readable, scenario identity unchanged (B8)', () => {
  assert.ok(app.includes(`"I\\'m stupid" — homework scenario`), 'preset title carries no internal scenario ID');
  assert.ok(!app.includes('AT1'), 'no AT1 anywhere in the served app strings');
  assert.ok(app.includes("id: 'at1'"), 'underlying preset id is unchanged');
});

test('d2: animation is gated on validated GUIDANCE outcomes only', () => {
  const gate = html.indexOf("r.outcome === 'GUIDANCE' && r.proposal");
  assert.ok(gate > 0, 'GUIDANCE gate present in the render path');
  const call = html.indexOf('landOnSpoke(r.proposal.spoke_id, r.label)', gate);
  assert.ok(call > gate, 'the landing call sits behind the GUIDANCE gate');
  assert.equal(html.split('landOnSpoke(r.proposal').length - 1, 1, 'exactly one landing call site, fed by the run result');
  assert.ok(html.includes('resetWheelIllustrative()'), 'non-guidance outcomes reset the wheel to the illustrative state');
  assert.ok(!html.includes('Math.random'), 'no randomness anywhere in the page — the animation can never re-roll a result');
});

test('d2: animation mechanics — deterministic angle, ease-out settle, skip control, reduced motion', () => {
  assert.ok(html.includes('id="wheelRotor"'), 'wheel rotor group present');
  assert.ok(html.includes('transform-box: view-box'), 'rotor rotates about the wheel centre');
  assert.ok(html.includes('transition: transform 1.6s cubic-bezier'), 'ease-out settle of about 1.6s');
  assert.ok(html.includes('finalAngleFor'), 'landing angle computed deterministically from the validated spoke');
  assert.ok(markup.includes('id="skipAnim"') && markup.includes('Skip animation'), 'skip-animation control present in markup');
  assert.ok(html.includes("matchMedia('(prefers-reduced-motion: reduce)')"), 'JS reduced-motion path settles instantly');
  assert.ok(html.includes('Validated result —'), 'a validated landing carries its own distinct chip text');
  assert.ok(html.includes('parent override, re-validated'), 'override settle is labeled as a re-validated parent override');
});

test('d2: stops and fallbacks are explained in the rail without any landing', () => {
  assert.ok(html.includes('The model was never called'), 'rail explains the safety-stop path');
  assert.ok(html.includes("r.outcome === 'STOP'"), 'rail handles STOP outcomes explicitly');
  assert.ok(html.includes("r.outcome === 'NEEDS-MODEL'"), 'rail handles deterministic-only free text explicitly');
});
