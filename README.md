# Childhood Confidence Learning Lab — Hackathon Prototype

A framework-constrained AI prototype built during the **Meta Global AI Developer Hackathon (October 26 – November 4, 2026)**, Indie Developer Track, "Build for Your World."

**What it is:** a parent describes a fictional everyday confidence moment. The system classifies it against the author's published framework — the Confidence Wheel (what to focus on) and the Confidence Cycle (how confidence is built) — using a Meta Muse model that may only propose canonical framework identifiers. A deterministic validator rejects anything outside the framework. Approved parent scripts are selected deterministically from published book content, application-side; the model never generates or receives them. Safety screening is deterministic, uses exact pre-approved wording, and stops the pipeline when it triggers — a stop cannot be bypassed by confirmation, retry, or fallback.

**What it is not:** not a chatbot, not a diagnostic tool, not a public product. Fictional scenarios only, ages 7–9. Safety screening is **not independently validated**; safety wording is provisional and awaiting independent review (see `content/safety-copy.json` and PROVENANCE.md).

**Privacy & data minimization:** API requests carry only the fictional scenario text and the minimum canonical identifiers/definitions required for classification. Full scripts, complete framework materials, and validator logic never leave this application's environment. No real child or parent information is ever sent to the API. Development usage is funded by Meta promotional hackathon credits; Meta's billing disclosure for credit-funded use is recorded in PROVENANCE.md.

**Status:** B1 — foundation: content modules, deterministic validator, safety screening, model gateway with application-side budget safeguard, mocked test suite. No live API calls yet.

See **PROVENANCE.md** for what is pre-existing (labeled, with hashes) versus built during the event.
