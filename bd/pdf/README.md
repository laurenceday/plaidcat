# PDF production stubs

Per Laurence's direction, this run ships research and prose; designed PDFs are
produced by a separate imagegen-capable pipeline. This file is the spec for
that pipeline. Every site page also carries a print stylesheet, so
`File → Print → Save as PDF` on any page yields a clean interim copy.

Cover art prompt: see `../assets/imagegen-prompts.md`, entry 5.
Typography: Liberation Sans headlines, Inter body. Colors: bunker `#141414`
text on white; ultramarine `#3E68FF` and Purple Heart `#4D26BC` accents;
Dull Red `#C24647` reserved for risk callouts.

## PDF 1: Executive brief (4 to 6 pages)

- **Source:** `../index.html` (verdict cards) + `../moat.html` (defensibility
  verdict) + the cost table on `../commercial.html`.
- **Audience:** Wildcat leadership, investors, strategic partners.
- **Shape:** cover, one-page TL;DR with the two core verdicts, one page on
  what Plaid actually yields for corporate borrowers, one page of build
  cost/pricing, one page of legal posture, back cover with contact.
- **Art:** cover background (imagegen entry 5), pipeline diagram redrawn from
  `../index.html`'s hero SVG.

## PDF 2: Full research report (30 to 50 pages)

- **Source:** all seven explainer pages in reading order: technical,
  products, coverage, legal, commercial, architecture, moat.
- **Audience:** engineering, BD, counsel; external analytics partners under
  NDA.
- **Shape:** cover, table of contents, the seven sections with their
  diagrams, appendix with the full source list from each page's Sources
  block, and the study/runbook from `../../study/` as an annex.

## PDF 3: Borrower-facing one-pager

- **Source:** the "what the borrower sees" walkthrough on `../technical.html`
  and the consent/revocation rights summary on `../legal.html`.
- **Audience:** corporate borrowers being asked to click "Connect Operating
  Accounts."
- **Shape:** single page, front/back. Front: the five-step connect flow with
  the mascot spot illustration (imagegen entry 3, spot-technical scenario).
  Back: what Wildcat sees, what it never sees, how to revoke, who to contact.
- **Tone:** plain-English, no jargon; reuse the exact revocation rights
  wording from `../legal.html` so the promise and the page never diverge.

## PDF 4: Analytics-partner data-access brief

- **Source:** `../architecture.html` external-analytics layer section +
  `../legal.html` re-sharing pattern section.
- **Audience:** DeFi Llama, auditors, credit analytics firms.
- **Shape:** two pages: the scoped-access model (what a partner receives,
  under which controls, what may leave), and the derived-metrics catalog
  table with exact formulas from `../architecture.html`.
