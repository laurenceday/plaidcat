# Research Stream B — Plaid Data Products in Depth (as of 2026-08-26)

**Sourcing note.** Live plaid.com fetches were blocked by the sandbox egress proxy. Verification was done against (a) **Plaid's official OpenAPI spec** (`github.com/plaid/plaid-openapi`, file `2020-09-14.yml`, last generated **2026-08-17** — this file carries the verbatim endpoint/field descriptions that render on plaid.com/docs), and (b) web search snippets quoting plaid.com/docs, support.plaid.com, and Plaid blog pages. Claims from search snippets that could not be cross-checked against the spec are flagged **UNVERIFIED**. Cited as `[spec]` = https://github.com/plaid/plaid-openapi (2026-08-17 build).

---

## 1. Transactions

### Lookback
- **Verified: max `days_requested` = 730 (2 years); default 90; min 1 (Production floor 30).** Set at Item initialization via `/link/token/create` `transactions.days_requested` or on first `/transactions/sync`//get call. [spec: TransactionsSyncRequestOptions.days_requested; https://plaid.com/docs/transactions/]
- **Immutable after init**: "The maximum amount of transaction history to request on an Item cannot be updated if Transactions has already been added. To request older transaction history … you must delete the Item via `/item/remove` and send the user through Link to create a new Item." [spec] Same warning at https://support.plaid.com/hc/en-us/articles/24631662544919 ("Why does this Item include only three months…" — 90-day default bites integrators who forget to set it).
- **Institution-side caps override the 730 ask** (critical for a "2yr history" goal):
  - Capital One: **only 90 days** available, period. [https://support.plaid.com/hc/en-us/articles/25349321999511]
  - Bank of America: checking/savings/mortgage **18 months**; personal cards current cycle + 11 statement cycles; **small-business credit cards current cycle + 17 cycles**. [https://support.plaid.com/hc/en-us/articles/25348952076567]
  - So "24 months" is a request ceiling, not a guarantee; realistic initial history is institution-dependent (often 12–24 months at majors, 90 days at some).

### Transaction fields (all verified in [spec] Transaction/TransactionBase schemas)
- `amount` (double; **positive = outflow**, negative = inflow — inverted vs. intuition), `iso_currency_code`/`unofficial_currency_code`.
- `date` (posted date for posted txns), `datetime`, `authorized_date`, `authorized_datetime` (select institutions only; may carry default 00:00:00 times).
- `name` (legacy, "not actively maintained"), `merchant_name` (Plaid-enriched; null for checks/transfers), `original_description` (raw bank string — **only returned if `options.include_original_description: true`**; important to switch on for B2B descriptor analysis).
- `counterparties[]`: name, stable `entity_id`, `type` (enum: `merchant`, `financial_institution`, `payment_app`, `marketplace`, `payment_terminal`, `income_source`), website, logo_url, `confidence_level` (VERY_HIGH >98%, HIGH >90%, MEDIUM, LOW = "cleansed name parsed out of the description, no match in our records", UNKNOWN). `account_numbers` (BACS/IBAN/BIC) **only for select European institutions** — i.e., no counterparty bank-account identifiers for US ACH/wires.
- `personal_finance_category`: `primary` + `detailed` + `confidence_level` + `version`; taxonomy CSV at https://plaid.com/documents/pfc-taxonomy-all.csv (16 primary / ~104 detailed categories). AI-enhanced categorization rolled out 2025 (+10% primary, +20% subcategory accuracy claimed) [https://plaid.com/blog/ai-enhanced-transaction-categorization/, https://plaid.com/blog/2025-year-in-review/].
- **`business_finance_category`** (primary/detailed/confidence_level): present in the current spec but **`x-hidden-from-docs` — beta**. This is the "Transactions for Business" categorization (see §11).
- `location` (address/city/region/postal/lat/lon/store_number), `payment_channel` (`online` / `in store` / `other`), `merchant_entity_id`, `merchant_category_code` (ISO 18245 MCC, not always populated), `logo_url`, `website`, `check_number`, `payment_meta` (ACH ppd_id, payee, reference number etc.).
- Pending lifecycle: `pending` bool + `pending_transaction_id` linking posted txn back to its pending predecessor; pending details (name/amount/category) may mutate before settling; not all institutions expose pendings. [spec]
- `account_owner`: **"not typically populated"** — only for sub-account cases (e.g., multi-card accounts); format non-standardized. Do not rely on it for borrower attribution. [spec]

### /transactions/sync vs /transactions/get
- `/transactions/get` is legacy; "all new implementations are encouraged to use `/transactions/sync`". [spec]
- Sync returns `added` / `modified` / `removed` arrays + `next_cursor`, `has_more`, `transactions_update_status`. Cursor semantics: pass `""` first call; **on pagination failure (`TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`) restart the whole update loop from the first-page cursor**, not the failed page. Filtering by `account_id` creates a separate cursor stream per account — don't mix cursors. [spec]
- Supports `credit`, `depository`, and loan subtypes `student`/`mortgage` only; investments accounts use `/investments/transactions/get`. [spec]

### Refresh cadence & on-demand refresh
- **Verified: "Plaid typically checks for new transactions data between one and four times per day, depending on the institution."** Check `item.status.transactions.last_successful_update` via `/item/get`. [spec, /transactions/sync description]
- `/transactions/refresh`: on-demand extraction **in addition to** the periodic pulls; synchronous, typically <10s, occasionally 30s+; not supported for Capital One non-depository accounts; **it is a gated optional add-on billed per-request flat fee** ("separate fee model… submit a product access request or contact your account manager"). [spec; https://plaid.com/docs/account/billing/]
- Base Transactions billing: **subscription, per connected Item per month** (Recurring Transactions is a subscription add-on; Refresh is per-request). [https://plaid.com/docs/account/billing/] Third-party estimate ~$0.30–0.60/connection/mo depending on volume — **UNVERIFIED, negotiable**.

### /transactions/recurring (Recurring Transactions)
- Returns `inflow_streams`/`outflow_streams` of `TransactionStream`: stream_id, description, merchant_name, first_date/last_date, `predicted_next_date`, `frequency` (WEEKLY/BIWEEKLY/SEMI_MONTHLY/MONTHLY/ANNUALLY/UNKNOWN), `average_amount`, `last_amount`, `is_active`, `status` (e.g. MATURE/EARLY_DETECTION), member `transaction_ids`, `personal_finance_category`. [spec]
- Requires Transactions initialized; **request ≥180 days of history for best results**; subscribe to `RECURRING_TRANSACTIONS_UPDATE`. Billed as subscription add-on. [spec]

### Webhooks
- `SYNC_UPDATES_AVAILABLE` (fires on initial 30-day pull, on historical backfill completion — flags `initial_update_complete`, `historical_update_complete` —, and on every scheduled-update delta; only fires after first `/sync` call on the Item). Legacy: `INITIAL_UPDATE`, `HISTORICAL_UPDATE`, `DEFAULT_UPDATE`, `TRANSACTIONS_REMOVED` still fire for back-compat. `RECURRING_TRANSACTIONS_UPDATE` fires on stream changes. [spec]

### Enrich quality for BUSINESS transactions
- Counterparty extraction works on raw descriptors and returns cleansed names even without a KB match (confidence LOW). Plaid's merchant knowledge base is consumer-merchant-centric; **B2B counterparties (suppliers, one-off wire beneficiaries) will mostly resolve as LOW-confidence cleansed strings, not entity matches** — inference from documented confidence semantics; **UNVERIFIED as a measured quality figure** (Plaid publishes no B2B accuracy metrics).
- Mitigations Plaid now offers: `original_description` (raw descriptor), MCC where present, and the beta **business_finance_category** (13 purpose-built business categories: Revenue, Payroll, Loan Payments, etc.) trained on business transaction patterns [https://plaid.com/blog/transactions-for-business/]. Business categorization + business-account indicator are **beta, gated via account manager** (see §11).

---

## 2. Assets

- `/asset_report/create`: `access_tokens` (1–99 Items), **`days_requested` 0–731 (verified max 731)**; Fannie Mae Day 1 Certainty requires ≥61 (new origination) / ≥31 (refi). **">61 days of history incurs an 'Additional History' fee"**; extra fee per 5 Items in a report. Assets **must be initialized during Link; cannot be added to an existing Item afterward** (unlike Transactions). Report generation is async (seconds to ~1 min; longer for more history), signaled by `PRODUCT_READY` webhook. Reports are **immutable point-in-time snapshots**. [spec]
- Contents (`/asset_report/get`): per Item → per account: balances (available/current/limit + `margin_loan_amount`), **`historical_balances` at DAILY granularity** (date + computed `current`, derived by reverse-rolling posted transactions), full `transactions[]` for the window, **`owners[]` (Identity data: names, phones, emails, addresses)**, `ownership_type`, `days_available`. Report-level: `user` object (lender-supplied borrower PII), `client_report_id`, `date_generated`. [spec]
- **Asset Report with Insights**: `include_insights: true` on `/asset_report/get` adds merchant name, category, location to the report's transactions — **additional fee, and requires approval because it exposes Identity data**. [https://plaid.com/docs/api/products/assets/; fee noted in billing docs]
- **Fast Report** add-on: parallel "fast" report with only Identity + Balance for time-sensitive flows; no extra charge. [spec]
- `/asset_report/pdf/get`: full bank-formatted PDF (sample: https://plaid.com/documents/sample-asset-report.pdf); PDF retrieval carries a fee per billing docs.
- `/asset_report/refresh`: creates a **new report (new token, new billing event)** off the old one's Items/parameters; `days_requested` overridable. **Not supported in Canada.** [spec]
- **Audit Copy** (`/asset_report/audit_copy/create`): token granting a **participating auditor** (fixed `auditor_id`, e.g. `fannie_mae`) direct access to the same underlying data — this is how Day 1 Certainty / Freddie AIM verification works. One audit copy per third party. [spec]
- **Relay** (`/credit/relay/create|get|pdf/get|refresh|remove`): share the exact Asset Report with any third party **that has its own Plaid `client_id`** (`secondary_client_id` — "contact the third party to obtain" it, i.e., the recipient must be a Plaid customer/registered secondary client). Secondary can retrieve JSON + PDF and even **`/credit/relay/refresh`** to pull a fresh report with the original parameters. Webhook notifies the owner when the secondary retrieves it. [spec] → **This is Plaid's sanctioned mechanism for a data-layer intermediary to hand verified reports to downstream lenders/auditors.**
- TTL: Asset Reports remain retrievable until `/asset_report/remove` (or Item removal); **no documented expiry** — unlike Check reports (24h). **UNVERIFIED (absence of documented TTL confirmed; retention policy not stated in docs).**
- Suitability: point-in-time snapshot product. Monitoring = repeated `/asset_report/refresh`, each a billed report. Assets is being strategically superseded for consumer lending by Consumer Report/Check ("Migrate from Assets" guide exists: https://plaid.com/docs/check/migrate-from-assets/) — but Check is FCRA/consumer-scoped, so **Assets remains the non-FCRA report product** relevant to business lending.

---

## 3. Statements

- Endpoints: `/statements/list` (metadata: statement_id, month, year, date_posted), `/statements/download` (**binary PDF**, exact bank-branded statement, `Plaid-Content-Hash` SHA-256 header), `/statements/refresh` (on-demand extraction for a date range). [spec]
- History: Link config `statements.start_date`/`end_date` required; **"You can request up to two years of data"** (verified in spec, LinkTokenCreateRequestStatements.end_date). All statements in the window are pulled at Item creation.
- **Account types: depository ONLY (checking/savings/money market). No credit cards.** [https://plaid.com/docs/statements/ via search verification] The docs limit is account *type*, not consumer-vs-business; business *checking* at a supported bank is not explicitly excluded — **UNVERIFIED whether business operating accounts reliably work**.
- **Institution coverage is the killer constraint**: US-only; supported majors ≈ Bank of America, Chase (early availability, gated via account manager), Citibank, Fifth Third, Huntington, Navy FCU, Regions, Truist, US Bank, Wells Fargo + assorted smaller banks/CUs ≈ **~40% of US depository accounts**. Docs explicitly say Statements "does not currently support all major or long-tail institutions, and should be used with a fallback option." [https://plaid.com/docs/statements/]
- Pricing: billed at Item creation, **fee scales with the number of statements in the requested window** ("flexible per-Item fee"); `/statements/refresh` billed per statements extracted. [https://plaid.com/docs/account/billing/]
- **Answer to the stream question**: *Could an integrator get ~2 years of corporate operating-account statements automatically after one connect?* — **Only partially.** Mechanically yes at a supported institution: one Link session with `statements` product + 24-month window returns up to 24 monthly PDFs, and `/statements/refresh` can extend forward each month. Real limitations: (1) ~40%-of-depository institution coverage with a mandatory-fallback posture; (2) Chase gated; (3) depository accounts only (fine for operating accounts, but no credit-line statements); (4) business-account support unverified per institution; (5) per-statement cost × 24 at link time; (6) how many months each bank actually exposes varies (the 2-year window is a request cap, not a guarantee — **UNVERIFIED per-institution depth**).

---

## 4. Balance / Balance Plus

- `/accounts/balance/get`: forces a **real-time balance extraction** (vs. cached balances on `/accounts/get`); usable on any Item regardless of products; latency typically <10s, up to 30s+ (docs elsewhere: p50 ~3s, p95 ~11s). Not a Link-initializable product itself. [spec]
- `min_last_updated_datetime`: **only meaningful for Capital One non-depository accounts** (no real-time balance there; must state oldest acceptable staleness or get INVALID_FIELD; can yield LAST_UPDATED_DATETIME_OUT_OF_RANGE). Ignored everywhere else. [spec]
- Billing: per-successful-call flat fee. [https://plaid.com/docs/account/billing/]
- **Balance Plus**: exists as `balance_plus` in the Products enum and Link `additional_consented_products` [spec]; was a beta that added a `payment_risk_assessment` object (risk_level enum, `BalancePlusAttributes`, request `payment_details`) to `/accounts/balance/get` [spec CHANGELOG 1.520.0]. Those schemas are **no longer present in the current spec**, and current docs steer payments risk to `/signal/evaluate` + Signal Rules. Best reading: **Balance Plus's risk-attribute functionality was folded into the Signal platform; the standalone beta is de-emphasized. UNVERIFIED (docs page for Balance Plus not directly reachable).**

## 5. Identity

- `/identity/get`: account-holder `owners[]` — names, emails, phones, addresses as on file at the FI. **Only names guaranteed**; other fields empty if institution doesn't provide. [spec]
- Business accounts: **"the name reported may be either the name of the individual or the name of the business, depending on the institution; detecting whether the linked account is a business account is not currently supported"** (Identity docs) — though the new beta business-account indicator in Transactions for Business now addresses detection separately, and `/identity/match` returns `is_business_name` heuristics (true if name contains CORP/LLC/INC/LTD etc.; false ≠ not-a-business). [https://plaid.com/docs/api/products/identity/]
- `/identity/match`: per-field similarity scores (name/address/email/phone) against lender-supplied identity; balances nulled in its response. [spec]
- → For KYB-ish attribution of a borrower LLC to its operating account: usable but noisy; institution-dependent whether you see "ACME LLC" or the signer's personal name. **Plan for manual/heuristic reconciliation.**

## 6. Signal

- ACH return-risk product: `/signal/evaluate` on a planned debit returns `customer_initiated_return_risk` + `bank_initiated_return_risk` scores (1–99) plus **80+ core attributes** (e.g., counts of possible unauthorized-return events over 7/30/60/90 days, balance/velocity/history features). Ruleset-driven (dashboard-configured Signal Rules); can run in Balance-only mode. Feedback loop via `/signal/decision/report` and `/signal/return/report`. [spec; https://plaid.com/docs/signal/]
- Relevance to borrower monitoring: **designed per-payment (debit initiation risk), not portfolio surveillance** — useful at repayment-collection time (will this ACH pull bounce?), not as a cash-flow monitoring feed. Requires payments context and Signal enablement.

## 7. Income / Bank Income

- Three methods: Payroll Income (payroll creds), Document Income (paystub/W2 upload), **Bank Income** (`/credit/bank_income/get`): identifies/categorizes income streams from linked bank data; user-token based; multi-Item via Multi-Item Link. [spec; https://plaid.com/docs/income/bank-income/]
- **Consumer-oriented, verified**: docs now say "For new integrations supporting US end users, Plaid recommends Consumer Report instead of Bank Income" (FCRA-compliant bundle). Handles gig/self-employed **individuals**; it models personal income, not business revenue. For an SMB borrower entity, Bank Income answers "what does this person earn," not "what does this company gross." Business revenue detection lives in Transactions for Business categorization (beta), not Income.

## 8. Plaid Check / Consumer Report (CRA)

- Plaid Check is Plaid's **wholly-owned FCRA consumer reporting agency** (launched 2024). Product = **Consumer Report**: `/cra/check_report/create` + module `/get`s: `base_report` (accounts/balances/transactions), `income_insights`, `cashflow_insights` (attributes incl. NSF frequency, balances, obligations), `network_insights`, `partner_insights` (e.g., Prism scores), **LendScore** (`/cra/check_report/lend_score/get` — Plaid's cash-flow score; "LS1… up to 25% better predictive performance than traditional credit scores alone" per 2025 year-in-review), `verification`, PDF. [spec; https://plaid.com/docs/check/; https://plaid.com/blog/introducing-plaid-check-cra-consumer-report/]
- **Report TTL: 24 hours** — call `/get`s before expiry; recreate to refresh. [spec, /cra/check_report/create]
- **Monitoring exists here**: `/cra/monitoring_insights/subscribe|get` — "Cash Flow Updates" beta, insights updated **1–4×/day best-effort**, currently **one Item per user**; payload = income insights (baseline/forecasted/historical annual income, income sources) + loan insights + account data. [spec]
- 2025 partnerships: FICO, Experian, Xactus distribute Plaid CRA data. [https://plaid.com/blog/2025-year-in-review/]
- **Business credit applicability: essentially none, with one carve-out.** Consumer Report is FCRA-governed; permissible purpose for a *commercial* credit decision exists **only for individuals personally liable** (sole proprietor, personal guarantor) — FTC advisory position, not Plaid-specific. So a permissioned **business** financial-data layer cannot be built on Check; using Check on SMB *owners/guarantors* as a supplementary signal is possible but drags the integrator into FCRA user obligations (permissible purpose certification, adverse action notices). [https://plaid.com/docs/check/; FTC Tatelbaum advisory via NACM/FTC sources]
- Flip side: staying on non-FCRA products (Transactions/Assets) for **business-entity** underwriting avoids CRA classification concerns that pushed Plaid to create Check for consumer lending in the first place. (Legal analysis belongs to another stream.)

## 9. Enrich

- `/transactions/enrich`: enrich transactions you already possess (from your own ledger/other aggregators). Input per txn: `id`, `description` (raw), `amount` (absolute ≥0), `direction` (INFLOW/OUTFLOW), `iso_currency_code`, optional `location`, `mcc`, `date_posted`, account type/subtype. Output `enrichments`: counterparties[] (same schema+confidence levels as Transactions), merchant_name, entity ids, PFC category + confidence, payment_channel, logo/website, check_number, location. [spec]
- Priced per enriched transaction (contact sales); relevant to Wildcat only if ingesting non-Plaid transaction feeds (e.g., statements-parsed data or direct bank files) and wanting Plaid's categorization/counterparty layer over them.

## 10. Processor tokens & partner integrations

- `/processor/token/create`: one token per (Item, processor); sent to a Plaid partner so the partner calls Plaid directly for that account. Permissions adjustable via `/processor/token/permissions/set`; revocation only by deleting the Item. Stripe uses a special bank-account token. [spec]
- Processor endpoint surface (what a partner can pull with a processor token): auth, account, balance, **identity (+match)**, **transactions/get + /sync + /refresh + /recurring**, liabilities, signal, investments — i.e., **near-full data-product surface exists in processor form** [spec: /processor/* paths]. **No processor Assets endpoints — Asset Reports go to third parties via Relay or Audit Copy instead.**
- Reseller program: Plaid has formal reseller partners (docs: https://plaid.com/docs/account/resellers/, partner API https://plaid.com/docs/api/partner/ for creating managed sub-clients) and a partner directory spanning LOS/servicing, digital banking, etc. If Wildcat wants to *be* the data layer serving downstream lenders, the sanctioned patterns are: (a) become a processor partner (token-based, per-endpoint access), (b) Relay (report-level sharing, recipient needs a Plaid client_id), or (c) reseller/managed-client structure.

## 11. Business/commercial-specific products, 2025–2026

- **Transactions for Business** (announced 2025-05-29, https://plaid.com/blog/transactions-for-business/): the headline move for SMB. Components: (1) **business-account coverage** — "95% of US banks offering small-business checking/savings/credit accounts" reachable through existing integrations; (2) **business account indicator** (personal vs business classification; beta, account-manager gated; ~70% of accounts populated); (3) **business-specific categorization** — 13 business categories (Revenue, Payroll, Loan Payments, …), beta — visible in the API spec as hidden `business_finance_category` on Transaction. 2025 additions: NSF frequency, primary-account indicators, improved income categorization. [blog; spec; https://www.paymentsjournal.com/plaid-to-expand-data-coverage-to-small-business-banking/]
- **Hidden `/cashflow_report/*` product family** in the current spec (`x-hidden-from-docs`): `/cashflow_report/get` (cursor-paginated transactions, `days_requested` 1–730), `/cashflow_report/refresh`, `/cashflow_report/transactions/get`, `/cashflow_report/insights/get` ("insights calculated on credit and depository accounts"), plus `/user/transactions/refresh` and `/user/financial_data/refresh`. Reads as an unreleased user-level cash-flow reporting product — plausibly the non-FCRA/SMB counterpart to Check's consumer reports or the productization of Transactions-for-Business insights. **UNVERIFIED (not publicly documented; existence verified in spec only).**
- **Layer**: instant onboarding (phone-number → identity + account linking for the "hundreds of millions" in the Plaid network); consumer-onboarding oriented, pairs with Consumer Report for instant cash-flow underwriting; not a data product per se. [https://plaid.com/blog/introducing-plaid-layer/]
- No dedicated "Business Report" / KYB / commercial-credit report product shipped as of Aug 2026; SMB underwriting is served by Transactions (+business beta fields), Assets, Statements, and consumer-side Check on guarantors.

---

## Comparison table — Transactions vs Assets vs Statements

| Dimension | **Transactions** | **Assets (Asset Report)** | **Statements** |
|---|---|---|---|
| Max lookback | 730 days requested at init (default 90; immutable after); institution caps apply (CapOne 90d, BofA 18mo…) | 731 days per report | Up to 2 years of statements requested at Link |
| Fields | Full txn objects: amount, dates, merchant, counterparties+confidence, PFC (+beta business categories), location, channel, pending lifecycle, MCC, raw descriptor (opt-in) | Accounts, balances, **daily historical_balances**, transactions (raw strings; enriched only with Insights add-on), **owners/Identity**, days_available | PDF binaries only (bank-branded, exact); metadata = month/year/posted date; no parsed fields |
| Freshness | Auto-updated 1–4×/day per institution; webhook-driven deltas | Frozen at generation (point-in-time) | Monthly cadence (statements post monthly); pulled at link + on refresh |
| Refresh model | Continuous via `/sync` cursor; `/transactions/refresh` on-demand (per-request fee, gated) | `/asset_report/refresh` = new billed report (not in Canada) | `/statements/refresh` per date range (per-statement fee) |
| PDF | No | Yes (`/asset_report/pdf/get`, fee) | Yes — the product *is* PDFs (with SHA-256 hash) |
| Third-party sharing | Processor tokens (partner calls Plaid directly, per-endpoint permissions) | **Audit Copy** (fixed auditors, e.g. Fannie/Freddie) + **Relay** (any Plaid-registered secondary client; JSON+PDF+refresh) | None documented (redistribute files yourself) |
| Cost model | Subscription per Item/month (+add-ons: Recurring subs, Refresh per-request) | Per report; Additional History fee >61 days; per-5-Items fee; Insights/PDF/Audit Copy fees | Per Item at creation scaled by statement count; refresh per statement |
| Continuous monitoring | **Best fit** (webhooks + cursor + recurring streams) | Poor (re-buy snapshots) | Poor-moderate (monthly docs, no parsing) |
| Point-in-time underwriting | Good (but data is "live", no fixed artifact) | **Best fit** (immutable, dated, PDF, shareable, GSE-accepted) | Strong as verification artifact / fallback evidence, weak coverage |
| Business-account fit | Business accounts covered (95% of US SMB banks); business categorization beta | Works on any linkable depository/credit accounts; no business-specific fields | Depository only; ~40% institution coverage; business-account support unverified |

---

## Verdict — foundation for a persistent borrower cash-flow dataset (~2yr history + ongoing monitoring)

**Core: Transactions via `/transactions/sync` with `days_requested: 730`, initialized at Link.** It is the only product whose economics (per-Item subscription) and mechanics (cursor deltas, SYNC_UPDATES_AVAILABLE, 1–4×/day automatic institution polls, on-demand `/transactions/refresh` for pre-decision freshness) are built for a *persistent, continuously-updated* dataset. It also carries the enrichment Wildcat needs (counterparties, PFC, and — pending beta access — business categories + business-account indicator + `original_description` for B2B descriptor work). Non-negotiable implementation details: set 730 days *at Link* (irreversible), enable `include_original_description`, and store raw descriptors — institution caps mean actual history will range 90d–24mo, so backfill the gap by aging the dataset forward from onboarding.

**Companion: Assets, generated at underwriting events.** Same Items can carry `assets` (must be in the Link products array from the start), producing immutable, dated, PDF-able, third-party-shareable (Relay/Audit Copy) reports with daily historical balances and owner identity — the audit artifact a credit protocol wants at origination and covenant checkpoints. Don't use it as the monitoring feed (each refresh is a new billed snapshot; no delta semantics).

**Statements: fallback/evidence tier only.** Depository-only, ~40% institution coverage, PDFs without parsed data; valuable as bank-authenticated documentary proof for the subset of banks that support it, not as a data foundation. One connect *can* yield ~24 months of operating-account PDFs — at supported institutions only, and Plaid itself mandates designing a fallback.

**Explicitly not foundations:** Check/Consumer Report (FCRA consumer-only; usable at most on personally-liable guarantors, with FCRA obligations; 24h report TTL), Bank Income (consumer income), Signal (per-payment ACH risk at collection time), Balance (spot checks pre-disbursement), Enrich (only if ingesting non-Plaid feeds).

**Watch items:** Transactions for Business betas (business_finance_category, account indicator) — request access early; the hidden `/cashflow_report/*` family in the spec suggests a packaged cash-flow report product may ship that could collapse the Transactions+insights assembly work; Chase Statements early availability; institution-level history caps should drive an "age-in" data strategy from day one.
