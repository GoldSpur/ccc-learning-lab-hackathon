// Budget safeguard ledger — application-side spending protection.
// (This is NOT a provider-enforced cap; Meta's $150 Spend Limit is a
// notification only. This ledger is the project's own control.)
//
// Approved design (Gate B, Oct 26, 2026):
//  - Worst-case estimate is computed BEFORE dispatch; a request whose
//    worst case would exceed the hard stop is REJECTED outright.
//  - Reservations are atomic (synchronous read-modify-write + rename).
//  - Reconciliation charges ACTUAL usage; unknown usage (timeout, missing
//    usage fields) is charged at the WORST CASE.
//  - ONE aggregate ceiling covers development + judging use.
//  - Accounting FAILS CLOSED: an unreadable/corrupt ledger blocks all calls.
//  - The ledger records METADATA ONLY (ids, timestamps, token counts,
//    amounts) — never prompt or response content.
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

export const PRICES_NANO_PER_TOKEN = { input: 1250, cachedInput: 150, output: 4250 }; // $1.25 / $0.15 / $4.25 per 1M
export const WARN_NANO = 75_000_000_000;  // $75 soft warning
export const HARD_NANO = 120_000_000_000; // $120 hard stop -> labeled FALLBACK

export class LedgerError extends Error {}

export function estimateWorstNano({ inputTokens, maxOutputTokens }) {
  return inputTokens * PRICES_NANO_PER_TOKEN.input +
         maxOutputTokens * PRICES_NANO_PER_TOKEN.output;
}

export function actualNano(usage) {
  const cached = usage.cached_input_tokens ?? 0;
  const fresh = Math.max(0, (usage.input_tokens ?? 0) - cached);
  return fresh * PRICES_NANO_PER_TOKEN.input +
         cached * PRICES_NANO_PER_TOKEN.cachedInput +
         (usage.output_tokens ?? 0) * PRICES_NANO_PER_TOKEN.output;
}

export class BudgetLedger {
  constructor(path) {
    this.path = path;
    this.state = this.#load();
  }

  #load() {
    if (!existsSync(this.path)) return { entries: [] };
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(this.path, 'utf8'));
    } catch {
      throw new LedgerError('budget ledger is unreadable or corrupt — failing closed');
    }
    if (!parsed || !Array.isArray(parsed.entries)) {
      throw new LedgerError('budget ledger has an invalid shape — failing closed');
    }
    return parsed;
  }

  #save() {
    const tmp = `${this.path}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.state));
    renameSync(tmp, this.path);
  }

  // Total committed spend (nanodollars): reconciled entries charge actual;
  // open reservations charge their worst case.
  committedNano() {
    return this.state.entries.reduce((sum, e) => sum + e.chargedNano, 0);
  }

  // Reserve the worst case BEFORE dispatch. Returns { id, warn }.
  // Throws LedgerError when the hard stop would be exceeded.
  reserve({ session, worstNano }) {
    if (!Number.isSafeInteger(worstNano) || worstNano < 0) {
      throw new LedgerError('invalid worst-case estimate');
    }
    const total = this.committedNano();
    if (total + worstNano > HARD_NANO) {
      throw new LedgerError('budget hard stop: worst case would exceed the aggregate ceiling');
    }
    const id = `res-${this.state.entries.length + 1}-${Date.now()}`;
    this.state.entries.push({
      id, session: session ?? 'default', ts: new Date().toISOString(),
      status: 'reserved', estimatedNano: worstNano, actualNano: null,
      chargedNano: worstNano,
    });
    this.#save();
    return { id, warn: total + worstNano > WARN_NANO };
  }

  // Reconcile after the call. actualNanoValue === null (usage unknown,
  // timeout) charges the full worst case.
  reconcile(id, actualNanoValue) {
    const entry = this.state.entries.find((e) => e.id === id);
    if (!entry) throw new LedgerError(`unknown reservation: ${id}`);
    if (entry.status !== 'reserved') throw new LedgerError(`reservation already settled: ${id}`);
    if (actualNanoValue === null) {
      entry.status = 'settled-worst-case';
    } else {
      entry.actualNano = actualNanoValue;
      entry.chargedNano = actualNanoValue;
      entry.status = 'settled';
      if (actualNanoValue > entry.estimatedNano) entry.overage = true;
    }
    this.#save();
    return entry;
  }
}
