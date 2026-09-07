# Research Stream A — Plaid Core Technical Integration Mechanics
**Wildcat Labs / Fiat research run. Current as of 2026-08-26.**

**Sourcing note.** Direct fetch of plaid.com was blocked by this session's egress policy. Primary sources used instead: (1) Plaid's official OpenAPI spec, `github.com/plaid/plaid-openapi`, file `2020-09-14.yml`, version **2020-09-14_1.729.1**, last updated **2026-08-17** — this is generated from the same source of truth as plaid.com/docs and all endpoint/webhook/parameter text below is quoted verbatim from it; (2) live web search returning plaid.com/docs content in snippet form. Claims sourced only via search snippets (not verbatim spec text) are flagged. Items that could not be pinned to a primary source are marked **UNVERIFIED**.

---

## 1. The full Link flow

### 1.1 `/link/token/create`
Source: OpenAPI `LinkTokenCreateRequest` + https://plaid.com/docs/api/link/

- Purpose: creates a `link_token`, required to initialize Link. "Once Link has been initialized, it returns a `public_token`... saved and exchanged for an `access_token` via `/item/public_token/exchange`." Also used to initialize update mode and Identity Verification flows.
- **Required params**: `client_name` (≤30 chars, shown in Link), `language`, `country_codes`. One of `user` (with required `user.client_user_id`) or `user_id` (from `/user/create`; required for integrations that began using Plaid Protect, Multi-Item Link, or Plaid Check Consumer Report after **December 10, 2025**).
- **`products`** (array): products the linked Item *must* support. Limits the institution list — "Only institutions that support *all* requested products can be selected." Should be minimal; at least one product required unless in update mode ("If launching Link in update mode, should be omitted"). `balance` is not a valid value (auto-initialized). "In Production, you will be billed for each product that you specify when initializing Link... a product cannot be removed from an Item once the Item has been initialized with that product. To stop billing on an Item for subscription-based products, such as Liabilities, Investments, and Transactions, remove the Item via `/item/remove`."
- **`required_if_supported_products`**: "products you wish to use only if the institution and account(s) selected by the user support the product. Institutions that do not support these products will still be shown in Link. The products will only be extracted and billed if the user selects an institution and account type that supports them." No overlap allowed with the other arrays.
- **`optional_products`**: products that "enhance the consumer's use case, but that your app can function without. Plaid will attempt to fetch data for these products on a best-effort basis, and failure to support these products will not affect Item creation." For Auth/Identity/Signal/Plaid Check in this array, billing occurs only when their endpoints are called.
- **`additional_consented_products`**: "products you wish to collect consent for to support your use case. These products will not be billed until you start using them by calling the relevant endpoints." Data is *not* fetched at link time; shown to the user in the Data Transparency Messaging consent pane. Enables adding a product later via direct endpoint call without re-linking.
- Post-Link product addition: "Transactions, Investments, Liabilities, Identity, Auth, and Transfer can be added post-Link by making a call to that product's endpoint... so long as these products were originally included in `required_if_supported_products`, `optional_products`, or `additional_consented_products`." (https://plaid.com/docs/link/initializing-products/; https://support.plaid.com/hc/en-us/articles/14976875990551)
- **`transactions.days_requested`**: integer 1–730, default 90. "The maximum number of days of transaction history to request for the Transactions product... In Production, if a value under 30 is provided, a minimum of 30 days of history will be requested. Once Transactions has been added to an Item, this value cannot be updated." ≥180 recommended for Recurring Transactions. (Note: it lives under the `transactions` object, not at root.)
- **`webhook`**: "The destination URL to which any webhooks should be sent." Per-Item, set at link time. "In update mode, this field will not have an effect; to update the webhook receiver endpoint for an existing Item, use `/item/webhook/update` instead." (Some product webhooks — Transfer, Identity Verification, Monitor, e-wallet Payment Initiation — are configured in the Dashboard instead.)
- **`redirect_uri`**: "destination where a user should be forwarded after completing the Link flow; used to support OAuth authentication flows when launching Link in the browser or another app. Should not contain any query parameters. When used in Production, must be an https URI. Must also be added to the Allowed redirect URIs list in the developer dashboard." Android uses `android_package_name` instead.
- **`access_token`**: pass to launch **update mode** for an existing Item (re-auth) — see §4.5.
- **`update` object**: `account_selection_enabled` (default false; enables Account Select during update mode to add/change shared accounts; "For institutions in the US that have an OAuth account selection flow... update mode with Account Select will always be enabled"), `user`, `item_ids`. A hidden `reauthorization_enabled` field exists: "**Note: this field is not currently used. Plaid may enable this field in the future if 1033-related expiration begins to be enforced.** By default, Plaid will enable the reauthorization flow during update mode for an Item enabled for Data Transparency Messaging if the Item expires within six months... After the end user successfully completes the reauthorization flow, the Item's expiration date will be extended to 12 months from the time that the reauthorization took place." (verbatim, OpenAPI spec — key 2026 nuance)
- **`hosted_link` object**: enables **Hosted Link** — Plaid-hosted web page running the Link session; response then includes `hosted_link_url`. Options: `delivery_method` (`sms`/`email`, Link Delivery beta), `completion_redirect_uri`, `url_lifetime_seconds` (max 21 days; default 7 days email / 1 day SMS / **30 minutes** if not delivered by Plaid), `is_mobile_app`.
- Other notable params: `account_filters` (limit account subtypes shown; institutions not supporting selected subtypes omitted; "If the user selects only excluded account subtypes [in OAuth], the link attempt will fail"), `link_customization_name`, `appearance_mode`, `enable_multi_item_link` ("If `true`, enable linking multiple items in the same Link session"), `institution_data`, `eu_config`, product-specific config objects.
- **Response**: `link_token` (expires **4 hours** for new-Item flows; **30 minutes** for update-mode tokens; Hosted Link tokens expire with the URL), `expiration`, `request_id`, optional `hosted_link_url`.

### 1.2 Link UI stages and what the user sees
Source: https://plaid.com/docs/link/ and https://plaid.com/docs/link/oauth/ (via search snippets)

- Typical non-OAuth pane sequence: **CONSENT → SELECT_INSTITUTION → CREDENTIAL → LOADING → MFA (if required) → [ACCOUNT_SELECT] → CONNECTED**. OAuth sequence: **CONSENT → SELECT_INSTITUTION → OAUTH (handoff to bank) → return to Link → CONNECTED**.
- **Consent pane / Data Transparency Messaging (DTM)**: the user sees the connecting app's name, Plaid's role, Plaid's End User Privacy Policy, and — under DTM — the specific **use cases** and **data scopes** being requested ("a user is informed of the specific data types that you are requesting and the reason that you are requesting them"). Use cases are configured in Dashboard → Link → Data Transparency (https://dashboard.plaid.com/link/data-transparency-v5). Source: https://plaid.com/docs/link/data-transparency-messaging-migration-guide/, https://plaid.com/blog/introducing-data-transparency-messaging/.
- **Institution selection**: searchable list, filtered to institutions supporting all `products` and any `account_filters`.
- **Credential-based (non-OAuth) auth**: user enters bank username/password inside Link; Link handles **MFA** challenges (OTP codes, security questions, device-based approval) as an MFA pane. Plaid holds the credentials for the connection (screen-scraping / non-OAuth API).
- **OAuth auth**: Link redirects/hands off to the bank's own site or app; user authenticates at the bank (credentials never touch Plaid), typically completes the bank's own account-selection and consent screen, then is redirected back via `redirect_uri`. "OAuth support is required in all Plaid integrations that connect to financial institutions in the US, EU, and UK." (https://plaid.com/docs/link/oauth/)
- **Account Select ("Account Select v2")**: current Link shows an account-selection pane configurable per Link customization for **single account**, **multiple accounts**, or **all accounts preselected** (`AccountSelectionCardinality`: `SINGLE_SELECT` | `MULTI_SELECT` | `ALL` — enum verbatim from OpenAPI spec). The pane "may be skipped if the financial institution's OAuth flow has already fulfilled the account selection step." Sources: https://plaid.com/docs/link/customization/, OpenAPI `AccountSelectionCardinality`.
- **onSuccess**: Link's `onSuccess` callback returns the **`public_token`** plus metadata (institution, selected accounts, `link_session_id`).

### 1.3 Token exchange
Source: OpenAPI `/item/public_token/exchange` description (verbatim):
- "Exchange a Link `public_token` for an API `access_token`. Link hands off the `public_token` client-side via the `onSuccess` callback once a user has successfully created an Item. **The `public_token` is ephemeral and expires after 30 minutes. An `access_token` does not expire, but can be revoked by calling `/item/remove`.**"
- Response: `access_token`, `item_id` ("should be stored with the `access_token`. The `item_id` is used to identify an Item in a webhook"), `request_id`.
- https://plaid.com/docs/api/items/#itempublic_tokenexchange

---

## 2. Items, access tokens, accounts

### 2.1 What an Item is
- An **Item** = one login/connection at one financial institution for one user, created via Link. It is the unit to which the `access_token`, webhook URL, products, consent, and billing attach. One Item contains **one or more accounts** (`/accounts/get` lists them; only active accounts capable of carrying a balance are returned).
- One Item per institution login: linking the same credentials twice creates **two distinct Items** — "The `item_id` is always unique; linking the same account at the same institution twice will result in two Items with different `item_id` values." (OpenAPI `Item.item_id`). Exception: Chase de-duplicates — "existing Chase OAuth Items will be invalidated when a new public token is created using the same credentials, if the two Items do not have exactly the same set of accounts" (https://plaid.com/docs/link/oauth/).
- Item metadata (`/item/get` → `item` object): `item_id`, `institution_id`, `institution_name`, `webhook`, `auth_method`, `error`, `available_products`, `billed_products`, `products`, `consented_products`, `consent_expiration_time`, `update_type` (`background` = updatable without the user; `user_present_required` = user interaction needed, e.g. some 2FA setups), plus `created_at`, `consented_use_cases`, `consented_data_scopes` (DTM). Response also carries `status` (`ItemStatus`): `transactions.last_successful_update` / `last_failed_update`, `investments.*`, `last_webhook.sent_at`/`code_sent`. Source: OpenAPI `Item`, `ItemWithConsentFields`, `ItemStatus`; https://plaid.com/docs/api/items/#itemget.

### 2.2 `access_token` properties
- **Does not expire** (verbatim exchange-endpoint text). It survives indefinitely until: `/item/remove` is called; `/item/access_token/invalidate` rotates it; the user revokes consent (token remains but all calls fail); or the Item is otherwise deleted. Note: non-expiry of the *token* ≠ non-expiry of the *bank-side consent* — at consent-expiring institutions the Item enters an error state while the token string stays valid as an identifier (see §3.2, §4).
- **Rotation**: `/item/access_token/invalidate` — "rotates the access token associated with an Item. Immediately invalidates the old one" and returns `new_access_token`. Use if a token may have been compromised. Source: OpenAPI `ItemAccessTokenInvalidateRequest/Response`; https://plaid.com/docs/api/tokens/#itemaccess_tokeninvalidate.
- **Sensitivity/storage guidance** (Plaid docs, via https://plaid.com/docs/api/items/ + https://plaid.com/docs/quickstart/ + launch checklist): store server-side only, "never expose... client-side," associate with your user record together with `item_id`. Exchange must happen server-side because it requires the `secret`. Encryption-at-rest of tokens is asked about in Plaid's production security questionnaire (see §7). An access_token is only usable in combination with your `client_id` + `secret`, so a leaked token alone does not grant data access — but treat it as a credential regardless (this mitigating point is Plaid's design; flagged **partially UNVERIFIED** as an explicit doc quote).

### 2.3 Account selection scope
- Data access is limited to the accounts the user shared (Link Account Select and/or the bank's OAuth account picker). Accounts excluded by `account_filters` that the user picks in an OAuth flow "will not be added to the Item" (OpenAPI `LinkTokenAccountFilters`).
- New accounts opened later at the bank: Plaid fires `NEW_ACCOUNTS_AVAILABLE` (see §5) and they can be added via update mode with `account_selection_enabled: true` (US/CA only; in UK/EU relink + `/item/remove` the old Item). Some banks' OAuth settings let users opt out of new-account detection.

---

## 3. Consent and scoping

### 3.1 Can products/scopes be limited per Item?
**Yes — at Item creation.** The consent envelope of an Item = `products` + `required_if_supported_products` + `optional_products` + `additional_consented_products` at `/link/token/create` time, surfaced to the user as DTM use cases + data scopes. `/item/get` exposes `consented_products`, `consented_use_cases`, `consented_data_scopes`. Calling an endpoint for a product outside the consent envelope fails (`ADDITIONAL_CONSENT_REQUIRED`); expanding consent requires a new Link/update-mode session. Since **July 2026**, Signal explicitly requires end-user consent in Link before `/signal/evaluate` even for non-DTM sessions (https://plaid.com/blog/product-updates-august-2026/ era updates; Plaid changelog).
- Data scopes enum (what users consent to, verbatim from spec): `account_balance_info`, `contact_info`, `account_routing_number`, `transactions`, `credit_loan_info`, `investments`, `payroll_info`, `income_verification_*`, `bank_statements`, `risk_info`, `network_insights_lite`, `fraud_info`.
- Products cannot be removed from an Item once initialized (only the whole Item can be removed, or products terminated via `/item/products/terminate` — see §4.2).
- Account-level scoping: yes, via Account Select / OAuth picker (§2.3). Fine-grained per-account product scopes are visible to the *user* through Plaid Portal and to institutions via `/item/application/list` `scopes` (e.g. `product_access.account_balance_info: true`, per-account `authorized` flags — OpenAPI example).

### 3.2 Consent expiration (state of play, Aug 2026)
- `consent_expiration_time` on `/item/get`: "Currently, only institutions in **Europe** and a **small number of institutions in the US** have expiring consent. For a list of US institutions that currently expire consent, see the OAuth Guide." (verbatim, OpenAPI `Item.consent_expiration_time`).
- Europe/UK: consent expires periodically (commonly ~180 days under PSD2 practice; UK moved to remove the 90-day re-auth requirement in favor of app-side reconfirmation). `PENDING_EXPIRATION` webhook fires 7 days ahead.
- US: **no universal consent expiration exists as of Aug 2026.** The CFPB 1033 rule's 12-month reauthorization requirement is **not being enforced** (rule enjoined; CFPB re-rulemaking — see §8). Plaid's machinery for 12-month DTM reauthorization exists in the API but is dormant ("this field is not currently used. Plaid may enable this field in the future if 1033-related expiration begins to be enforced" — OpenAPI, `update.reauthorization_enabled`).
- However, **specific US institutions impose their own consent windows via data-access agreements**: per Plaid's OAuth guide (search-verified), certain US institutions "require periodic OAuth consent refresh... every **12 months**, unless noted otherwise" — confirmed examples: **Capital One** (consent refresh after one year), **PNC** (TAN-holding Items require re-authorization within past 12 months). `PENDING_DISCONNECT` (reason `INSTITUTION_TOKEN_EXPIRATION`) fires 7 days before. The *full* current list lives at https://plaid.com/docs/link/oauth/#refreshing-item-consent (list contents beyond Capital One/PNC: **UNVERIFIED** — page not directly fetchable; treat the set as growing since the 2025 bank data-access agreements).
- If consent lapses, the Item enters **`ITEM_LOGIN_REQUIRED`** (reason codes include `OAUTH_CONSENT_EXPIRED`, `OAUTH_USER_REVOKED`, `OAUTH_INVALID_TOKEN`) and is fixed by update mode. Source: https://plaid.com/docs/errors/item/.

### 3.3 Consent visibility APIs
- `/item/application/list` — "List a user's connected applications" (for a user across Items): returns `applications[]` (name, logo, `reason_for_access`, `created_at`, `scopes` incl. per-product booleans and per-account `authorized`) and `disconnected_applications[]` ("carry no `scopes` or `created_at`, since the user has revoked their access"). Related institution-facing endpoints: `/item/application/unlink` ("Plaid will immediately revoke the Application's access to the User's data. The User will have to redo the OAuth authentication process in order to restore functionality... only removes ongoing data access permissions"), `/item/application/scopes/update` ("Enable consumers to update product access on selected accounts for an application"). Source: OpenAPI paths.
- **`/consent/events/get`** — "List a historical log of Item consent events. Consent logs are only available for events occurring on or after **November 7, 2024**... Up to three years of consent logs" — event example: `event_type: CONSENT_GRANTED`, `event_code: USER_AGREEMENT`, `initiator: END_USER`, `consented_use_cases`. Built for 1033-style audit trails. Also `/item/activity/list` ("List a historical log of user consent events," returns `activities` + `last_data_access_times`). Source: OpenAPI paths (verbatim).

---

## 4. Revocation and termination

### 4.1 `/item/remove` (integrator-initiated) — verbatim from OpenAPI:
- "Once removed, the `access_token`, as well as any processor tokens or bank account tokens associated with the Item, **is no longer valid and cannot be used to access any data** that was associated with the Item."
- "Calling `/item/remove` is a recommended best practice when offboarding users or if a user chooses to disconnect an account linked via Plaid. For subscription products, such as Transactions, Liabilities, and Investments, **calling `/item/remove` is required to end subscription billing** for the Item, unless the end user revoked permission (e.g. via https://my.plaid.com/)."
- "Removing an Item does not affect any Asset Reports or Audit Copies you have already created."
- "**For certain OAuth-based institutions, an Item removed via `/item/remove` may still show as an active connection in the institution's OAuth permission manager.**" (i.e. removal kills Plaid-side access; the bank-side OAuth grant may linger until the user revokes it at the bank.)
- Optional `reason_code` (added ~2025): `FRAUD_FIRST_PARTY`, `FRAUD_FALSE_IDENTITY`, `FRAUD_ABUSE`, `FRAUD_OTHER`, `CONNECTION_IS_NON_FUNCTIONAL`, `OTHER` + free-text `reason_note` (no PII).
- URL: https://plaid.com/docs/api/items/#itemremove

### 4.2 `/item/products/terminate` (newer, now Plaid-recommended)
- "allows you to terminate an Item. Once terminated, the `access_token` associated with the Item is no longer valid, **billing for the Item's products is ended, and relevant webhooks are fired**. `/item/products/terminate` is the recommended way to offboard users or disconnect accounts linked via Plaid." Requires `reason_code` from a richer enum (`FRAUD_*`, `CONSUMER_LOAN_PAID_OFF`, `CONSUMER_ACCOUNT_CLOSED`, `CONSUMER_CHARGE_OFF`, `CONSUMER_PAYMENT_METHOD_SWITCHED`, `USER_OFFBOARDING`, `DUPLICATE_ITEM`, `BILLING_TERMINATION`, `OTHER`). Source: OpenAPI (verbatim). Docs anchor: /api/items/#itemproductsterminate.

### 4.3 Borrower/user-initiated revocation — Plaid Portal (my.plaid.com)
- Users can view every app connection, see data types shared, **revoke app access, revoke Plaid's own access, and request deletion of data stored by Plaid** at https://my.plaid.com. Sources: https://support-my.plaid.com/hc/en-us/articles/4410328321303, https://support-my.plaid.com/hc/en-us/articles/4420193428503.
- When revoked via Portal (or Plaid support), Plaid fires **`USER_PERMISSION_REVOKED`** (§5) and subscription billing for the Item ends (per the `/item/remove` billing text). Disconnecting "stops future data sharing only" — data the app already holds must be deleted by the app.

### 4.4 Bank-side OAuth revocation
- Users can also revoke at the institution's own consent portal (e.g. Chase Security Center). Effect: Item breaks. "If the end user revoked their permissions directly through the institution, **this webhook [`USER_PERMISSION_REVOKED`] may not always fire**, since some institutions' consent portals do not trigger this webhook" (verbatim). Instead the Item typically surfaces `ITEM_LOGIN_REQUIRED` (reason `OAUTH_USER_REVOKED`/`OAUTH_INVALID_TOKEN`) on next update attempt, via the `ERROR` webhook.
- Account-level (not Item-level) bank-side revocation: **`USER_ACCOUNT_REVOKED`** webhook — "fired when an end user has revoked access to their account on the Data Provider's portal. **Currently sent only for Chase, PNC, and Truist Items**... recommended to delete any Plaid-derived data... associated with the revoked account"; for Auth, the tokenized account number (TAN) stops working for new transfers (verbatim, OpenAPI).

### 4.5 Re-auth / update mode / credential expiry
- Triggers: password change at bank, MFA reset, expired bank-side OAuth token, expired consent window, institution migration to OAuth. Manifestation: API calls return **`ITEM_LOGIN_REQUIRED`** ("the login details of this item have changed (credentials, MFA, or required user action) and a user login is required to update this information" — verbatim error_message in spec example); webhook `ITEM: ERROR` carries the same error.
- Fix: **update mode** — create a link_token with `access_token` set (and `products` omitted); user re-authenticates (credentials or bank OAuth); **the `access_token` and `item_id` are unchanged** — no new public_token exchange is needed (docs: https://plaid.com/docs/link/update-mode/). Update-mode link_tokens expire in 30 minutes. Update mode is also used to: refresh expiring consent (`PENDING_DISCONNECT`/`PENDING_EXPIRATION`), add new accounts (`update.account_selection_enabled`), add credit products to an existing Item, and (when 1033-style expiration is enforced) run the DTM reauthorization flow.
- **`LOGIN_REPAIRED`** webhook: "Fired when an Item has exited the `ITEM_LOGIN_REQUIRED` state without the user having gone through the update mode flow in your app (this can happen if the user completed the update mode in a different app)." (verbatim)
- If update mode itself can't be launched (some revocation paths): "create a fresh Link token for the user" / delete via `/item/remove` and re-link (verbatim from `USER_PERMISSION_REVOKED` description + errors docs).

---

## 5. Webhooks

Per-Item webhook URL is set via `/link/token/create.webhook` and changed via `/item/webhook/update` (confirmation: `WEBHOOK_UPDATE_ACKNOWLEDGED` sent to the *new* URL). All payloads include `webhook_type`, `webhook_code`, `environment` (`sandbox`/`production`), and `item_id` (Item-scoped ones). Docs: https://plaid.com/docs/api/webhooks/.

### 5.1 Transactions webhooks (`webhook_type: TRANSACTIONS`)
| Code | Fires when (verbatim/condensed from spec) |
|---|---|
| `SYNC_UPDATES_AVAILABLE` | "Fired when an Item's transactions change... initial 30-day fetch..., backfill of historical transactions..., or... regularly-scheduled transactions update job." Fields: `initial_update_complete`, `historical_update_complete`. Requires `/transactions/sync` to have been called at least once on the Item. The recommended webhook for `/transactions/sync` consumers. |
| `INITIAL_UPDATE` | Initial pull (most recent 30 days) complete. Legacy — for `/transactions/get`; still fired for backward compatibility. Field `new_transactions`. |
| `HISTORICAL_UPDATE` | Full historical pull (up to `days_requested`, max 730 days) complete; also refires after account-selection updates. Legacy. |
| `DEFAULT_UPDATE` | "Fired when new transaction data is available for an Item. Plaid will typically check for new transaction data several times a day." Legacy. |
| `TRANSACTIONS_REMOVED` | Legacy; "Fired when transaction(s) for an Item are deleted," carries `removed_transactions[]` IDs. (`/transactions/sync` signals removals in-band instead.) |
| `RECURRING_TRANSACTIONS_UPDATE` | Recurring streams added/changed; carries `account_ids`. |

### 5.2 Item webhooks (`webhook_type: ITEM`)
| Code | Meaning |
|---|---|
| `ERROR` | "Fired when an error is encountered with an Item" — payload embeds the `PlaidError` (canonically `ITEM_LOGIN_REQUIRED`). "Can be resolved by having the user go through Link's update mode." |
| `LOGIN_REPAIRED` | Item exited `ITEM_LOGIN_REQUIRED` without your app's update-mode flow. |
| `PENDING_DISCONNECT` | "Fired when an Item is expected to be disconnected... fired 7 days before." **US/CA institutions.** `reason`: `INSTITUTION_MIGRATION` or `INSTITUTION_TOKEN_EXPIRATION`; field `disconnect_time`. Resolve via update mode. |
| `PENDING_EXPIRATION` | "Fired when an Item's access consent is expiring in 7 days." **EU/UK institutions.** Field `consent_expiration_time`. |
| `USER_PERMISSION_REVOKED` | User revoked access via Plaid (Portal/support); may not fire for bank-side revocation. Auth/Transfer TANs stop working (except US Bank Items). |
| `USER_ACCOUNT_REVOKED` | Account-level revocation at the data provider's portal (currently Chase, PNC, Truist). |
| `NEW_ACCOUNTS_AVAILABLE` | "Fired when Plaid detects a new account" — prompt update mode w/ Account Select (US/CA) to share it. |
| `WEBHOOK_UPDATE_ACKNOWLEDGED` | Webhook URL changed; sent to new URL with `new_webhook_url`. |

### 5.3 Verification, retries, IPs
- **Verification**: every webhook carries a **`Plaid-Verification` header containing a JWT** signed **ES256**. Verify: check `alg == ES256`; take `kid` from JWT header; call **`/webhook_verification_key/get`** with `key_id` to fetch the JWK public key; verify signature; then compare the JWT payload's `request_body_sha256` claim to the SHA-256 of the raw body (last step per docs page; endpoint/JWK schema verbatim in spec). Keys rotate — cache by `kid`, refetch unknown `kid`s. Docs: https://plaid.com/docs/api/webhooks/webhook-verification/.
- **Retry semantics** (docs /api/webhooks/, search-verified): non-200 or no response within **10 seconds** → retries for up to **24 hours**, each delay **4× the previous, starting at 30 seconds**; Plaid stops retrying if the receiver rejected >90% of webhooks over the last 24h; a `429` with `Retry-After` is honored (capped at 4 hours).
- **IP allowlist**: Plaid publishes webhook source IPs (e.g. `52.21.26.131` among them), "subject to change" — full list on /docs/api/webhooks/ (**exact full list UNVERIFIED** here; fetch before firewalling).

---

## 6. Is the connection live? Data freshness

- The connection is **persistent**: an Item, once created, is maintained by Plaid until removed/revoked/expired. Plaid pulls from the institution on its own schedule and caches; your API calls mostly read Plaid's cache.
- **Transactions**: Plaid runs scheduled update jobs "typically between one and four times per day, depending on the institution" (https://plaid.com/docs/transactions/). Updates announced via `SYNC_UPDATES_AVAILABLE` / `DEFAULT_UPDATE`. **No real-time feed exists.**
- **On-demand**: `/transactions/refresh` — "initiates an on-demand extraction to fetch the newest transactions... in addition to the periodic extractions that automatically occur one or more times per day for any Transactions-enabled Item." Synchronous against the bank (latency typically <10s, occasionally 30s+); fires the update webhooks if changes found; **separate per-request fee, access must be requested**; not supported for Capital One non-depository accounts (verbatim, OpenAPI). Investments/Statements have analogous `/investments/refresh`, `/statements/refresh` add-ons.
- **Balance**: `/accounts/get` is free and cached ("balance will typically update about once a day" on Items with a regularly-updating product); `/accounts/balance/get` forces a real-time balance pull (paid). (OpenAPI `/accounts/get` description, verbatim.)
- **Item health monitoring**: `/item/get` → `status.transactions.last_successful_update` / `last_failed_update`, `status.last_webhook`; `item.error` (populated e.g. with `ITEM_LOGIN_REQUIRED`); `update_type`. Dashboard also surfaces Item health. Recommended architecture: treat webhooks as the health signal (`ERROR`, `PENDING_DISCONNECT`, `LOGIN_REPAIRED`) rather than polling.

---

## 7. Production requirements

- **Environments**: exactly two API hosts — `https://sandbox.plaid.com` and `https://production.plaid.com` (verbatim, OpenAPI `servers`). The old "Development" environment was retired (mid-2024). Sandbox is free, fully featured, simulated data, with helpers (`/sandbox/public_token/create`, `/sandbox/item/reset_login`, `/sandbox/item/fire_webhook`).
- **Free production tiers**: historically "Limited Production"; **as of April 15, 2026 new Limited Production signups are closed for US/CA** and replaced by a **Trial plan**: "use Plaid with real production data at no cost, supporting up to 10 Production Items," most OAuth institutions included. On Trial, `/item/remove` doesn't return Trial Item quota. Source: https://support.plaid.com/hc/en-us/articles/16110110883479 (search-verified).
- **Full production**: Dashboard flow — pass endpoint validation, then "Request Production Access"; provide company/use-case details, accept terms, add billing. "Allow at least one week for your request to be processed." OAuth institution registration then proceeds per-institution (mostly automatic; some, e.g. **Charles Schwab, up to six weeks**; **PNC gated on the Security Questionnaire**). Sources: https://plaid.com/docs/launch-checklist/, https://plaid.com/docs/link/oauth/.
- **Security questionnaire**: required for access to certain US OAuth institutions; covers deployment process, authN enforcement, encryption of consumer data at rest/in transit, access controls, incident response. (Questionnaire v6 content circulates publicly; gist example.) Plaid also operates a Security Portal for diligence (https://plaid.com/blog/plaid-launches-security-portal/).
- **Token/credential storage expectations**: exchange public_token server-side; never expose `access_token`, `client_id`+`secret` client-side; encrypt tokens at rest; keep `secret` in a secrets manager. (Launch checklist + questionnaire, search-verified.)
- **API auth**: every request carries `client_id` + `secret` — "may be provided either in the `PLAID-CLIENT-ID`/`PLAID-SECRET` header[s] or as part of a request body" (verbatim). Each environment has its own `secret`. Secrets can be **rotated from the Dashboard (Team Settings → Keys)** with two active secrets during rotation (**rotation UI details UNVERIFIED** — Dashboard-only page). Per-Item compromise: `/item/access_token/invalidate`.
- Plaid API version pinning: versioned API (current wire version `2020-09-14`).

---

## 8. New in 2025–2026

1. **CFPB 1033 in limbo**: Oct 2024 final rule → industry suit (*Forcht Bank v. CFPB*) → post-administration-change CFPB called the rule unlawful → court **enjoined enforcement** and stayed litigation while CFPB runs a **new rulemaking** (ANPR Aug 2025 reopening: who counts as authorized third party, data security/privacy, and **whether data providers may charge fees**). The April 2026 first compliance deadline passed without effect. Sources: https://www.consumerfinancialserviceslawmonitor.com/2025/07/cfpb-section-1033-open-banking-rule-stayed-as-cfpb-initiates-new-rulemaking/, https://bankingjournal.aba.com/2025/10/court-temporarily-halts-section-1033-rule-enforcement/, https://www.openbankingtracker.com/guides/section-1033-status.
2. **Bank data-access fees**: JPMorgan Chase announced charging aggregators for API data pulls (1.89B requests in June 2025; only ~13% tied to real-time user action); **Plaid signed a paid data-access agreement with JPMC (Sept 2025)**; by Nov 2025 JPMC had updated contracts covering >95% of its open-banking data requests. Plaid stated "no changes to current contracts or pricing" for its customers "at this time." Expect bank-imposed consent windows/fees to spread contractually despite 1033 pause. Sources: https://www.paymentsdive.com/news/plaid-to-pay-for-jpmorgan-data-open-banking-fintechs/760192/, https://www.forbes.com/sites/jeffkauflin/2025/07/21/why-jpmorgan-is-hitting-fintechs-with-stunning-new-fees-for-data-access/.
3. **Consent machinery shipped ahead of regulation**: DTM (use cases + data scopes in Link), `consented_products`/`consented_use_cases`/`consented_data_scopes` on `/item/get`, `/consent/events/get` (logs from Nov 7 2024, 3-year retention), `/item/activity/list`, dormant 12-month DTM reauthorization flow in update mode, July 2026 mandatory Signal consent (`ADDITIONAL_CONSENT_REQUIRED`).
4. **Offboarding hygiene formalized**: `reason_code` on `/item/remove`; new **`/item/products/terminate`** endpoint now "the recommended way to offboard users."
5. **`USER_ACCOUNT_REVOKED`** webhook (account-level bank-portal revocation; Chase/PNC/Truist).
6. **Link/user platform changes**: `user_id` via `/user/create` mandatory for new Protect / Multi-Item Link / Plaid Check integrations after **Dec 10, 2025**; Multi-Item Link (`enable_multi_item_link`); Hosted Link mainstream incl. SMS/email Link Delivery (beta); `appearance_mode`; Fidelity added as pinnable institution (Aug 2026); MCP server for data partners (Aug 2026, early access — AI-agent access to integration diagnostics). Sources: OpenAPI; https://plaid.com/blog/product-updates-august-2026/.
7. **OAuth/API coverage**: 100% of traffic to the biggest US banks (Chase, Capital One, USAA, Wells Fargo) has been API-based since 2023; Plaid's older public figure was "80% of traffic on or committed to APIs" and OAuth is mandatory in all new US/EU/UK integrations. A precise 2026 OAuth-share % is **UNVERIFIED** (Plaid hasn't published a current single number); Dashboard now shows live per-institution migration status (May 2025). Sources: https://plaid.com/blog/api-progress-update/, https://plaid.com/blog/product-updates-may-2025/.
8. **Plaid for banks**: **Core Exchange** (FDX-standard API implementation for data providers, supports FDX 4.6+, deployable "in as little as six weeks") positioned as banks' 1033/open-finance on-ramp; "Plaid Exchange" branding has been superseded by Core Exchange. FDX conformance = "indicia of compliance" for 1033 API documentation requirements. Sources: https://plaid.com/products/core-exchange/, https://plaid.com/blog/navigating-section-1033-data-providers/.
9. **Trial plan replaces Limited Production** for new US/CA teams (April 15, 2026) — see §7.

---

## Answers to the client's Part I questions

1. **What is an Item?** One user's authenticated connection to one financial institution (one login), created through Plaid Link. It groups 1..n accounts, carries the product set + user consent (use cases/data scopes), a webhook URL, health/error state, and billing. Same credentials linked twice = two independent Items.
2. **What is an access token? How sensitive?** The long-lived server-side credential your backend uses (with `client_id`+`secret`) to call Plaid for that Item; obtained by exchanging Link's ephemeral `public_token` (30-min TTL) at `/item/public_token/exchange`. Sensitivity: it unlocks all consented data for that connection for as long as consent stands — store server-side only, encrypted at rest, never client-side/logs; useless without your API secret but treated as a bank-data credential in Plaid's security review.
3. **How long does it survive?** "An `access_token` does not expire" (Plaid docs, verbatim). It dies only by `/item/remove` or `/item/products/terminate`, rotation via `/item/access_token/invalidate`, or is *functionally* neutered by user/bank revocation or consent expiry (token persists, calls fail with `ITEM_LOGIN_REQUIRED`/`USER_PERMISSION_REVOKED` errors). No proactive refresh loop is needed.
4. **Can permissions be scoped?** Yes, two axes fixed at link time: **products/data scopes** (`products`, `required_if_supported_products`, `optional_products`, `additional_consented_products` → DTM consent; visible in `consented_products`/`consented_data_scopes`) and **accounts** (Account Select / bank OAuth picker / `account_filters`). Broadening scope requires a new user consent session (update mode or re-link). Narrowing: products can't be removed from an Item; users can revoke per-account at some banks or via Portal.
5. **Can access be revoked? By whom?**
   - **Integrator**: `/item/remove` (kills token + all derived processor tokens, ends subscription billing) or `/item/products/terminate` (recommended offboarding; ends billing, fires webhooks).
   - **Borrower**: (a) Plaid Portal my.plaid.com — revoke the app, revoke Plaid, request Plaid-side data deletion → `USER_PERMISSION_REVOKED` fires, billing ends; (b) the bank's own OAuth/consent portal → Item breaks; webhook may be `USER_ACCOUNT_REVOKED` (Chase/PNC/Truist, account-level) or nothing until the next update fails with `ITEM_LOGIN_REQUIRED` (`OAUTH_USER_REVOKED`). Caveat both directions: `/item/remove` may leave a stale "active" entry in the bank's OAuth manager, and bank-side revocation may not ping Plaid — neither side's off-switch reliably cleans up the other's UI.
   - Revocation stops *future* access only; data already delivered to the integrator stays with the integrator.
6. **Reauthentication / credential expiry / OAuth consent expiry**: any of password change, MFA reset, bank OAuth token invalidation, or consent-window lapse ⇒ Item enters `ITEM_LOGIN_REQUIRED`; Plaid sends `ITEM: ERROR` webhook; data serving from the bank stops (cache remains readable in some products). Recovery = **update mode**: `/link/token/create` with the existing `access_token`, user re-authenticates, same `access_token`/`item_id` continue — no exchange, no data loss, transaction history continuity preserved. Advance warnings: `PENDING_DISCONNECT` (US/CA, 7 days, reasons `INSTITUTION_TOKEN_EXPIRATION`/`INSTITUTION_MIGRATION`) and `PENDING_EXPIRATION` (EU/UK, 7 days). `LOGIN_REPAIRED` says the Item healed elsewhere. US consent windows currently exist only at specific institutions (Capital One, PNC, et al., ~12 months) via their data agreements; the 1033 12-month reauth regime is built but dormant.
7. **How do webhooks communicate these events?** Per-Item HTTPS POSTs to your `webhook` URL: lifecycle under `webhook_type: ITEM` (`ERROR`, `PENDING_DISCONNECT`, `PENDING_EXPIRATION`, `USER_PERMISSION_REVOKED`, `USER_ACCOUNT_REVOKED`, `NEW_ACCOUNTS_AVAILABLE`, `LOGIN_REPAIRED`, `WEBHOOK_UPDATE_ACKNOWLEDGED`); data under `webhook_type: TRANSACTIONS` (`SYNC_UPDATES_AVAILABLE` + legacy `INITIAL_UPDATE`/`HISTORICAL_UPDATE`/`DEFAULT_UPDATE`/`TRANSACTIONS_REMOVED`). Authenticate every delivery via the `Plaid-Verification` ES256 JWT + `/webhook_verification_key/get` + body-hash check. Delivery is at-least-once with 24h exponential retries — design handlers to be idempotent and to treat webhooks as "go fetch" signals, not payloads of record.

---

## Production workflow trace: "Connect Operating Accounts" → data in backend

Actors: **B** = borrower, **F** = integrator frontend, **S** = integrator backend, **P** = Plaid, **K** = bank.

1. **B→F**: clicks "Connect Operating Accounts."
2. **F→S**: authenticated request `POST /api/plaid/link-token` (integrator's own API).
3. **S→P**: `POST /link/token/create` with `client_id`+`secret`, `client_name`, `user.client_user_id` (internal borrower ID, no PII), `products: ["transactions"]`, optionally `additional_consented_products` (e.g. `auth`, `liabilities`) for future use, `transactions.days_requested: 730` (max history for underwriting), `country_codes: ["US"]`, `webhook: https://api.integrator.com/plaid/webhooks`, `redirect_uri` (pre-registered in Dashboard), `account_filters.depository.account_subtypes: ["checking","savings"]`.
4. **P→S→F**: returns `link_token` (4h TTL); backend forwards it to the frontend.
5. **F**: initializes Plaid Link (JS/iOS/Android SDK or Hosted Link URL) with the `link_token`. Link opens.
6. **B in Link (P UI)**: sees the **consent pane** (app name, Plaid's role/privacy policy; with DTM: use cases + data scopes) → accepts → **selects institution**.
7. Branch — **OAuth institution** (majority of US traffic): Link redirects B to **K**'s site/app; B logs in at the bank, picks which accounts to share on the bank's screen, approves; K redirects back to `redirect_uri`; F re-initializes Link with the received OAuth state to resume. — **Non-OAuth institution**: B enters bank credentials in Link; P authenticates against K; B answers any **MFA** challenge in Link.
8. **B in Link**: **Account Select** pane (unless fulfilled by the bank's OAuth picker) — confirms the operating account(s) → success pane ("Connected").
9. **F**: Link `onSuccess(public_token, metadata)` fires (metadata: institution, selected accounts, `link_session_id`). F sends `public_token` to S. (public_token TTL: 30 min.)
10. **S→P**: `POST /item/public_token/exchange` → receives **`access_token`** + **`item_id`**. S encrypts and persists both against the borrower record; never returns them to F.
11. **P→K (async)**: P begins the initial data pull for consented products: first ~30 days of transactions, then historical backfill up to `days_requested`.
12. **S→P (immediately after exchange)**: first `POST /transactions/sync` with the `access_token` (cursor empty) — returns whatever is ready and, importantly, arms `SYNC_UPDATES_AVAILABLE` for this Item. May also call `/accounts/get`, `/auth/get`, `/identity/get` as consented.
13. **P→S (webhook)**: `TRANSACTIONS: SYNC_UPDATES_AVAILABLE` with `initial_update_complete: true` (≈seconds–minutes), later again with `historical_update_complete: true` (minutes, longer for large `days_requested`). S verifies the `Plaid-Verification` JWT before trusting either.
14. **S→P**: on each webhook, loops `POST /transactions/sync` with stored cursor until `has_more: false`; upserts `added`/`modified`, tombstones `removed`; stores new cursor atomically. **Transactions now landed in the integrator's backend.**
15. **Steady state**: P re-polls K ~1–4×/day; every change → `SYNC_UPDATES_AVAILABLE` → step 14 repeats. For on-demand freshness before a credit decision, S calls `POST /transactions/refresh` (paid add-on) and waits for the webhook. Item health watched via `ITEM:*` webhooks and periodic `/item/get`.
16. **Exception paths**: `ERROR (ITEM_LOGIN_REQUIRED)` / `PENDING_DISCONNECT` → S flags borrower, F prompts "reconnect your bank," S creates update-mode link_token (`access_token` set), B re-auths (steps 5–8 abbreviated), same tokens continue. `USER_PERMISSION_REVOKED` / `USER_ACCOUNT_REVOKED` → S halts use, per policy deletes derived data, prompts re-link. Offboarding → S calls `/item/products/terminate` (or `/item/remove`) to kill access and stop billing.

---

## Key source URLs
- OpenAPI spec (verbatim quotes): https://github.com/plaid/plaid-openapi (2020-09-14.yml @ 2026-08-17)
- https://plaid.com/docs/api/link/ · https://plaid.com/docs/api/items/ · https://plaid.com/docs/api/tokens/
- https://plaid.com/docs/link/ · https://plaid.com/docs/link/oauth/ · https://plaid.com/docs/link/update-mode/ · https://plaid.com/docs/link/initializing-products/ · https://plaid.com/docs/link/data-transparency-messaging-migration-guide/ · https://plaid.com/docs/link/customization/
- https://plaid.com/docs/api/webhooks/ · https://plaid.com/docs/api/webhooks/webhook-verification/ · https://plaid.com/docs/transactions/ · https://plaid.com/docs/transactions/webhooks/ · https://plaid.com/docs/api/products/transactions/
- https://plaid.com/docs/errors/item/ · https://plaid.com/docs/launch-checklist/ · https://plaid.com/docs/sandbox/
- https://support.plaid.com/hc/en-us/articles/16110110883479 (environments/Trial) · https://support-my.plaid.com/hc/en-us/articles/4410328321303 (Portal)
- 1033/fees: consumerfinancialserviceslawmonitor.com (2025/07 stay), bankingjournal.aba.com (2025/10 injunction), paymentsdive.com/news/plaid-to-pay-for-jpmorgan-data-open-banking-fintechs/760192/, forbes.com (2025/07/21 JPMC fees)
- 2026 updates: https://plaid.com/blog/product-updates-august-2026/ · https://plaid.com/blog/product-updates-may-2025/ · https://plaid.com/products/core-exchange/
