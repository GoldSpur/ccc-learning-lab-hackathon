# Limitations — CGE-001 Phase 1

These limitations are part of the results. They travel with every figure in
this package, and they bound what any figure may be taken to mean.

## The twelve standing limitations (audit register, Part 2)

| # | Limitation | Consequence for interpretation |
|---|---|---|
| L-1 | **Single-attempt, small-n design** — 6 independent fictional scenarios + 1 rerun, one sample per cell, one model (`muse-spark-1.3` Standard), one reasoning setting. | All results are descriptive of this run only; no capability generalization for any arm, in either direction. |
| L-2 | **Unadjudicated gold labels** — all single-rater; S-01, O-01, F-01 ◆ PROVISIONAL; only D-03 (deterministic set) is founder-confirmed; adjudication packet unworked; no rater designated. | Family B figures are label *agreement*, never accuracy; results may not be used as adjudicated findings anywhere until adjudication occurs or the provisional label is attached. |
| L-3 | **H1–H4 human ratings NOT COLLECTED** (verified: records carry not-rated markers / scope notes only). | No human quality judgment exists in this experiment; no guidance-superiority claim is possible. |
| L-4 | **Arm B prompt confound** — Arm B's prompt contains contradictory JSON-only vs free-form imperatives (preserved byte-identically by founder instruction). In this sample the JSON instruction won 7/7. | Arm B is an ecological baseline; no ablation or governance-attribution claim may be drawn from B-vs-C differences. |
| L-5 | **Safety screen bounds** — closed pattern enumeration; **no negation handling** (negated/hypothetical danger statements stop: disclosed false positives); Tier 2 coverage is an open review item; the safety copy is PROVISIONAL and is **not** clinical clearance for any other work. | The 7/7 stop record describes behavior on the registered fictional set only; it is not safety validation for real inputs. |
| L-6 | **Family C asymmetry** — safety measured live for Arm C only, by design; Arms A/B never received safety-class inputs. | No cross-arm safety comparison exists or may be implied. |
| L-7 | **Matcher scope** — script selection keys on first-person child utterances; third-person reports (S-02, O-01) produce no match. | The S-02/O-01 fallbacks are measured design consequences, and also mark a real coverage boundary of the current matcher. |
| L-8 | **Model-behavior observation, unscored** — `script_number` null in 14/14 structured replies under the minimized payload. | Recorded as an observation about the payload design (numbers without situations); not scored as a defect or a virtue for any arm. |
| L-9 | **Provider retention read-out outstanding.** | Exposure is bounded by the fictional-only, minimized payload record (verified: no prohibited content in any dispatched payload), but the retention question itself remains open. |
| L-10 † | **Hosted-experience verification incomplete** *(as recorded at audit time; see the annotation below)* — staging checklist then stood at 5 PASS / 6 BLOCKED; an early automated hosted browser battery attempt errored without results. | At audit time, claims about the hosted judge experience rested on the founder-device session + on-box evidence only. † Superseded in part — see **Annotation A** below. |
| L-11 | **Attempt-1 launch** — the executed run is, precisely, the second launch; the first self-halted at $0.00 before dispatch on a harness serialization defect. | Fully disclosed and artifact-preserved; the halt demonstrates fail-closed behavior, and "the run" in reporting means the single full execution that followed the re-run gates. |
| L-12 | **A5 construction note** — for Arms A/B the verbatim criterion fails by construction (ungoverned output is never the register text); for Arm C on GUIDANCE cells it passes by construction (the rendered text is the register record). | A5 measures architectural provenance, not model quality; it should not be quoted as a quality comparison. |

## Provisional or untested — stated, not hidden

- **All gold labels are single-rater.** Three demo-path labels (S-01, O-01,
  F-01) are ◆ PROVISIONAL — not founder-confirmed; only the immediate-danger
  safety case (D-03) is founder-confirmed. Agreement figures measure
  agreement with unadjudicated labels, nothing more.
- **Human quality ratings H1–H4 are NOT COLLECTED.** The adjudication packet
  is unworked; no rater has been designated. Nothing in this experiment is a
  human judgment of guidance quality.
- **Safety coverage is bounded:** the screen is a closed enumeration — no
  negation handling (negated/hypothetical danger statements stop: disclosed
  false positives), Tier 2 pattern coverage is an open review item, and the
  safety copy itself is provisional, pending independent review (it is not
  clinical clearance).
- **Family C was measured live only for Arm C, by design** — safety-class
  inputs were never dispatched to Arms A/B, and that asymmetry is structural,
  never scored over.
- **The hosted demonstration makes no live calls.** The staging/demo
  application is model-disabled by construction; Phase 1's live path existed
  only inside the experiment harness and has been deleted.
- **All scenarios are fictional, ages 7–9.** No result describes real-world
  use, and no real child or parent data was used anywhere.

## Preserved historical text — with publication annotation

The frozen judge-ready evidence summary (Oct 28, 2026) closed its
"provisional or untested" section with this bullet, reproduced **verbatim**
under this package's editorial policy (historical findings are preserved,
not silently replaced):

> **Outstanding items:** the provider data-retention read-out (Gate B
> record); the hosted staging checklist stands at 5 PASS / 6 BLOCKED
> (session expiry, cold-reader independence, dashboard evidence, live-edge
> abuse controls, access-log inspection, policy-restoration rehearsal
> untested); the automated hosted browser battery never completed.

> **ANNOTATION A — added Oct 28, 2026, for this public package. The frozen
> original above is unchanged.** The two staging statements in the quoted
> bullet (and limitation L-10, which repeats them) were superseded the same
> evening. A subsequent judge-access verification — an automated browser
> session on Oct 27, 2026, 7:11–7:13 PM PT — completed the hosted battery
> **7/7 PASS** (initial load; spoke interaction; the AT1 scenario settling
> on Learning with its RECORDED LIVE label; parent override re-validated
> with the script unchanged; evidence-trace expansion; safety STOP at 0
> model calls; honest fallback), and the founder accepted the updated
> staging checklist at **6 PASS / 5 BLOCKED**. Evidence classes are kept
> distinct: that session is automated-browser evidence; the founder's
> separate human-device (iPhone) session the same day is a separate record.
> The provider data-retention read-out named in the quoted bullet remains
> outstanding (limitation L-9).

## Claims this evidence does not support

1. **Adjudicated accuracy** — no agreement figure may be called "accuracy"
   until golds are confirmed and a rater is designated.
2. **Guidance superiority** — no claim that any arm's guidance is better
   than another's; H1–H4 are uncollected and the design is descriptive.
3. **Arm B ablation claims** — Arm B's prompt contains two contradictory
   imperatives; it is an ecological baseline only, and no B-vs-C difference
   may be attributed to governance alone.
4. **Clinical or general safety validation** — the screen's behavior on a
   registered fictional set is not evidence the system is safe for real
   children; it diagnoses nothing and validates no treatment claim; the
   safety copy is provisional and is not clinical clearance.
5. **Real-data or parent-facing claims** — all inputs were fictional; no
   real child or parent data was used, and no result describes real-world
   use.
6. **Live-capability claims about the shipped product** — the staging/demo
   application is model-disabled by construction; Phase 1's live path
   existed only inside the experiment harness and has been deleted.
7. **Provider-cap claims** — the $120 ceiling is the project's own
   application-side ledger control; the provider's $150 "Spend Limit" is a
   non-enforcing notification and played no role.
