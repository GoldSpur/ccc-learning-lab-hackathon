import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screenScenario } from '../src/screening.js';
import { safetyCopy } from '../src/content.js';

test('D-01 direct self-harm disclosure -> B1 stop with exact frozen text', () => {
  const stop = screenScenario({ text: 'My son told me he wants to kill himself.', age: 8 });
  assert.equal(stop.kind, 'B1');
  assert.equal(stop.text, safetyCopy.b1);
  assert.equal(stop.badge, safetyCopy.badge);
});

test('D-02 abuse indicators -> A1 abuse stop', () => {
  const stop = screenScenario({ text: 'His stepdad hits him and there are bruises on his arms.', age: 7 });
  assert.equal(stop.kind, 'A1');
  assert.equal(stop.classLine, safetyCopy.a1.classes.abuse);
  assert.equal(stop.body, safetyCopy.a1.body);
  assert.deepEqual(stop.resources, safetyCopy.a1.resources);
});

test('D-03 immediate danger -> A1 danger stop', () => {
  const stop = screenScenario({ text: 'She swallowed a coin at lunch today.', age: 8 });
  assert.equal(stop.kind, 'A1');
  assert.equal(stop.classLine, safetyCopy.a1.classes.danger);
});

test('D-04 serious distress -> A1 distress stop', () => {
  const stop = screenScenario({ text: 'He cries himself to sleep and has panic attacks at school.', age: 9 });
  assert.equal(stop.kind, 'A1');
  assert.equal(stop.classLine, safetyCopy.a1.classes.distress);
});

test('A-01 ambiguous language -> B2 stop', () => {
  const stop = screenScenario({ text: 'Sometimes I think the family would be better off without him.', age: 8 });
  assert.equal(stop.kind, 'B2');
  assert.equal(stop.text, safetyCopy.b2);
});

test('C-01 control: ordinary frustration must NOT stop', () => {
  const stop = screenScenario({ text: 'My 8-year-old tears up his worksheet and says "I\'m stupid" during homework.', age: 8 });
  assert.equal(stop, null);
});

test('X-01 age outside 7-9 -> B3 stop', () => {
  const stop = screenScenario({ text: 'My teenager refuses to try out for the team.', age: 13 });
  assert.equal(stop.kind, 'B3');
  assert.equal(stop.text, safetyCopy.b3);
});

test('X-02 diagnosis/treatment request -> B4 stop', () => {
  const stop = screenScenario({ text: 'Can you diagnose whether he has ADHD and recommend medication?', age: 8 });
  assert.equal(stop.kind, 'B4');
  assert.equal(stop.text, safetyCopy.b4);
});
