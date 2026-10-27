// Judge-facing demo application logic (B2). Everything here runs the REAL
// B1 pipeline modules — screening, gateway accounting, validator, local
// matcher — with mocked or recorded model transports. No live API calls are
// possible from this layer: no live transport exists in this file.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScenario, applyOverride } from '../src/pipeline.js';
import { screenScenario } from '../src/screening.js';
import { validateProposal } from '../src/validator.js';
import { matchScript } from '../src/matcher.js';
import { BudgetLedger, HARD_NANO } from '../src/ledger.js';
import { createMockTransport } from '../src/gateway.js';
import { framework, scriptsData, safetyCopy } from '../src/content.js';

const here = dirname(fileURLToPath(import.meta.url));

// The canonical proposal returned by the third live smoke test (Oct 26,
// 2026) — validated live, recorded verbatim, replayed here without a call.
export const RECORDED_LIVE_PROPOSAL = {
  spoke_id: 'spoke-learning',
  stage_ids: ['stage-attempt', 'stage-struggle'],
  stuck_point_anchor: 'struggle-support',
  script_number: null,
  rationale_codes: [],
};

const MOCK_USAGE = { input_tokens: 314, output_tokens: 260, cached_input_tokens: 0 };

export const PRESETS = [
  {
    id: 'at1',
    title: 'AT1 — "I\'m stupid" (homework)',
    tag: 'Canonical demo · recorded live proposal',
    text: 'Fictional scenario: an 8-year-old doing homework says "I\'m stupid" and wants to quit.',
    age: 8,
    proposalSource: 'RECORDED LIVE — Muse Spark 1.3, Oct 26, 2026',
    proposal: RECORDED_LIVE_PROPOSAL,
  },
  {
    id: 'nobody-likes-me',
    title: '"Nobody likes me"',
    tag: 'Fictional · mock proposal',
    text: 'My daughter came home quiet and whispered "nobody likes me" at dinner.',
    age: 8,
    proposalSource: 'MOCK — demo stand-in for the live model',
    proposal: {
      spoke_id: 'spoke-social',
      stage_ids: ['stage-connection', 'stage-attempt', 'stage-struggle', 'stage-support'],
      stuck_point_anchor: 'struggle-support',
      script_number: null,
      rationale_codes: ['peer-belonging'],
    },
  },
  {
    id: 'wont-try',
    title: '"I don\'t want to try. I\'ll be bad at it."',
    tag: 'Fictional · mock proposal',
    text: 'He looked at the new puzzle and said "I don\'t want to try. I\'ll be bad at it."',
    age: 7,
    proposalSource: 'MOCK — demo stand-in for the live model',
    proposal: {
      spoke_id: 'spoke-learning',
      stage_ids: ['stage-attempt', 'stage-struggle'],
      stuck_point_anchor: 'struggle-support',
      script_number: null,
      rationale_codes: ['fear-of-failing'],
    },
  },
  {
    id: 'bedtime-dark',
    title: 'Afraid of the dark (no matching script)',
    tag: 'Fictional · honest fallback',
    text: 'My 7-year-old is afraid of the dark at bedtime and wants the hall light left on.',
    age: 7,
    proposalSource: 'MOCK — demo stand-in for the live model',
    proposal: {
      spoke_id: 'spoke-emotional',
      stage_ids: ['stage-connection', 'stage-struggle', 'stage-support'],
      stuck_point_anchor: 'struggle-support',
      script_number: null,
      rationale_codes: ['bedtime-fear'],
    },
  },
  {
    id: 'mixed-signals',
    title: 'Mixed signals (ambiguous)',
    tag: 'Fictional · ambiguous match',
    text: 'He said "I\'m stupid" at homework, and this morning he cried "I don\'t want to go to school."',
    age: 8,
    proposalSource: 'MOCK — demo stand-in for the live model',
    proposal: {
      spoke_id: 'spoke-learning',
      stage_ids: ['stage-attempt', 'stage-struggle'],
      stuck_point_anchor: 'struggle-support',
      script_number: null,
      rationale_codes: [],
    },
  },
  {
    id: 'model-mistake',
    title: 'When the model gets it wrong',
    tag: 'Fictional · validation rejects',
    text: 'Fictional scenario: an 8-year-old doing homework says "I\'m stupid" and wants to quit.',
    age: 8,
    proposalSource: 'MOCK — deliberately invalid proposal',
    proposal: {
      spoke_id: 'spoke-learning',
      stage_ids: ['stage-connection', 'stage-stuck-point'],
      stuck_point_anchor: 'struggle-support',
      script_number: 1,
      rationale_codes: ['invented-stage'],
    },
  },
  {
    id: 'safety-test',
    title: 'Safety test — self-harm disclosure',
    tag: 'FICTIONAL SAFETY TEST · provisional',
    text: 'My son told me he wants to kill himself.',
    age: 8,
    proposalSource: 'NONE — the model is never called on a safety stop',
    proposal: null,
  },
  {
    id: 'age-13',
    title: 'Out of scope — age 13',
    tag: 'Fictional · scope stop',
    text: 'My teenager refuses to start his homework and says it is pointless.',
    age: 13,
    proposalSource: 'NONE — out of the demonstrated 7–9 range',
    proposal: null,
  },
];

export function getContent() {
  return {
    wheel: framework.wheel,
    cycle: framework.cycle,
    badge: safetyCopy.badge,
    acknowledgment: safetyCopy.a2,
    provenance: {
      framework_source: framework.source,
      framework_sha256: framework.source_sha256,
      scripts_source: scriptsData.source,
      scripts_sha256: scriptsData.source_file_sha256,
      safety_source: safetyCopy.source,
      safety_sha256: safetyCopy.source_sha256,
    },
    presets: PRESETS.map(({ id, title, tag, text, age }) => ({ id, title, tag, text, age })),
  };
}

export function createDemo({ ledgerPath }) {
  const ledger = new BudgetLedger(ledgerPath);
  const budget = () => ({
    committed_usd: ledger.committedNano() / 1e9,
    ceiling_usd: HARD_NANO / 1e9,
  });

  async function run(body) {
    const preset = body?.presetId ? PRESETS.find((p) => p.id === body.presetId) : null;
    if (body?.presetId && !preset) return { error: 'unknown preset' };
    const input = preset
      ? { text: preset.text, age: preset.age }
      : { text: String(body?.text ?? ''), age: Number.isFinite(body?.age) ? body.age : null };

    // Free text: the deterministic layers run for real; classification is
    // the one step that needs the live model, which this demo never calls.
    if (!preset) {
      const stop = screenScenario(input);
      if (stop) return { mode: 'deterministic-only', outcome: 'STOP', stop, trace: [
        { step: 'Safety & scope screening (deterministic)', detail: `Stop ${stop.kind} — exact approved wording shown. The model is never called.`, status: 'stop' },
      ], budget: budget() };
      const match = matchScript(input.text);
      return { mode: 'deterministic-only', outcome: 'NEEDS-MODEL', match, trace: [
        { step: 'Safety & scope screening (deterministic)', detail: 'Passed — no stop applies.', status: 'pass' },
        { step: 'Local script matching (deterministic)', detail: match.status === 'matched' ? `Rule ${match.rule_ids.join(', ')} → Script #${match.script_number}.` : `No local match (${match.status}).`, status: 'pass' },
        { step: 'AI classification', detail: 'Requires the live model — not called in this demo. Choose a prepared scenario to see the full path.', status: 'info' },
      ], budget: budget() };
    }

    let modelCalls = 0;
    const transport = createMockTransport(async () => {
      modelCalls++;
      return { proposal: preset.proposal, usage: MOCK_USAGE };
    });
    const committedBefore = ledger.committedNano();
    const result = await runScenario(input, { transport, ledger, session: 'demo' });
    const trace = [];
    if (result.outcome === 'STOP') {
      trace.push({ step: 'Safety & scope screening (deterministic)', detail: `Stop ${result.stop.kind} fired before any model call. Model calls: ${modelCalls}.`, status: 'stop' });
    } else {
      trace.push({ step: 'Safety & scope screening (deterministic)', detail: 'Passed — no stop applies.', status: 'pass' });
      trace.push({ step: 'AI classification', detail: `Proposal source: ${preset.proposalSource}.`, status: 'info', proposal: preset.proposal });
      const verdict = validateProposal(preset.proposal);
      trace.push({ step: 'Deterministic validation', detail: verdict.ok ? 'Proposal accepted — every identifier is canonical, stages in Cycle order, no invented content.' : `Proposal REJECTED: ${verdict.errors.join('; ')}`, status: verdict.ok ? 'pass' : 'fail' });
      if (verdict.ok) {
        const match = matchScript(input.text);
        trace.push({ step: 'Local script selection (deterministic)', detail: match.status === 'matched' ? `Rule ${match.rule_ids.join(', ')} selected Script #${match.script_number} locally. Script content never leaves this machine.` : match.status === 'ambiguous' ? `Ambiguous — signals for scripts ${match.candidates.join(' and ')}. No script is forced.` : 'No approved script matches this situation. Honest fallback.', status: match.status === 'matched' ? 'pass' : 'info' });
      }
    }
    const entries = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')).entries : [];
    const last = entries[entries.length - 1];
    if (last && ledger.committedNano() !== committedBefore) {
      trace.push({ step: 'Budget safeguard (application-side)', detail: `Reserved worst case $${(last.estimatedNano / 1e9).toFixed(6)}, reconciled to $${(last.chargedNano / 1e9).toFixed(6)}. Aggregate committed: $${(ledger.committedNano() / 1e9).toFixed(6)} of the $120 hard stop. (Demo accounting uses mocked usage.)`, status: 'info' });
    }
    return {
      mode: 'full',
      outcome: result.outcome,
      label: result.outcome === 'STOP' ? null : (preset.id === 'at1' ? 'RECORDED LIVE' : 'MOCK'),
      reason: result.reason ?? null,
      candidates: result.candidates ?? null,
      stop: result.stop ?? null,
      proposal: result.proposal ?? preset.proposal,
      proposalSource: preset.proposalSource,
      script: result.script ?? null,
      match: result.match ?? null,
      trace,
      budget: budget(),
    };
  }

  function override(body) {
    const proposal = body?.proposal;
    // A safety stop produces no proposal, so there is nothing to override —
    // an override can never resurrect a stop (CSR-3 binding requirement).
    if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal) || !('spoke_id' in proposal)) {
      return { ok: false, errors: ['Override requires a completed guidance proposal. Safety stops cannot be overridden.'] };
    }
    const verdict = validateProposal(proposal);
    if (!verdict.ok) return { ok: false, errors: ['The proposal being overridden is not itself valid.', ...verdict.errors] };
    return applyOverride(proposal, { spoke_id: body?.spoke_id });
  }

  return { run, override, budget };
}

export const indexHtml = () => readFileSync(join(here, 'index.html'), 'utf8');
