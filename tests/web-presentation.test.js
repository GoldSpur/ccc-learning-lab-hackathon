// D1 presentation-layer tests — the judge-facing shell in web/index.html.
// Deterministic and offline: reads the served HTML file and the canonical
// content modules, and asserts the shell presents CSR-1/CSR-3 content
// exactly, with no pipeline behavior involved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'web', 'index.html'), 'utf8');
const framework = JSON.parse(readFileSync(join(root, 'content', 'framework.json'), 'utf8'));
const safety = JSON.parse(readFileSync(join(root, 'content', 'safety-copy.json'), 'utf8'));

const islandMatch = html.match(/<script type="application\/json" id="frameworkData">(.+?)<\/script>/s);
assert.ok(islandMatch, 'framework data island present');
const island = JSON.parse(islandMatch[1]);

test('presentation: data island matches canonical framework content exactly', () => {
  assert.deepEqual(island.wheel, framework.wheel);
  assert.deepEqual(island.cycle, framework.cycle);
});

test('presentation: served HTML contains all 8 canonical spoke names in canonical order', () => {
  const names = island.wheel.map((w) => w.display_name);
  assert.deepEqual(names, ['Learning', 'Social', 'Physical', 'Independence', 'Communication', 'Creativity', 'Emotional', 'Moral / Courage']);
  // Each name appears in the served HTML, in canonical sequence.
  let pos = -1;
  for (const name of names) {
    const at = html.indexOf(`"display_name":"${name}"`, pos + 1);
    assert.ok(at > pos, `spoke "${name}" present in canonical order`);
    pos = at;
  }
});

test('presentation: served HTML contains all 9 canonical stage names in canonical order', () => {
  const names = island.cycle.map((s) => s.name);
  assert.deepEqual(names, ['Connection', 'Attempt', 'Struggle', 'Support', 'Learning', 'Small Win', 'Responsibility', 'Independence', 'Confidence']);
  let pos = -1;
  for (const name of names) {
    const at = html.indexOf(`"name":"${name}"`, pos + 1);
    assert.ok(at > pos, `stage "${name}" present in canonical order`);
    pos = at;
  }
});

test('presentation: CSR-3 badge string appears verbatim in the header badge', () => {
  assert.ok(html.includes(`<span class="badge" id="badge">${safety.badge}</span>`), 'badge element carries the exact CSR-3 string');
  assert.equal(safety.badge, 'PROVISIONAL — fictional safety test. Independent safety review pending.');
});

test('presentation: the simplified five-step strip is absent (not a cycle)', () => {
  assert.ok(!html.includes('Take Action'), 'no "Take Action" step label');
  assert.ok(!/Notice\s*(→|->|&rarr;)\s*Understand/.test(html), 'no Notice → Understand sequence');
  assert.ok(!html.includes('stage-stuck-point'), 'Stuck Point is never rendered as a stage id');
  assert.ok(html.includes('Stuck Point — a lens at Struggle → Support, never a stage'), 'Stuck Point appears only as a lens');
});

test('presentation: Journey panel carries the DEMONSTRATION DATA badge and honest framing', () => {
  assert.ok(html.includes('DEMONSTRATION DATA — FICTIONAL'));
  assert.ok(html.includes('My Confidence Journey'));
  assert.ok(html.includes('participation'), 'counts framed as participation');
  assert.ok(html.includes('not</b> a measurement of confidence growth'), 'no invented growth measurement');
});

test('presentation: labels legend defines LIVE, RECORDED LIVE, MOCK and FALLBACK', () => {
  for (const label of ['<b>LIVE</b>', '<b>RECORDED LIVE</b>', '<b>MOCK</b>', '<b>FALLBACK</b>']) {
    assert.ok(html.includes(label), `legend defines ${label}`);
  }
  assert.ok(html.includes('Only the AT1 proposal carries this label'), 'RECORDED LIVE restricted to AT1');
});

test('presentation: boundaries gallery covers the four inspectable cases, safety stop at 0 model calls', () => {
  for (const id of ['bedtime-dark', 'mixed-signals', 'model-mistake', 'safety-test']) {
    assert.ok(html.includes(`data-run-preset="${id}"`), `boundary card points at preset ${id}`);
  }
  assert.ok(html.includes('0 model calls'));
  assert.ok(html.includes('cannot be confirmed away, retried around, or overridden'));
});

test('presentation: accessibility and shell requirements', () => {
  assert.ok(html.includes('@media (prefers-reduced-motion: reduce)'), 'reduced-motion support present');
  assert.ok(html.includes(':focus-visible'), 'visible focus states present');
  assert.ok(html.includes('name="viewport"'), 'responsive viewport present');
  for (const anchor of ['href="#framework"', 'href="#demonstration"', 'href="#boundaries"', 'href="#journey"']) {
    assert.ok(html.includes(anchor), `nav anchor ${anchor}`);
  }
  assert.ok(html.includes('The model does the interpreting. The framework does the governing. The parent keeps the final word.'), 'Founder line in header');
  assert.ok(html.includes('id="wheel"') && html.includes('id="cycle"') && html.includes('id="presets"') && html.includes('id="results"'), 'existing demo hooks intact');
});
