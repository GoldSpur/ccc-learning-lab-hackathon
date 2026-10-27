// Model-response extraction + diagnostics (B1 diagnostic correction, Oct 26).
//
// The first live smoke test (Oct 26, 2026) returned a well-formed API
// envelope with real usage, but the harness's bare JSON.parse of the message
// content failed and the proposal collapsed to null. This module is the
// single extraction path for live replies. It separates four failure classes
// the Founder required to be distinguished:
//   1. envelope  — the API envelope has no usable message content.
//   2. parse     — content is not a JSON object (malformed JSON, non-object
//                  JSON, or no JSON span at all).
//   3. schema    — parsed object violates the proposal schema (reported by
//                  the deterministic validator, never by this module).
//   4. canonical — parsed object names non-canonical IDs (also the
//                  validator's job; this module never invents or repairs IDs).
// Harmless formatting differences — a markdown code fence or prose around a
// JSON object — are extracted and REPORTED via `format`, not treated as
// failures. This module never weakens validation: whatever it returns is
// still judged by validator.js exactly as before.
//
// Diagnostics are shape-only: lengths, detected format, parse outcome, token
// counts. No credentials, no prompt text, and no full reply text are logged.

// Pull the message content string out of a Chat Completions envelope.
export function extractContent(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    return { ok: false, stage: 'envelope', error: 'envelope-not-an-object' };
  }
  if (envelope.http_status) {
    return { ok: false, stage: 'envelope', error: `http-${envelope.http_status}` };
  }
  const choice = Array.isArray(envelope.choices) ? envelope.choices[0] : undefined;
  const content = choice?.message?.content;
  if (typeof content !== 'string') {
    return { ok: false, stage: 'envelope', error: 'content-missing-or-not-a-string' };
  }
  return {
    ok: true,
    content,
    shape: {
      content_chars: content.length,
      finish_reason: choice?.finish_reason ?? null,
      model: typeof envelope.model === 'string' ? envelope.model : null,
    },
  };
}

// Map a Chat Completions usage block to the ledger's usage shape.
export function mapUsage(envelope) {
  const u = (envelope && typeof envelope === 'object' && envelope.usage) || {};
  return {
    input_tokens: u.prompt_tokens ?? 0,
    output_tokens: u.completion_tokens ?? 0,
    cached_input_tokens: u.prompt_tokens_details?.cached_tokens ?? 0,
  };
}

function tryParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

// Extract a proposal object from raw model text. Returns diagnostics, not
// just a value, so a failure names its class precisely.
export function extractProposal(content) {
  if (typeof content !== 'string' || content.trim() === '') {
    return { ok: false, stage: 'parse', error: 'empty-content', format: null };
  }
  const trimmed = content.trim();

  // 1. Bare JSON.
  let attempt = tryParse(trimmed);
  if (attempt.ok) {
    return asObject(attempt.value, 'bare');
  }

  // 2. Fenced JSON (```json ... ``` or ``` ... ```).
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    attempt = tryParse(fence[1].trim());
    if (attempt.ok) {
      return asObject(attempt.value, 'fenced');
    }
  }

  // 3. JSON object embedded in prose: first '{' to last '}'.
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) {
    attempt = tryParse(trimmed.slice(start, end + 1));
    if (attempt.ok) {
      return asObject(attempt.value, 'embedded');
    }
  }

  return { ok: false, stage: 'parse', error: 'no-parseable-json-object', format: null };
}

function asObject(value, format) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, stage: 'parse', error: 'json-not-an-object', format };
  }
  return { ok: true, proposal: value, format };
}
