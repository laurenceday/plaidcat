# Study: Plaid data ownership research site (plaidcat)

Fiat run, Wildcat Labs, 2026-08-26. Operator: Laurence Day. Controller
receipts and signing discipline waived by the operator for this external-facing
run; phase order, protasis contract, imprimatur lint and vulgate mask kept.

Assuming, unless corrected:

1. The deliverable is a knowledge product (static site plus research corpus),
   not production software. The audience is Wildcat BD, engineering, and
   counsel, plus selected external partners.
2. The two core questions from the input brief govern everything: (a) how hard
   it is, technically, commercially and legally, for Wildcat to obtain
   permissioned corporate bank data through Plaid, retain and normalize it, and
   expose it selectively to third-party analytics providers; (b) does retaining
   it create a defensible data advantage.
3. Research is current as of 2026-08-26. plaid.com blocked direct fetches from
   the research environment, so Plaid-official claims rest on the published
   OpenAPI spec (github.com/plaid/plaid-openapi, 2026-08-17 build) and
   search-index extracts of plaid.com pages, cross-checked against operator
   sources. The site must carry this caveat and per-claim confidence labels.
4. Designed PDFs and generated artwork are out of scope per the operator's
   direction; the run ships stub specs (`pdf/README.md`) and an imagegen
   prompt catalog instead, plus reference art from laurenceday/mascot-imagegen-kit.
5. All work lands on branch `claude/plaid-data-ownership-research-bu58rz` of
   laurenceday/plaidcat, authored as Laurence Day (operator's fallback
   instruction). No pull request unless asked.

## 1. Problem statement

Build a self-contained research site in laurenceday/plaidcat that gives
Wildcat a decision-grade answer to the two core questions, structured for
three audiences (BD, engineering, legal), with the complete evidence trail.
A working prototype means: `index.html` opens locally with all seven explainer
pages, three audience primers, diagrams, and sources; every internal link
resolves; the imprimatur lint passes on shipped prose.

Demo path: open `index.html` from the repo root in a browser and follow the
reading map; run `python3 <plugin>/skills/imprimatur/scripts/imprimatur.py`
over the shipped markdown and confirm exit 0; run the link check in step 6 of
the runbook and confirm exit 0.

The headline verdicts the site must carry, distilled from the six research
streams in `research/`:

- **Feasibility.** The pipe works and is cheap. Plaid officially covers SMB
  and fintech business banking (Transactions for Business, 2025); tokens do
  not expire by design; `/transactions/sync` with `days_requested: 730` plus
  webhook-driven monitoring is a real foundation; Assets provides the
  immutable shareable underwriting artifact; Statements is a ~10-bank
  fallback. Plaid spend is $1k to $48k/yr across 20 to 500 borrowers, a rounding
  error. The hard limits are coverage (treasury portals are invisible to every
  aggregator; the bigger the borrower, the less Plaid sees), entitlement
  lockouts (primary-owner-only linking), consent decay (12-month windows at
  BofA/PNC/Capital One), and Plaid's production/use-case approval process.
- **Data rights.** The binding constraints are contract, not law. The end
  user owns raw data; Wildcat holds a revocable license tied to a
  Plaid-approved written use case; resale and third-party distribution need
  Plaid's written agreement plus borrower Express Consent; borrowers hold
  contractual deletion rights even where no statute applies. US statute
  barely touches entity-level commercial reporting (1033 enjoined and
  consumer-only; GLBA consumer-only; FCRA only at the guarantor/sole-prop
  boundary). The durable proprietary layer is entity-level, genuinely
  non-reidentifiable derived metrics produced under an approved use case.
- **Defensibility.** The raw data is not a moat; any competitor with consent
  re-pulls 24 months in one API call. The moat is (thin) the consent graph
  with contractual teeth, and (thick) the outcomes dataset: cash-flow
  features joined to onchain credit outcomes, which no incumbent can
  assemble. Build the layer as a label factory from day one.

## 2. Prior art

- The six Surveyor streams, committed under `research/`:
  `research-A-technical.md` (Link/Item/token/webhook mechanics, verified
  against the OpenAPI spec), `research-B-products.md` (product depth,
  comparison table, foundation verdict), `research-C-business-coverage.md`
  (institution-by-institution business reality), `research-D-legal.md`
  (MSA clause analysis, 1033 timeline, FCRA/GLBA/GDPR, precedents),
  `research-E-pricing.md` (billing models, cost model, MSA commercial terms),
  `research-F-architecture.md` (DeFi credit precedent mortality, attestation
  tech, five-layer reference architecture, defensibility verdict).
- Wildcat's own docs: docs.wildcat.finance: V2 hooks accept "a credential
  testifying to off-chain circumstances", the natural onchain attachment
  point for attestations.
- The input brief: `ce89a7b5-plaidresearchquestion.md` (operator upload),
  restated in full on the site's index.
- Wildcat brand guidelines (operator upload, 2026-08-26) and
  laurenceday/mascot-imagegen-kit (reference art, brand guideline PDF).
- No prior runs exist in this repository; it was empty at start. No audit
  synopses exist yet; there is nothing to reconcile.

## 3. Constraints and non-goals

- Starting ref: branch `claude/plaid-data-ownership-research-bu58rz`, first
  scaffold commit 8d593c1; base is the empty repository.
- Toolchain: hand-authored static HTML/CSS, inline SVG diagrams, Python 3 for
  checks. No build system, no JS frameworks. Google Fonts (Inter) with system
  fallbacks; Liberation Sans headline stack via local fonts.
- Prose gates: imprimatur lint (bundled script) and vulgate register on every
  shipped document and page.
- Non-goals: no hexctl receipts (waived), no stacked PRs (harness forbids),
  no designed PDFs (stubs only), no generated imagery (prompt catalog +
  reference art), no implementation of the data layer itself (prototype
  runbooks only), no legal advice (research memo posture with re-verification
  caveats).

## 4. Design options

1. **Single monolithic page.** One long index.html. Cheapest to build and
   link-check; trades away audience routing, printability per section, and
   readable diffs; a 150KB page of mixed audiences serves none well. Rejected.
2. **Multi-page static site, shared stylesheet, root index (chosen).** Seven
   explainer pages mirroring the brief's parts, three audience primers, hub
   index with verdicts and reading map. Trades more files and a link-checking
   obligation for audience-fit pages, clean printing, and GitHub-Pages
   compatibility. Cheapest to comprehend at the reader's end, which is where
   this deliverable earns its keep.
3. **Build-tooled site (SSG or SPA).** Adds a dependency chain and build step
   to a repo whose consumers open files. Rejected: tooling cost with no
   reader benefit.

## 5. Risk register seed

Concerns the audit rounds must check, one per line:

```risk-register
claim-accuracy | load-bearing factual claims on the site vs the research streams | every headline number and verdict on a page traces to a stream file or a cited URL; UNVERIFIED items keep their label on the page
plaid-source-caveat | official-Plaid claims sourced via search extracts | the method caveat appears on the index and README, and per-claim confidence badges survive the prose pass
internal-links | hrefs across eleven pages and assets | a link-check command over all html files exits 0
prose-slop | machine-register tells in shipped prose | imprimatur exit 0 on shipped markdown and page text extracts
brand-compliance | palette, type, mascot usage vs operator guidelines | colors match the guideline hexes; yellow only for warnings; mascot images from the kit, uncropped meaning intact
image-weight | committed raster art | no single image over 200KB, total assets under 2MB
secret-material | repo contents | no tokens, keys, or credentials anywhere in the tree
```

## 6. Glossary seeds

- Item: one authenticated Plaid connection to one institution login;
  carries accounts, consent, webhook, billing.
- access_token: non-expiring server-side credential for one Item.
- DTM: Data Transparency Messaging, Plaid's consent pane regime.
- Express Consent: the MSA's standard for any third-party disclosure.
- Relay and Audit Copy: Plaid-intermediated report sharing to registered
  secondary clients and fixed auditors respectively.
- 1033: CFPB Personal Financial Data Rights rule; enjoined 2025-10-29,
  consumer accounts only.
- Outcomes dataset: cash-flow features joined to onchain credit
  outcomes; the defensibility thesis.
- Fiat run: the Shoggoth delivery loop: study, runbook, implement,
  audit, prose, push.

## 7. Sources

Primary: `research/research-A..F.md` (each carries per-claim URLs and
confidence labels); github.com/plaid/plaid-openapi (2020-09-14_1.729.1,
2026-08-17); the Plaid MSA as filed on SEC EDGAR (Live Oak Financial Form
1-A exhibit); plaid.com docs/legal/blog URLs as extracted; CFPB/court
reporting via the law-firm alerts cited in stream D; DeFi precedent reporting
cited in stream F; operator uploads (brief, brand guidelines);
laurenceday/mascot-imagegen-kit @ 5efdfe5.

## 8. Signals, and the questions behind them

None at runtime, and here is why: the deliverable is a static site with no
unattended execution. The build-time signals are the check commands in the
runbook (imprimatur exit code, link-check exit code, image-weight check);
each step's exit names the command that proves it.

## 9. Boundaries, per capability

- Repository content: no secret material of any kind enters the tree
  (control: risk-register `secret-material`, checked each audit round).
- Outbound references: pages reference only Google Fonts as an external
  host; everything else ships in-repo (control: grep for external URLs in
  html during audit).
- Mascot/brand assets: sourced only from the operator's kit and uploads;
  no redistribution beyond this private repo (control: assets inventory in
  the audit round).

## 10. The budget, or its absence

No performance budget: nothing here has a latency claim. A weight discipline
stands in for it: no single committed image over 200KB and total `assets/`
under 2MB, measured by `du -sb assets/ && find assets -size +200k`.

## 11. The fail-closed posture

A failing check stops the phase: imprimatur exit non-zero on any shipped
document blocks the prose receipt; a broken internal link blocks the push
step; a factual claim that cannot be traced to a stream file or citation is
removed or labeled UNVERIFIED rather than shipped bare. Fix, re-run the
check, then continue. Failures found during audit follow elenchus: name the
cause before the fix.

## 12. Decisions and their homes

- Waiver of hexctl receipts, signing, and stacked PRs: recorded here
  (assumptions) and in `README.md`.
- Authorship fallback to Laurence Day: recorded here and in git history.
- Method caveat (plaid.com egress block): recorded in `README.md`, on the
  site index, and in each research stream's header.
- Art/PDF stub policy: recorded in `assets/imagegen-prompts.md` and
  `pdf/README.md`.
- No other decision in this run is expensive to reverse; page copy and
  layout are cheap edits by design.
