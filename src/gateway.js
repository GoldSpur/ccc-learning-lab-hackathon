// Server-side model gateway — the ONLY component that can call the model,
// and the only place the API key is ever read (from the environment, never
// from the repository). Enforces, in order: kill switch, data minimization,
// budget reservation, timeout, reconciliation.
//
// Founder data-minimization decision (Oct 26, 2026): the payload contains
// ONLY the fictional scenario text and the minimum canonical identifiers
// and definitions required for classification. Full scripts, complete
// framework materials, and validator logic are never sent.
import { framework } from './content.js';
import { LedgerError, actualNano, estimateWorstNano } from './ledger.js';

export const MODEL_ID = 'muse-spark-1.3'; // Standard. Contributor is prohibited.
// Reasoning-budget correction (Founder-approved Oct 26, 2026): Muse Spark's
// reasoning is always on, reasoning tokens bill as output and count against
// the output cap, and on Chat Completions a reasoning-consumed budget returns
// content null with finish_reason "length" — exactly what both smoke calls
// showed at the old 400 cap (314 in / 400 out, no content). The effort is
// pinned low (also the Gate B design's safeguard) and the cap raised so the
// bounded classification answer fits after reasoning.
export const REASONING_EFFORT = 'low';
export const MAX_OUTPUT_TOKENS = 2048;

// Minimal classification context: spoke ids with name + child statement,
// stage ids with names, script NUMBERS only (never script content).
export function buildPayload(scenarioText) {
  const spokes = framework.wheel.map((s) => `${s.id} = ${s.display_name} ("${s.child_statement}")`).join('; ');
  const stages = framework.cycle.map((s) => `${s.id} = ${s.name}`).join('; ');
  const system = [
    'You classify a fictional parenting scenario against a fixed framework.',
    'Respond with JSON only, using exactly these keys: spoke_id, stage_ids, stuck_point_anchor, script_number, rationale_codes.',
    `spoke_id must be one of: ${spokes}.`,
    `stage_ids must be a non-empty subset, in order, of: ${stages}.`,
    'stuck_point_anchor must be "struggle-support" or null. The stuck point is a lens at the struggle-to-support transition, never a stage.',
    'script_number must be an integer 1-7 (the approved script whose situation matches) or null when none matches.',
    'Do not invent definitions, stages, spokes, or scripts.',
  ].join('\n');
  return {
    model: MODEL_ID,
    // Canonical Chat Completions cap field (Meta accepts max_tokens only as
    // a deprecated alias for max_completion_tokens).
    max_completion_tokens: MAX_OUTPUT_TOKENS,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: String(scenarioText) },
    ],
  };
}

const estimateInputTokens = (payload) =>
  Math.ceil(JSON.stringify(payload).length / 4);

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('model call timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// transport: { kind: 'mock' | 'live', send(payload) -> { proposal, usage|null } }
export async function callModel({ scenarioText, transport, ledger, session, timeoutMs = 15000 }) {
  if (process.env.CCC_KILL_SWITCH === '1') {
    return { mode: 'FALLBACK', reason: 'kill-switch' };
  }
  const payload = buildPayload(scenarioText);
  const worstNano = estimateWorstNano({
    inputTokens: estimateInputTokens(payload),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  let reservation;
  try {
    reservation = ledger.reserve({ session, worstNano });
  } catch (err) {
    if (err instanceof LedgerError) return { mode: 'FALLBACK', reason: 'budget-hard-stop', detail: err.message };
    throw err;
  }

  let result;
  try {
    result = await withTimeout(transport.send(payload), timeoutMs);
  } catch {
    ledger.reconcile(reservation.id, null); // unknown usage -> worst case
    return { mode: 'FALLBACK', reason: 'api-failure' };
  }
  if (!result || typeof result !== 'object' || !('proposal' in result)) {
    ledger.reconcile(reservation.id, null);
    return { mode: 'FALLBACK', reason: 'api-failure' };
  }
  ledger.reconcile(reservation.id, result.usage ? actualNano(result.usage) : null);
  return {
    mode: transport.kind === 'live' ? 'LIVE' : 'MOCK',
    proposal: result.proposal,
    warn: reservation.warn,
  };
}

// Mock transport for tests and offline development (B1: mocked responses only).
export function createMockTransport(handler) {
  return { kind: 'mock', send: async (payload) => handler(payload) };
}

// Live transport is intentionally NOT implemented in B1. Gate D (B1 scope)
// authorizes mocked tests only; live calls require the Founder's separate
// explicit authorization, at which point this is replaced by the real
// HTTPS transport reading MODEL_API_KEY from the environment.
export function createLiveTransport() {
  return {
    kind: 'live',
    send: async () => {
      throw new Error('live transport disabled — no live API calls are authorized in B1');
    },
  };
}
