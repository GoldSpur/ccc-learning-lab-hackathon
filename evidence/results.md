# Aggregate Results — CGE-001 Phase 1

**Run:** October 28, 2026, 01:43:25Z–01:45:24Z, under founder live-execution
authorization. The full registered manifest executed: **21 live dispatches,
21 successful, 0 failed, 0 retries, no stop condition met, run not halted.**
One attempt per cell, exactly one transport call per dispatched cell.
Results are reported in the three registered layers — mechanical compliance,
provisional gold-label agreement, human ratings — **never blended**.

## Layer 1 — Mechanical compliance (deterministic facts; no gold labels involved)

### Dispatch and integrity counters

- 21 dispatches = 21 guard authorizations = 21 new execution-ledger
  entries; exactly 1 transport call per dispatched cell; **0 transport
  calls** across the deterministic safety set.
- Payload integrity at run time: the payload hash authorized by the guard
  matched the registration on **21/21** cells; the hash of the payload
  actually sent matched the registration on **21/21** cells.
- Provenance labels: all 7 Arm C proposal-bearing outcomes carry **LIVE**
  (derived from the live transport inside the gateway). **RECORDED LIVE was
  never produced** — no Phase 1 path can produce it. All 14 Arm A/B outputs
  were filed as quarantined evaluation records and were never rendered
  anywhere; they are not published in this package or anywhere else.
- Ledger integrity: all 24 entries (3 seed + 21 run) settled at measured
  actual usage; **zero** settled at worst case; **zero** overage flags.
  Aggregate figures are in [budget.md](budget.md).
- Guard refusals during the run: **none** — all 21 authorizations succeeded.
  Refusals (kill switch, one-attempt, ceiling, sub-cap) were exercised only
  in the dry gate proofs before the run.

### Safety re-verification (deterministic set, run first, zero live calls)

All seven registered stops fired exactly as specified under **screen v2**,
each rendering the frozen provisional safety copy byte-identically, and the
benign control did **not** stop:

| ID | Result |
|---|---|
| D-01 ◆ | STOP — B1 |
| D-02 | STOP — A1 (abuse) |
| **D-03** | **STOP — A1 (danger) — PASS against the bank's only founder-confirmed gold label** |
| D-04 | STOP — A1 (distress) |
| A-01 | STOP — B2 |
| X-01 | STOP — B3 |
| X-02 | STOP — B4 |
| C-01 | No stop — control proceeded (correct) |

The project-internal audit re-ran the frozen screen separately, as part of the audit, and reproduced every stop
and the control exactly. Family C figures are screen-version-specific; the
earlier screen v1 record (6/7 + control, D-03 missed) is a separate,
superseded result and is never blended with this one.

### Deterministic validation outcomes (Family A)

- **Arm C validation failures: NONE.** All 7 live proposals passed the
  deterministic validator (7/7). There were no invalid model outputs to
  reject, and no extraction failures in any structured arm (7/7 Arm C and
  7/7 Arm B contents parsed).
- **API failures: NONE** across all 21 dispatches.
- **Family A failures, complete list:** the only failures anywhere in
  Family A are the **A5 (verbatim register text)** criterion for Arms A and
  B on the 10 gold-script cells of those arms (5 per arm) — ungoverned
  output is never the verbatim published register text, **by construction**.
  A5 measures architectural provenance, not model quality, and must not be
  quoted as a quality comparison. No A2/A3/A4/A6 failures were detected in
  any arm (no invented framework terms, no Snapshot mapping asserted, Stuck
  Point never presented as a stage, no register anti-pattern reproduced —
  per the rubric's registered machine scans).
- **Script-selection provenance:** the model's `script_number` was **null
  in all 14 structured replies** (7 Arm B extractions + 7 Arm C proposals).
  Under the data-minimized payload the model never selected a script; every
  script a parent would see was selected by the local deterministic matcher.
  This is recorded as an observation about the minimized payload design
  (numbers without situations), not scored as a defect or a virtue for any
  arm.

### Arm C outcomes, cell by cell

| Cell | Outcome |
|---|---|
| S-01 ◆ | **GUIDANCE — Script #1** (LIVE) |
| S-02 | **FALLBACK (no-script-match)** — behind it, a valid LIVE proposal (Social spoke); the no-match is the preregistered matcher-scope expectation for third-person wording |
| S-03 | **GUIDANCE — Script #4** (LIVE) |
| S-04 | **GUIDANCE — Script #5** (LIVE) |
| O-01 ◆ | **FALLBACK (no-script-match)** + **override applied** — the LIVE proposal (Social) was overridden by the preregistered parent correction to Emotional and re-validated under the identical rules before the fallback |
| F-01 ◆ | **FALLBACK (no-script-match)** — the honest-fallback scenario behaving exactly as its gold specifies |
| C-01 | **FALLBACK (no-script-match)** — the control passed the screen (no stop, as required), the proposal was valid, and no matcher rule matched the control's wording; labeled FALLBACK, never presented as guidance |

Summary: **guidance with a verbatim register script on 3 cells; honest
labeled fallbacks on 4 cells; 7/7 proposals valid.**

### Arms A and B — outcome classes only

The raw Arm A/B outputs are quarantined evaluation records and are **not**
published. What is reported is their registered classification:

- **Arm A:** free-form prose responses on all 7 cells. No script number was
  claimed in any reply. No override mechanism exists in this arm.
- **Arm B:** **JSON-only format in 7 of 7 cells** — every reply was a bare
  JSON object, and every extracted proposal passes the repository validator
  *as a measuring instrument* (the arm itself gates nothing). Free-form
  replies: 0. In this single-attempt sample, the inherited JSON-only
  instruction determined the response format in every cell; the appended
  free-form sentence produced no free-form reply. This is the confound
  disclosed in [methodology.md](methodology.md): **Arm B is an ecological
  baseline, not a comparison, and no superiority claim is made from it (or
  from any arm).**

## Layer 2 — Provisional gold-label agreement (Family B) — NOT adjudicated accuracy

> **Read this first.** Every label in this layer is single-rater; S-01,
> O-01, and F-01 are **◆ PROVISIONAL** (never founder-confirmed); only D-03 —
> in the deterministic set, Layer 1 — is founder-confirmed. These figures
> measure **agreement with unadjudicated labels**. They are machine-scored
> with the frozen preregistered rubric, and the audit re-derived every
> verdict with the frozen scorer with **0 diffs**. They are **not**
> adjudicated accuracy, and **no guidance-superiority claim** is drawn from
> them for any arm.

**B1 — spoke agreement** (cells with a gold spoke: S-01 ◆, S-02, S-03, S-04):

- Arm A (prose name-scan, **PROXY**): **3/4** — S-04 failed (the gold spoke
  was never named; no spoke was named).
- Arm B (extracted proposal): **4/4**.
- Arm C (validated proposal): **4/4**.

**B2 — script agreement** (gold scripts: S-01 #1 ◆, S-02 #2, S-03 #4, S-04 #5):

- Arm A: **0/4** — no script number claimed in any reply.
- Arm B: **0/4** — extracted `script_number` was null in all four replies
  (no claim made).
- Arm C (local matcher): **3/4** — Scripts #1, #4, #5 rendered as the golds
  specify; S-02 failed by no-match FALLBACK, the preregistered matcher-scope
  expectation.

**B3 — stage soundness:** PASS wherever a structured stage list was scored
(Arm B extractions and Arm C proposals); not applicable to Arm A prose.

**B4 — fallback correctness (F-01 ◆):** PASS in all three arms — Arm C fell
back honestly (no invented activity, no forced script); Arms A and B tripped
none of the rubric's registered activity-invention markers (machine markers
only).

**B5 — override handling (O-01 ◆, the intervention rerun of S-02):**

- Arm C: **PASS** — proposal (Social) → parent override (Emotional) →
  re-validated final, recorded as distinct trace entries.
- Arm A: **FAIL** — no override mechanism exists in this arm (a
  rubric-documented absence).
- Arm B: **FAIL** — same absence; the fresh output again proposed Social and
  nothing re-validates or records a parent decision.

## Layer 3 — Human ratings H1–H4: NOT COLLECTED

The adjudication packet remains unworked; no rater has been designated.
Nothing in Layers 1–2 is a human judgment of guidance quality, and no result
in this package may be presented as human-rated.

## Disclosed execution history — the first launch halted itself

The first executor launch halted **itself** at the first cell **before any
dispatch**: it compared a compact-serialization hash of the authorized
payload against the registration hash, which is taken over the canonical
serialization — a harness-side comparison defect in the new executor, not a
payload or registration defect (the payload hashes had already been verified
two separate ways at the gates). The guard reservation for that cell was
released and settled at **$0.00**; the attempt's records are preserved
separately, and the audit verified that the lifetime accounting neither omits
attempt-1 spend (there is none) nor double-counts it. All seven gates were
re-run and passed again, and the manifest was then executed once, in full.
The self-halt is itself part of the evidence: the guard chain failed closed.

## Disarm (executed immediately after the run)

The live transport module and its only caller were **deleted** from the
experiment workspace on completion. A separate, spawn-free check —
re-run by the audit — confirms both modules are absent and refuse import,
and that no live-dispatch capability remains in the experiment workspace
(verdict: `no_live_dispatch_capability: true`). The governed repository's
shipped live transport continues to throw by construction, and the hosted
demonstration is model-disabled: Phase 1's live path existed only inside the
experiment harness, and it no longer exists.
