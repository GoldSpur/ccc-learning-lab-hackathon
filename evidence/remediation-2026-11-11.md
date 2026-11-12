# Remediation Record — Test Portability and Disclosure (Nov 11, 2026)

This record documents the post-judging remediation approved by the Founder
on Nov 11, 2026. It sits alongside the Nov 2, 2026 verification record and
the audit (`audit.md`), whose historical text is preserved unchanged; this
file is the annotation that travels with their test-count figure.

## What was wrong

The Nov 2 verification ran the mocked suite from an anonymous clone of
this repository and reported **184/184 pass**. The clone was clean; the
execution environment was not. Three tests in
`tests/content-integrity.test.js` read absolute paths outside the
repository, on the builder's machine:

- `CSR-1 source file hash is unchanged` — founder-side framework spec JSON
- `CSR-2 scripts: 7 records, byte-equal to the frozen source extraction` —
  founder-side prototype data file
- `CSR-3 safety copy: every string appears verbatim in the frozen module` —
  founder-side safety-copy module

On a genuinely clean machine those three tests fail with `ENOENT`, so the
portable result was **181/184**, and the README's unconditional "184/184"
did not travel. An independent technical review (Nov 4, 2026, Finding 4)
established this; the Founder's Decision C (Nov 4) preserved the frozen
submission unchanged through judging (Nov 5–8) and finals (Nov 9), with
remediation to follow.

## What changed (Nov 11, 2026)

1. **`tests/content-integrity.test.js`** — the three provenance guards now
   check for their founder-side source file first. When it is absent they
   **skip with an explicit reason** naming the path and stating the guard
   runs on the founder's machine only, instead of failing. When the file
   is present, the guard runs in full, byte-for-byte as before. No other
   test was touched; no application code was touched.
2. **`README.md`** — the test figure corrected in all three places it
   appears: the suite passes **181/184 on any clean machine and 184/184 on
   the founder's machine**, with the skip behavior stated.
3. **`evidence/limitations.md`** — new standing limitation **L-13** naming
   the script matcher's exact-phrase coverage: the seven selection rules
   match near-verbatim situation phrases; paraphrases and synonyms do not
   match and return the labeled fallback by design.

## Verification (Nov 11, 2026)

- **Founder's machine** (sources present): `node --test tests/*.test.js`
  → 184 tests, **184 pass, 0 skipped, 0 fail**. The guards run in full.
- **Clean environment**: a fresh copy of the repository tree was run
  inside a mount namespace with the entire founder workspace shadowed by
  an empty tmpfs, so no founder-side path could resolve:
  `node --test tests/*.test.js` → 184 tests, **181 pass, 3 skipped,
  0 fail**. Each skip carries its explicit reason, e.g.:

  > CSR-1 source file hash is unchanged — founder-side source not present
  > at /home/hatch/workspace/.../ccc-framework-spec.json — this
  > provenance guard runs on the founder's machine only

## Lesson recorded

A clean clone is not a clean environment. Any future verification figure
for this project must be produced with the founder-side filesystem
unreachable, and a test-count claim must state the environment it was
verified in. The 184/184 figure from Nov 2 should never be cited without
its environment qualifier; the portable figure is the one in the README.

## Scope boundaries

- The frozen submission of record (portal entry, submitted Nov 3, 2026)
  is unchanged; this remediation post-dates judging and finals.
- The historical audit text in `audit.md` — including its 184/184 line,
  which records what the audit observed on the builder's machine — is
  preserved verbatim under this package's editorial policy; this record
  is its annotation.
- No live model calls were made. The demo remains model-disabled by
  construction.
