// Refinement-pass presentation tests — Wheel as centerpiece, Cycle as a
// connected pathway, condensed mobile opening, and the explanatory-copy
// correction. Deterministic and offline, in the style of the D1/D2 tests:
// reads the shipped web/index.html and asserts the refinement's structural
// hooks, without any pipeline behavior involved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'web', 'index.html'), 'utf8');
// Static markup = everything before the main inline script.
const markup = html.slice(0, html.indexOf('<script>\nconst $'));
// The responsive block that carries the mobile treatment.
const mobile = html.slice(html.indexOf('@media (max-width:900px)'));

test('refinement: explanatory copy no longer says the Wheel “diagnoses”', () => {
  assert.ok(markup.includes('The Confidence Wheel helps identify which area of confidence may need support.'),
    'introductory Wheel card carries the corrected, non-clinical phrasing');
  assert.ok(!markup.includes('diagnoses which area'), 'the old diagnostic phrasing is gone from interface copy');
  assert.ok(!html.includes('diagnoses which area'), 'the old diagnostic phrasing is gone from the whole page');
  assert.ok(markup.includes('1 · The Wheel — WHAT') && markup.includes('2 · The Cycle — HOW') && markup.includes('3 · The Script — WORDS'),
    'the WHAT / HOW / WORDS distinction is intact');
});

test('refinement: Cycle renders as a connected pathway, canonical order, lens not a stage', () => {
  assert.ok(html.includes('<div class="track">'), 'stages render inside a pathway track');
  assert.ok(html.includes('class="cstep"'), 'stages are pathway nodes');
  assert.ok(html.includes('<span class="nm">'), 'each node carries its stage name');
  assert.ok(html.includes('.cstep::before') && html.includes('.cstep::after'), 'nodes are joined by connectors');
  assert.ok(html.includes('.cstep:first-child::before') && html.includes('.cstep:last-child::after'),
    'the path starts at Connection and ends at Confidence with no dangling connectors');
  // The Stuck Point stays a lens marker under the track — never a stage node.
  assert.ok(html.includes('<div class="lensrow"><span class="lens"'), 'lens renders as its own marker row');
  assert.ok(!/<button[^>]*class="lens"/.test(html), 'the lens is never a stage button');
  assert.ok(!html.includes('data-id="stage-stuck'), 'no stage id exists for the Stuck Point');
  assert.ok(html.includes('Stuck Point — a lens at Struggle → Support, never a stage'), 'lens wording preserved');
});

test('refinement: mobile treatment condenses the opening and switches the Cycle vertical', () => {
  assert.ok(mobile.length > 0, 'a max-width:900px responsive block exists');
  // Header becomes a flex column: identity, principle, provisional notice,
  // then the supporting copy — so the Framework (and its Wheel) comes early.
  assert.ok(mobile.includes('header { display: flex; flex-direction: column;'), 'mobile header is a reordering flex column');
  assert.ok(mobile.includes('.banner { order: 3;'), 'the provisional safety banner rides high in the condensed opening');
  assert.ok(mobile.includes('.strip { order: 6;'), 'the system cards close the condensed opening');
  // Vertical pathway with the same nodes, order preserved top to bottom.
  assert.ok(mobile.includes('.track { flex-direction: column;'), 'Cycle pathway goes vertical on small screens');
  assert.ok(mobile.includes('.cstep { flex-direction: row;'), 'vertical nodes read as rows (number, then name)');
  // Touch targets.
  assert.ok(mobile.includes('min-height: 44px'), 'mobile controls meet the 44px touch-target floor');
});

test('refinement: the Wheel is the dominant framework feature and detail agrees with selection', () => {
  assert.ok(html.includes('minmax(500px, 600px)'), 'the framework grid gives the Wheel the dominant column');
  assert.ok(html.includes("setProperty('--spoke-color'"), 'selecting a spoke restyles the detail card accent from the same spoke');
  assert.ok(html.includes('SPOKE_COLORS[w.order - 1]'), 'the accent color is derived from the selected spoke itself');
  assert.ok(html.includes('.detail { border-top: 5px solid var(--spoke-color'), 'detail card carries the spoke-color accent');
  assert.ok(markup.includes('Illustrative example'), 'the initial Emotional highlight is still labeled illustrative');
  assert.ok(markup.includes('This is not an AI result'), 'the initial highlight still disclaims an AI result');
});

test('refinement: Journey panel presentation matches, content framing unchanged', () => {
  assert.ok(markup.includes('class="card journey-card"'), 'Journey panel carries the refined card styling');
  assert.ok(html.includes('.journey-card {'), 'Journey card styles are defined');
  assert.ok(markup.includes('DEMONSTRATION DATA — FICTIONAL'), 'fictional-data badge unchanged');
  assert.ok(markup.includes('not</b> a measurement of confidence growth'), 'participation-not-growth framing unchanged');
});
