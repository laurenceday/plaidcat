<!-- Verbatim Warden verification record (G2), kept outside the prose
mask like the other research streams because it quotes docs text as
evidence. Corpus: operator-supplied mirror of plaid.com/docs, mid-2026. -->

# Verification stream B — products & billing vs plaid.com/docs mirror
Corpus: /home/user/plaid-docs/plaid-docs/ (llms-full.txt as grep index; per-topic index.html)
Pages: products.html, commercial.html, coverage.html (product-support claims)

## SUMMARY (details per item below; counts: 34 confirmed, 6 corrected, 12 newly answered)

### CONFIRMED (highlights)
- Statements: 10-bank list verbatim incl. Chase early availability, ~40% share, depository-only, mandated fallback, 2-yr window, per-statement refresh billing, US-only (item 1).
- Assets: 731d max, 1-99 Items, immutable, refresh=new report, no refresh in Canada, auditors = Fannie/Freddie/Ocrolus, Relay secondary_client_id + third-party refresh, >5-Item surcharge blocks, flat per-Item Additional History fee >61d (item 2).
- Transactions: days_requested default 90 / init-only / delete-and-relink to change, Capital One 90d cap, original_description opt-in, counterparty LOW = cleansed-string semantics, 180d recurring recommendation, holder_category beta ~70% account-manager gated, 1-4x/day extraction (financial-insights page) (item 3).
- Check: 24h TTL + re-billing on new report, monitoring 1-4x/day best-effort (items 5).
- Billing: 4 plans, error-state Items bill until removed/depermissioned, no pro-rating (UTC calendar months), per-statement scaling, refresh per-request, Trial = 10 Items and /item/remove does NOT return quota (items 6, 9).
- Rate limits: balance 5/min+30/hr per Item; full table extracted (item 7).
- institutions products array (incl. statements value) + PRODUCTS_NOT_SUPPORTED (item 8).

### CORRECTED
1. products.html: "Assets... cannot be added to an existing Item later" — FALSE; update-mode Link adds Assets to an existing Item, usually consent-step-only (item 2).
2. products.html Identity card: "business-account detection is officially unsupported" — outdated; holder_category is the documented mechanism (beta), plus /identity/match is_business_name_detected (item 3).
3. products.html: BofA 18-month checking history cap has NO support in the docs corpus — relabel operator-reported (item 3).
4. Insights approval: no docs gate on Asset Report with Insights (only credit_category subfield is closed-beta) (item 2).
5. coverage.html: institution health status comes from /institutions/get_by_id with include_status (not /institutions/get list), and not in Sandbox (item 8).
6. Minor: >5-Item Assets fee is an additive per-block surcharge, not a base-fee multiplier (item 2).

### NEWLY ANSWERED
- /cashflow_report/*: still 100% undocumented (0 hits); Check's "Cash Flow Updates/Servicing" beta is the consumer-side analog (items 4, 10).
- financial-insights page bars Transactions/Liabilities/Investments/Enrich from "credit or underwriting decisioning" — biggest new tension with the site (item 4).
- Underwriting docs steer new customers to Consumer Report (US-only, 12-mo contract only); Check cannot share a Link session with Assets/Statements/Income (item 4).
- Asset Report TTL: none exists (only Check reports expire, 24h) (item 2).
- Statements retrofittable to existing Items via update mode (item 1).
- Business statements support: docs still silent — UNVERIFIED stands (item 1).
- Trial plans limited to new US/CA teams created on/after Apr 15, 2026; migration guides, Check bundles, plan sizing thresholds, no business-debt Liabilities (items 5, 6, 10).

---
### 1. Statements
Source: llms-full.txt "Statements - Introduction to Statements" (~L145681-145880); statements/index.html

CONFIRMED:
- Supported-institution list, current: "Statements support includes the following major institutions, constituting ~40% of US depository accounts: Bank of America, Chase (early availability; contact your Plaid account manager to request access), Citibank, Fifth Third Bank, Huntington Bank, Navy FCU, Regions Bank, Truist, US Bank, Wells Fargo" plus "several smaller banks and credit unions". Site's "roughly ten large banks plus assorted small ones, around 40%... Chase still gated behind early availability" = exact match.
- Depository-only: "Statements currently supports only bank depository accounts (e.g. checking and savings accounts)."
- Mandated fallback: "Statements does not currently support all major or long-tail institutions, and should be used with a fallback option in case data is not available."
- 2-year window: "Plaid allows extracting up to 2 years of statements" (link/token/create statements object start_date/end_date); API ref: "The end date for statements... You can request up to two years of data." (llms-full.txt L7570)
- Refresh: /statements/refresh re-checks for new statements; STATEMENTS_REFRESH_COMPLETE webhook; billed "based on the number of statements extracted between the provided start and end dates... per-request flexible fee model". Billing page adds: "you will be charged for any statement extracted, even those that you previously requested at an earlier date" (llms-full.txt L353) — slightly worse than site implies but consistent with "per-statement refresh fee".
- US only: "Statements (US only)".
- Billed at Item creation "even if you do not call any Statements endpoints".

STILL UNVERIFIED (docs silent):
- Business-account statement support: no mention anywhere in statements docs of business accounts; only "bank depository accounts (e.g. checking and savings)". Site's "unverified" label is correct and should stand.

NEWLY ANSWERED:
- Statements CAN be added to an existing Item via update mode (products=["statements"], access_token set); "If the user connected their account less than two years ago, they can bypass the Link credentials pane and complete just the Statements consent step." Site implies one-Link-session initialization only; not a contradiction but a useful softening (unlike Assets, Statements is retrofittable).
- Recommended init pattern: put statements in required_if_supported_products so unsupported institutions don't block the Link flow; unsupported calls then return PRODUCTS_NOT_SUPPORTED.

---
### 2. Assets
Source: llms-full.txt "Assets - Introduction to Assets" (~L102063-102380), "API - Assets" (~L20826+), billing (~L349)

CONFIRMED:
- 731-day max: /asset_report/create days_requested "Maximum: 731" (L20895); same on /asset_report/refresh (L25290).
- 1-99 Items per report: access_tokens "Min items: 1 / Max items: 99" (L20885).
- Immutable snapshot: "An Asset Report is an immutable snapshot of a user's assets... Asset Reports can either be created or removed; they cannot be updated."
- Refresh = new report: /asset_report/refresh "creates a new Asset Report based on the old one, but with the most recent data available"; Assets billed per report on flexible fee model, so each refresh is a newly billed report.
- Canada exclusion: "Note: Asset Report refresh is not supported in Canada." (Assets intro + API ref, both).
- Audit Copy auditor list: "Currently, Fannie Mae, Freddie Mac, and Ocrolus are the only auditors integrated with Plaid." Exact match to site.
- Relay mechanics: "/credit/relay/create... Each third party has its own secondary_client_id... You'll need to create a separate relay_token for each third party" (L25939+); third parties get /credit/relay/get (JSON), relay PDF, and /credit/relay/refresh (beta): "allows third parties to refresh a report that was relayed to them... A new report will be created with the original report parameters" (L30038). Site's "JSON and PDF and even refresh rights" + Plaid-registered recipient = confirmed.
- >5-Item fee: "An additional fee is charged for an Asset Report containing more than 5 Items; this fee will be charged twice if the Asset Report contains more than 10 Items, and so on." (billing, L349). Site's "each block of five Items... multiplies the report fee" is directionally right; precise mechanic is an ADDITIVE per-5-Item-block surcharge, not a multiplier of the base fee. Minor wording precision, not an error of substance.
- Additional History fee: "An 'Additional History' fee is also charged for each Item for which more than 61 days of history is requested. The Additional History fee is a flat fee regardless of how many days of additional history are requested" (billing L349). Confirms commercial.html "one flat Additional History fee per Item, whatever the depth"; note it is PER ITEM, which commercial.html states correctly.
- Async generation + webhook (PRODUCT_READY), JSON + PDF endpoints, Fannie Mae Day 1 Certainty thresholds (days_requested >=61 new originations / >=31 refi).

CORRECTED:
- "Assets must be in the products array at Link; it cannot be added to an existing Item later" (products.html) is WRONG as stated. API ref does say "the Assets product cannot be added after initialization" (L20883) for the raw access_tokens path, BUT the Assets intro has a whole section "Getting an Asset Report for an existing Item": "you can add Assets to the existing Item via update mode... populate the access_token field... set the products array to [\"assets\"]. If the user connected their account less than two years ago, they can bypass the Link credentials pane and complete just the Asset Report consent step." So no delete-and-relink is needed — a short update-mode consent step suffices. Site should soften to "cannot be added silently via API; requires an update-mode Link consent step".
- Insights approval: no approval/account-manager gate is documented for Asset Report with Insights — it is just include_insights=true on /asset_report/get ("This field defaults to false if omitted"). Only the `credit_category` field inside Insights is "in closed beta; to request access, contact your account manager" (changelog, L112489). If the site/research claimed Insights itself is approval-gated, that is unsupported by current docs.

NEWLY ANSWERED:
- Report TTL: still NOT documented — no expiry/TTL exists anywhere in the Assets docs (reports persist until /asset_report/remove). The 24h TTL belongs to Plaid Check Consumer Reports only. "Previously undocumented" stands: treat Asset Reports as non-expiring.
- Docs now actively steer AWAY from Assets: "Most new customers should use Consumer Report by Plaid Check instead of Assets... Assets is currently recommended only for use cases not supported by Consumer Report, such as underwriting outside the US." For a business-entity (non-FCRA) use case, Assets remains the applicable product — worth stating on the site.
- Fast Assets add-on (options.add_ons=["fast_assets"]): early balance+identity-only report, then full report, separate webhooks.
- UK-only Financial Insights Report add-on to Assets (risk + affordability insights, JSON/PDF).

---
### 3. Transactions
Source: llms-full.txt API-Transactions (~L78390+), troubleshooting (~L147201), link token (~L16966), Identity (~L12219)

CONFIRMED:
- days_requested 1-730 semantics: default 90 ("If no value is specified, 90 days of history will be requested by default"), set only at first initialization; "if you need more than 90 days... for an Item that has already been initialized... you will need to delete the Item and create a new one" (L147201). Immutability + delete-and-relink = confirmed.
- Capital One 90-day cap: "Capital One provides only 90 days of transaction history and does not provide pending transactions." (L147203). Also /transactions/refresh returns PRODUCTS_NOT_SUPPORTED on Capital One Items with only non-depository accounts (L133862).
- original_description opt-in: "this field will only be included if the client has set options.include_original_description to true" (L17496).
- Counterparty confidence semantics: VERY_HIGH >98%, HIGH >90%, MEDIUM moderate, "LOW: We didn't find a matching counterparty in our records, so we are returning a cleansed name parsed out of the request description", UNKNOWN (L17718). Site's "mostly resolve as low-confidence cleansed strings" reading of LOW is exactly the documented meaning.
- Recurring 180-day recommendation: "Customers using Recurring Transactions should request at least 180 days of history for optimal results." (L7640 et al.).
- /transactions/sync added/modified/removed + cursor; SYNC_UPDATES_AVAILABLE fires on every change (L81677).
- /transactions/refresh is paid: "offered as an optional add-on to Transactions and has a separate fee model [per-request flat fee]" (L81477).
- Business-account indicator: `holder_category` "Indicates the account's categorization as either a personal or a business account. This field is currently in beta; to request access, contact your account manager. Coverage varies by institution, with approximately 70% of accounts populated overall." (L1074). Site's "~70% populated, account-manager gated, beta" = exact match.

CORRECTED:
- Polling cadence "one to four times a day" is misattributed. Transactions docs say only "Plaid typically checks for new data multiple times a day, but these checks may occur less frequently, such as once a day, depending on the institution" (L79743). The "between one and four times per day (best-effort)" cadence belongs to Plaid Check's Cash Flow Updates monitoring insights (L44959), not core Transactions. Suggest rewording to "typically multiple times a day, as little as once a day per institution".
- Bank of America 18-month checking-history cap: NOT found anywhere in the docs corpus (the only 18-month string is USAA's OAuth consent-refresh interval, L133980). This claim has no primary-source support in plaid.com/docs; it should be labeled operator-reported, not folded into the "official" lookback bullet.
- Identity card claim "Business-account detection is officially unsupported here" is now outdated. Identity/account-object docs say: "To determine whether the linked account is a business account, use the holder_category field on the account object" (L12219), and the changelog notes /identity/match's `legal_name.is_business_name_detected` "is no longer deprecated and can now be used for detecting business names" (L111967). Detection is supported (beta holder_category + identity match flag); the caveat that the returned NAME may be entity or signer "depending on the institution" is confirmed verbatim.
- business_finance_category and "Transactions for Business": ZERO hits in the entire docs corpus (llms-full.txt and all per-topic files). Not documented, not beta-documented. The site's operator-reported/spec-only labeling is correct and should NOT be upgraded; the docs-visible business surface is holder_category only.

AMENDMENT to item 3 (polling cadence): the Financial Insights overview page DOES document the site's figure: "New and updated transactions are typically extracted between one and four times per day, depending on the institution" and the comparison table lists Transactions "Typical update frequency: 1-4 times per day" (llms-full.txt ~L119837, table ~L119860). So "Plaid polls institutions one to four times a day" is CONFIRMED after all (docs/financial-insights); the API-reference phrasing "multiple times a day... may occur less frequently, such as once a day" is the more conservative variant. Withdraw the earlier correction; keep only the note that the API ref hedges lower.

---
### 4. /cashflow_report/* and docs/financial-insights + docs/underwriting
Sources: llms-full.txt "Financial Insights | Plaid Docs" (L119823+), "Credit and Underwriting | Plaid Docs" (L149425+); financial-insights/index.html; underwriting/index.html

NEWLY ANSWERED (the question: is the packaged cash-flow product now documented?):
- /cashflow_report/*: ZERO hits in the entire docs corpus (llms-full.txt and every per-topic file). The endpoint family remains completely undocumented on plaid.com/docs. Site's "existence verified in the spec; everything else unverified" callout stands unchanged — no upgrade, no contradiction.
- docs/financial-insights is NOT a new product: it is a category overview page comparing Transactions, Transactions Refresh, Recurring Transactions, Enrich, Liabilities, and Investments. Crucially it carries a usage restriction: "Note that none of these products may be used as part of a credit or underwriting decisioning process; for underwriting use cases, see credit underwriting products." This is a NEW, decision-relevant constraint for the site: a lender using Transactions data in credit decisioning is pointed by Plaid's own docs to the underwriting product set — relevant to how Wildcat frames its use case to Plaid oversight (products.html/architecture present Transactions as the underwriting-monitoring foundation).
- docs/underwriting product story: "Consumer Report by Plaid Check is recommended for most new customers" for underwriting; "Assets is currently recommended only for use cases not supported by Consumer Report, such as underwriting outside the US"; same steer for Income ("recommended only for... end users outside the US, or Payroll or Document Income based flows"). Consumer Report: US-only, 12-month contract ONLY (no pay-as-you-go, per comparison table), includes LendScore, Network Insights, Cash Flow Insights, Income Insights, Partner Insights (Prism Data), optional Home Lending Report (early availability, Fannie D1C + Freddie LPA AIM approved).
- Link-session incompatibility (new for the site): "Plaid Check cannot be used in the same Link session as Plaid Inc. credit products such as Income, Assets, or Statements; to use those products, create separate /link/token/create requests." Non-credit products (Balance, Auth) can share a session with Check.
- The packaged CONSUMER cash-flow product is Check (documented); a packaged BUSINESS cash-flow product still does not exist anywhere in docs. Underwriting page confirms Statements depository-only ("checking, savings, or money market") and repeats the fallback mandate.

---
### 5. Plaid Check / Consumer Report (docs/check)
Sources: llms-full.txt L382-396 (billing), L42570 (check add-to-app), L44959/L46552 (monitoring), L113833+ (Migrate from Assets), L114118+ (Migrate from Transactions)

CONFIRMED:
- 24h report TTL: "A Consumer Report will last for 24 hours before expiring; you should call any /get endpoints on the report before it expires" (L42570); "After 24 hours, the user's report expires. Calls to product endpoints on an expired report will return a CONSUMER_REPORT_EXPIRED error... Once you create a new report and call a /get endpoint on it, you will be charged a new bundle fee, regardless of whether the original report has expired or not" (L382). Site's "24-hour report TTL" = exact.
- Monitoring insights cadence: /cra/monitoring_insights subscription "updated between one and four times per day (best-effort)"; "only one Item per user may be subscribed for monitoring updates" in the current Cash Flow Updates beta (L44959). INSIGHTS_UPDATED webhook "will fire between one and four times a day" (L46552; replaced by CASH_FLOW_INSIGHTS_UPDATED for customers onboarded on/after Dec 10, 2025).
- Consumer-only / US-only / FCRA framing confirmed (underwriting page: supported countries "US"; CRA products; permissible purpose required).

NEWLY ANSWERED:
- Migration guides exist for both paths. Migrate-from-Assets: replace `assets` with `cra_base_report`, must call /user/create first (name, DOB, emails, phones, addresses required; SSN required for GSE sharing), cra_options.days_requested MINIMUM 180 (vs Assets min 0), consumer_report_permissible_purpose required; multi-Item reports need enable_multi_item_link=true (default one Item per report, unlike Assets' 99).
- Migrate-from-Transactions states flatly: "If your use case involves evaluating the financial standing of US-based end users for underwriting, credit, or leasing, you should use the CRA Base Report instead of Transactions." Combined with the financial-insights restriction (no credit/underwriting decisioning with Transactions), Plaid's docs now position raw Transactions as NOT for consumer credit decisioning. For Wildcat this matters at the margins: business-entity underwriting is outside FCRA/Check's scope, but any guarantor/individual analysis with Transactions would run against this guidance. The site's legal-page FCRA framing is directionally consistent; products.html could note the docs-level usage restriction.

---
### 6. Billing (docs/account/billing) + 9. Trial plan
Source: llms-full.txt "Account - Pricing and billing" (L200-460)

CONFIRMED (commercial.html section 1):
- Plans: "Trial – Free access. Limited to 10 Items"; "Pay-as-you-go – No minimum spend or commitment"; "Growth – Minimum spend, annual commitment"; "Custom (aka Scale) – Higher minimum spend and annual commitment... lowest per-use costs". "A price list is not available in the documentation... Pricing information for Pay-as-you-go and Growth plans will be displayed on the last page before you submit your request [for Production access]." All match the site.
- Billing model taxonomy: one-time fee (Auth, Identity, Income, Layer); subscription fee (Transactions, Recurring Transactions, Liabilities, Investments); per-request flat fee (Balance /accounts/balance/get, Signal, refresh endpoints incl /transactions/refresh, Asset report PDF + Audit Copy, Identity Match); per-request flexible fee (Assets, Statements Refresh, Enrich); per-Item flexible fee (Statements). Site's "three billing models" is a serviceable simplification but docs enumerate five-plus models; note Asset PDF and Audit Copy each carry their own per-request flat fee on top of the report fee (site doesn't mention).
- Error-state Items keep billing: "Plaid will charge for the subscription even if no API calls are made for the Item or API calls cannot be successfully made for the Item (e.g. because the Item is in an error state)"; "persist the access token so that you can remove the Item when needed to avoid being billed indefinitely". Exact match to commercial.html gotcha.
- No pro-rating: "Plaid's subscription cycle is based on calendar months in the UTC time zone... Fees for Items created or removed in the middle of the month are not pro-rated."
- Per-statement scaling: "For Statements, the flexible fee is calculated based on the number of statements available within the date range requested... charged even if you do not call any Statements endpoints", billed at public_token creation.
- Refresh per-request: /transactions/refresh + /investments/refresh = per-request flat fee; /statements/refresh = per-request flexible fee (per statement extracted, including re-extractions).
- Per-5-Items surcharge and flat per-Item Additional History fee (>61 days): see item 2.
- Trial plan (site: "ten live production Items"): "You can create 10 Production Items on a Trial plan... Removing Items created on a Trial plan (using /item/remove) will NOT allow you to create more Items." Both halves confirmed verbatim.

NEWLY ANSWERED:
- Trial availability window: "Free Trial plans are available to new Plaid teams (US/Canada only) created on or after April 15, 2026." Trial includes Assets, Statements, Transactions (incl. Refresh), Balance, Auth, Identity, Investments, Liabilities — i.e., every product the Wildcat pilot needs is trial-testable with live data.
- Plan sizing guidance now published: Growth "most appropriate for... API usage volumes up to $6,000/month"; Custom for "volumes over $2,000/month or... enterprise-level functionality". Also NO Plaid Check products on Pay-as-you-go; LendScore/Partner/Network Insights are Custom-plan-exclusive; EU/UK customers get Custom plans only.
- Subscription also ends if the END USER depermissions the Item via my.plaid.com/Plaid support (institution-portal revocation ends it only best-effort) — a second exit valve besides /item/remove.
- One-time fees and optional_products: Auth/Identity in `optional_products` bill only when the endpoint is first called — a cost lever for the site's Identity-at-onboarding model.

---
### 7. Rate limits (docs/errors, RATE_LIMIT_EXCEEDED page)
Source: llms-full.txt L118180-118380 ("Rate limit exceeded errors", Production table)

CONFIRMED:
- commercial.html "five-per-minute per-Item balance check": /accounts/balance/get = "5 per minute, 30 per hour" per Item; 1,200/min per client. The 30/hour per-Item ceiling is an additional constraint the site omits (harmless at Wildcat scale).
- "Rate limits are irrelevant at Wildcat scale" holds against exact numbers. Key rows (Production, per Item | per client):
  /transactions/sync 50/min | 2,500/min (500/min for empty-cursor requests); /transactions/get 30/min | 20,000/min; /transactions/refresh 2/min, 120/hr, 2,880/day | 100/min, 18,000/hr, 432,000/day; /transactions/recurring/get 20/min | 1,000/min; /asset_report/create 5/min | 50/min; /asset_report/get 15/min | 1,000/min; /asset_report/pdf/get 5/min | 50/min; /asset_report/refresh 5/min | 50/min; /asset_report/audit_copy/create N/A | 30/min; /statements/list N/A | 100/min; /statements/download N/A | 50/min; /statements/refresh N/A | 50/min; /identity/get 15/min | 2,000/min; /institutions/get N/A | 50/min; /institutions/get_by_id N/A | 400/min; /item/remove 20/min | 2,000/min; /accounts/get 15/min | 15,000/min; /signal/evaluate 70/hr per Item.
- Caveats stated in docs: table "is not an exhaustive listing", "some customers may experience different rate limit thresholds", "rate limits are subject to change at any time"; higher limits via account manager/support.
- Note for coverage-page pre-flight design: /institutions/get at only 50/min per client means bulk products-array scans must be paced or cached (500 institutions/request pagination still applies).
- Changelog: "Introduced a rate limit of 100 requests per minute for all Plaid Check endpoints" (L111349).

---
### 8. /institutions/get products array, institution health, PRODUCTS_NOT_SUPPORTED
Source: llms-full.txt "API - Institutions" (L2455+), errors page (L117350+)

CONFIRMED (coverage.html "small" paragraph):
- Per-institution products array exists: "A list of the Plaid products supported by the institution" (L2661); `statements` is a possible value, so Statements support IS checkable per institution. Filtering: /institutions/get options.products "Will only return institutions that support all listed products" (max 500/page).
- Per-product health: institution status object "determined by the health of its Item logins, Transactions updates, Investments updates... Auth requests, Balance requests, Identity requests..." with HEALTHY/DEGRADED/DOWN (deprecated field) and a more granular `breakdown` object (L2697-2710).
- PRODUCTS_NOT_SUPPORTED: "Returned when a data request has been made for an Item for a product that it does not support" (ITEM_ERROR, HTTP 400, L117350). Confirmed as the unsupported-call error.

CORRECTED (precision, coverage.html):
- Health status is NOT returned by /institutions/get at Link time as the site implies: "Institution status is accessible in the Dashboard and via the API using the /institutions/get_by_id endpoint with the options.include_status option set to true. Note that institution status is not available in the Sandbox environment." (L2699). The pre-flight check therefore needs get_by_id + include_status per institution (400/min client limit), not the bulk /institutions/get list (which carries the products array but not status).
- products array caveats worth adding: `auth` listed only for Instant Auth institutions; Signal/Transfer coverage in the array "may be incomplete or incorrect" (use balance/auth as proxies); institutions with no product overlap with the client's enabled products are filtered out of responses entirely.
- PRODUCTS_NOT_SUPPORTED common-causes list confirms an Assets constraint the site can cite: "Updated accounts have been requested for an Item initialized with the Assets product, which does not support adding or updating accounts after the initial Link."

---
### 10. New-product scan (layer, protect, monitor, liabilities) + contradictions
Source: llms-full.txt Layer intro (L126903), Liabilities intro (L128008), Monitor intro (L137051), Protect blurb (L125838), product enums (L1190), Check monitoring endpoints (L36098+)

NEWLY ANSWERED (nothing the site missed for a CORPORATE cash-flow layer, but note these):
- Layer: consumer instant onboarding via phone number, US only, Plaid Network — irrelevant to corporate cash flow.
- Protect: "Plaid's anti-fraud solution (US only)... dynamic Trust Index score... currently in early availability" — fraud tooling, not cash-flow data; enum values protect_linked_bank / protect_transactions.
- Monitor: sanctions/PEP/watchlist screening (AML). Could serve Wildcat's own KYC/AML on borrower principals, but not a data-layer product.
- Liabilities: business debt schedules do NOT exist. Coverage is consumer debt only: "credit cards, PayPal credit accounts, student loans, and mortgages" (US, CA limited); no transaction history; ~once-daily refresh. No business-loan/commercial-debt product anywhere in the corpus.
- The closest documented thing to the site's speculated packaged cash-flow monitor is CONSUMER-side: Plaid Check "Cash Flow Updates" (beta) via /cra/monitoring_insights/subscribe|get|unsubscribe — subscription-based cash-flow insights updated 1-4x/day, one Item per user in beta, webhooks incl. LOW_BALANCE_DETECTED / LARGE_DEPOSIT_DETECTED, now labeled "Servicing (fka Cash Flow Updates)". This strengthens the site's /cashflow_report inference (Plaid is productizing packaged cash-flow monitoring on the consumer/CRA side) without documenting the business counterpart.
- Product enum also shows documented-adjacent SKUs the site may want to track: cra_monitoring, cra_cashflow_insights, cra_lend_score, cra_plaid_credit_score, cra_qualify, cra_home_lending, pay_by_bank, beacon, balance_plus (still an enum value despite the site's "schemas left the spec" note on Balance Plus — enum presence in docs is not a product page; no Balance Plus product docs found).

CONTRADICTIONS with the pages: none material beyond those already logged (Assets add-later in item 2; institution health via get_by_id in item 8; BofA 18-month cap unsupported in item 3). The financial-insights "no credit or underwriting decisioning" restriction on Transactions/Liabilities/Investments/Enrich (item 4) is the largest NEW tension with the site's Transactions-as-underwriting-foundation framing and should be surfaced on products.html or legal.html.
