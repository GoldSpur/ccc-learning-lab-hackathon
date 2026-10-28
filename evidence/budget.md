# Budget Reconciliation (Aggregates Only) — CGE-001 Phase 1

This file publishes **aggregate figures only**. Per-call ledger entries,
reservation identifiers, timestamps, and token-level records are operational
records of the experiment; they remain in the project's private experiment
workspace and are not published. Every aggregate below was **recomputed** by the project-internal audit from the machine records — a separate recomputation of the machine records, performed as part of that audit — charges recomputed from
recorded token usage using the gateway's own pricing function (in this
repository, `src/ledger.js`) — and matched the recorded charges at
nanodollar precision on all 21 cells.

## The figures

| Figure | Value |
|---|---|
| Reserved worst case, 21 registered cells | $0.19046525 |
| **Phase 1 actual charged** | **$0.10335210** |
| — Arm A (7 cells) | $0.03822100 |
| — Arm B (7 cells) | $0.03363745 |
| — Arm C (7 cells) | $0.03149365 |
| Lifetime before Phase 1 (3 authorized smoke-test calls, Oct 26, 2026 — all settled) | $0.00815175 |
| First-launch self-halt (attempt 1) contribution | $0.00 (one reservation, released and settled at zero; never dispatched) |
| **Lifetime actual after Phase 1** | **$0.11150385** |
| Aggregate ceiling (project's own application-side ledger control) | $120.00 |
| **Remaining lifetime budget** | **$119.88849615** |
| Phase 1 protocol sub-cap | $1.00 — actual spend is ≈10.3% of it |

## How the accounting worked

- **Reservation before dispatch.** Every dispatch required a worst-case
  reservation computed from that cell's actual payload (per-cell range
  $0.008794–$0.0092215). A reservation that would breach a ceiling is
  refused by construction; the refusals were dry-demonstrated at the gates
  before the run (22nd dispatch, sub-cap, and $120-ceiling cases).
- **Reconciliation at measured usage.** All 24 ledger entries (3 seed + 21
  run) are `settled` at measured actual usage. **Zero** entries settled at
  worst case; **zero** overage flags; no actual charge exceeded its
  reservation. Actuals landed at ≈54% of the reserved worst case in
  aggregate — the reservations remain the binding control.
- **One enforced lifetime total.** The budget ledger enforces its ceiling
  per ledger file, so the run adopted a single-authoritative-ledger
  discipline (preflight correction C-1): the execution ledger was created as
  a hash-verified byte copy of the prior smoke-test ledger, so lifetime
  spend sits inside one enforced committed total. The attempt-1 ledger is a
  separate file, never merged — verified by the audit — so the lifetime
  total neither omits nor double-counts it.
- **Audit verification.** The auditor recomputed every charge from recorded
  token usage × the gateway's pricing constants: 21/21 cells match at
  nanodollar precision; all three arm subtotals, the Phase 1 total, the
  lifetime figures, and the remaining budget match the claimed figures
  exactly. (The private execution report's per-cell display table rounds to
  6 decimal places for presentation; the underlying records are exact —
  register item R-1 in [audit.md](audit.md).)

## What the ceiling is — and is not

The $120 ceiling is **the project's own application-side ledger control**,
designed for this experiment ($75 warning level, $120 hard stop to labeled
fallback). It is not a provider feature. The provider's $150 "Spend Limit"
is a **non-enforcing notification** and played no role in this accounting.
Development and judging usage is funded by Meta's $150 promotional hackathon
credits; the billing disclosure attached to credit-funded use is recorded in
this repository's [PROVENANCE.md](../PROVENANCE.md).
