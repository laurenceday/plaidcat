# Audit round 1: risk-register concern claim-accuracy

Verbatim Warden record. Kept outside the prose mask, like the research
streams, because it quotes page and stream text as evidence; the imprimatur
exemption for raw evidence artifacts applies.

Scope: all 11 HTML pages at /home/user/plaidcat vs the six stream files in /home/user/plaidcat/research/.
Method: every specific number, date, name, quote and verdict on each page traced to stream text; badges compared to the streams' own confidence labels (OFFICIAL / OPERATOR-REPORTED / INFERRED / ESTIMATE / LORE / UNVERIFIED).

Headline: no page-vs-stream contradiction was found on a load-bearing number, date or quote — the decisive figures (730 days, 731, ~$9k/39 purchases, 2025-10-29 injunction, ~$31M 3Jane TVL, 95% of SMB-serving banks, ~40% of depository accounts, $56M Goldfinch, $58M settlement, 12-month BofA/PNC/CapOne consent, $2.5M/$36M Orthogonal, 77k Coinbase Verifications, all endpoint and webhook spellings) all match their streams. The findings are badge inflation on searched-absence and estimate claims, one institution-row overstatement, and a set of low-grade imprecisions.

---

## Medium

**1. WRONG-BADGE — coverage.html §2 institution table (line 110): "Mercury / Brex / Relay / Bluevine … First-class Plaid institutions. … `official`"**
- Stream evidence: research-C-business-coverage.md applies "first-class Plaid institution" only to Mercury ("Yes — first-class Plaid institution (Assets, Auth, Balance, Transactions)… **OFFICIAL**"). For Brex it says "Yes — connectable via Plaid (QB-via-Plaid lists Brex) … **OPERATOR-REPORTED** (Plaid connectivity): https://www.finder.com/…" — only the Capital One acquisition is OFFICIAL. Relay and Bluevine are sourced to those fintechs' own help pages, not Plaid.
- Why it matters: a BD reader could rely on Brex being a verified Plaid institution when the stream's support is a third-party listing, and Brex is expected to migrate onto Capital One's OAuth estate.
- Minimal fix: keep the row but split the badge: Mercury `official`; Brex connectivity `operator-reported` (acquisition `official`); Relay/Bluevine "per the banks' own docs". Drop "first-class" for all but Mercury.

**2. OVERCLAIM + WRONG-BADGE — commercial.html §4 (lines 164-166): "No premium-institution surcharge exists as of August 2026. … `official`"**
- Stream evidence: research-E-pricing.md §3: "**No 'premium institution' surcharge found as of Aug 2026** (searched explicitly; **absence of evidence, not proof — ESTIMATE**: risk remains that surcharges appear at renewal…)".
- The page converts a searched absence into a verified negative and badges it official. A reader budgeting fees could act on it.
- Minimal fix: "No premium-institution surcharge has been found as of August 2026 (absence of evidence, not proof)" with badge `inferred`.

**3. WRONG-BADGE — the "SOC 2-shaped questionnaire" judgment, badged `official` on commercial.html §3 (line 117: "the security questionnaire gates certain banks and is effectively SOC 2-shaped. `official`") and `operator-reported` on technical.html §7 (lines 328-331: "The security questionnaire is effectively SOC 2-shaped… A team without those controls will struggle. `operator-reported`")**
- Stream evidence: research-E-pricing.md §4: questionnaire *contents* are OFFICIAL (mirror), but "SOC 2 is not literally mandated, but the questionnaire is effectively a SOC 2-shaped attestation — a company without SOC 2-grade controls will struggle to pass (**ESTIMATE** from questionnaire contents)."
- The characterization is the stream's own inference; both badges are stronger than ESTIMATE.
- Minimal fix: badge the "effectively SOC 2-shaped / will struggle" sentence `inferred` on both pages (the questionnaire-contents list may stay `official`).

**4. OVERCLAIM — commercial.html §3 (lines 119-124): "No prohibited-industries bar touches the data products; only the Transfer payments product carries one. … `official`"**
- Stream evidence: research-E-pricing.md §4: "**No blanket prohibition on crypto found** in the Developer Policy or elsewhere; no operator reports of crypto firms being rejected for *data* products surfaced in searches (**absence noted explicitly**)." Only the Transfer prohibited list is directly OFFICIAL.
- The page states the negative as verified fact under an official badge; the stream frames it as a searched absence.
- Minimal fix: "No prohibited-industries bar was found on the data products (Transfer, the payments product, does carry one `official`)" and badge the negative `inferred`.

---

## Low

**5. MISMATCH (actor) — technical.html §1 flow table, step 4 (line 122): "P → F | Returns a `link_token`, valid four hours."**
- Stream evidence: research-A-technical.md trace step 4: "**P→S→F**: returns `link_token` (4h TTL); backend forwards it to the frontend." /link/token/create is a server call; Plaid returns the token to the backend, not the frontend.
- Minimal fix: change the actor cell to "P → S → F".

**6. IMPRECISION — PNC consent window generalized. coverage.html §2 (line 108): "PNC business online … 12-month consent windows"; also grouped generically on index.html (line 239) and technical.html §3 (lines 222-226).**
- Stream evidence: research-A-technical.md §3.2: "PNC (**TAN-holding Items** require re-authorization within past 12 months)"; research-C §2: "Items **with Auth** after Oct-2024 carry consent_expiration_time = 1 year." The streams scope the 12-month window to PNC Auth/TAN Items, not all PNC Items.
- Minimal fix: on coverage.html say "12-month consent windows on Items with Auth (post-Oct-2024)".

**7. IMPRECISION (cherry-picked bound) — commercial.html §1 (line 67): "Balance about $0.05"**
- Stream evidence: research-E-pricing.md §2: "Balance | $0.05–$0.15/call | OPERATOR-REPORTED — PriceLevel ($0.05), Vendr range".
- Minimal fix: "$0.05 to $0.15 per call".

**8. INTERNAL INCONSISTENCY — statements coverage stated two ways. commercial.html §2 (line 88): "statements monthly where supported (about 60% of institutions)" vs products.html (line 145) and stream B: "around 40% of US depository accounts."**
- Stream evidence: the 60% is stream E's own modeling assumption ("available at ~60% of institutions, ESTIMATE-laden cost model"); the 40% is stream B's coverage figure (different unit: share of depository accounts). Both trace, but a reader sees two coverage numbers with no reconciliation.
- Minimal fix: on commercial.html mark "(model assumption; see the ~40%-of-depository-accounts coverage figure on the products page)".

**9. ORPHAN + STALE FIGURE — 3Jane framing. bd-primer.html objection table (line 110): "the one live protocol running this exact pattern (3Jane) is growing"; moat.html (line 64): "Live on Base, ~$31M TVL" presented as Aug-2026 status.**
- Stream evidence: research-F-architecture.md §1.6: "~$31M TVL **as of Jan 2026**"; status "Alive, early". No stream statement that 3Jane is growing (the ~25% growth claim in F is about RedStone-rated Morpho vaults, not 3Jane).
- Minimal fix: drop "and is growing" (or say "live"); date the TVL "(~$31M, Jan 2026)".

**10. IMPRECISION (over-generalized policy) — coverage.html §3 "Entitlement lockout" card (lines 135-139): "only the primary owner's login can share business accounts" stated as a universal rule.**
- Stream evidence: research-C §4: the primary-owner-only rule is documented for **BofA** ("Plaid help center (BofA article): only the primary account holder's username can link business accounts… similar patterns reported at other banks").
- Minimal fix: "at BofA (and reportedly at other banks), only the primary owner's login…". (The §2 table row already scopes it correctly to BofA.)

**11. MISSING BADGE on an inferred claim — coverage.html §1 diagram (line 83): "OAuth handles even hardware-token MFA" inside the settled-green box.**
- Stream evidence: research-C §4 labels this "**INFERRED + OPERATOR-REPORTED**" ("under OAuth the bank's own login page handles any MFA (incl. Wells Fargo's RSA SecurID)…"). Same claim is repeated unhedged in bd-primer.html's objection table (line 107).
- Minimal fix: soften to "OAuth hands MFA to the bank's own login page (incl. hardware tokens)" or move the line out of the green settled zone.

**12. IMPRECISION (date conflation) — legal.html §3 timeline (line 201): "2025-08 | CFPB pivots to reconsideration; advance notice reopens fees…"**
- Stream evidence: research-D §3: "**2025-07**: CFPB pivots from vacatur to reconsideration… **2025-08**: ANPR issued". The pivot was July; only the ANPR was August.
- Minimal fix: either split the rows or reword to "2025-07/08".

**13. WRONG-BADGE (minor) — commercial.html §4 "Renewal mechanics" card (lines 138-142): the card's single `official` badge also covers "operators report 5-10% annual escalators".**
- Stream evidence: research-E §7: escalators are "(OPERATOR-REPORTED — Vendr)"; the MSA terms in the same card are OFFICIAL-template. The inline "operators report" phrasing self-labels, but the badge contradicts it.
- Minimal fix: add an `operator-reported` badge to the escalator sentence or move it out of the official-badged card.

---

## Counts

| Severity | Count |
|---|---|
| High | 0 |
| Medium | 4 |
| Low | 9 |
| **Total** | **13** |

---

## Disposition (same round)

All 13 findings fixed on the pages on 2026-08-26: badges corrected to the
streams' own labels (findings 1-4, 11, 13), the token-path actor corrected
(5), PNC consent scoped to Auth Items (6), the Balance price range widened
(7), the statements model assumption reconciled against the coverage figure
(8), the 3Jane TVL dated and the growth claim dropped (9), the
primary-owner rule scoped to BofA with operator reports elsewhere (10), and
the 1033 pivot dates split (12). Round closes clean: 0 high, 0 open.
