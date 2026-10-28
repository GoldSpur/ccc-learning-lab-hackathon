# Phase 1 Evidence Package — CGE-001 Controlled Live AI Validation

**What this is.** The curated public evidence record for **CGE-001 Phase 1**, a
preregistered, controlled live validation of the Childhood Confidence Learning
Lab, run once on October 28, 2026 (01:43:25Z–01:45:24Z) against **Muse Spark
1.3 (Standard)** via the Meta Model API. Twenty-one registered live dispatches
across three arms, over six independent fictional scenarios plus one
preregistered intervention rerun, followed by a project-internal read-only
audit and a full evidence freeze.

**What this is not.** This package is not the experiment's raw record. It is a
curated publication derived from the frozen record: aggregate figures,
methodology, registered scenario descriptions, and verified outcomes. The
following are deliberately **excluded** and remain in the project's private
experiment workspace: the 14 raw ungoverned (Arm A/B) model outputs, which were
quarantined as evaluation records at run time and have never been rendered
anywhere; per-call operational ledger entries, reservation identifiers, and
timestamps; and the experiment harness source. Every figure published here was
recomputed from the machine records during the project-internal audit — a separate recomputation of the machine records, performed as part of that audit (see
[audit.md](audit.md)); the frozen source documents this package derives from
were hash-verified against the Phase 1 freeze manifest before curation.

## Category boundaries — what this project is not

Two distinctions, stated plainly because the hackathon's official rules ban
the adjacent categories:

- **Not medical or mental-health advice.** The Learning Lab is a
  parenting-education prototype built over the founder's published
  confidence framework. It does not diagnose any child, and it does not
  advise on mental-health conditions or treatment. Inputs matching the registered screening
  rules are stopped by deterministic screening before any model call, and
  receive fixed, pre-approved wording (the CSR-3 safety copy —
  **PROVISIONAL**, independent safety review pending; see
  [scenarios.md](scenarios.md)). The rules are a fixed, registered list —
  they are not comprehensive danger or mental-health detection.
- **Not a generic education chatbot.** There is no free-form chat surface.
  The governed pipeline is: deterministic safety screen → a constrained
  model proposal limited to canonical framework identifiers →
  deterministic validation → local selection of a verbatim published
  script → parent confirm/override → an honest labeled fallback when no
  approved script matches. The model never generates the guidance text a
  parent sees.

## Contents

| File | Contents |
|---|---|
| [methodology.md](methodology.md) | The governed pipeline, the three arms, hash-versioned prompts, data minimization, pre-registration, the budget safeguard, the three metric families, and the safety-screen versions. |
| [scenarios.md](scenarios.md) | The registered scenario set: six independent fictional scenarios, the O-01 intervention rerun (and why it is not a seventh independent scenario), the deterministic safety re-verification set, and the excluded sets. |
| [results.md](results.md) | Aggregate results: dispatch totals, safety re-verification, Arm C outcomes, deterministic (Family A) outcomes, and provisional single-rater label agreement (Family B), each labeled at the strength the evidence supports. |
| [budget.md](budget.md) | Aggregate budget reconciliation only: reserved worst case vs measured actual, by arm and in total, against the project's $120 application-side ceiling. |
| [audit.md](audit.md) | The project-internal, read-only audit: what was machine-recomputed and verified, what remains a provisional single-rater assessment, and the discrepancy register's outcome. |
| [limitations.md](limitations.md) | The complete limitations register, the claims this evidence does not support, and one preserved historical passage with a dated publication annotation. |

## How to read the figures — two evidence classes, never blended

- **Machine-recomputed facts.** Counts, hashes, validation verdicts, safety
  screen behavior, and charges were recomputed from the machine records by the
  audit (re-running the frozen validator, matcher, safety screen, and scoring
  rubric, and recomputing every charge from recorded token usage). These are
  stated as verified facts.
- **Provisional single-rater assessments.** All gold labels were set by a
  single rater (the project's AI research and development worker, acting under
  the founder's direction). Three labels (S-01, O-01, F-01) are additionally
  flagged **◆ PROVISIONAL** — never founder-confirmed. Exactly one label in the
  bank is founder-confirmed: the D-03 immediate-danger safety case.
  Label-agreement figures measure **agreement with unadjudicated labels** —
  they are not adjudicated accuracy, and no guidance-superiority claim is made
  from them for any arm. Human quality ratings (H1–H4) were **not collected**.

## Anchors (SHA-256)

| Artifact | SHA-256 |
|---|---|
| Phase 1 run registration (preregistered before any live call; held read-only) | `93830077db7ff1d8eb8329cf1ceca97b2d2194a90db7851b7c2e5f9833f29df8` |
| Scoring rubric (frozen, Phase 0) | `fe44bd77ca431ac10f43b4bce373bb01576f3c6f0c41b3822acdd1362e8f7ebd` |
| Safety screen v2 (`src/screening.js`, this repository) | `aef8c02ba09e9c9f42d59dfe1dec671fd460492068aced2b02e5af4239ac0eea` |
| Safety screen v1 (superseded; Phase 0 figures only — never blended with v2) | `0dcae49b724f2794327d48c13f0ba0325ecd8230b0e31735f0d3189e43715bdd` |
| Scenario manifest (`content/scenario-manifest.json`, this repository) | `240dcc67ebadd88d57620d843741f0f486992871488404426940170bca1fad69` |
| Framework content (`content/framework.json`, this repository) | `5caf934ed575d7be81de95b89c3e1ff00db05e1911784bef75bae57fbac67c2a` |
| Safety copy as rendered (`content/safety-copy.json`, this repository) | `f0b82ad8d9f170ee3105f3dbb15bfec8e733719a3251ca2349335ae92c56e505` |
| Phase 1 evidence freeze record (Oct 27, 2026) — the frozen record document itself | `413dba14077dfb411c86b7f4cc4fe69e63433fce53d11951adca6e9966eb217d` |
| Governed build at registration — local commit | `ef223376cad0ab39e2ee864658c0a4a35617eb22` |
| Governed build — public `main` commit (same tree) | `bcdffb7a53e27f0a77839f1284404ffa8e334ef6` |

Pre-existing framework content anchors (CSR-1/2/3) are recorded in the
repository's [PROVENANCE.md](../PROVENANCE.md) and are not repeated here.

## Editorial policy of this package

Historical findings are preserved, not rewritten. Where a frozen statement was
later superseded (one staging passage), the original text is quoted as written
and a clearly marked, dated **ANNOTATION** carries the superseding evidence —
see [limitations.md](limitations.md). Frozen originals in the private record
are untouched. Screen v1 and v2 figures are never blended; Arm A/B/C results
are reported in separate metric families, never merged into a single score.
