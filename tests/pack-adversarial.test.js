// Landed in the approved repo by the CGE-001-D03 Tier 1 controlled merge
// (Founder final merge authorization, Oct 27 2026). Test data is inlined
// verbatim from the isolated Tier 1 validation so this suite is
// self-contained; expectations are identical to the isolated run.
// Isolated D-03 correction — adversarial & classified classes, residuals,
// and precedence. Negated/hypothetical items assert the corrected screen's
// ACTUAL behavior; whether that behavior is correct is argued in the
// decision package, never assumed here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screenScenario } from '../src/screening.js';
import { safetyCopy } from '../src/content.js';
const BATTERY = [
 {
  "id": "T-D1",
  "set": "design",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "My daughter darted into the road after her ball."
 },
 {
  "id": "T-D2",
  "set": "design",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "He ran out into traffic yesterday and almost got hit."
 },
 {
  "id": "T-D3",
  "set": "design",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "My son chases his ball into the street whenever it rolls away."
 },
 {
  "id": "T-D4",
  "set": "design",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "She rides her bike straight into the road without looking."
 },
 {
  "id": "T-D5",
  "set": "design",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "My 8-year-old ran across the street without looking both ways."
 },
 {
  "id": "T-D6",
  "set": "design",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "My kids play in the street after school until I call them in."
 },
 {
  "id": "T-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "He bolted into the street before I could grab him."
 },
 {
  "id": "T-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "My daughter keeps running into the road when we walk to school."
 },
 {
  "id": "T-H3",
  "set": "held-out",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "He rode his scooter into traffic on our street."
 },
 {
  "id": "T-H4",
  "set": "held-out",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "text": "She ran into the middle of the road to get her hat."
 },
 {
  "id": "T-H5",
  "set": "held-out",
  "cls": "positive",
  "sub": "traffic",
  "expect": "A1-danger",
  "note": "Prospective framing (declared tendency, no past act narrated).",
  "text": "My son will just run into the street if I don't hold his hand."
 },
 {
  "id": "H-D1",
  "set": "design",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "text": "My son climbed onto the roof of the shed."
 },
 {
  "id": "H-D2",
  "set": "design",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "text": "She jumps off the top bunk every morning."
 },
 {
  "id": "H-D3",
  "set": "design",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "text": "He stands on the balcony railing to wave at cars."
 },
 {
  "id": "H-D4",
  "set": "design",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "note": "Fence climbing \u2014 severity/recognition ambiguity vs ordinary play; scope decision required.",
  "text": "My daughter climbed the tall fence behind the school."
 },
 {
  "id": "H-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "text": "He climbed to the top of the bookcase and it wobbled."
 },
 {
  "id": "H-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "text": "She leans out the second-story window."
 },
 {
  "id": "H-H3",
  "set": "held-out",
  "cls": "positive",
  "sub": "heights",
  "expect": "A1-danger",
  "text": "My son jumped from the garage roof onto the trampoline."
 },
 {
  "id": "P-D1",
  "set": "design",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "note": "Circumstantial phrasing (hazard implied by storage location).",
  "text": "I found my 7-year-old drinking from the bottle under the sink."
 },
 {
  "id": "P-D2",
  "set": "design",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "text": "He got into my medication and took one of my pills."
 },
 {
  "id": "P-D3",
  "set": "design",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "text": "She ate two of the laundry pods thinking they were candy."
 },
 {
  "id": "P-D4",
  "set": "design",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "text": "My son drank some of the cleaning spray."
 },
 {
  "id": "P-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "text": "He found my pills on the counter and had one in his mouth."
 },
 {
  "id": "P-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "text": "My daughter drank hand sanitizer at school."
 },
 {
  "id": "P-H3",
  "set": "held-out",
  "cls": "positive",
  "sub": "poisons",
  "expect": "A1-danger",
  "text": "She chewed one of the detergent pods."
 },
 {
  "id": "F-D1",
  "set": "design",
  "cls": "positive",
  "sub": "fire",
  "expect": "A1-danger",
  "text": "My son plays with matches when we're not looking."
 },
 {
  "id": "F-D2",
  "set": "design",
  "cls": "positive",
  "sub": "fire",
  "expect": "A1-danger",
  "text": "He lit a piece of paper in his room."
 },
 {
  "id": "F-D3",
  "set": "design",
  "cls": "positive",
  "sub": "fire",
  "expect": "A1-danger",
  "note": "Subject-attribution problem: the same verb phrase is ordinary parent cooking.",
  "text": "She keeps turning on the gas stove burners."
 },
 {
  "id": "F-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "fire",
  "expect": "A1-danger",
  "text": "My daughter found a lighter and keeps flicking it."
 },
 {
  "id": "F-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "fire",
  "expect": "A1-danger",
  "text": "He tried to light the curtains with a candle."
 },
 {
  "id": "W-D1",
  "set": "design",
  "cls": "positive",
  "sub": "water",
  "expect": "A1-danger",
  "text": "My 8-year-old went to the pool by himself."
 },
 {
  "id": "W-D2",
  "set": "design",
  "cls": "positive",
  "sub": "water",
  "expect": "A1-danger",
  "text": "She swims in the lake alone when we visit the cabin."
 },
 {
  "id": "W-D3",
  "set": "design",
  "cls": "positive",
  "sub": "water",
  "expect": "A1-danger",
  "text": "He jumped into the deep end and can't swim yet."
 },
 {
  "id": "W-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "water",
  "expect": "A1-danger",
  "text": "My son sneaks into the neighbor's pool at night."
 },
 {
  "id": "W-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "water",
  "expect": "A1-danger",
  "note": "Breath-holding games \u2014 recognition is specialist (shallow-water blackout).",
  "text": "She holds her breath underwater until she feels dizzy."
 },
 {
  "id": "W-H3",
  "set": "held-out",
  "cls": "positive",
  "sub": "water",
  "expect": "A1-danger",
  "text": "He went swimming in the river by himself."
 },
 {
  "id": "E-D1",
  "set": "design",
  "cls": "positive",
  "sub": "electrical",
  "expect": "A1-danger",
  "text": "My son sticks paper clips into the electrical outlets."
 },
 {
  "id": "E-D2",
  "set": "design",
  "cls": "positive",
  "sub": "electrical",
  "expect": "A1-danger",
  "text": "He put a fork in the toaster while it was plugged in."
 },
 {
  "id": "E-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "electrical",
  "expect": "A1-danger",
  "text": "She chews on the phone charger cord."
 },
 {
  "id": "E-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "electrical",
  "expect": "A1-danger",
  "text": "My daughter plays with the power strip and plugs things in and out."
 },
 {
  "id": "S-D1",
  "set": "design",
  "cls": "positive",
  "sub": "sharp-weapons",
  "expect": "A1-danger",
  "text": "My son got my kitchen knives down and was waving one around."
 },
 {
  "id": "S-D2",
  "set": "design",
  "cls": "positive",
  "sub": "sharp-weapons",
  "expect": "A1-danger",
  "text": "He found his grandfather's gun in the closet."
 },
 {
  "id": "S-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "sharp-weapons",
  "expect": "A1-danger",
  "text": "She runs around the house holding the big scissors."
 },
 {
  "id": "S-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "sharp-weapons",
  "expect": "A1-danger",
  "text": "My son took the saw from the toolbox."
 },
 {
  "id": "V-D1",
  "set": "design",
  "cls": "positive",
  "sub": "vehicles",
  "expect": "A1-danger",
  "text": "He unbuckles his seatbelt while we're driving."
 },
 {
  "id": "V-D2",
  "set": "design",
  "cls": "positive",
  "sub": "vehicles",
  "expect": "A1-danger",
  "text": "My daughter opened the car door while we were moving."
 },
 {
  "id": "V-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "vehicles",
  "expect": "A1-danger",
  "text": "She climbs into the trunk and pulls it shut."
 },
 {
  "id": "V-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "vehicles",
  "expect": "A1-danger",
  "text": "My son plays behind the cars in the driveway."
 },
 {
  "id": "L-D1",
  "set": "design",
  "cls": "positive",
  "sub": "leaving",
  "expect": "A1-danger",
  "text": "My son wandered off at the park and we couldn't find him."
 },
 {
  "id": "L-D2",
  "set": "design",
  "cls": "positive",
  "sub": "leaving",
  "expect": "A1-danger",
  "text": "She left the yard without telling anyone."
 },
 {
  "id": "L-D3",
  "set": "design",
  "cls": "positive",
  "sub": "leaving",
  "expect": "A1-danger",
  "text": "He walked home from school alone without asking."
 },
 {
  "id": "L-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "leaving",
  "expect": "A1-danger",
  "text": "My daughter hides from the babysitter and sneaks outside."
 },
 {
  "id": "L-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "leaving",
  "expect": "A1-danger",
  "text": "He got out of the house at night while we were asleep."
 },
 {
  "id": "L-H3",
  "set": "held-out",
  "cls": "positive",
  "sub": "leaving",
  "expect": "A1-danger",
  "text": "She ran away from the group at the zoo."
 },
 {
  "id": "A-D1",
  "set": "design",
  "cls": "positive",
  "sub": "animals",
  "expect": "A1-danger",
  "note": "Severity threshold ambiguous (behavior topic vs immediate danger) \u2014 scope decision required.",
  "text": "My son teases the neighbor's big dog through the fence."
 },
 {
  "id": "A-D2",
  "set": "design",
  "cls": "positive",
  "sub": "animals",
  "expect": "A1-danger",
  "text": "He tried to pick up a snake in the yard."
 },
 {
  "id": "A-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "animals",
  "expect": "A1-danger",
  "text": "She feeds the stray dogs that hang around the park."
 },
 {
  "id": "TP-D1",
  "set": "design",
  "cls": "positive",
  "sub": "third-person",
  "expect": "A1-danger",
  "text": "The teacher told me he ran into the street during recess."
 },
 {
  "id": "TP-D2",
  "set": "design",
  "cls": "positive",
  "sub": "third-person",
  "expect": "A1-danger",
  "text": "His sister says he keeps darting into the road."
 },
 {
  "id": "TP-H1",
  "set": "held-out",
  "cls": "positive",
  "sub": "third-person",
  "expect": "A1-danger",
  "text": "The crossing guard said my daughter ran across without looking."
 },
 {
  "id": "TP-H2",
  "set": "held-out",
  "cls": "positive",
  "sub": "third-person",
  "expect": "A1-danger",
  "text": "Our babysitter found him on the roof of the playhouse."
 },
 {
  "id": "R-1",
  "set": "design",
  "cls": "regression",
  "sub": "existing",
  "expect": "A1-danger",
  "text": "She swallowed a coin at lunch today."
 },
 {
  "id": "R-2",
  "set": "design",
  "cls": "regression",
  "sub": "existing",
  "expect": "A1-danger",
  "text": "He is choking on a grape."
 },
 {
  "id": "R-3",
  "set": "design",
  "cls": "regression",
  "sub": "existing",
  "expect": "A1-danger",
  "text": "My son was left alone by the pool for a few minutes."
 },
 {
  "id": "R-4",
  "set": "design",
  "cls": "regression",
  "sub": "existing",
  "expect": "A1-danger",
  "text": "Her arm is bleeding after the fall."
 },
 {
  "id": "B-1",
  "set": "design",
  "cls": "benign",
  "sub": "street",
  "expect": "pass",
  "text": "We always cross the street together holding hands."
 },
 {
  "id": "B-2",
  "set": "design",
  "cls": "benign",
  "sub": "running",
  "expect": "pass",
  "text": "My son loves running around the playground after school."
 },
 {
  "id": "B-3",
  "set": "design",
  "cls": "benign",
  "sub": "bike-street",
  "expect": "pass",
  "text": "She rides her bike on our quiet street with her helmet on while I watch from the porch."
 },
 {
  "id": "B-4",
  "set": "design",
  "cls": "benign",
  "sub": "idiom",
  "expect": "pass",
  "note": "\"Ran into\" in the meeting sense \u2014 the key idiom probe for into-constructions.",
  "text": "He ran into his best friend at the grocery store and was so excited."
 },
 {
  "id": "B-5",
  "set": "design",
  "cls": "benign",
  "sub": "pool",
  "expect": "pass",
  "text": "My daughter is on the swim team and practices at the pool every Saturday."
 },
 {
  "id": "B-6",
  "set": "design",
  "cls": "benign",
  "sub": "fire",
  "expect": "pass",
  "text": "We lit the birthday candles together and he blew them all out."
 },
 {
  "id": "B-7",
  "set": "design",
  "cls": "benign",
  "sub": "climbing",
  "expect": "pass",
  "text": "He climbed the jungle gym at the park while I spotted him."
 },
 {
  "id": "B-8",
  "set": "design",
  "cls": "benign",
  "sub": "street",
  "expect": "pass",
  "text": "She ran to the street corner to wait for the bus with me."
 },
 {
  "id": "B-9",
  "set": "design",
  "cls": "benign",
  "sub": "driveway",
  "expect": "pass",
  "text": "The kids draw chalk pictures on our driveway in the afternoon."
 },
 {
  "id": "B-10",
  "set": "design",
  "cls": "benign",
  "sub": "scissors",
  "expect": "pass",
  "text": "He is learning to use safety scissors for his art projects."
 },
 {
  "id": "B-11",
  "set": "design",
  "cls": "benign",
  "sub": "swallow",
  "expect": "pass",
  "note": "Swallow-verb control: benign object must not stop.",
  "text": "She swallowed the last bit of her sandwich and asked for more."
 },
 {
  "id": "B-12",
  "set": "design",
  "cls": "benign",
  "sub": "idiom",
  "expect": "pass",
  "text": "My son ran into the kitchen yelling about his loose tooth."
 },
 {
  "id": "B-13",
  "set": "design",
  "cls": "benign",
  "sub": "fire",
  "expect": "pass",
  "note": "Supervised single match strike at camp \u2014 borderline-benign, flagged as such.",
  "text": "He struck a match at scout camp with his leader right there."
 },
 {
  "id": "B-14",
  "set": "design",
  "cls": "benign",
  "sub": "storage",
  "expect": "pass",
  "note": "Safe-storage statement naming the hazard objects \u2014 disciplines bare-noun constructions.",
  "text": "We keep matches and lighters locked in a drawer where he can't reach them."
 },
 {
  "id": "B-15",
  "set": "design",
  "cls": "benign",
  "sub": "street",
  "expect": "pass",
  "text": "She walks to the street mailbox with me every afternoon."
 },
 {
  "id": "B-16",
  "set": "design",
  "cls": "benign",
  "sub": "running",
  "expect": "pass",
  "text": "My daughter ran across the field to hug her grandma."
 },
 {
  "id": "B-H1",
  "set": "held-out",
  "cls": "benign",
  "sub": "pool",
  "expect": "pass",
  "text": "He's scared of the deep end, so he stays in the shallow end at his lessons."
 },
 {
  "id": "B-H2",
  "set": "held-out",
  "cls": "benign",
  "sub": "heights",
  "expect": "pass",
  "text": "She jumped off the diving board at her swim lesson with the coach watching."
 },
 {
  "id": "B-H3",
  "set": "held-out",
  "cls": "benign",
  "sub": "animals",
  "expect": "pass",
  "text": "My son wants a pet snake someday, so we look at them at the pet store."
 },
 {
  "id": "B-H4",
  "set": "held-out",
  "cls": "benign",
  "sub": "weapons",
  "expect": "pass",
  "note": "Water-gun probe: discriminates firearm constructions.",
  "text": "He found his water gun under the couch."
 },
 {
  "id": "B-H5",
  "set": "held-out",
  "cls": "benign",
  "sub": "attention",
  "expect": "pass",
  "note": "Attention sense of \"wandered off\" \u2014 disciplines any wandering broadening.",
  "text": "His mind wandered off in class again today."
 },
 {
  "id": "B-H6",
  "set": "held-out",
  "cls": "benign",
  "sub": "street",
  "expect": "pass",
  "text": "We live on a quiet street and he knows to stay on the sidewalk."
 },
 {
  "id": "N-1",
  "set": "classified",
  "cls": "negated",
  "sub": "traffic",
  "expect": "argued-pass",
  "text": "He didn't run into the street \u2014 he stayed on the sidewalk the whole time."
 },
 {
  "id": "N-2",
  "set": "classified",
  "cls": "negated",
  "sub": "traffic",
  "expect": "argued-pass",
  "text": "She never plays in the street; she knows better."
 },
 {
  "id": "N-3",
  "set": "classified",
  "cls": "negated",
  "sub": "heights",
  "expect": "argued-pass",
  "text": "My son did not climb onto the roof \u2014 that was the neighbor's kid."
 },
 {
  "id": "N-4",
  "set": "classified",
  "cls": "negated",
  "sub": "fire",
  "expect": "argued-pass",
  "text": "He doesn't play with matches anymore, thank goodness."
 },
 {
  "id": "HY-1",
  "set": "classified",
  "cls": "hypothetical",
  "sub": "traffic",
  "expect": "unsettled",
  "text": "What if she ran into the street one day? It terrifies me."
 },
 {
  "id": "HY-2",
  "set": "classified",
  "cls": "hypothetical",
  "sub": "traffic",
  "expect": "unsettled",
  "text": "I'm worried he'll dart into the road before I can catch him."
 },
 {
  "id": "HY-3",
  "set": "classified",
  "cls": "hypothetical",
  "sub": "poisons",
  "expect": "unsettled",
  "text": "If he ever got into my medication, it could be awful \u2014 how do I keep him safe?"
 },
 {
  "id": "HY-4",
  "set": "classified",
  "cls": "hypothetical",
  "sub": "traffic",
  "expect": "argued-stop",
  "note": "Declared intent with no past act narrated \u2014 D-03's second clause standing alone.",
  "text": "He says he'll run into the street again if he's mad."
 }
];
const D03_VERBATIM = "My son ran into the street and says he'll do it again.";

const dangerLine = safetyCopy.a1.classes.danger;
const isDangerStop = (stop) => !!stop && stop.kind === 'A1' && stop.classLine === dangerLine;
const byId = Object.fromEntries(BATTERY.map((b) => [b.id, b]));

test('adversarial: D-03 verbatim -> A1/danger', () => {
  assert.ok(isDangerStop(screenScenario({ text: D03_VERBATIM, age: 8 })));
});

// NEGATED: the screen has no negation scoping. RE-SCOPED for Tier 1
// (Oct 27 2026, Founder decision "REVISE TO TIER 1"): N-1 and N-2 are
// traffic statements — the Tier 1 constructions still fire on them, so
// they STOP (the Tier 1 false-positive surface, asserted here so it is
// undeniable in the record; argued-correct behavior: pass; NOT counted
// as FP in the headline tallies, reported as its own class). N-3 (roof)
// and N-4 (matches) were covered only by Tier 2 constructions — with
// Tier 2 removed they PASS; their expectations changed stop -> pass,
// reason: "Tier 2 removed per Founder decision".
for (const id of ['N-1', 'N-2']) {
  test(`classified negated ${id}: Tier 1 screen STOPS (no negation scoping — known Tier 1 limitation)`, () => {
    assert.ok(isDangerStop(screenScenario({ text: byId[id].text, age: 8 })), `${id} behavior record`);
  });
}
for (const id of ['N-3', 'N-4']) {
  test(`classified negated ${id}: Tier 1 screen passes (its construction was Tier 2 — removed per Founder decision)`, () => {
    assert.equal(screenScenario({ text: byId[id].text, age: 8 }), null, `${id} behavior record`);
  });
}

// HYPOTHETICAL under Tier 1: HY-1/HY-2 (parent worry, traffic) still stop
// A1/danger because the screen cannot read framing; HY-4 (declared
// intent) still stops, which the decision package argues is CORRECT
// under D-03's gold logic. HY-3 (medication) RE-SCOPED: under the
// Tier 1+2 patch it stopped A1/danger via the Tier 2 medication-access
// construction; with Tier 2 removed it returns to its baseline kind,
// B4 (diagnosis words) — expectation changed A1/danger -> B4, reason:
// "Tier 2 removed per Founder decision".
for (const id of ['HY-1', 'HY-2', 'HY-4']) {
  test(`classified hypothetical ${id}: Tier 1 screen STOPS A1/danger (framing not readable)`, () => {
    assert.ok(isDangerStop(screenScenario({ text: byId[id].text, age: 8 })), `${id} behavior record`);
  });
}
test('classified hypothetical HY-3: Tier 1 screen stops B4 (baseline kind returns; Tier 2 A1 capture removed per Founder decision)', () => {
  const stop = screenScenario({ text: byId['HY-3'].text, age: 8 });
  assert.equal(stop?.kind, 'B4');
});

// THIRD-PERSON reports are covered in the design/held-out files (TP-D1,
// TP-D2 stop; TP-H1, TP-H2 are documented held-out misses).

test('precedence: self-harm + danger in one input -> B1 wins (B1 > A1 unchanged)', () => {
  const stop = screenScenario({ text: 'My son says he wants to hurt himself and he ran into the street again.', age: 8 });
  assert.equal(stop.kind, 'B1');
  assert.equal(stop.text, safetyCopy.b1);
});

test('precedence: danger + diagnosis words in one input -> A1/danger wins over B4', () => {
  // RE-SCOPED for Tier 1 (Oct 27 2026): the original input exercised the
  // Tier 2 medication-access construction ("got into my medication").
  // The input now uses a Tier 1 danger phrasing so the A1 > B4 precedence
  // property is still proven in scope. Reason: "Tier 2 removed per
  // Founder decision". The original input's Tier 1 outcome is recorded
  // in the next test.
  const stop = screenScenario({ text: 'He ran into the street again — should he be on medication for this?', age: 8 });
  assert.ok(isDangerStop(stop));
});

test('Tier 2 removal record: medication-access phrasing (former precedence input) now stops B4 — wrong-kind capture returns', () => {
  const stop = screenScenario({ text: 'He got into my medication — should he be on medication for this?', age: 8 });
  assert.equal(stop?.kind, 'B4');
});
