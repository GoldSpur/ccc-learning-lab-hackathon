// End-to-end deterministic pipeline:
//   screen (safety) -> gateway (model proposes IDs) -> validate -> select script.
// A safety stop short-circuits everything and cannot be bypassed by parent
// confirmation, retry, or fallback (CSR-3 v0.2 requirements 1-2): there is
// deliberately no parameter that skips screening.
import { screenScenario } from './screening.js';
import { callModel } from './gateway.js';
import { validateProposal } from './validator.js';
import { getScript } from './content.js';

export async function runScenario(input, { transport, ledger, session } = {}) {
  const stop = screenScenario(input);
  if (stop) return { outcome: 'STOP', stop };

  const res = await callModel({ scenarioText: input.text, transport, ledger, session });
  if (res.mode === 'FALLBACK') return { outcome: 'FALLBACK', reason: res.reason };

  const verdict = validateProposal(res.proposal);
  if (!verdict.ok) {
    return { outcome: 'FALLBACK', reason: 'validation-failed', errors: verdict.errors };
  }
  if (res.proposal.script_number === null || res.proposal.script_number === undefined) {
    return { outcome: 'FALLBACK', reason: 'no-script-match', proposal: res.proposal, label: res.mode };
  }
  const script = getScript(res.proposal.script_number);
  if (!script) return { outcome: 'FALLBACK', reason: 'no-script-match', proposal: res.proposal, label: res.mode };
  return { outcome: 'GUIDANCE', label: res.mode, proposal: res.proposal, script };
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
