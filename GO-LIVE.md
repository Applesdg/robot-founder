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
