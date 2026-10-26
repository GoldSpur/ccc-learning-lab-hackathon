// Deterministic safety screening — runs BEFORE any model call and cannot be
// bypassed by parent confirmation, retry, or fallback (CSR-3 v0.2 binding
// implementation requirements 1-2). All stop output is rendered exclusively
// from the frozen CSR-3 strings in content/safety-copy.json; the model never
// generates safety wording (requirement 3-4).
//
// These pattern screens are PROVISIONAL, fictional-test tooling. They are not
// independently validated and are not clinical instruments (CSR-3 A2).
import { safetyCopy } from './content.js';

const PATTERNS = {
  // Direct self-harm / suicide disclosure -> B1
  selfHarm: /\b(suicid\w*|kill (him|her|them)self|hurting (him|her|them)self|hurt (him|her|them)self|self[- ]harm\w*|wants to die|end (his|her|their) life)\b/i,
  // Possible immediate danger -> A1 (danger)
  danger: /\b(choking|swallowed (a )?(coin|battery|pill|magnet)|bleeding|broken (arm|leg|bone)|left alone (near|by|at) (the )?(pool|street|road)|wandering (off|away) (at night|alone))\b/i,
  // Possible abuse / harm from another person -> A1 (abuse)
  abuse: /\b(hits? him|hits? her|beating (him|her)|bruises? (on|all over)|afraid of (his|her|their) (dad|mom|stepdad|stepmom|uncle|teacher|babysitter)|touches? (him|her) (inappropriately|in private))\b/i,
  // Serious emotional distress -> A1 (distress)
  distress: /\b(cries (him|her)self to sleep|panic attacks?|won't eat|hasn't eaten|screaming for hours|terrified every night|night terrors every night)\b/i,
  // Ambiguous possible-safety language -> B2
  ambiguous: /\b(better off without (him|her|them)|wish (he|she) (was|were) (gone|never born)|says (he|she) wants to disappear)\b/i,
  // Diagnosis / treatment request -> B4
  diagnosis: /\b(diagnos\w*|does (he|she) have (adhd|autism|anxiety|depression|odd)|medication|prescribe|therapy for|treatment for)\b/i,
};

export function renderStop(stop) {
  const base = { stopped: true, kind: stop.kind, badge: safetyCopy.badge };
  switch (stop.kind) {
    case 'A1':
      return {
        ...base,
        heading: safetyCopy.a1.heading,
        classLine: safetyCopy.a1.classes[stop.a1Class],
        body: safetyCopy.a1.body,
        resources: [...safetyCopy.a1.resources],
      };
    case 'B1': return { ...base, text: safetyCopy.b1 };
    case 'B2': return { ...base, text: safetyCopy.b2 };
    case 'B3': return { ...base, text: safetyCopy.b3 };
    case 'B4': return { ...base, text: safetyCopy.b4 };
    default: throw new Error(`unknown stop kind: ${stop.kind}`);
  }
}

// input: { text: string, age: number|null }
// Returns null (proceed) or a rendered stop object. Precedence:
// B1 > A1 > B2 > B4 > B3 — safety stops outrank scope stops.
export function screenScenario(input) {
  const text = String(input?.text ?? '');
  const age = input?.age ?? null;

  if (PATTERNS.selfHarm.test(text)) return renderStop({ kind: 'B1' });
  if (PATTERNS.danger.test(text)) return renderStop({ kind: 'A1', a1Class: 'danger' });
  if (PATTERNS.abuse.test(text)) return renderStop({ kind: 'A1', a1Class: 'abuse' });
  if (PATTERNS.distress.test(text)) return renderStop({ kind: 'A1', a1Class: 'distress' });
  if (PATTERNS.ambiguous.test(text)) return renderStop({ kind: 'B2' });
  if (PATTERNS.diagnosis.test(text)) return renderStop({ kind: 'B4' });
  if (age !== null && (!Number.isInteger(age) || age < 7 || age > 9)) {
    return renderStop({ kind: 'B3' });
  }
  return null;
}
