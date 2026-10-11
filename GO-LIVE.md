# GO-LIVE — connecting the robot to real accounts

The game's 🛰 Live Ops mode runs the robot against **mock** connectors that return Etsy Open API v3 / Shopify Admin API / Printify API v1 shaped data. The robot logic only talks to an `Adapter` interface (`MockAdapter` | `LiveAdapter` in `liveops.js`); live mode swaps adapters, same logic.

**Security rules:** the static GitHub Pages site and browser localStorage never hold keys (only the backend URL). All secrets live in the backend (the private repo `Applesdg/robot-founder-server`, Cloudflare Worker secrets). The backend — not the game — enforces approvals: going live (listings/products), spending over $40/order, any new subscription, and refunds over $25 return `202 pendingApproval` until Dom taps a signed approval link.

## Accounts / keys needed
1. **Etsy** seller shop (ID + bank verified) → developer app at etsy.com/developers → keystring + shared secret. Scopes: `listings_r listings_w transactions_r transactions_w shops_r email_r`. Redirect: `https://<worker>/oauth/etsy/callback`. Note: Etsy has no refund API — the robot drafts, Dom issues in Shop Manager.
2. **Shopify** store (Basic $39/mo, Shopify Payments) → custom app in the Dev Dashboard → client id/secret; scopes `read_orders,write_orders,read_products,write_products,write_fulfillments,read_customers`; webhooks `orders/paid, refunds/create, disputes/create` → `/webhooks/shopify`.
3. **Printify** account → Connections → API → Personal Access Token; webhooks `order:sent-to-production, order:shipment:created, order:shipment:delivered` → `/webhooks/printify`; card on file.
4. **AI keys** (image + LLM) — backend secrets only.
5. **Cloudflare** account (free) for the Worker + KV.

## Setup (when Dom is ready — nothing here has been done)
```
gh repo clone Applesdg/robot-founder-server && cd robot-founder-server && npm i -g wrangler && wrangler login
wrangler kv namespace create KV         # paste id into wrangler.toml
for s in ETSY_CLIENT_ID ETSY_CLIENT_SECRET SHOPIFY_CLIENT_ID SHOPIFY_CLIENT_SECRET PRINTIFY_TOKEN DOM_APPROVAL_SECRET SESSION_SECRET; do wrangler secret put $s; done
wrangler deploy                          # MODE stays "mock"
```
Visit `/oauth/etsy/start` and `/oauth/shopify/start` to link. Paste the Worker URL into the game's Connections panel. Run a week in mock, then set `MODE="live"` and redeploy.

## Backend security (implemented in robot-founder-server, tested offline with `npm test`)
- **Game → worker auth:** every `/api/*` request carries `x-rf-ts` + `x-rf-sig` = HMAC-SHA256(GAME_SHARED_SECRET, ts⏎method⏎path⏎body); 5-minute window, replayed signatures rejected. Dom types the key into the game once per tab; it is held in memory only.
- **One route contract:** the game converts real API paths to canonical paths (`canon()` in liveops.js, e.g. `/v3/application/shops/{shop_id}/listings` → `/listings`); the worker allow-list lives in `src/routes.js`; `test/client-paths.json` is captured from a real simulation run and checked against it.
- **Webhooks verified:** Shopify `X-Shopify-Hmac-Sha256` (base64 HMAC of raw body with app secret); Printify `X-Pfy-Signature: sha256=<hex>` (PRINTIFY_WEBHOOK_SECRET); deduped by webhook id.
- **Etsy token refresh:** tokens saved with expiry; refreshed on demand 2 min before expiry and by a 30-min cron.
- **Approvals enforced server-side:** golive (publish/edit/retire listings, photos, sales), spend over AUTO_SPEND_CAP (or unknown cost), refunds over AUTO_REFUND_CAP → stored, Dom gets a signed link via the pluggable notifier (`src/notify.js`: log | webhook e.g. ntfy/Pushover/Slack | email e.g. Resend/Postmark). Links expire after 7 days.
- Etsy has no refund API: refunds become a notification for Dom to tap in Shop Manager.

## Still TODO before live
- Wire a real notifier provider; ads budget connector (Etsy Ads / Meta have no simple budget API for this — robot proposes, Dom sets); Shopify customer messaging via an email app.


## Always-on worker (built, NOT deployed) — `Applesdg/robot-founder-server`
Hourly cron runs: research (reads `research/backlog.json` from the daily Action) → ideas → art (image provider) → listing drafts (text provider) → grader (rewrite if <70, drop if <60) → Printify product drafts → **approval queue** → publish approved listings ≤ `DAILY_PUBLISH_CAP`/day → new orders → Printify order (auto only ≤ `AUTO_SPEND_CAP`, ≤ `DAILY_SPEND_CAP`/day; else approval) → 8 PM ET digest.
Safety: per-hour idempotency + lock, `KILL_SWITCH` / `POST /api/worker/kill`, `MONTHLY_AI_BUDGET` hard cap with cost log, all writes through the same server-side approval gate as the game API. Customer inbox: Cloudflare Email Routing (`email()` handler) or provider webhook `POST /webhooks/email` (header `x-inbound-token`) → classify → draft reply (+ AI proof for custom requests) → signed link to Dom. **Etsy messages must be sent by Dom in the Etsy app** (no messaging API); the link shows the text to paste. Tests: `npm test` (route contract, signatures, approvals, loop, caps, budget, inbox) — all offline mocks.

### Exact accounts & keys
| What | Account to create | Secret / var |
|---|---|---|
| Etsy | Seller shop + developer app | `ETSY_CLIENT_ID` (keystring); OAuth via `/oauth/etsy/start` |
| Shopify | Store (Basic) + custom app | `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, var `SHOPIFY_SHOP`; install via `/oauth/shopify/start` |
| Printify | Account + API token + webhook | `PRINTIFY_TOKEN`, `PRINTIFY_WEBHOOK_SECRET`, `PRINTIFY_SHOP_ID` |
| Text AI | OpenAI or Anthropic API | `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`; var `TEXT_PROVIDER` |
| Image AI | OpenAI API (gpt-image-1) | `OPENAI_API_KEY`; var `IMAGE_PROVIDER=openai` |
| Notifier | Quo (SMS) or email API or webhook | `QUO_API_KEY`, `QUO_FROM_NUMBER`, `DOM_PHONE` (var `NOTIFIER=quo`) — or `EMAIL_API_URL/KEY`, `DOM_EMAIL` |
| Inbox | Cloudflare Email Routing on a domain (or Postmark/Resend inbound) | `INBOUND_EMAIL_TOKEN` (webhook option) |
| Backend | Cloudflare account (Workers + KV) | `GAME_SHARED_SECRET`, `DOM_APPROVAL_SECRET`, KV namespace id |

### Monthly cost estimate (ESTIMATES, Oct 2026 list prices — verify)
| Item | Est. / month |
|---|---|
| Cloudflare Workers + KV (free tier covers hourly cron + light traffic; Paid plan $5 if exceeded) | $0–5 |
| Text AI (~90 listing drafts + rewrites, ~150 replies/classifications; gpt-5-mini ≈ $0.25/$2 per MTok) | $1–5 (Claude Sonnet ≈ $5–15) |
| Image AI (~90 listing arts + ~30 proofs × ≈$0.25) | ≈ $30 (capped by `MONTHLY_AI_BUDGET`, default $60) |
| Etsy listing fees (8/day cap × 30 × $0.20, if every draft is approved) | up to $48 |
| Shopify Basic + apps (when the 2nd channel is turned on) | $39 + ~$42 |
| Printify Premium (optional) | $24.99 |
| Quo (SMS notifier; per-user plan) | ~$15–23 |
| Domain for email routing | ~$1 |
| **Etsy-only start** | **≈ $80–110** · with Shopify ≈ $160–190 |
