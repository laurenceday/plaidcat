# DefiLlama API Probing — Findings

Date: 2026-09-05
Method: raw HTTP (curl) + real-Chrome headful browser via Playwright to pass Cloudflare.
Raw evidence in `raw/`.

## TL;DR
Every market-maker endpoint is **Cloudflare-JS-challenged** at the edge. Plain `curl`
(even with a Chrome User-Agent and full `Sec-CH-UA` client hints) gets `403` with a
"Just a moment…" challenge page and header `cf-mitigated: challenge`. A **real Chrome
render** passes the challenge, sets `cf_clearance`, and the same route returns `200`
application/json. So the data is public but gated behind a browser challenge, not by
auth.

## The frxUSD path is the exception (clean, no challenge)
Read-side verification API on the preview host `vrtnd.ll4m4.com`:

  GET https://vrtnd.ll4m4.com/api/public/verified/frxusd  -> 200 JSON, plain curl.

- CORS `access-control-allow-headers: Content-Type,Authorization,X-Requested-With`
- `cache-control: public, max-age=60, stale-while-revalidate=300`
- `x-robots-tag: noindex, nofollow`
- Response shape: `{projectId, projectName, state:{upToDate}, data:{balances,
  totalValueUsd, assets[], liabilities{frxusdSupply, frxusdSupplyByChain,
  frxusdLockedInFraxtalBridge, frxusdSupplyUsd}}}`
- Snapshot captured: `totalValueUsd = 111,957,619`, `frxusdSupply = 113,129,506`,
  reserves split across USDC/WTGXX/BUIDL/USTB holdings in named wallets
  (Redemption Contract, BitGo Trust Account, Solana Primary Multisig).
- Unknown-id probe: `GET /api/public/verified/<id>` returns `404 {"error":"Unknown verified project"}`
  for usdsd/usdt/aave/usdc (only `frxusd` is currently live there).
- `/api/public/verified`, `/api/verified`, `/api`, `/api/v1/verified` all 404 (Next.js HTML),
  i.e. no index listing route is exposed.

**This confirms the "read-side only" distinction:** the result endpoint is public; there
is no observed public create/connect/consent route.

## Market-maker leaderboard endpoints (gated but reachable in-browser)
Base: `https://defillama.com/api/public/market-makers/`
Query (all of them take it, optional): `start_date`, `end_date` (ISO dates, ~30d window),
`_n` (client nonce, timestamp ms).

Six of the seven slugs fire from their subpages and returned 200:

| slug | triggers from | size | captured file |
|------|----------------|------|----------------|
| `aggregated` | `/market-makers` | 38.7 KB | mm-api-*aggregated* |
| `performance` | `/market-makers` | 17.3 KB | mm-api-*performance* |
| `depth` | `/market-makers/depth` | 120.1 KB | mm-api-*depth* |
| `kpi` | `/market-makers/kpi` | 26.1 KB | mm-api-*kpi* |
| `spread` | `/market-makers/spread` | 16.3 KB | mm-api-*spread* |
| `volume` | `/market-makers/volume` | 37.4 KB | mm-api-*volume* |
| `details` | per-row click (JS route) | not fired | — (route exists but needs a market-makerId row interaction) |

Top-1 in the snapshot window (2026-08-06 → 2026-09-05) is `flowdesk`
(rank 1, composite 9.4, grade AA, medianEngagementsFdv ~$50.9M); `gsr` and `auros` follow.

### Field vocabulary (from `aggregated` and `performance`)
`marketMakerId`, `marketMakerName`, `marketMakerImageUrl`, `rank` (percentile/value),
`bidAskDepth` (percentile/rank/value), `bidAskDepthMarketPercentage` (pct/rank/value),
`combinedUptime`, `dailyFillVolume`, `dailyFillVolumeMarketPercentage`,
`depthLoanUtilization`, `topOfBookSpread`, `volumeLoanUtilization`, `composite`, `grade`,
`coverageCapabilities`, `integrationLevel`, `integrationStatus`, `tradingKpis`,
`trustIntegration`, `uptime`, `activeEngagementsCount`, `medianEngagementsFdv`.

## How the challenge is broken (to reproduce)
```
chromium.launch({ headless:false, channel:'chrome',
  args:['--disable-blink-features=AutomationControlled'] })
ctx: userAgent = Chrome/126 macOS, viewport 1280x900
goto('https://defillama.com/market-makers', waitUntil:'domcontentloaded')
waitForTimeout(18000)   // challenge auto-clears, cf_clearance set
```
Then visit each `/market-makers/{depth,kpi,spread,volume}` to fire its XHR and capture the
`response` event. `capture_mm.mjs` + `capture_mm2.mjs` are the working scripts.

What did NOT work: curl with UA only; curl with UA + full Sec-CH-UA/Sec-Fetch headers
(still 403 challenge — CF is doing JS/TLS fingerprinting, not header checks).
`api.llama.fi/public/market-makers/*` → 404 (not the host). `vrtnd.ll4m4.com/api/public/
market-makers/kpi` → 502. `api.defillama.com` → 000 (DNAT/DNS doesn't resolve).
Wayback: no archived snapshots for the page or the API.

## What's still unknown
- `details`: needs a `marketMakerId` row click; schema not captured yet.
- Whether the challenge is IP-rate-based (repeated in-browser fetches may re-challenge).
- No server-side cookie jar was exported; a `cf_clearance` cookie + matching TLS
  fingerprint would be needed for headless reuse — Playwright's real-Chrome render is
  the reliable path.
