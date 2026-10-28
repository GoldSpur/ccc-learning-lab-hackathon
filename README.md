# Childhood Confidence Learning Lab — Hackathon Prototype

A framework-constrained AI prototype built during the **Meta Global AI Developer Hackathon (October 26 – November 4, 2026)**, Indie Developer Track, "Build for Your World."

**What it is:** a parent describes a fictional everyday confidence moment. The system classifies it against the author's published framework — the Confidence Wheel (what to focus on) and the Confidence Cycle (how confidence is built) — using a Meta Muse model that may only propose canonical framework identifiers. A deterministic validator rejects anything outside the framework. Approved parent scripts are selected deterministically from published book content, application-side; the model never generates or receives them. Safety screening is deterministic, uses exact pre-approved wording, and stops the pipeline when it triggers — a stop cannot be bypassed by confirmation, retry, or fallback.

**What it is not:** not medical or mental-health advice — the Lab is a parenting-education prototype over a published confidence framework; it does not diagnose any child or advise on mental-health conditions or treatment, and inputs matching the registered screening rules are stopped by deterministic screening before any model call — the rules are a fixed, registered list, not comprehensive danger or mental-health detection (safety copy CSR-3, **PROVISIONAL**, independent safety review pending). Not a chatbot and not a generic education chatbot — there is no free-form chat surface; the product is a governed pipeline (deterministic safety screen → constrained model proposal → deterministic validation → local verbatim script selection → parent confirm/override → honest labeled fallback). Not a diagnostic tool, not a public product. Fictional scenarios only, ages 7–9. Safety screening is **not independently validated**; safety wording is provisional and awaiting independent review (see `content/safety-copy.json` and PROVENANCE.md).

## Try the hosted demo

**https://lab-staging.createchildhoodconfidence.com/**

The demo is behind a Cloudflare Access email-PIN login. There is no account and no password: enter **any email address you control**, request the login code, and enter the one-time PIN sent to that inbox (it arrives within a minute and is valid for about 10 minutes). The Learning Lab then loads in your browser; the session lasts 24 hours, and if it expires you repeat the same steps. The access policy is intentionally open (Cloudflare Access "Include Everyone") and is labeled as such — please start from the full URL above, since the bare cloudflareaccess.com root shows an unrelated "App Launcher" notice.

**The hosted demo makes no live model calls.** Its transports are mocked/recorded only; see the labels section below for exactly what that means.

## Labels — RECORDED LIVE, MOCK, and the separate Phase 1 live experiment

These three are different things and are never interchanged:

- **RECORDED LIVE** — the guided "I'm stupid" — homework scenario in the hosted demo replays a **real Muse Spark 1.3 (Standard) model proposal recorded on October 26, 2026** (the successful third of three authorized one-call smoke tests; aggregate smoke spend $0.00815175 of the $120 ceiling). The proposal is replayed verbatim; the validation, local script selection, and override behavior you see are the real deterministic pipeline operating on it. The hosted copy calls no model.
- **MOCK** — every other demo run uses deterministic local mock proposals, labeled MOCK in the interface. Fallback and safety-stop demonstrations are likewise deterministic and labeled.
- **LIVE (Phase 1 only)** — the separate **CGE-001 Phase 1** controlled live validation (October 27–28, 2026) made real, preregistered model calls through an experiment harness that lived **outside** this repository and outside the hosted product. Its governed-path outcomes were labeled LIVE. That experiment is **concluded and frozen**; the harness's live transport was deleted on completion, and no live path exists in the shipped application. Its curated evidence package is in [`evidence/`](evidence/README.md).

## Status

**Frozen build.** The judge-facing interface is frozen at public commit `bcdffb7a53e27f0a77839f1284404ffa8e334ef6` (the A1–B8 presentation refinement is the HEAD commit); the hosted staging deployment serves exactly this revision, and its health endpoint reports `live: "disabled"` by construction. The mocked test suite passes **184/184** (`node --test tests/*.test.js`). The Phase 1 live validation has been executed, audited, and frozen (below). Nothing in the demo, the repository, or the staging deployment can make a live model call.

## Phase 1 live validation — evidence and limitations

Phase 1 was a preregistered controlled run: **21/21 live dispatches completed with 0 retries** across three arms (a standard baseline, a minimized-framework prompted baseline, and the governed pipeline) over **six independent fictional scenarios plus one preregistered intervention rerun**. Headline outcomes: the governed pipeline produced **7/7 valid proposals** (guidance with a verbatim published script on 3 cells, honest labeled fallbacks on 4); the deterministic safety screen stopped **7/7 registered fictional safety cases at 0 model calls**, including the one founder-confirmed danger case; script selection was local in every case (the model's `script_number` was null in 14/14 structured replies); exact measured spend was **$0.10335210** against the project's own $120 application-side ceiling. A project-internal, read-only audit recomputed every figure from the machine records with **zero material discrepancies**.

**Limitations, stated plainly:** the agreement labels behind the experiment are provisional and single-rater — never adjudicated — and human quality ratings (H1–H4) were **not collected**, so no accuracy or superiority claim is made. One comparison arm used a self-contradictory prompt and is reported only as a confounded ecological baseline. The safety screen is a fixed, registered rule set whose coverage is bounded (including disclosed false positives on negated statements); its wording remains provisional pending independent review. Full methodology, registered scenarios, aggregate results, budget reconciliation, audit findings, and the complete limitations register: **[`evidence/`](evidence/README.md)**.

**Privacy & data minimization:** API requests carry only the fictional scenario text and the minimum canonical identifiers/definitions required for classification. Full scripts, complete framework materials, and validator logic never leave this application's environment. No real child or parent information is ever sent to the API. Development usage is funded by Meta promotional hackathon credits; Meta's billing disclosure for credit-funded use is recorded in PROVENANCE.md.

**Run the demo locally:** `node web/server.mjs` → http://127.0.0.1:8377 (mocked/recorded transports only; the demo server has no live-model path). Deep-link a preset with `?run=at1`, `?run=safety-test`, etc.

**Tests:** `node --test tests/*.test.js` — 184 mocked tests, all passing.

See **PROVENANCE.md** for what is pre-existing (labeled, with hashes) versus built during the event.
