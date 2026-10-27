// Deterministic LOCAL script selection (Founder decision, Oct 26, 2026).
//
// The model proposes canonical Wheel/Cycle identifiers only. It never sees
// the Appendix B scripts or their situation labels (data minimization), so
// it cannot ground a script choice — the third live smoke test proved this
// (valid proposal, script_number null). Script selection therefore happens
// here, locally and deterministically, from the scenario text the parent
// provided, against the seven approved Appendix B situations (CSR-2).
//
// Binding rules (Founder direction):
// - Matching is driven by the scenario TEXT alone. The matcher takes no
//   spoke, stage, or model proposal as input, so a match can never be
//   forced from a spoke or stage.
// - Utterance rules (the child's own words, tiers of the published
//   situations) outrank context rules (described circumstances).
// - Signals for two or more different scripts at the winning tier are
//   AMBIGUOUS and produce a labeled fallback, never a guess.
// - No signals produce NO MATCH and a labeled fallback.
// - Script content and situation labels live only in this local layer and
//   in content/scripts.json. They never enter the model payload.

export const MATCH_RULES = [
  {
    rule_id: 'R1-stupid-utterance',
    script_number: 1,
    tier: 'utterance',
    basis: 'Appendix B Script #1 situation: "I\'m stupid."',
    patterns: ["\\bi(?:'m| am) (?:so |really )?stupid\\b"],
  },
  {
    rule_id: 'R2-nobody-likes-me-utterance',
    script_number: 2,
    tier: 'utterance',
    basis: 'Appendix B Script #2 situation: "Nobody likes me."',
    patterns: ["\\b(?:nobody|no one) likes me\\b"],
  },
  {
    rule_id: 'R3-wont-try-utterance',
    script_number: 3,
    tier: 'utterance',
    basis: 'Appendix B Script #3 situation: "I don\'t want to try. I\'ll be bad at it."',
    patterns: ["\\bdon'?t want to try\\b", "\\bbe bad at it\\b"],
  },
  {
    rule_id: 'R4-cant-do-it-utterance',
    script_number: 4,
    tier: 'utterance',
    basis: 'Appendix B Script #4 situation: "I can\'t do it."',
    patterns: ["\\bi can(?:'t| not) do (?:it|this)\\b"],
  },
  {
    rule_id: 'R5-loses-game-context',
    script_number: 5,
    tier: 'context',
    basis: 'Appendix B Script #5 situation: child loses a game (tears, anger, "this is rigged")',
    patterns: ["\\brigged\\b", "\\b(?:lose|loses|lost|losing) (?:a |the )?game\\b"],
  },
  {
    rule_id: 'R6-trouble-at-school-context',
    script_number: 6,
    tier: 'context',
    basis: 'Appendix B Script #6 situation: child gets in trouble at school',
    patterns: ["\\btrouble at school\\b", "\\bgot in trouble\\b", "\\bgets in trouble\\b", "\\bin trouble at school\\b"],
  },
  {
    rule_id: 'R7-school-refusal-utterance',
    script_number: 7,
    tier: 'utterance',
    basis: 'Appendix B Script #7 situation: "I don\'t want to go to school."',
    patterns: ["\\bdon'?t want to go to school\\b", "\\brefus(?:e|es|ed|ing) to go to school\\b"],
  },
];

const compiled = MATCH_RULES.map((rule) => ({
  ...rule,
  regexes: rule.patterns.map((p) => new RegExp(p, 'i')),
}));

function normalize(text) {
  return String(text ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// matchScript(text) ->
//   { status: 'matched', script_number, rule_ids, tier }
//   { status: 'ambiguous', candidates: [script_number...], rule_ids }
//   { status: 'none' }
export function matchScript(text) {
  const normalized = normalize(text);
  const hits = compiled.filter((rule) => rule.regexes.some((re) => re.test(normalized)));
  if (hits.length === 0) return { status: 'none' };

  const utterance = hits.filter((h) => h.tier === 'utterance');
  const winning = utterance.length > 0 ? utterance : hits;
  const scripts = [...new Set(winning.map((h) => h.script_number))];
  if (scripts.length > 1) {
    return { status: 'ambiguous', candidates: scripts, rule_ids: winning.map((h) => h.rule_id) };
  }
  return {
    status: 'matched',
    script_number: scripts[0],
    rule_ids: winning.map((h) => h.rule_id),
    tier: winning[0].tier,
  };
}
