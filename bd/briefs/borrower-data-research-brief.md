# Borrower-data research brief: Plaid, interim assessment, and an in-house path

**Status:** working business-development brief, 5 September 2026. This is a
summary of supplied context and a pinned public-API inventory, not a statement
of current entitlement, geography, pricing, legal sufficiency, or provider
support.

## Bottom line

Wildcat can plausibly build a useful borrower-diligence surface from
borrower-consented financial evidence, but it should not call the result a
global solvency product. The near-term product should publish narrow,
time-bounded derived findings; an interim assessor may produce them first, and
Wildcat can later ingest and calculate the same evidence itself if the
commercial and data-rights terms allow that transition.

The key design principle is simple: raw banking, accounting, collateral, and
identity records stay private. A market page may show only a small,
revocable derived result with its scope, as-of time, expiry, missingness, and
methodology boundary.

## What this does and does not answer

The research question is whether consented Plaid and borrower-supplied data can
improve lender diligence for a very mixed population: early-stage companies,
fintechs, asset-backed lenders, factoring businesses, GPU-heavy AI companies,
and mature listed entities. The answer is **yes, for bounded evidence claims**;
it is **not yet evidence for a universal solvency conclusion**.

“Basel III countries” should not be treated as a borrower filter or a coverage
guarantee. A jurisdiction with mature financial reporting may be a useful
operating-risk heuristic, but it says neither that Plaid supports a particular
institution or product nor that the borrower has a complete, usable evidence
set.

## Recommended evidence model

| Evidence area | Narrow result Wildcat could show | Material limit |
| --- | --- | --- |
| Connected accounts | A scoped liquidity observation, including as-of time and account perimeter | A connection is not consolidated treasury or proof of total liquidity. |
| Transactions and cash flow | Observed cash-flow or revenue-pattern finding | Coverage, history depth, pending/posted treatment, and source taxonomy may be incomplete. |
| Liabilities | Limited identified-liabilities finding | Absence of a feed or account is not absence of debt. |
| Holder and account verification | Financial-institution-reported name or account-control match | It does not settle group ownership, beneficial ownership, or legal authority by itself. |
| Borrower-supplied records | Separate findings on debt schedules, management accounts, receivables, inventory, equipment, or projections | Each source needs its own perimeter, date, methodology, and exceptions. |
| Token reserves or market-maker data | Separate reserve-coverage or market-performance finding | Neither should be promoted to enterprise solvency without an explicit rule and supporting perimeter. |

The derived result should carry at least: entity and facility perimeter,
evidence module, methodology version, source date, as-of time, expiry,
support level, omitted evidence, correction status, and whether it is suitable
for lender-restricted or public display. A positive result should never erase
known missing debt, incomplete account coverage, stale data, conflicts, or
revoked consent.

## Plaid: useful, but not a universal data layer

The supplied material indicates that Plaid is strongest in the United States
and Canada. It describes Transactions and Assets as available in Europe, but
income as UK-only and liabilities as unavailable in Europe. Treat that as a
starting hypothesis only: every live case still needs confirmation by
institution, account type, legal entity, product, entitlement, permitted use,
and written commercial terms.

The most useful questions for a discovery pilot are:

- balances over time, including the semantics of current, available, settled,
  and pending amounts;
- account inventory, type/subtype, business-versus-personal indicators, and
  holder-name matching;
- transaction history, pending/posted treatment, counterparty/merchant data,
  history window, and incremental refresh behaviour;
- income, revenue, payroll, and loan-payment categorisation where the product
  is actually available;
- liabilities coverage, especially the boundary between consumer products and
  commercial term loans, revolving facilities, warehouse lines, and venture
  debt;
- routing/account verification, statements, and document retention where a
  document trail is necessary.

Business Verification is worth asking Plaid about as a possible KYB-style
input, but it is not a pilot dependency. Public specification visibility does
not establish access, permitted use, availability, commercial terms, or stable
behaviour.

## Interim assessor and eventual in-house operation

An interim assessor can be useful if it receives borrower-authorised inputs and
returns only a defined derived result. Before using one, the agreement should
say who may retain, correct, display, export, recompute, and migrate each
derived result; what happens on revocation or termination; what attribution is
required; and what evidence is available for an audit trail.

The exit path matters as much as the pilot. Wildcat should seek a contract that
allows it eventually to run its own consented ingestion and calculation while
retaining the permitted historical derived results from its own borrowers. That
does not mean raw source records should enter a public repository, a public
website, or an on-chain system.

## DefiLlama and other public market data

The observed market-maker dashboard surface is useful as third-party market
performance context, not borrower solvency. If Wildcat displays it, keep the
provider’s required attribution and preserve the distinction between a market
maker’s observed performance and a borrower’s balance sheet.

Seven public client routes were observed in the dashboard surface:

- `GET /api/public/market-makers/performance`
- `GET /api/public/market-makers/aggregated`
- `GET /api/public/market-makers/details`
- `GET /api/public/market-makers/depth`
- `GET /api/public/market-makers/volume`
- `GET /api/public/market-makers/spread`
- `GET /api/public/market-makers/kpi`

They are observations of a browser-facing surface, not a supported commercial
API contract. Do not mirror them, bypass access controls, reuse browser
credentials, or infer rights to redistribute the data. Ask the provider for a
written data, attribution, cache, correction, and termination policy.

## Public OpenAPI methods not shown in Plaid documentation

The following 26 **POST** method-and-path pairs appeared with
`x-hidden-from-docs` in the pinned public Plaid OpenAPI snapshot. They are
included here because they should be explicit supplier questions, not because
Wildcat should call them.

1. `/cra/report/get`
2. `/profile/network_status/get`
3. `/cashflow_report/refresh`
4. `/cashflow_report/get`
5. `/cashflow_report/transactions/get`
6. `/identity/match/list`
7. `/beacon/account_risk/v1/evaluate` — deprecated in the snapshot
8. `/identity_verification/autofill/create`
9. `/business_verification/get`
10. `/business_verification/create`
11. `/beta/webhook_events/list`
12. `/user/identity/remove`
13. `/user/third_party_token/create`
14. `/user/third_party_token/remove`
15. `/beta/transactions/user_insights/v1/get`
16. `/beta/ewa_report/v1/get`
17. `/beta/issues/v1/get`
18. `/beta/issues/v1/list`
19. `/beta/issues/v1/match`
20. `/beta/issues/v1/subscribe`
21. `/beta/issues/v1/unsubscribe`
22. `/beta/partner/customer/v1/create`
23. `/beta/partner/customer/v1/get`
24. `/beta/partner/customer/v1/update`
25. `/beta/partner/customer/v1/enable`
26. `/fdx/notifications`

There is also a documentation-orphan candidate,
`POST /cashflow_report/insights/get`, which should be discussed separately.
None of these paths should be probed against a live service without explicit
provider authorisation. The pinned public spec is a discovery artifact, not an
entitlement mechanism.

## Questions to put to providers

### Plaid

1. Which products are contractually available to this buyer, for which
   countries, institutions, account types, and legal-entity types?
2. Which data can be used for credit diligence and to generate a
   lender-restricted or public derived result?
3. What are the refresh, history-depth, balance, pending-transaction, and
   liability coverage limits in each relevant geography?
4. Which account, identity, holder-name, routing, income, statements, and
   Business Verification features are actually entitled?
5. What raw-data retention, deletion, correction, consent-revocation, and
   onward-sharing rules apply?
6. Which of the 26 public-specification-only methods are supported, deprecated,
   beta-only, prohibited, or irrelevant for this use case?

### Interim assessor or data provider

1. What raw inputs are consumed, what methodology produces the result, and
   what warnings or missingness are preserved?
2. Can Wildcat retain and display the derived result, with what attribution,
   correction process, expiry, and revocation path?
3. Can Wildcat export its own historical derived results and recompute them in
   a future in-house system?
4. What happens to data, outputs, and display rights on termination?
5. Is there a stable, documented route for any public market-performance data,
   and what redistribution terms apply?

## Recommended next move

Run a small, deliberately mixed feasibility cohort only after the supplier
questions have written answers. For each case, record the entity, facility,
institution, product, account scope, consent, permitted use, coverage,
missingness, expiry, and publication right. Ship a narrow result only when all
of those gates are satisfied. Otherwise show the result as unavailable or
indeterminate, rather than filling gaps with a broad “solvent” label.

## Source boundary

This brief relies on the supplied context plus the pinned public OpenAPI
snapshot at [Plaid OpenAPI commit
`457d08b`](https://github.com/plaid/plaid-openapi/blob/457d08b92a569289195312aec8daa712d3324cab/2020-09-14.yml)
and the public [DefiLlama market-maker dashboard](https://defillama.com/market-makers).
Supplier notes and browser observations are leads to validate, not independent
proof. No private communications, shareable links, credentials, borrower data,
or live-probe instructions belong in this document.
