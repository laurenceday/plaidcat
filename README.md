# plaidcat

Wildcat Labs research: can Wildcat build a proprietary, permissioned
financial-data layer around its credit markets, using Plaid as the pipe into
corporate borrowers' bank accounts, and does holding that data create a
defensible advantage?

Produced by a Shoggoth Fiat run (study → runbook → implement → audit → prose
→ push) on 2026-08-26. External-facing: the framework's controller receipts
and signing discipline were waived by the operator for this run; the phase
order, lints and voice mask were kept.

## The site

Open `index.html` in a browser, or serve the repo root with any static file
server. Every page prints cleanly to PDF.

| Page | What it answers |
| --- | --- |
| `index.html` | Both core verdicts, the pipeline at a glance, reading map |
| `technical.html` | Part I, the complete connect-to-data workflow, tokens, webhooks, lifecycle |
| `products.html` | Part II, Transactions vs Assets vs Statements vs the rest |
| `coverage.html` | Part III, business/commercial account reality |
| `legal.html` | Data rights: Plaid contracts, 1033, GLBA, FCRA, re-sharing |
| `commercial.html` | Pricing, production access, cost model |
| `architecture.html` | Part IV, the Wildcat data layer design + prototype runbook |
| `moat.html` | The defensibility verdict |
| `bd-primer.html` | Primer for business development |
| `engineering-primer.html` | Primer for engineering, with the prototype runbook |
| `legal-primer.html` | Primer for counsel/compliance |

## Repository layout

- `assets/`: stylesheet, official logos and three generated site illustrations;
  `imagegen-prompts.md` records their source references and generation briefs
- `pdf/`: production spec stubs for designed PDFs (content sourced from the
  site pages; art from the imagegen catalog)
- `research/`: the six raw Surveyor research streams with per-claim sources
  and confidence labels
- `study/`: the Fiat study, runbook and link-check artifacts

The private `wildcat-finance/mascot-imagegen-kit` is a generation reference,
not a site asset library. Its source images are not committed here or displayed
wholesale. Only new illustrations generated from a small identity-reference set
belong in `assets/generated/`.

## Method and trust labels

Claims across the site carry confidence labels: OFFICIAL (Plaid docs, bank
pages, regulators), OPERATOR-REPORTED (forums, customer help centers,
procurement intel), INFERRED (triangulated), UNVERIFIED (best understanding,
check before relying). plaid.com blocked direct fetches during the
original research, so official Plaid claims were first drawn from
search-index extracts plus Plaid's published OpenAPI specification. A
local mirror of plaid.com/docs (mid-2026 vintage, operator-supplied) was
then used to verify the site: two Warden passes confirmed the great
majority of claims verbatim, corrected eleven, and answered previously
unverifiable items (the full consent-refresh institution list, webhook IP
allowlist, rate limits). The verification records live in `research/` as
streams G1 and G2. Contract clauses still deserve a live-page check before
reliance. Research is current as of 2026-08-26.
