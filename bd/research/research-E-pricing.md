# Research Stream E — Plaid Pricing, Billing, Production Access, Commercial Dynamics
**Fiat research run · Wildcat Labs · as of 2026-08-26**
**Surveyor note on method:** the research sandbox's egress proxy blocked direct fetches of plaid.com, support.plaid.com, vendr.com, sec.gov, and news.ycombinator.com. Claims below are sourced via web-search extraction of those pages (URLs given) plus two directly-fetched GitHub mirrors of Plaid's MSA and Security Questionnaire. Confidence labels: **OFFICIAL** (Plaid docs/help center/press), **OPERATOR-REPORTED** (procurement sites, forums, buyer-shared contracts), **ESTIMATE** (our inference).

---

## 1. Pricing structure and per-product billing models

Plaid does not publish a universal price list. Four plans (OFFICIAL — https://support.plaid.com/hc/en-us/articles/16110502116887, https://plaid.com/pricing/):

| Plan | Minimum | Notes |
|---|---|---|
| **Trial** (replaced old "Development" env) | Free | Limited to **10 live Items**; unlimited API calls against those Items; includes Auth, Transactions (+ Refresh), Balance, Identity, Assets, Liabilities, Investments, Statements. Most applications auto-approved after ID verification; flagged ones reviewed by Customer Oversight in 2–3 days. (OFFICIAL — https://support.plaid.com/hc/en-us/articles/39994173227159) |
| **Pay-as-you-go** | None | No minimum spend or commitment; card-billed; rates shown during Production signup, not public. (OFFICIAL) |
| **Growth** | Minimum spend + annual commitment | Lower unit costs; SSO, priority support, account manager. One source pegs minimum at ~$100/mo with 3-month commitment (OPERATOR-REPORTED — https://costbench.com/software/api-management/plaid/); treat as indicative only. |
| **Custom / Scale** | Higher minimum + annual commitment | Lowest unit costs; sales-negotiated. Scale minimum reported ~$500/mo (OPERATOR-REPORTED — costbench, checkthat.ai). |

Three billing models (OFFICIAL — https://plaid.com/docs/account/billing/):

| Model | Products | Mechanics |
|---|---|---|
| **One-time (per Item)** | Auth, Identity, many Income flows | Charged once per connected Item/account regardless of subsequent API call count. |
| **Subscription (per Item per month)** | Transactions, Recurring Transactions, Liabilities, Investments | Continuous monthly fee per Item **as long as the Item exists**; calendar-month (UTC) cycles; **no pro-rating** for mid-month creation/removal. |
| **Per-request / flexible** | Balance, Signal, Transactions Refresh, Assets, Statements | Flat fee per successful request, or "flexible" fee scaled by Items/date-range/data volume. |

Product-specific mechanics:
- **Transactions**: per-Item/month subscription. An **"Additional History" flat fee** is charged once per Item when >61 days of history is requested — flat regardless of whether you pull 90 days or 24 months (OFFICIAL — plaid.com/docs/account/billing/). So a 2-year historical pull = 1 flat fee per Item, not per-transaction.
- **/transactions/refresh**: optional add-on, billed **per request** on top of the subscription (OFFICIAL — billing docs).
- **Assets**: flexible per-report fee; extra fee applies for each block of 5 Items in a report (>5 Items = 2× fee, >10 = 3×, etc.); Additional History fee applies for >61 days in report (OFFICIAL — billing docs, plaid.com/docs/assets/).
- **Statements** (US only; PDF copies of bank statements): billed at Item creation, cost scales with **number of statements between start/end dates**; /statements/refresh carries a flat fee. Coverage is incomplete — Plaid itself says to build a fallback because Statements "does not cover all major or long-tail institutions" (OFFICIAL — https://plaid.com/docs/statements/, billing docs).
- **Balance**: flat fee per successful call. **Signal**: per call to /signal/evaluate. **Auth/Identity**: one-time per Item. (OFFICIAL — billing docs.)

**Billing when Items err or are removed (important):** "If the Item's subscription is active, Plaid will charge for the subscription even if no API calls are made… or API calls cannot be successfully made (e.g. because the Item is in an error state)" — i.e., **ITEM_LOGIN_REQUIRED Items keep billing**. The only way to stop the meter is `/item/remove`; Plaid explicitly warns to persist access tokens so you can remove Items "to avoid being billed indefinitely" (OFFICIAL — https://plaid.com/docs/account/billing/, https://support.plaid.com/hc/en-us/articles/18785119002263). Fees are not pro-rated in the removal month.

## 2. Price points (label = source class)

| Product | Reported price | Confidence / source |
|---|---|---|
| Transactions | **$0.25/account/mo** (buyer data); community benchmark **$0.30/Item/mo**; ranges to $0.60 at low volume | OPERATOR-REPORTED — https://www.pricelevel.com/vendors/plaid/pricing, https://www.vendr.com/marketplace/plaid, https://fintechspecs.com/blog/plaid-alternatives-bank-data-connectivity/ |
| Liabilities | $0.20/account/mo | OPERATOR-REPORTED — PriceLevel |
| Auth | $1.00–$1.25 one-time | OPERATOR-REPORTED — PriceLevel |
| Identity | ~$1.10 one-time | OPERATOR-REPORTED — PriceLevel |
| Balance | $0.05–$0.15/call | OPERATOR-REPORTED — PriceLevel ($0.05), Vendr range |
| Signal | ~$0.20/evaluation | OPERATOR-REPORTED — PriceLevel |
| Asset Report | **$3.00–$5.00/report** (lending use cases) | OPERATOR-REPORTED — https://www.getmonetizely.com/articles/plaid-vs-yodlee-how-much-will-financial-data-apis-cost-your-fintech |
| Identity Verification (KYC add-on) | $0.50–$2.00/verification | OPERATOR-REPORTED — getmonetizely |
| Additional History fee | flat, unpublished; ESTIMATE $1–$3/Item | ESTIMATE (structure OFFICIAL, amount not public) |
| Statements | unpublished; ESTIMATE $0.50–$2/statement | ESTIMATE (model OFFICIAL, amount not public) |
| Transactions Refresh | unpublished; ESTIMATE $0.10–$0.15/request | ESTIMATE |

Contract sizes:
- **Vendr: median annual Plaid cost ≈ $9,000 across 39 verified purchases** (OPERATOR-REPORTED — https://www.vendr.com/marketplace/plaid). This is the most decision-relevant benchmark for a company of Wildcat's likely volume.
- Enterprise minimums commonly $1,000–$10,000+/mo; one large-enterprise average quoted at ~$434k/yr (OPERATOR-REPORTED, weak — https://checkthat.ai/brands/plaid/pricing; treat with skepticism).
- Forum-reported: **$1,000/mo minimum for business use, negotiated down to $500/mo by one buyer** (OPERATOR-REPORTED — Reddit/HN synthesis via costbench.com and https://news.ycombinator.com/item?id=21380382).
- Volume discounts: unit prices step down with volume; bundling multiple products, multi-year terms, and prepayment reported to yield lower per-call rates (OPERATOR-REPORTED — Vendr).
- 2025–26 changes: no across-the-board published price increase found. Structural changes: Trial plan replaced the old free Development environment; "Transactions for Business" launched with business-account coverage (~4,500 FIs, 95% of US banks serving SMBs) (OFFICIAL — https://plaid.com/blog/transactions-for-business/). MSA template allows rate increases at renewal with 30 days' notice (OFFICIAL-template, see §7).

## 3. Bank data-access fee passthrough (JPMorgan, 2025–26)

- July 2025: JPMorgan Chase began charging aggregators for consumer data access — the first large US bank to do so (OFFICIAL/press — https://www.paymentsdive.com/news/plaid-to-pay-for-jpmorgan-data-open-banking-fintechs/760192/).
- By Sept 2025, **Plaid signed a paid data-access agreement with JPMC**; fees described by people familiar as "fractions of a cent per data pull"; agreement extended/renewed with joint security investment (OFFICIAL — https://www.jpmorganchase.com/newsroom/press-releases/2025/jpmc-plaid-renewed-data-access-agreement; https://news.bloomberglaw.com/banking-law/jpmorgan-plaid-data-fee-deal-shifts-open-banking-battlefield).
- **Plaid has publicly said it will NOT pass the cost to its ~7,000 customers; current contracts and pricing unchanged** (OFFICIAL/press — Payments Dive, Finovate https://finovate.com/jpmorgans-data-access-agreement-from-plaids-perspective/).
- **No "premium institution" surcharge found as of Aug 2026** (searched explicitly; absence of evidence, not proof — ESTIMATE: risk remains that surcharges appear at renewal as other banks (PNC, and JPMC's deals with Yodlee/Morningstar/Akoya covering >95% of JPMC third-party data requests) normalize the fee model — https://www.openbankingtracker.com/guides/open-banking-data-access-fees, https://www.emarketer.com/content/jpmorgan-data-sharing-deal-plaid-legitimizes-fee-model).
- Commercial implication: Plaid's margin is now squeezed on large-bank Items; the MSA's renewal-rate-increase clause (§7) is the natural passthrough vehicle. Expect pressure at renewal rather than mid-term surcharges (ESTIMATE).

## 4. Production access requirements

What Plaid requires (OFFICIAL — https://plaid.com/docs/launch-checklist/, support.plaid.com articles):
- **Application profile + company profile** in Dashboard (end-user-facing name, use case description, website).
- **Use-case / oversight review**: Trial applications mostly auto-approved after identity verification; flagged applications go to Plaid's **Customer Oversight** team (2–3 day follow-up). Paid Production requires billing setup and, for Growth/Custom, an MSA + order form (the template MSA is a 12-month initial term; see §7).
- **Security Questionnaire** — required for OAuth access to certain major US institutions (e.g., PNC gated on it unless on Trial; Schwab adds up to 6 weeks post-approval). Contents (v6, full text: OFFICIAL mirror — https://gist.github.com/coolaj86/0c17836066362d812006314ffc36ef13): TLS 1.2+ in transit; **encryption at rest** (volume + object/column level); documented access-control request/grant/review/revoke processes; MFA on critical systems; vulnerability scanning with patching SLAs; network segmentation; change management with code review; audit trails + real-time security alerting; **independent security audits and penetration-test documentation**; background checks (pre-hire + annual); incident response process; data retention/deletion policies; consumer consent; no selling of consumer data. SOC 2 is not literally mandated, but the questionnaire is effectively a SOC 2-shaped attestation — a company without SOC 2-grade controls will struggle to pass (ESTIMATE from questionnaire contents).
- **Timeline**: "allow at least one week" for Production request processing; security questionnaire >24h; some institutions add weeks (Schwab up to 6) (OFFICIAL — plaid.com/docs/link/oauth/, core-exchange docs).

**Crypto/DeFi stance (key finding):**
- Plaid **actively serves crypto companies as customers**: named customer stories for **Coinbase** (IDV/KYC) and **Gemini** (ID verification, ACH linking); partnerships/products for Binance.US, Robinhood, SoFi, Circle; a dedicated crypto use-case page ("Onboarding & funding solutions for crypto accounts"), a crypto-onramp guide, and Wallet Onboard (web3 wallet linking, 2022). Read-only crypto-exchange data (balances/transactions from Binance, Kraken, Gemini) was added to the network in 2022. (OFFICIAL — https://plaid.com/customer-stories/coinbase/, https://plaid.com/customer-stories/gemini/, https://plaid.com/use-cases/crypto/, https://plaid.com/blog/digital-asset-exchanges/, https://techcrunch.com/2022/07/14/plaid-adds-read-only-support-for-thousands-of-crypto-exchanges/.)
- **No blanket prohibition on crypto found** in the Developer Policy or elsewhere; no operator reports of crypto firms being rejected for *data* products surfaced in searches (absence noted explicitly). The **Transfer** (money movement) product has a distinct prohibited business/industry list (OFFICIAL — https://plaid.com/docs/transfer/application/) — but Wildcat would not need Transfer.
- Plaid's Developer Policy reserves broad rights to "withhold, refuse, or terminate access… where it believes the Services are being used in violation of this Policy or any other Plaid agreement," and the MSA permits immediate suspension for legal violations or **reputational harm** (OFFICIAL — https://plaid.com/developer-policy/; MSA mirror). ESTIMATE: a DeFi credit protocol pulling *corporate borrower* financials is a lending/underwriting use case Plaid explicitly courts (Assets, Credit/Underwriting docs) and its crypto posture is commercial, not hostile — approval is plausible, but expect **enhanced Customer Oversight diligence** (KYC/BSA/AML-staffed team; staged diligence deepens for higher-risk verticals — https://www.indexventures.com/startup-jobs/plaid/risk-analyst-customer-oversight-4/). The realistic risks are (a) slower onboarding, (b) a negotiated rider on data use, and (c) the unilateral-termination right hanging over an onchain protocol whose "end users" are corporate borrowers — Wildcat should present itself as a fintech lender doing borrower underwriting/monitoring, with a clean consent flow from each borrower.

## 5. Wildcat cost model (list-ish prices)

**Assumptions (all explicit):**
- Borrowers each connect avg **2 Items** (range 1–3; a corporate borrower with 2 banks).
- **Onboarding per Item**: Identity one-time $1.10; Additional History flat fee for 24-month pull, assumed **$2.00/Item (ESTIMATE)**; Auth skipped (no money movement).
- **Ongoing**: Transactions subscription **$0.30/Item/mo** (community benchmark; buyer data says $0.25/account — using the higher, conservative figure); 2 on-demand refreshes/Item/mo at **$0.12 (ESTIMATE)**.
- **Quarterly asset reports**: 1 report/borrower/quarter covering all its Items (≤5 Items ⇒ single-report fee) at **$4.00/report** (midpoint of $3–5), incl. 90-day history; +$2 additional-history fee per report for >61-day lookback (ESTIMATE).
- **Statements**: 12 statements/Item/yr, available at ~60% of institutions, **$1.00/statement (ESTIMATE)**.
- No Balance/Signal (no ACH). No churn/re-linking costs (understates: 15–25% of links need annual reconnection per getmonetizely — OPERATOR-REPORTED).

Per borrower: onboarding one-time ≈ **$6.20**; ongoing ≈ $7.20 (txn subs) + $5.76 (refresh) + $24 (4 reports × $6) + $14.40 (statements) ≈ **$51.40/yr** ⇒ **~$58 first-year per borrower**.

| Scenario | Usage-based spend (yr 1) | Plan-floor reality | Modeled annual Plaid spend |
|---|---|---|---|
| **20 borrowers** (40 Items) | ~$1,160 | PAYG (no minimum) viable; Growth floor ~$100–500/mo would dominate | **$1.2k (PAYG) – $6k (if pushed to a committed plan)** |
| **100 borrowers** (200 Items) | ~$5,800 | At/below common $500–1,000/mo minimums | **$6k – $12k** (matches Vendr's $9k median) |
| **500 borrowers** (1,000 Items) | ~$29,000 | Growth/Custom commitment; 10–30% volume discount plausible | **$22k – $35k** |

Sensitivity: doubling the ESTIMATE line items (asset report $8 loaded, statements $2, refresh $0.15, history $3) raises per-borrower cost to ~$95/yr ⇒ 500-borrower case ~**$48k/yr** upper bound. Even so, **Plaid is a rounding error against Wildcat's protocol economics; the floor/commitment, not unit price, drives spend at 20–100 borrowers.** Add ~$0 for JPMC fees (not passed through, §3). Not modeled: engineering integration cost, multi-aggregator redundancy (§6), Plaid IDV/KYB products if used for onboarding.

## 6. Multi-aggregator commercials

| Provider | Model | Notes |
|---|---|---|
| **Finicity (Mastercard Open Banking)** | Custom; test drive + PAYG + custom plans | Strength in mortgage/income verification via direct bank agreements; per-report pricing for verification products (OFFICIAL/OPERATOR — https://fintechspecs.com/blog/plaid-vs-mx-vs-finicity/, g2.com) |
| **MX** | Custom, quote-only | Positioned on data quality/enrichment; no public pricing (OPERATOR — fintechspecs) |
| **Akoya** | **Standard plan ≤10k unique connections/mo; Enterprise above**; amounts undisclosed | Bank-owned network, API-only (no screen scraping); now on JPMC's paid-access roster (OFFICIAL — https://akoya.com/pricing) |
| **Teller** | **Free dev tier: 100 live connections**; paid above | Cheapest entry; leaner product surface (OFFICIAL — https://teller.io/) |
| **Flinks** | Quote-only, per-connection | Canada-centric strength (OPERATOR — g2.com) |
| **Codat** | Platform fee ~$12k–24k/yr + ~$30–50/connected company/mo (estimates) | Accounting-data (QuickBooks/Xero/NetSuite) rather than bank-transaction rails — arguably the better primitive for *corporate* borrower financials (OPERATOR-REPORTED — https://www.merge.dev/blog/codat-pricing, satvasolutions.com) |
| **Super-aggregators (Quiltt, Fuse)** | Abstraction layer over Plaid/MX/Teller/Finicity/Yodlee | One integration, per-institution routing, failover; the "aggregator of aggregators" pattern (https://www.quiltt.io/blog/the-rise-of-the-super-aggregator, https://fintechtakes.com/articles/2024-06-14/aggregating-the-aggregators/) |

**Switching costs**: schema divergence (each aggregator's transaction/account model differs), and — decisive — **Items/consents don't port**: every borrower must re-link every bank account through the new aggregator's flow. For Wildcat's small corporate user base (tens–hundreds of sophisticated counterparties), re-linking is an email campaign, not a death march — switching costs are **low relative to consumer fintechs** (ESTIMATE). An abstraction layer is overkill below ~500 borrowers.

## 7. Commercial risk factors

**Contract terms** (Plaid MSA template, buyer-shared mirror: https://gist.github.com/kirillzubovsky/4937e0c14c843d11e2399c83d1e47052; same doc surfaced on SEC EDGAR https://www.sec.gov/Archives/edgar/data/2069448/000206944825000001/Plaid_msa.htm — OFFICIAL-template):
- 12-month initial term; **auto-renews in 1-year increments** unless 60 days' written non-renewal notice.
- **Plaid may raise rates at any renewal with 30 days' notice**; operators report 5–10% annual escalators in practice (OPERATOR-REPORTED — Vendr).
- Net-15 payment; 1.5%/mo late interest; payments **non-refundable, non-cancellable, no set-off** — an unused minimum commitment is sunk.
- Termination for material breach with only a **10-day cure period**; Plaid may **suspend immediately** for legal violations or reputational harm (relevant to a DeFi-adjacent customer).
- **No SLA in the standard MSA**; no published uptime guarantee found anywhere — SLAs/service credits are a negotiated enterprise add-on (searched; nothing public — ESTIMATE/absence).

**Termination & data** (commercial angle; hand to legal stream): upon termination, client must stop using services and return/destroy API materials; Plaid deletes client data on its servers on written request (or per law), and clients get a **30-day window to download client data** post-termination, after which Plaid disclaims liability for deletion (OFFICIAL-template — MSA mirror; https://plaid.com/legal/terms-of-use/). Already-pulled end-user data sitting in Wildcat's own database is governed by the MSA's data-use limits ("providing the Client Application to the applicable End User") and privacy law (CFPB 1033 revocation duties), not physically clawed back — but continued *use* for new purposes after termination is contractually restricted. Model post-Plaid continuity accordingly: historical underwriting snapshots should be transformed into Wildcat's own derived records before exit.

**Rate limits** (OFFICIAL — https://plaid.com/docs/errors/rate-limit-exceeded/): Production: `/transactions/get` **30/min per Item, 20,000/min per client**; `/accounts/balance/get` **5/min per Item**; `/accounts/get` 15/min per Item, 15,000/min per client. Sandbox differs (e.g., 1,000/min client cap on /transactions/get). Higher limits by request via account manager. None of these constrain Wildcat's volumes (500 borrowers × quarterly reports is trivial); only per-Item balance checks (5/min) could bite a naive polling design.

**Deprecation track record**: Plaid deprecates steadily but with long parallel-run windows — Development environment → Trial plan; legacy User APIs → new User APIs (new behavior default Dec 10 2025; parallel webhooks from Apr 1 2026; legacy still functional); legacy Income Verification awaiting forced migration ("contact your account manager") (OFFICIAL — https://plaid.com/docs/api/users/migrate-to-new-user-apis/, https://plaid.com/docs/changelog/). Also strategic push from Assets toward FCRA-regulated **Consumer Report by Plaid Check** for consumer lending — not applicable to commercial/corporate credit, but signals Plaid reshaping the underwriting product line (OFFICIAL — https://plaid.com/docs/check/, https://plaid.com/docs/underwriting/).

**Billing gotchas checklist**: error-state Items bill until removed; no pro-rating; >5-Item asset reports multiply fees; >61-day history triggers flat fees on both Transactions and Assets; refresh add-ons are metered separately; 15–25% of Items need annual re-linking (OPERATOR-REPORTED — getmonetizely), which re-triggers one-time fees if products are re-initialized.

---

## Total cost of ownership — summary

At list-ish prices, Wildcat's direct Plaid spend is small: **~$1–6k/yr at 20 borrowers, ~$6–12k/yr at 100 (Vendr median for Plaid contracts is $9k), ~$22–48k/yr at 500** — driven by plan minimums at the low end and asset-report + statement volume at the high end, not by the $0.25–0.30/Item/mo transactions subscription. True TCO adds: integration engineering (weeks, incl. passing the security questionnaire — which effectively demands SOC 2-grade controls Wildcat needs anyway), item-hygiene automation (removing errored Items to stop the meter), annual re-linking friction with corporate borrowers, and optionally a second aggregator (Codat for accounting data would likely add a $12–24k platform fee — potentially more useful than bank statements for corporate underwriting). Plaid will not be a material line item; the binding constraints are procedural (production approval, oversight review of a DeFi-adjacent use case) and contractual (auto-renewal, rate-increase clause, no SLA), not price.

## Three biggest commercial risks

1. **Use-case approval / unilateral termination risk.** Plaid happily serves crypto exchanges, but a DeFi credit protocol is a novel oversight profile; the MSA allows immediate suspension for "reputational harm" and termination access-cutoff with a 10-day-cure/30-day-download cliff. Mitigate: frame as fintech commercial lending, get the use case in writing in the order form, keep derived underwriting records outside Plaid data-use restrictions, and keep a warm second aggregator path (Items don't port, but a small corporate borrower base re-links cheaply).
2. **Renewal-time price escalation, JPMC-fee fallout.** Plaid absorbed JPMorgan's per-pull fees in 2025 and publicly promised no passthrough — but the MSA lets it raise any rate at renewal with 30 days' notice, auto-renewal locks a year at a time, minimums are non-refundable, and the industry now has a legitimized bank-fee model (JPMC deals with Plaid/Yodlee/Morningstar/Akoya). Budget 5–10%/yr escalation and calendar the 60-day non-renewal notice window.
3. **No SLA + silent-meter billing mechanics.** Standard contracts carry no uptime commitment or service credits; meanwhile errored Items bill forever until affirmatively removed, >61-day history and >5-Item reports trigger multiplier fees, and re-links can re-trigger one-time charges. For a protocol whose covenants may depend on monitoring feeds, the absence of an SLA is the real exposure; the billing gotchas are an ops-discipline tax rather than a dollar risk at Wildcat's scale.
