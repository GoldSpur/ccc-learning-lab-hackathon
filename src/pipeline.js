// End-to-end deterministic pipeline:
//   screen (safety) -> gateway (model proposes IDs) -> validate -> select script.
// A safety stop short-circuits everything and cannot be bypassed by parent
// confirmation, retry, or fallback (CSR-3 v0.2 requirements 1-2): there is
// deliberately no parameter that skips screening.
import { screenScenario } from './screening.js';
import { callModel } from './gateway.js';
import { validateProposal } from './validator.js';
import { getScript } from './content.js';
import { matchScript } from './matcher.js';

export async function runScenario(input, { transport, ledger, session } = {}) {
  const stop = screenScenario(input);
  if (stop) return { outcome: 'STOP', stop };

  const res = await callModel({ scenarioText: input.text, transport, ledger, session });
  if (res.mode === 'FALLBACK') return { outcome: 'FALLBACK', reason: res.reason };

  const verdict = validateProposal(res.proposal);
  if (!verdict.ok) {
    return { outcome: 'FALLBACK', reason: 'validation-failed', errors: verdict.errors };
  }
  // Script selection is LOCAL and deterministic (Founder decision, Oct 26
  // 2026): the model never sees the scripts or their situations, so its
  // script_number is validated for schema but never selects. The matcher
  // reads the scenario text alone; ambiguous or unmatched situations fall
  // back honestly instead of forcing a script.
  const match = matchScript(input.text);
  if (match.status === 'ambiguous') {
    return { outcome: 'FALLBACK', reason: 'ambiguous-script-match', candidates: match.candidates, proposal: res.proposal, label: res.mode };
  }
  if (match.status !== 'matched') {
    return { outcome: 'FALLBACK', reason: 'no-script-match', proposal: res.proposal, label: res.mode };
  }
  const script = getScript(match.script_number);
  if (!script) return { outcome: 'FALLBACK', reason: 'no-script-match', proposal: res.proposal, label: res.mode };
  return {
    outcome: 'GUIDANCE',
    label: res.mode,
    proposal: res.proposal,
    script,
    match: { script_number: match.script_number, rule_ids: match.rule_ids, tier: match.tier },
  };
}

// Parent override (Charter H2): the parent may replace the proposed spoke
// with another canonical spoke. The override is re-validated by the same
// deterministic rules; it can never resurrect a stopped scenario, because
// overrides apply only to a completed GUIDANCE proposal.
export function applyOverride(proposal, changes) {
  const next = { ...proposal, ...changes };
  const verdict = validateProposal(next);
  return verdict.ok ? { ok: true, proposal: next } : { ok: false, errors: verdict.errors };
}
