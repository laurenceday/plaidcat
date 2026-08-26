<!-- Verbatim Warden verification record (G1), kept outside the prose
mask like the other research streams because it quotes docs text as
evidence. Corpus: operator-supplied mirror of plaid.com/docs, mid-2026. -->

# Warden verification — Stream A (technical) vs plaid.com/docs mirror
Corpus: /home/user/plaid-docs/plaid-docs/ (llms-full.txt line refs; URLs map to per-topic index.html.md)

## CONFIRMED

### 1. Token TTLs — CONFIRMED
- access_token / public_token: llms-full.txt:5592 (docs/api/items, /item/public_token/exchange): "The `public_token` is ephemeral and expires after 30 minutes. An `access_token` does not expire, but can be revoked by calling /item/remove." Also :5700 "By default, the `access_token` associated with an Item does not expire".
- link_token: llms-full.txt:7750 (docs/api/link, link/token/create response `expiration`): "a `link_token` created to generate a `public_token`... expires after 4 hours, and a `link_token` created for an existing Item (such as... update mode) expires after 30 minutes." Hosted Link: expires with URL (`url_lifetime_seconds`, max 21 days; defaults 7d email / 1d SMS / 30 min if not Plaid-delivered — :7624). Link Delivery (beta) default: 24h SMS / 7d email. NOTE: research says "default 7 days email / 1 day SMS" for hosted_link URL lifetime — matches :7624; the *Link Delivery token* default 24h SMS/7d email is a separate figure the research omitted (minor, not wrong).

### 2. days_requested — CONFIRMED
- llms-full.txt:7638-7644 (docs/api/link, transactions.days_requested): "The default value is 90 days. In Production, if a value under 30 is provided, a minimum of 30 days of history will be requested. Once Transactions has been added to an Item, this value cannot be updated." "Customers using Recurring Transactions should request at least 180 days". Minimum: 1, Maximum: 730.

### 3. US institutions with expiring/refreshing OAuth consent — NEWLY ANSWERED (full list)
- Source: docs/link/oauth #refreshing-item-consent (llms-full.txt:133966-133982): "In the US, the following institutions require periodic OAuth consent refresh. Consent refresh at these institutions is required every 12 months, unless noted otherwise."
  FULL LIST: American Express; Bank of America (new API only); Brex (**3 months**); Capital One; Charles Schwab; Citibank; Fidelity; Navy Federal Credit Union; PNC; TD Bank; USAA (**18 months**).
  Europe: "consent typically expires after 180 days."
- Bank of America detail (:133842-133848): 2026 gradual migration off old BoA API; "Once an Item is on the new Bank of America API, it will have a 12-month consent expiration policy applied to it." PENDING_DISCONNECT fired; 1 week later Item disconnects into ITEM_LOGIN_REQUIRED.
- Detection: `/item/get` `consent_expiration_time`; PENDING_DISCONNECT (US/CA) / PENDING_EXPIRATION (UK/EU) "one week before a user's consent is set to expire"; fix via update mode. Confirms the 7-day figure.
- technical.html's "Bank of America, PNC, and Capital One are confirmed examples" — all three ARE on the list (BoA new-API only), but the list is 11 institutions; page/research should cite the full set. Research's "12 months unless noted otherwise" wording is verbatim-correct.

### 4. Webhook retries, IP allowlist, JWT verification — CONFIRMED + NEWLY ANSWERED (IPs)
- Retries (docs/api/webhooks #webhook-retries, llms-full.txt:100204-100208): "If there is a non-200 response or no response within 10 seconds... Plaid will keep attempting to send the webhook for up to 24 hours. Each attempt will be tried after a delay that is 4 times longer than the previous delay, starting with 30 seconds." 90%-rejection cutoff and 429 Retry-After honored "up to a maximum of 4 hours" — all confirmed verbatim.
- IP allowlist — NEWLY ANSWERED (llms-full.txt:100190-100197): the FULL list is exactly four IPs: **52.21.26.131, 52.21.47.157, 52.41.247.19, 52.88.82.239** — "Note that these IP addresses are subject to change."
- JWT verification (docs/api/webhooks/webhook-verification, :100240-100437): Plaid-Verification header holds a JWT; check `alg == "ES256"` ("Reject the webhook if this is not the case"), extract `kid`, call /webhook_verification_key/get with `key_id`, validate signature; additionally "Use the issued at time denoted by the `iat` field to verify that the webhook is not more than 5 minutes old" (replay protection — a step the research omitted); compare SHA-256 of body against `request_body_sha256` with constant-time comparison. Note doc also says verification "is optional." Key caching/rotation guidance confirmed elsewhere in same page.

### 5. Item webhook semantics — CONFIRMED (all six)
- PENDING_DISCONNECT (docs/api/items, llms-full.txt:6080): "Fired when an Item is expected to be disconnected. The webhook will currently be fired 7 days before... fired only for US or Canadian institutions." Reasons: INSTITUTION_MIGRATION, INSTITUTION_TOKEN_EXPIRATION; carries `disconnect_time`. Confirmed.
- PENDING_EXPIRATION (:6136): "Fired when an Item's access consent is expiring in 7 days... fired only for Items associated with institutions in Europe (including the UK)." Confirmed.
- USER_PERMISSION_REVOKED (:6185-6187): revocation via Plaid Portal/support → fires; "If the end user revoked their permissions directly through the institution, this webhook may not always fire, since some institutions' consent portals do not trigger this webhook." TANs stop working for new transfers "except for US Bank Items." Confirmed incl. the US Bank exception.
- USER_ACCOUNT_REVOKED (:6300): "fired when an end user has revoked access to their account on the Data Provider's portal. This webhook is currently sent only for Chase, PNC, and Truist Items, but may be sent in the future for other financial institutions..." + recommendation to delete Plaid-derived data. Confirmed — Chase/PNC/Truist is exact.
- LOGIN_REPAIRED (:5931): "Fired when an Item has exited the `ITEM_LOGIN_REQUIRED` state without the user having gone through the update mode flow in your app (this can happen if the user completed the update mode in a different app)." Confirmed verbatim.
- NEW_ACCOUNTS_AVAILABLE (:5973): "Fired when Plaid detects a new account" → update mode w/ new-accounts request (US/CA only); EU/UK: re-link + /item/remove old Item; users can opt out via institution OAuth settings ("Plaid will not detect new accounts and this webhook will not fire"). Confirmed.
- Extra corpus nuance: bank-side consent revocation → Item enters ITEM_LOGIN_REQUIRED "after approximately 24-48 hours" (link/oauth #managing-consent-revocation, :134048). Single-ACCOUNT revocation: "no webhook will be fired", account treated as closed (:134050).

### 6. Update mode same token; Chase de-dup — CONFIRMED (with one nuance)
- docs/link/update-mode (llms-full.txt:~135314): "An Item's `access_token` does not change when using Link in update mode, so there is no need to repeat the exchange token process." item_id likewise persists. Also: "Whenever an Item is successfully sent through update mode, the Item consent expiration date will be updated as though the Item were newly created." Update-mode link_token TTL 30 min confirmed (:7750).
- Chase de-dup (docs/link/oauth Chase section, :133858): "Existing Chase OAuth Items will be invalidated when a new public token is created using the same credentials, if the two Items do not have exactly the same set of accounts associated with them, or if either Item is used with a Plaid Check product." CONFIRMED — but NOT Chase-only:
  - PNC has the IDENTICAL rule (:133888).
  - Charles Schwab is stricter: "permits only one active OAuth Item per end user per application... invalidated... regardless of whether the two Items have the same set of accounts" (:133876).
  Research §2.1 and technical.html ("except at Chase, which silently de-duplicates") UNDERSTATE this — CORRECTION: Chase, PNC, and Schwab all de-duplicate same-credential Items.
- Chase extra: update mode "cannot be used to remove accounts or permissions from a Chase Item"; permissions persist across Item deletion/re-creation with same credentials (:133856).

### 7. /item/remove vs /item/products/terminate — PARTIAL CORRECTION
- /item/remove (docs/api/items, llms-full.txt:5190-5199): all quoted claims CONFIRMED verbatim — token + processor/bank-account tokens invalid; "recommended best practice when offboarding users"; "required to end subscription billing... unless the end user revoked permission (e.g. via https://my.plaid.com/)"; Asset Reports/Audit Copies survive; "for certain OAuth-based institutions, an Item removed via /item/remove may still show as an active connection in the institution's OAuth permission manager." reason_code enum (:5221-5223) matches research exactly (FRAUD_*, CONNECTION_IS_NON_FUNCTIONAL, OTHER).
- Billed-indefinitely warning CONFIRMED (docs/account/billing, :305-309): "Plaid will charge for the subscription even if no API calls are made... (e.g. because the Item is in an error state)"; "persist the access token so that you can remove the Item when needed to avoid being billed indefinitely."
- **CORRECTION / gap:** `/item/products/terminate` has NO reference documentation in this corpus. It appears only in a changelog entry (:110723, adding FRAUD_TRANSACTION to its reason_code enum), so the endpoint exists, but the docs' stated recommendation for offboarding is /item/remove ("recommended best practice when offboarding users"). The research's verbatim quote "'/item/products/terminate' is the recommended way to offboard users" comes from the OpenAPI spec, NOT plaid.com/docs; technical.html's flat "'/item/products/terminate' is the recommended offboarding call" is not supported by the docs corpus and conflicts with the /item/remove text. The documented sibling is **/user/products/terminate** (user-based subscriptions: Financial Management, Plaid Protect, CRA Cash Flow Updates; :99239-99265) with the richer reason_code enum (which also includes FRAUD_TRANSACTION, missing from research's list). Also /user/items/remove (:99131) = /item/remove per-Item for user-based flows.
- On Trial plan: "/item/remove does not impact the number of remaining Trial Items" (:5196) — note this contradicts the research's phrasing "doesn't return Trial Item quota" only in direction of meaning: docs say removal does NOT free up quota... actually it says removal does not *impact* remaining count, i.e. removing does not restore quota. Research phrasing matches.

### 8. DTM consent, additional_consented_products, consent log, dormant 1033 reauth — CONFIRMED (with sourcing caveat)
- DTM (docs/link/data-transparency-messaging-migration-guide, llms-full.txt:129349): "a user is informed of the specific data types that you are requesting and the reason that you are requesting them (use cases). If you want access to additional data... they must consent to sharing that data through a separate consent flow." Also :129483 "DTM is mandatory for all customers who are enabled for Plaid in the US" (Canada gets it too, opt-out possible if not US-enabled). ADDITIONAL_CONSENT_REQUIRED error fires when calling non-consented endpoints on DTM/Robinhood Items or Signal-score rulesets without signal consent (:115979-115981).
- additional_consented_products (:6996): "List of additional Plaid product(s) you wish to collect consent for to support your use case. These products will not be billed until you start using them by calling the relevant endpoints." Confirmed.
- /consent/events/get (docs/api/consent, :2119): "Consent logs are only available for events occurring on or after November 7, 2024... Up to three years of consent logs will be available via the endpoint." (Also: events within past 12 hours may not be available.) Confirmed.
- Dormant 1033 reauth: the docs corpus does NOT contain the exact OpenAPI sentence "this field is not currently used... if 1033-related expiration begins to be enforced" for `update.reauthorization_enabled` (that text is OpenAPI-only). What the corpus DOES say: changelog :111858 documents the reauthorization update-mode flow (6-month window → extended to 12 months from reauth; `update.reauthorization_enabled` param; "no reason to send Items through the reauthorization flow at this time"); and :133292 "Plaid is not currently enforcing the requirement to have an LEI, as the CFPB is revising the section 1033 rule and rule enforcement is not in effect." The "dormant/enforcement paused" characterization is therefore corpus-supported, though via LEI/changelog text rather than the quoted field description.
- Corpus also confirms the 1033 data-deletion duty on revocation (:133996): "the 1033 rule requires third parties to no longer use or retain covered data upon revocation unless... reasonably necessary...".

### 9. Refresh cadence, /transactions/refresh, balance — CONFIRMED
- Cadence (docs/api/products/transactions, llms-full.txt:78332 & 16908): "Plaid typically checks for new transactions data between one and four times per day, depending on the institution." Confirmed.
- /transactions/refresh (:81469-81477): "initiates an on-demand extraction... in addition to the periodic extractions that automatically occur one or more times per day"; not supported for Capital One (ins_128026) non-depository-only Items (PRODUCTS_NOT_SUPPORTED); "latency may be higher than for other Plaid endpoints (typically less than 10 seconds, but occasionally up to 30 seconds or more)"; "offered as an optional add-on... separate fee model [per-request flat fee]. To request access to this endpoint, submit a product access request or contact your Plaid account manager." All confirmed — gating, latency, fee, Capital One exclusion.
- Balance (:782): "/accounts/get is free to use and retrieves cached information... If the Item is enabled for a regularly updating product... the balance will typically update about once a day"; /accounts/balance/get (:77291) "returns the real-time balance... forces the available and current balance fields to be refreshed rather than cached", same <10s/30s+ latency note. Confirmed.

### 10. Trial plan, production timelines, Schwab, PNC — MOSTLY CONFIRMED, one UNVERIFIABLE
- Trial plan (docs/account/billing #trial-plans, llms-full.txt:234-246): "Free Trial plans are available to new Plaid teams (US/Canada only) created on or after April 15, 2026"; "You can create 10 Production Items on a Trial plan"; "Removing Items created on a Trial plan (using /item/remove) will *not* allow you to create more Items." Changelog :110843: "Trial plans replace Limited Production for all newly created Plaid teams going forward." CONFIRMED, incl. the 2026-04-15 date and 10-Item cap. Product list on Trial: Assets, Auth, Balance, Identity, Investments (+refresh), Liabilities, Transactions (+refresh), Statements. Also: Trial plan customers "get immediate access to all OAuth institutions" (:110789) — which explains why PNC/Chase questionnaire gating says "Unless you are on a Trial plan."
- Schwab: CONFIRMED (:133876): "Schwab has an additional waiting period and it may take up to six weeks from Production approval until Schwab Production access has been granted"; pay-as-you-go must explicitly request access.
- PNC questionnaire gate: CONFIRMED (:133882): "Unless you are on a Trial plan, you must complete the Security Questionnaire before gaining access to PNC in Production." Same rule for Chase (:133852) — technical.html names only PNC; Chase is gated identically (worth adding). Fidelity: auto-granted on Growth/Custom ~8 weeks after Production access (:125775). General: complete the OAuth security questionnaire "at least six weeks ahead" of launch (:147439).
- "Allow at least one week for your request to be processed" (production access review): NOT FOUND in this corpus — no processing-time figure for the Production request appears in the mirror. Treat "~1 week" as unverified against docs (support-site sourced). Nearest corpus datapoints: Chase OAuth registration "approximately 1-2 business days" post-approval (:111021).

### 11. Rate limits per endpoint — NEWLY ANSWERED
- Source: docs/errors/rate-limit-exceeded (llms-full.txt:118180+). "Default rate limit thresholds for some of the most commonly rate-limited endpoints"; table "is not an exhaustive listing"; limits "subject to change at any time"; error type RATE_LIMIT_EXCEEDED. Key Production rows (per-Item / per-client):
  - /accounts/balance/get: 5/min, 30/hr per Item; 1,200/min per client
  - /accounts/get: 15/min; 15,000/min
  - /item/get: 15/min; 5,000/min
  - /item/public_token/exchange: N/A; 12,000/min
  - /item/remove: 20/min; 2,000/min
  - /link/token/create: N/A; 20,000/min
  - /transactions/sync: 50/min; 2,500/min (500 per empty-cursor request)
  - /transactions/get: 30/min; 20,000/min
  - /transactions/refresh: 2/min, 120/hr, 2,880/day per Item; 100/min, 18,000/hr, 432,000/day per client
  - /consent/events/get: N/A; 5,000/min. Plaid Check endpoints: 100/min (changelog :111349).
- Neither research-A nor technical.html covers rate limits; worth adding at least the balance (5/min/Item) and refresh (2/min/Item) caps since they bound decision-time freshness pulls.

### 12. Contradictions between corpus and page/research
1. **Offboarding recommendation (technical.html §4, §8; research §4.2, §8.4).** Page: "`/item/products/terminate` is the recommended offboarding call." Docs corpus: /item/remove is "a recommended best practice when offboarding users" (:5192) and /item/products/terminate has NO reference docs in the corpus (only a changelog mention of its reason_code enum, :110723). The "recommended way to offboard" quote exists only in the OpenAPI spec. Downgrade or dual-cite; do not present as docs-verbatim.
2. **Chase-only de-duplication (technical.html §2 "except at Chase, which silently de-duplicates"; research §2.1).** Docs give the identical same-credential invalidation rule for PNC (:133888) and a stricter one for Charles Schwab ("only one active OAuth Item per end user per application... regardless of whether the two Items have the same set of accounts", :133876). Chase is not the sole exception.
3. **Incomplete consent-window list (technical.html §3).** "Bank of America, PNC, and Capital One are confirmed examples" — correct as examples (BoA new-API only), but the docs list 11 institutions incl. Brex at 3 months and USAA at 18 months; "roughly 12-month windows" is wrong for those two outliers.
4. **PNC-only questionnaire gate (technical.html §7).** "PNC gates on the security questionnaire" — Chase has the identical gate (:133852), and both are waived on Trial plans. Minor understatement, not error.
5. **"~1 week production processing" (technical.html §7, research §7).** Not present anywhere in the docs corpus; support-site provenance only. Should stay flagged as non-docs-sourced.
No outright factual contradictions found beyond #1; #2-#5 are understatements/over-narrow claims.

## SECTION SUMMARY

### CONFIRMED (verbatim or equivalent in corpus)
- access_token non-expiry; public_token 30-min; link_token 4h new / 30-min update-mode; Hosted Link lifetimes (item 1).
- days_requested 1-730, default 90, 30-day production floor, immutable once Transactions added, 180+ for Recurring (item 2).
- Webhook retries: 10s timeout, 24h, 4x backoff from 30s, 90% rejection cutoff, 429 Retry-After ≤4h (item 4).
- JWT ES256 flow incl. /webhook_verification_key/get and request_body_sha256 (+ iat ≤5 min check research omitted) (item 4).
- All six Item webhooks: PENDING_DISCONNECT (US/CA, 7d, INSTITUTION_MIGRATION/INSTITUTION_TOKEN_EXPIRATION), PENDING_EXPIRATION (EU/UK, 7d), USER_PERMISSION_REVOKED (may not fire on bank-side revocation; TAN exception for US Bank), USER_ACCOUNT_REVOKED (Chase/PNC/Truist only), LOGIN_REPAIRED, NEW_ACCOUNTS_AVAILABLE (item 5). SYNC_UPDATES_AVAILABLE arming via first /transactions/sync confirmed (:81681).
- Update mode: access_token/item_id unchanged, no re-exchange; consent expiration reset "as though the Item were newly created" (item 6).
- /item/remove semantics, billed-indefinitely warning, stale bank-side OAuth entry warning, Asset Report survival, reason_code enum (item 7).
- DTM (mandatory in US), additional_consented_products billing-on-use, /consent/events/get (from 2024-11-07, 3 years), 1033 enforcement "not in effect" (via LEI note + changelog) (item 8).
- 1-4x/day cadence; /transactions/refresh gated add-on, per-request fee, <10s/occasionally 30s+ latency, Capital One non-depository exclusion; /accounts/get free+cached (~daily) vs /accounts/balance/get real-time (item 9).
- Trial plan: US/CA teams on/after 2026-04-15, 10 Production Items, /item/remove doesn't restore quota, replaced Limited Production; Schwab up to 6 weeks; PNC (and Chase) security-questionnaire gate unless on Trial (item 10).

### CORRECTED
- /item/products/terminate "recommended offboarding" — not in docs; docs recommend /item/remove (item 7/12.1).
- Chase de-dup is not unique: PNC identical, Schwab stricter (item 6/12.2).
- Consent windows not uniformly ~12 months: Brex 3 months, USAA 18 months (item 3/12.3).
- Chase questionnaire gate omitted alongside PNC (item 10/12.4).
- "~1 week production processing" unsupported by docs corpus (item 10/12.5).

### NEWLY ANSWERED
- Full US expiring-consent list (11): Amex, BoA (new API), Brex (3mo), Capital One, Schwab, Citibank, Fidelity, Navy Federal, PNC, TD Bank, USAA (18mo); Europe ~180 days (item 3).
- Full webhook source IP allowlist (4): 52.21.26.131, 52.21.47.157, 52.41.247.19, 52.88.82.239 (item 4).
- Rate-limit table incl. /accounts/balance/get 5/min/Item and /transactions/refresh 2/min/Item (item 11).
- Extras: bank-side revocation → ITEM_LOGIN_REQUIRED after ~24-48h; single-account revocation fires NO webhook; iat 5-min replay check; Fidelity ~8-week auto-grant on Growth/Custom; BoA old-API disconnections run mid-Mar–late-Oct 2026.
