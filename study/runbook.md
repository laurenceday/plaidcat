# Runbook: Plaid data ownership research site

Derived from `study.md`. Six steps, dependency order. Check commands are
relative to the repository root; `IMPRIMATUR` means
`python3 /home/user/wildcat-finance/skills/plugins/hexaemeron/skills/imprimatur/scripts/imprimatur.py`
and `LINKCHECK` means `python3 study/linkcheck.py` (written in step 1).

## Step 1: Commit run artifacts and checks

**Goal.** The study, runbook, research corpus, and a link-check script are in
the tree so every later step can cite and run them.
**Entry.** Branch `claude/plaid-data-ownership-research-bu58rz` at the mascot
art commit; study and runbook drafted and lint-clean.
**Exit.** `git status --short` shows a clean tree after commit;
`python3 study/linkcheck.py` runs and exits 0 on the current tree;
protasis study and runbook checks exit 0.
**Files.** `study/study.md`, `study/runbook.md`, `study/linkcheck.py`,
`research/research-{A..F}-*.md`.
**Tests.** `LINKCHECK` (self-test on empty page set counts as pass); protasis
checks. Runner contract: `python3 study/linkcheck.py {report}` writes a
plain-text report of broken references to the file named by `{report}` and
exits non-zero when any exist; report format: one `page -> missing-target`
line per defect.
**Disciplines.** phylax: none, no new boundary, repository-local files only.
ephoros: none, no unattended runtime. metron: none, no performance claim.
elenchus: none, no failure in hand. hypomnema: the study and runbook are the
records; committing them is the point of the step.

## Step 2: Hub page

**Goal.** `index.html` carries both core verdicts, the pipeline diagram, the
method caveat, and the reading map to every other page.
**Entry.** Step 1's exit state.
**Exit.** `index.html` renders with the shared stylesheet; `LINKCHECK` exits 0
with index links pointing only at pages that exist or are stubbed this step.
**Files.** `index.html`, `assets/style.css` (adjustments only).
**Tests.** `LINKCHECK` per step 1's runner contract; `IMPRIMATUR --include-code
index.html` informational, defects fixed at prose phase.
**Disciplines.** phylax: pages reference no external host except Google
Fonts, checked by grep over html. ephoros: none, static page. metron: image
weight discipline from study item 10 applies, measured by
`du -sb assets && find assets -size +200k`. elenchus: none. hypomnema: the
index restates the input brief so the site records its own mandate.

## Step 3: Part I and Part II explainers

**Goal.** `technical.html` (connect-to-data workflow, tokens, webhooks,
lifecycle) and `products.html` (Transactions, Assets, Statements, the rest,
comparison table, foundation verdict) carry streams A and B faithfully.
**Entry.** Step 2's exit state.
**Exit.** Both pages render; every decision-relevant claim carries a confidence
badge or traces to `research/`; `LINKCHECK` exits 0.
**Files.** `technical.html`, `products.html`.
**Tests.** `LINKCHECK` per step 1's runner contract.
**Disciplines.** phylax: same external-host rule as step 2. ephoros: none.
metron: none beyond the standing weight discipline. elenchus: none.
hypomnema: none, page content is its own record.

## Step 4: Coverage and legal explainers

**Goal.** `coverage.html` (business-account reality, archetype table, risks
and mitigations) and `legal.html` (MSA clauses, 1033 timeline, FCRA/GLBA/GDPR,
re-sharing pattern, ranked constraints) carry streams C and D faithfully.
**Entry.** Step 3's exit state.
**Exit.** Both pages render; ranked-constraints list matches stream D;
`LINKCHECK` exits 0.
**Files.** `coverage.html`, `legal.html`.
**Tests.** `LINKCHECK` per step 1's runner contract.
**Disciplines.** phylax: same external-host rule. ephoros: none. metron:
none beyond standing discipline. elenchus: none. hypomnema: legal page
carries the not-legal-advice and re-verification caveats from stream D's
method note.

## Step 5: Commercial, architecture, and moat explainers

**Goal.** `commercial.html` (pricing, cost model, production access, MSA
terms), `architecture.html` (five-layer design, metric formulas, access
postures, prototype runbook, build costs), and `moat.html` (defensibility
verdict, precedent mortality) carry streams E and F faithfully.
**Entry.** Step 4's exit state.
**Exit.** Three pages render; the cost table matches stream E's model; metric
formulas match stream F; `LINKCHECK` exits 0.
**Files.** `commercial.html`, `architecture.html`, `moat.html`.
**Tests.** `LINKCHECK` per step 1's runner contract.
**Disciplines.** phylax: same external-host rule. ephoros: none. metron:
none beyond standing discipline. elenchus: none. hypomnema: architecture
page records the buy-vs-build recommendation and its reasoning.

## Step 6: Primers, demo path, and full-tree checks

**Goal.** `bd-primer.html`, `engineering-primer.html` (with the Plaid
prototype runbook), and `legal-primer.html` complete the reading map; the
whole tree passes every standing check, proving the study's demo path.
**Entry.** Step 5's exit state.
**Exit.** All eleven pages render and interlink; `LINKCHECK` exits 0 over the
full tree; `IMPRIMATUR` exits 0 on shipped markdown; image-weight check
passes; no external hosts beyond Google Fonts; `git status --short` clean
after commit.
**Files.** `bd-primer.html`, `engineering-primer.html`, `legal-primer.html`,
`README.md` (final), `assets/imagegen-prompts.md` (final).
**Tests.** `LINKCHECK` per step 1's runner contract; `IMPRIMATUR` on
`README.md study/*.md pdf/README.md assets/imagegen-prompts.md`.
**Disciplines.** phylax: full-tree secret scan, `git grep` for key patterns.
ephoros: none. metron: standing weight discipline, final measurement
recorded. elenchus: any check failure worked to cause before the fix.
hypomnema: README records method, waivers, and layout; this is the record.
