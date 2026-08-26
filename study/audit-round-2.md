# Audit round 2: verification against the local plaid.com/docs mirror

Trigger: the operator supplied a complete mirror of plaid.com/docs (880
files, llms-full.txt included, entries through July 2026) after the first
integration. Two Warden verification passes ran against it; their verbatim
records are `research/research-G1-verify-technical.md` and
`research/research-G2-verify-products.md`. An inline sweep covered legal and
operational surfaces (LEI requirement, delete-on-revocation guidance,
Liabilities scope, Core Exchange).

## Results

- G1 (technical): 10 checklist areas confirmed, 5 corrections, 3 previously
  unverifiable items answered (the full 11-institution consent-refresh list
  with Brex at 3 months and USAA at 18, the four-address webhook IP
  allowlist, the per-endpoint rate-limit table).
- G2 (products/billing): 34 claims confirmed, 6 corrected, 12 newly
  answered. The largest finds: Assets and Statements are retrofittable to
  existing Items through an update-mode consent step; the Financial
  Insights docs bar Transactions, Enrich, Liabilities and Investments from
  credit or underwriting decisioning; /cashflow_report/* remains completely
  undocumented in the mirror.

## Disposition (all applied 2026-08-26)

1. technical.html: full consent-refresh list replaces the three-example
   framing; de-duplication extended to PNC and Schwab; offboarding
   re-anchored to /item/remove per docs with the spec's endpoint dual-cited;
   webhook IPs, the 5-minute JWT age check, the 24-48h bank-side revocation
   lag and the no-webhook single-account revocation added; Chase
   questionnaire gate added; the one-week production figure relabeled
   operator-reported.
2. products.html: Assets retrofit corrected; Statements retrofit and
   required-if-supported guidance added; BofA 18-month cap relabeled
   operator-reported; Identity card updated to holder_category and the
   undeprecated business-name flag; the additive per-5-Item surcharge and
   per-request PDF and Audit Copy fees stated; report non-expiry stated; the
   decisioning-restriction callout added; the cashflow_report note
   strengthened with the zero-hits result.
3. coverage.html: health status corrected to /institutions/get_by_id with
   include_status; PNC consent row generalized per the docs list; the
   consent-decay card updated to the eleven-institution reality.
4. commercial.html: balance and refresh rate caps stated; published plan
   sizing added; the one-week figure flagged.
5. architecture.html: prototype runbook step corrected (Assets update-mode
   path); the declared-debt attestation note gained the Liabilities scope
   fact.
6. legal.html and legal-primer.html: delete-on-revocation docs guidance
   added; the use-case framing ask (Assets as underwriting artifact) added;
   the LEI watchlist row added.
7. index.html and README.md: method notes rewritten to name the corpus and
   the verification pass; the consent-timer numbers card updated.

Round closes clean: no open findings. The remaining known unknowns keep
their labels: business-account Statements support (docs silent), the BofA
history cap (operator-reported), /cashflow_report capabilities (spec-only),
and everything in stream D marked for live-page re-verification.
