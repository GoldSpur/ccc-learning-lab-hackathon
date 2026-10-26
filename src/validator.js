// Deterministic validator. The model may only PROPOSE canonical framework
// identifiers; this module decides what is valid. No model output reaches
// the parent unless it passes every rule here. Rules implement the CCC
// Framework Specification v1.0.0 and the Execution Charter:
//  - Wheel = diagnose (spokes), Cycle = build (stages), kept distinct.
//  - Stuck Point is a diagnostic LENS at the Struggle -> Support transition,
//    never a Cycle stage.
//  - Snapshot is a separate instrument; no Snapshot -> spoke mapping exists.
//  - Scripts are selected from the approved Appendix B records only.
//  - Model-supplied framework definitions are never accepted (strict schema).
import { SPOKE_IDS, STAGE_IDS, SCRIPT_NUMBERS } from './content.js';

const ALLOWED_KEYS = new Set([
  'spoke_id',
  'stage_ids',
  'stuck_point_anchor',
  'script_number',
  'rationale_codes',
]);

export function validateProposal(proposal) {
  const errors = [];
  if (proposal === null || typeof proposal !== 'object' || Array.isArray(proposal)) {
    return { ok: false, errors: ['proposal must be an object'] };
  }

  // Strict schema: any unexpected key (e.g. an invented definition, a
  // Snapshot mapping, free-text framework content) is rejected outright.
  for (const key of Object.keys(proposal)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`unexpected field: ${key}`);
    if (/snapshot/i.test(key)) errors.push('snapshot mappings are not permitted');
    if (/definition|gloss|description/i.test(key)) {
      errors.push('model-supplied framework definitions are not permitted');
    }
  }

  // Spoke: exactly one canonical Wheel spoke.
  if (!SPOKE_IDS.includes(proposal.spoke_id)) {
    errors.push(`unknown spoke_id: ${proposal.spoke_id}`);
  }

  // Stages: non-empty, all canonical, in canonical Cycle order.
  const stages = proposal.stage_ids;
  if (!Array.isArray(stages) || stages.length === 0) {
    errors.push('stage_ids must be a non-empty array');
  } else {
    for (const s of stages) {
      if (/stuck/i.test(String(s))) {
        errors.push('stuck point is a lens, never a cycle stage');
      } else if (!STAGE_IDS.includes(s)) {
        errors.push(`unknown stage_id: ${s}`);
      }
    }
    const order = stages.map((s) => STAGE_IDS.indexOf(s)).filter((i) => i >= 0);
    for (let i = 1; i < order.length; i++) {
      if (order[i] <= order[i - 1]) errors.push('stage_ids out of canonical order');
    }
  }

  // Stuck Point: allowed only as a lens anchored at Struggle -> Support.
  if (proposal.stuck_point_anchor !== undefined && proposal.stuck_point_anchor !== null) {
    if (proposal.stuck_point_anchor !== 'struggle-support') {
      errors.push(`invalid stuck_point_anchor: ${proposal.stuck_point_anchor}`);
    }
  }

  // Script: must be one of the approved Appendix B records (or null when the
  // model judges no script matches — the pipeline then uses honest fallback).
  if (proposal.script_number !== null && proposal.script_number !== undefined) {
    if (!SCRIPT_NUMBERS.includes(proposal.script_number)) {
      errors.push(`unknown script_number: ${proposal.script_number}`);
    }
  }

  if (proposal.rationale_codes !== undefined) {
    if (!Array.isArray(proposal.rationale_codes) ||
        proposal.rationale_codes.some((c) => typeof c !== 'string')) {
      errors.push('rationale_codes must be an array of code strings');
    }
  }

  return { ok: errors.length === 0, errors };
}
