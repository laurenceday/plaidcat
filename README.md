# plaidcat

Wildcat Labs research: can Wildcat build a proprietary, permissioned
financial-data layer around its credit markets, using Plaid as the pipe into
corporate borrowers' bank accounts, and does holding that data create a
defensible advantage?

## Point people at `bd/`

Everything a reader needs is in **[`bd/`](bd/)** and nothing outside it is
required to read the site. Open [`bd/index.html`](bd/index.html) in a browser,
or serve `bd/` with any static file server. Every page prints cleanly to PDF.

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

Also inside `bd/`:

- `briefs/`: two later briefs (5 September 2026), written after the run below
  and **not covered by its audit passes** — the borrower-data evidence model,
  and a deep dive on Plaid's undocumented Business Verification API
- `research/`: the eight raw research streams with per-claim sources and
  confidence labels; the site cites these directly
- `assets/`: stylesheet, logos and the three generated site illustrations;
  `imagegen-prompts.md` records their source references and generation briefs
- `pdf/`: production spec stubs for designed PDFs

## Everything else in this repository

| Path | What it is |
| --- | --- |
| `study/` | The Fiat study, runbook, both audit records and the link checker |
| `probe/defillama/` | DefiLlama API probe: Playwright capture scripts and raw evidence |
| `reference/plaid-docs/` | Vendored mirror of plaid.com/docs (mid-2026, operator-supplied), used to verify the site |

The mirror is a reference corpus, not a site asset. It is served as a
Next.js static export, so `docs/` and its siblings `_next/` and `assets/`
must stay together for its pages to render. Its imagery lives in
`reference/plaid-docs/assets/` and is deliberately kept out of the site's own
`bd/assets/`.

The private `wildcat-finance/mascot-imagegen-kit` is a generation reference,
not a site asset library. Its source images are not committed here or displayed
wholesale. Only new illustrations generated from a small identity-reference set
belong in `bd/assets/generated/`.

## Checks

```sh
python3 study/linkcheck.py    # exits 0 when every local link in bd/ resolves
```

## Method and trust labels

Produced by a Shoggoth Fiat run (study → runbook → implement → audit → prose
→ push) on 2026-08-26. External-facing: the framework's controller receipts
and signing discipline were waived by the operator for this run; the phase
order, lints and voice mask were kept.

Claims across the site carry confidence labels: OFFICIAL (Plaid docs, bank
pages, regulators), OPERATOR-REPORTED (forums, customer help centers,
procurement intel), INFERRED (triangulated), UNVERIFIED (best understanding,
check before relying). plaid.com blocked direct fetches during the
original research, so official Plaid claims were first drawn from
search-index extracts plus Plaid's published OpenAPI specification. The
local mirror in `reference/plaid-docs/` was then used to verify the site: two
Warden passes confirmed the great majority of claims verbatim, corrected
eleven, and answered previously unverifiable items (the full consent-refresh
institution list, webhook IP allowlist, rate limits). The verification records
live in `bd/research/` as streams G1 and G2. Contract clauses still deserve a
live-page check before reliance. Research is current as of 2026-08-26; the
`bd/briefs/` material is current as of 2026-09-05.
