# The Audit — Project-Internal, Read-Only

## What the audit was

After the Phase 1 run, the complete experiment record was subjected to a
**project-internal, read-only audit** — a separate verification pass in which
nothing in the execution report was taken on trust. Every number was
recalculated from the machine records (run registration, ledgers, run
records, quarantined outputs), every score re-derived with the frozen
scoring rubric, and every deterministic component re-run separately, as part of the audit
against the frozen build.

The audit made **no API calls, no code changes, and no deployments**, and it
altered no experiment record. One disclosed exception: re-running the
experiment workspace's own spawn-free disarm checker regenerated that
checker's output file with a fresh check timestamp; its substantive content
(absent modules, import refusals, scan classifications, verdict) is
equivalent to the pre-audit version, which the auditor had read first
(register note N-1, below).

**Overall verdict: the execution record is accurate. All six verifications
PASS; zero material discrepancies were found.**

## What was machine-recomputed — verified facts

These results rest on recomputation and re-execution, not on the run's own
reporting:

1. **Dispatch, token, and financial recalculation — PASS.** 21 dispatches,
   21 transport calls (exactly 1 per cell), 0 retries, 0 failures, counted
   separately in two record sources that agree cell-by-cell. Every
   charge recomputed from recorded token usage via the gateway's pricing
   formula matched the recorded charge at nanodollar precision (21/21),
   including the four cells that exercised the cached-input rate. All arm
   subtotals, the Phase 1 total ($0.10335210), the lifetime total
   ($0.11150385), and the remaining budget ($119.88849615) match exactly.
   Every registered worst-case reservation was also recomputed from the
   manifest's token estimates: 21/21 match.
2. **Attempt-1 reconciliation — PASS.** The halted first launch's artifacts
   are preserved and self-consistent: one reservation settled at $0.00,
   never dispatched, absent from the execution ledger. The recorded root
   cause (a harness serialization-comparison defect) was corroborated from
   the artifacts themselves — the auditor's canonical re-hash of the payload
   matches the registration.
3. **Arm C governed-path trace — PASS.** All 7 Arm C cells traced from the
   records, then re-run separately, as part of the audit: the frozen validator passes 7/7
   stored proposals; the frozen local matcher, re-run on the frozen
   scenario texts, reproduces the recorded script selections exactly;
   `script_number` confirmed null in 14/14 structured replies across Arms B
   and C; the O-01 record distinguishes proposal → override → re-validated
   final, and O-01's payload is byte-identical to S-02's (a true rerun). The
   frozen safety screen, re-run on all 8 deterministic-set texts, reproduces
   7/7 stops and the control, with the provisional badge present in every
   rendered stop; all 18 scenario text hashes match the frozen manifest.
4. **Quarantine containment — PASS.** All 14 Arm A/B outputs exist only in
   the experiment's quarantine store, each labeled as an ungoverned
   evaluation record. A containment scan — 28 distinctive content probes
   drawn from the quarantined outputs, plus all 14 provider envelope
   identifiers — found **zero** occurrences in the product UI, this
   repository, or any project deliverable.
5. **Score verification against the frozen rubric — PASS.** All 21 cells
   were reconstructed from the stored evidence and re-scored with the frozen
   rubric scorer: **0 verdict diffs** across every Family A and Family B
   item. All reported aggregates (B1, B2, B3, B4, B5, and the A5-only Family
   A failure pattern) were re-derived exactly. PROXY verdicts are labeled as
   proxy in the records and the reporting; ◆ PROVISIONAL flags are carried
   in the registration, the run records, and the reporting alike. H1–H4 were
   verified **NOT COLLECTED**: every record carries a not-rated marker or
   scope note, and no rating value exists anywhere in the records.
6. **Disarmed state, frozen hashes, staging boundary — PASS.** The disarm
   checker was re-run: no live-dispatch capability remains in the experiment
   workspace. The governed repository was clean at the registered commit
   before and after the audit, and its mocked suite was re-run separately, as part of the
   audit: **184/184 pass**. All frozen hashes (screen, manifest, framework,
   gateway, safety copy, rubric, registration, seed ledger) match their
   pins. The hosted staging boundary was verified first-hand: the public
   edge redirects to the access login; the deployed application reports
   `live: "disabled"` and its deployed files match the frozen build.

## What remains a provisional single-rater assessment — not machine-verified

The audit verified the *integrity* of the scoring; it did not and could not
verify the *labels*. All gold labels are single-rater (set by the project's
AI research and development worker under the founder's direction); S-01,
O-01, and F-01 are ◆ PROVISIONAL; the adjudication packet is unworked and no
rater has been designated. Family B figures therefore stand as **agreement
with unadjudicated labels** — reproducible arithmetic over provisional
judgments. Only the D-03 safety label is founder-confirmed, and D-03's
*behavior* (the deterministic stop) is additionally machine-verified above.

## Discrepancy register — outcome

Every category of claim in the execution report was checked against the
machine records; a category with no mismatch carries an explicit
zero-discrepancy statement — silence was never used as a pass.

- **D-1 Financial figures — ZERO DISCREPANCIES.**
- **D-2 Dispatch and transport counts — ZERO DISCREPANCIES.**
- **D-3 Attempt-1 accounting — ZERO DISCREPANCIES.**
- **D-4 Arm C results (proposals, validation, matcher, labels, override) —
  ZERO DISCREPANCIES.**
- **D-5 Quarantine containment — ZERO DISCREPANCIES.**
- **D-6 Machine scores vs the frozen rubric — ZERO DISCREPANCIES.**
- **D-7 State claims (disarm, frozen hashes, repository, suite, staging) —
  ZERO DISCREPANCIES.**
- **R-1 (rounding presentation, not an error).** The private execution
  report's per-cell charge column displays values rounded to 6 decimal
  places; all totals are exact at the precision shown, and the underlying
  records are exact at nanodollar precision.
- **N-1 (auditor-induced timestamp refresh)** — disclosed above.
- **N-2 (count scoping, not an omission).** Across both launches there were
  22 guard authorizations (1 in the halted attempt at $0.00 + 21 in the
  execution). The "21 = 21 = 21" identity in the reporting is scoped to the
  execution run and its ledger; the halted attempt is disclosed alongside
  it, and the full record is complete and consistent.
- **N-3 (evidence strengthened, not a discrepancy).** The execution report's
  staging check rested partly on by-construction reasoning; the audit
  verified the staging boundary first-hand (edge redirect, host service
  state, on-box health response, deployed file hashes), so that claim now
  rests on direct observation.

The register's twelve standing limitations (L-1…L-12) are published in full
in [limitations.md](limitations.md) — they travel with the results.
