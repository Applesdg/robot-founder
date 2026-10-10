# Robot Founder — Economic assumptions (US / Melbourne, FL, 2026)

All numbers live in [`economics.js`](economics.js) (each entry names its source key) so they are easy to update.
**Accessed: 2026-10-10** for every URL below unless noted. Rows marked **ESTIMATE** had no direct source — they are the game author's judgment and are the first things to replace with your own numbers.

## 1. Channel fees
| Item | Value used | Source |
|---|---|---|
| Etsy listing fee | $0.20 per listing; renews after each sale / 4 months | https://www.etsy.com/legal/fees |
| Etsy transaction fee | 6.5% of item price + shipping charged | https://www.etsy.com/legal/fees |
| Etsy Payments processing (US) | 3% + $0.25 of order total incl. shipping & sales tax | https://help.etsy.com/hc/en-us/articles/115015628847 |
| Etsy Offsite Ads | 15% (12% once a shop has $10k sales in 365 days), cap $100/order | https://handandkin.com/guides/fee-audit/etsy-fees-2026 |
| Share of Etsy orders attributed to Offsite Ads | 8% | **ESTIMATE** |
| Shopify plans (monthly billing) | Basic $39 · Grow $105 · Advanced $399 (annual billing $29/$79/$299) | https://www.shopify.com/pricing |
| Shopify Payments online card rate | 2.9% + 30¢ (Basic) · 2.7% + 30¢ (Grow) · 2.5% + 30¢ (Advanced) | https://www.shopify.com/pricing |
| Shopify third-party gateway fee | 2% / 1% / 0.6% (not used: game assumes Shopify Payments) | https://www.shopify.com/pricing |
| Typical Shopify app spend | ~$42/mo average across stores ($100–200 for stores with 3+ paid apps) | https://storeinspect.com/blog/shopify-app-spending |
| In-store card processing (Square Free) | 2.6% + 15¢ per tap/dip/swipe | https://squareup.com/help/us/en/article/5068-what-are-square-s-fees |
| Share of in-store sales paid by card | 85% | **ESTIMATE** |

## 2. Shipping & packaging
| Item | Value used | Source |
|---|---|---|
| USPS Ground Advantage commercial, Zone 5 (eff. 2026-09-14) | 1 lb $9.29 · 2 lb $10.50 · 3 lb $12.12 · 5 lb $14.53 · 8 lb $16.54 · 10 lb $17.81 · 15 lb $22.90 · 20 lb $26.68 | https://www.usps.com/business/prices/2026/s-ground-advantage-com.csv |
| Zone 5 as the "average" zone shipping from Florida | — | **ESTIMATE** |
| USPS Priority Mail commercial 1 lb (reference) | $9.44 (Zone 1) – $16.07 (Zone 8) | https://es.usps.com/business/prices/2026/s-pm-com.csv |
| Packaging per order | $0.75 small mailer · $1.40 medium box · $2.50 large box (source range $0.50–2.00, boxes $0.75–2.50) | https://packaura.com/ecommerce-packaging-cost-per-order-benchmarks/ |
| Free shipping at ≥ $35 (otherwise buyer pays the label) | policy choice | **ESTIMATE** |
| USPS price changes each January & July | +4% per change | **ESTIMATE** (dates are real USPS practice; % is a guess) |

## 3. Labor (Palm Bay–Melbourne–Titusville MSA)
| Item | Value used | Source |
|---|---|---|
| Florida minimum wage | $14.00 (from 2025-09-30) → **$15.00 from 2026-09-30**; CPI-W-indexed from 2028-01-01 | https://www.lowndes-law.com/newsroom/insights/floridas-minimum-wage-reaches-15-00-on-september-30-2026 · https://floridacourtrules.com/florida-constitution/article-10-section-24/ |
| 2028 indexed minimum wage | $15.45 (3% CPI-W assumed) | **ESTIMATE** |
| Retail associate | $15.75/hr (local median $14.78–15.72 before the $15 floor) | https://wagedepth.com/occupations/retail-salespersons-41-2031/palm-bay-melbourne-titusville-fl-37340 |
| Customer service rep | $18.15/hr (median $37,760/yr) | https://www.mymeritlog.com/wagescope/occupations/customer-service-representatives/palm-bay-melbourne-titusville-fl |
| Shipping / warehouse | $17.47/hr (laborers & material movers median; hand packers' $13.33 is below the floor) | https://wagesbycity.com/salary/laborers-and-freight-stock-and-material-movers-hand/palm-bay-fl/ · https://www.citysalarydata.com/occupations/packers-and-packagers-hand |
| Maker / assembler | $17.00/hr | **ESTIMATE** (no local assembler figure found) |
| Product engineer | $102,310/yr (mechanical engineer median, Palm Bay MSA) | https://www.salaryengineer.com/mechanical-engineer-salary/florida/palm-bay-fl |
| Marketing coordinator | $22.00/hr | **ESTIMATE** |
| Employer FICA | 7.65% (6.2% SS + 1.45% Medicare) | https://www.irs.gov/taxtopics/tc751 |
| FUTA | 0.6% net on first $7,000/employee/yr | https://www.irs.gov/taxtopics/tc759 |
| Florida reemployment tax (SUTA), new employer | 2.7% on first $7,000 | https://floridarevenue.com/taxes/taxesfees/Pages/rt_rate.aspx |
| Workers' comp (per $100 payroll) | Retail 8017: $1.18 · Clerical 8810: $0.105 · Manufacturing: $2.50 | https://usaworkerscomp.com/workers-comp-insurance-florida/rates/ (manufacturing rate is an **ESTIMATE**) |
| Shifts | 8 h/day; retail Mon–Sat, others Mon–Fri | **ESTIMATE** |
| Robot founder | 10 h/day, 7 days, **unpaid** | game mechanic — a real owner must be paid (see Limitations) |

## 4. Premises, utilities, insurance, licenses, taxes
| Item | Value used | Source |
|---|---|---|
| Stage 0 home garage | $0 rent, $60/mo extra utilities | **ESTIMATE** (utilities) |
| Brevard retail asking rent | $20.34/sf/yr (Q2 2026; Q1 $18.58; Sept listings median $22.50) | https://www.matthews.com/insights/brevard-county-retailq1-2026 · https://www.spacecoastcre.com/post/brevard-county-commercial-real-estate-market-update-september-2026 |
| Brevard flex/industrial asking rent | $13.65/sf/yr | https://www.sperryflint.com/post/space-coast-cre-market-snapshot |
| NNN charges (taxes, insurance, CAM) | $5.50/sf/yr | **ESTIMATE** |
| Stage sizes | Small shop 900 sf · Store+workshop 1,500 + 1,800 sf flex · Flagship 3,000 + 8,000 sf flex | **ESTIMATE** |
| Buildout / fit-out | $12k · $30k · $90k | **ESTIMATE** |
| Lease escalator | +3%/yr | **ESTIMATE** |
| Electricity, retail | $0.25/sf/mo (source: $0.20–0.30) | https://naplesbusinessnews.com/naples-commercial-electricity-costs-the-fpl-lease-gap/ |
| Electricity, flex | $0.12/sf/mo | **ESTIMATE** |
| General liability insurance | $43/mo (source $42–45/mo, $1M/$2M) | https://www.insurance.com/small-business/retail-store-business-insurance/ |
| Product liability add-on | low-risk $0 (in GL) · medium $40/mo · high $150/mo; ×1.5 per stage | https://businessinsureguide.com/product-liability-insurance-cost/ (source: $25–40 low-risk, $100–250 cosmetics, $250–1,000+ electronics); tiny-seller levels are an **ESTIMATE** |
| Florida LLC formation | $125 ($100 filing + $25 registered agent) | https://dos.fl.gov/sunbiz/forms/fees/llc-fees/ |
| Florida LLC annual report | $138.75 (due by May 1) | https://dos.fl.gov/sunbiz/forms/fees/llc-fees/ |
| Brevard County business tax receipt | $37/yr | https://www.brevardtaxcollector.com/faq/ |
| Sales tax | 7% = 6% FL + 1% Brevard surtax (surtax pieces expire 2026-12-31 unless renewed; game keeps 7%) | https://edr.state.fl.us/Content/local-government/data/county-municipal/2026LDSSrates.pdf |
| Who collects | In-store and in-state Shopify orders: you collect & remit monthly. Etsy is a marketplace facilitator and remits for you | Etsy fees page above |
| Share of Shopify orders shipped inside Florida | 7% | **ESTIMATE** |
| Income tax | Pass-through LLC (no FL income tax); 25% of positive YTD profit set aside for SE tax (15.3%) + federal | https://venturesmarter.com/file-llc-taxes/florida/ — the 25% set-aside is an **ESTIMATE** |

## 4b. Digital + Print-on-Demand mode (added Oct 10, 2026; all accessed 2026-10-10)
| Item | Value used | Source |
|---|---|---|
| Etsy fees (digital and physical alike) | $0.20 listing, 6.5% transaction, 3% + $0.25 processing, offsite ads 15%/12% when attributed | https://www.etsy.com/legal/fees , https://help.etsy.com/hc/en-us/articles/115015628847 |
| Etsy instant downloads | up to 5 files, 20 MB each per listing; Etsy may charge a one-time setup fee that varies by country | https://help.etsy.com/hc/en-us/articles/115015628347-How-to-Manage-Your-Digital-Listings |
| Shopify digital delivery | free Shopify "Digital Downloads" app; Basic plan $39/mo (in config) | https://www.shopify.com/pricing |
| Florida sales tax on electronically delivered digital goods | not taxable (not tangible personal property); prints are taxable | https://floridarevenue.com/TaxLaw/Documents/03A-020.pdf |
| Printify canvas 0.75" (12x16) | from $11.26 base + $9.19 US shipping (one US provider; prices vary by provider) | https://podl.me/products/98642/canvas-stretched-075 |
| Printify canvas 16x20 | $15.50 base + $10.50 ship — **ESTIMATE** (listing shows "from $11.26" across sizes; larger sizes usually cost more) | same |
| Printify 11oz mug | $4.69 Free / $3.50 Premium base; US ship $4.39–$7.99 (used $4.39, SwiftPOD) | https://podvector.ai/articles/printify/costs-and-charges/printify-mug-base-cost-full-breakdown-for-pod-sellers |
| Printify 18x24 matte poster | $4.73 base; shipping $5.99 **ESTIMATE** | search summary of Printify catalog (Oct 2026) |
| Printify fleece blanket | Arctic Fleece from $12.84 ($9.32 Premium); shipping $9.50 **ESTIMATE** | https://printify.com/custom-blankets/ |
| Printify Premium | $24.99/mo billed yearly ($39 monthly); ~20% typical base discount (up to 33% advertised) | https://printify.com/pricing/ , podvector (Jul 2026) |
| Printful comparison (not used in game prices) | canvas 12x16 $25.75, 16x20 $31.25; 11oz mug $5.95 + $6.69 US ship; 18x24 poster $13.15; fleece blanket ~$24.62; Growth plan $24.99/mo (free after $12k/yr sales) | https://podl.me/products/98055/canvas-in , https://www.printful.com/shipping , https://www.printful.com/pricing |
| POD fulfillment time | 2–5 business days + shipping | https://help.printful.com/hc/en-us/articles/50265287600913 |
| POD reprints | free reshipment/refund for damaged, defective or misprinted items reported within 30 days; no buyer's-remorse returns | https://help.printful.com/hc/en-us/articles/50263870468753 |
| Partner defect rate | 2% — **ESTIMATE** (reprinted at partner's cost; costs us a late order and goodwill) | est |
| AI generation | Midjourney Standard $30/mo (in fixed costs); gpt-image-1 high quality 1024x1536 $0.25/image → $1.00 per finished portrait (~4 tries) **ESTIMATE**; revisions 30% of custom orders, +$0.50 AI and +8 min each **ESTIMATE** | https://docs.midjourney.com/hc/en-us/articles/27870484040333 , https://developers.openai.com/api/docs/models/gpt-image-1 |
| Pet-portrait price anchors | Etsy digital pet portraits $25–$75 (e.g. $32.50 listing); Pet on Canvas $24.99 digital, $49.99–$99.99 canvas; Pet Canvas AI $19.99 digital, $79.99–$99.99 canvas | https://www.etsy.com/listing/1279918249 , https://petoncanvas.com/pricing/ , https://create.petcanvas.art/blog/how-much-does-pet-portrait-cost |
| Game prices | printables pack $8, digital portrait $29, poster $39, canvas 12x16 $69, canvas 16x20 $89, mug $24, blanket $69, Space Coast poster $29 / mug $19 / canvas $59 — set inside the comparable ranges (**ESTIMATE**) | above |
| Refunds | custom portraits 3%, digital printables 1% — **ESTIMATE** | est |
| Design/QA time | 14–16 robot minutes per custom portrait, 1 min per instant download — **ESTIMATE**; costed at a customer-service wage in unit economics | est |
| Pop-up market booth | $75 fee, 300 visitors, 4% buy, no booths Jun–Sep (heat) — **ESTIMATE** | est |
| Founder salary (sensitivity run only) | $41,600/yr ($20/hr full time) — **ESTIMATE** | est |

**Demand caveat:** POD mode reuses the game's generic Etsy/Shopify traffic and conversion model. Digital printables are a very crowded Etsy category, so real traffic for a new shop is probably lower than the game shows. Treat the POD sim as an upper-middle case, not a forecast.

## 5. Demand & operations
| Item | Value used | Source |
|---|---|---|
| New Etsy shop traffic | ~20 views/day to start (source: 10–30/day, 200–500 views in month 1) | https://anlyzo.com/blog/first-month-selling-on-etsy |
| Etsy conversion | 1.8% before quality/price adjustments (source: 1–3% typical, Etsy says 1–5%) | https://www.shopify.com/blog/etsy-conversion-rate |
| Etsy view growth with listings, reviews and sales velocity; cap 2,500/day | curve | **ESTIMATE** |
| Shopify conversion | 1.4% of sessions (median) | https://www.littledata.io/ecommerce-conversion-rate |
| Paid traffic cost | $1.16 per click (blended Google/Meta retail) | https://coreppc.com/blog/state-of-shopify-advertising-2026/ |
| Etsy Ads cost per click | $0.45 | **ESTIMATE** |
| Organic Shopify sessions (base, email list, followers) | 6/day base; 0.03 visits/subscriber/day; 0.3%/day list churn; robot's spare hours → social followers | **ESTIMATE** |
| Repeat-purchase multiplier used for ad decisions | 1.4× | **ESTIMATE** |
| Store foot traffic by stage | 25 · 50 · 90 visitors/day (source: small boutiques 50–150/day; 20–50 is "low") | https://customercountingsoftware.com/insights/good-traffic-count-retail |
| In-store conversion | 20% before price/quality (source 15–30%) | https://www.hoxton.ai/blog/footfall-kpis |
| Store hours | 10am–6pm Mon–Sat; Saturday ×1.45 traffic | **ESTIMATE** |
| Checkout capacity | ~10 transactions per staffed hour | **ESTIMATE** |
| Price response | demand × (45 / avg price)^0.5 and own-price elasticity −1.5 vs inflation-adjusted launch price | **ESTIMATE** |
| Returns | 8% online, 3% in-store (NRF: 19.3% of all online sales, 15.8% all retail — handmade/gift assumed far lower) | https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025 |
| Chargebacks | 0.22% of transactions; $15 fee per dispute (fee is an **ESTIMATE**) | https://sift.com/blog/looking-back-on-2025-fraud-trends-with-sifts-fraud-industry-benchmarking-resource/ |
| Reviews | ~12% of orders leave a review; rating = moving average of quality, lateness, support | **ESTIMATE** |
| Seasonality (Jan→Dec) | .85 .85 .95 .95 1.0 .95 .9 .95 .95 1.0 1.35 1.6 → Nov+Dec ≈24% of the year (NRF: 19% for all retail; gift shops 26–32%) | https://nrf.com/research-insights/holiday-data-and-trends/winter-holidays/winter-holiday-faqs · https://www.listifyai.net/blog/etsy-holiday-calendar-2026 |
| Hurricane season | Jun 1–Nov 30; storm events Aug–Nov | https://www2.myfloridalicense.com/documents/HurricaneGuide_web.pdf |
| Rainy days (Melbourne) | Jun 19 · Jul 22 · Aug 23 · Sep 21 · Oct 15 · Nov 11 (others estimated) | https://www.weather-atlas.com/en/florida-usa/melbourne-climate |
| Material lead time | 5–12 days (+ supplier events) | **ESTIMATE** |
| Reorder point | daily usage × (avg lead time + 4 safety days) + backlog; order 30 days of usage | standard inventory practice; parameters **ESTIMATE** |
| Target stock | 8 days of cover, store and online allocations kept separately | **ESTIMATE** |
| Defect rate | 6% falling to 1.5% with R&D; QC catches 70% | **ESTIMATE** |
| Packing time / support | 6 min per order; 10% of orders create a support ticket, 6 min each | **ESTIMATE** |
| Annual price review | +3% each January (inflation) | **ESTIMATE** |

## 6. Funding & exits
| Item | Value used | Source |
|---|---|---|
| Personal savings at start | $5,000–25,000 | **ESTIMATE** |
| Business credit card | limit $5k–15k, 22.36% APR (Fed G.19 rate on accounts assessed interest) | https://www.federalreserve.gov/releases/g19/current/ |
| Friends & family | $5k–30k, 0%, 3-year note | **ESTIMATE** |
| SBA Microloan | up to $50,000, 8–13%, 6 years; needs ~6 months of sales | https://www.sba.gov/partners/lenders/microloan-program/operate-intermediary (rates via https://clarifycapital.com/blog/sba-loan-rates) |
| SBA 7(a) | up to $350,000 used here, 10.25–13.25% (prime 6.75% + max spreads), 10 years | https://clarifycapital.com/blog/sba-loan-rates |
| Merchant cash advance | repay 1.3–1.35× from 15% of daily sales | **ESTIMATE** |
| Pre-seed SAFE (rare) | $500k at $12.5M post-money cap (Carta Q2 2026 median for $500k–999k rounds) | https://carta.com/data/safe-valuation-caps-q2-2026/ |
| Acquisition multiples | 2.0–3.4× SDE if mostly own channels (Empire Flippers typical 2.2–2.3×); 1.0–2.5× if Etsy-dependent | https://buyouts.ai/alternatives/empire-flippers-valuation-multiple · https://realsiteworth.com/blog/etsy-shop-valuation |

**Milestones (the score):** first sale → first profitable month → ramen profitable (≥ $2,500 net in a month, **ESTIMATE**) → $10k revenue month → $100k trailing-12-month revenue → $1M TTM → acquisition offer received (the robot declines and keeps building) → IPO (legendary: ≥ $10M TTM revenue plus luck). Runs never end on their own; every 3 years a chapter recap appears. A run ends only when the player starts a new company.

## 6a. Robot brain: forecasting, experiments, ops (added Oct 10, 2026)
| Item | Value | Source (accessed 2026-10-10) |
|---|---|---|
| Email campaign placed-order rate | 0.16% of recipients per send (avg; top 10% 0.36%) | https://www.klaviyo.com/products/email-marketing/benchmarks |
| Shopify Messaging email cost | 10,000 sends/mo free, then $1 per 1,000 | https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/email/pricing |
| Forecast model | Holt damped trend (α .35, β .1, φ .9) on de-seasonalised weekly units × seasonal index | method choice (est) |
| Safety stock | z = 1.65 (≈95% service level) × σ(daily demand) × √lead time | standard formula (est σ from forecast errors) |
| Per-SKU price response | the existing price elasticity is also applied to each SKU's share of demand (substitution between SKUs) | est |
| Bundle/upsell attach rate | 6% of online orders add the cheapest other SKU at 10% off | est |
| Review requests | review rate 12% → 16%; 30% of replied ≤3★ reviews improve | est |
| Aging markdown | 15% off when > 45 days of cover, restored < 20 days | est |
| Featured SKU | +15% share of demand for the product the robot merchandises | est |
| Orders per customer (CLV) | 1.4 | est |
| Scenario ranges | best/base/worst = 120/100/80% of forecast revenue | est |

## 6b. Robot strategy engine (weekly review)
| Tactic | Parameter | Source |
|---|---|---|
| Business line of credit | 8.75–16.75% APR, limit ≈10% of TTM revenue ($6k–150k), 6+ months in business | https://yourbestloanrates.com/business-line-of-credit/ (Wells Fargo BusinessLine, checked Oct 2026); limit rule **ESTIMATE** |
| Supplier volume discount | 5% at $25k/yr materials, 10% at $50k, 12% at $100k | https://cnba.us/2026/05/19/contractor-supplier-discounts-guide/ (5–10%, ~10%, 10–15%; low end used) |
| Price raises | +6% steps when margin < 25% on the main channel, cap 1.2× inflation-adjusted launch price, 8-week cooldown | **ESTIMATE** |
| Drop SKU / pivot | drop if negative margin at the price cap; pivot line if best margin < 12% at the cap and trailing year is a loss | **ESTIMATE** |
| Black Friday promo | 15% off for 5 days, only SKUs that still clear the target margin | **ESTIMATE** |
| Custom commissions | 1.6× list price, 1.3× materials, when the robot has spare hours and 10+ reviews | **ESTIMATE** |
| Wholesale pitch | 50% of retail (keystone), net-30, 50% acceptance | **ESTIMATE** |
| Clearance / off-price reseller | 50% of retail for stock above 24 days of cover (60 in a cash crisis) | **ESTIMATE** |
| Batch production | −8% build time once there is a workshop | **ESTIMATE** |
| Profit review | 3 losing months and payroll > 45% of gross margin → trim newest hire (2 weeks' severance); 6 losing months → sublease / downsize | **ESTIMATE** |
| Rescue ladder (cash < 0, card maxed) | ads off → hiring freeze + 12h robot days → clearance → layoffs → sublease 50% of flex rent → sell equipment at 40% of cost → robot savings ($15k–40k pool) → 6-month interest-only loan modification → downsize → robot freelance contracts 4h/day at $45/hr; net-30 supplier terms keep production going | **ESTIMATE** (all are real, legal tactics; the amounts are guesses) |

## 7. Product lines (materials $, build minutes, price $, weight lb)
Comparable references: soy candles — materials $4–8 for 8 oz, list $18–28 (https://candlecostcalc.com/soy-candle-cost-calculator/, https://hivara.app/pricing-calculator/candles); ceramic mugs — Etsy $28–58, materials $3–8.50 (https://shoptodogood.com/pottery/articles/pricing-pottery-honest/, https://www.meeshpottery.com/blog/handmade-ceramic-mug-cost); custom keyboards — $164 Neo98, $209, $279 Neo Ergo, $299 Paper65 (https://www.qwertykeys.com/products/neo98-custom-mechanical-keyboard, https://mech.land/products/paper65-keyboard-kit); FPV drone kits — $133–$499 (search summary; individual URLs not verified). **All other lines are ESTIMATES** anchored on typical Etsy/Shopify listings.

| Line | SKU 1 | SKU 2 | SKU 3 | SKU 4 | Basis |
|---|---|---|---|---|---|
| Hand-Painted Sneakers | Canvas Slip-On 18/90/65/2 | Painted Hi-Top 35/180/140/3 | Custom Leather Low 60/360/220/3 | Bespoke Boot 95/600/380/5 | ESTIMATE |
| Smart Planters | Ceramic Pot 6/30/28/2 | Self-Watering 11/45/45/3 | Sensor Planter 26/60/89/3 | Smart Garden Kit 62/120/179/8 | ESTIMATE |
| Restored Retro Toasters | Classic 30/120/85/5 | Enamel 2-Slot 50/180/140/5 | Chrome 4-Slot 75/240/210/8 | Art Deco 110/360/340/8 | ESTIMATE |
| FPV Drone Kits | Micro Whoop 48/60/99/1 | 5" Freestyle 85/120/165/2 | Camera Drone 160/180/290/3 | F450 Pro 280/300/499/5 | prices anchored to real kits |
| Hand-Poured Soy Candles | 4oz Tin 2.5/8/14/1 | 8oz Jar 6/12/24/1 | 16oz 3-Wick 11/20/38/2 | Gift Set 16/30/58/3 | sourced |
| Custom Mechanical Keyboards | 60% Kit 75/120/165/3 | TKL 100/180/209/4 | Split Ergo 130/300/279/4 | 65% Premium 150/360/299/5 | prices sourced, costs ESTIMATE |
| Pet Toys | Rope Chew 3/15/14/1 | Puzzle Feeder 7/30/28/1 | Laser Chase 11/40/35/1 | Robo-Ball 17/60/49/1 | ESTIMATE |
| Handmade Ceramic Mugs | Classic 4/40/28/1 | Drip-Glaze 5.5/55/38/1 | Carved Large 7/75/52/2 | Mug Pair 13/120/85/3 | sourced |
| Solar Lanterns | Mason Jar 7/20/22/1 | Hanging 13/35/38/2 | Camp 21/45/55/2 | Patio String 30/60/79/2 | ESTIMATE |
| Skateboards | Custom Deck 30/120/89/5 | Cruiser 70/180/159/8 | E-Board Kit 290/300/499/15 | Complete E-Board 520/480/899/20 | ESTIMATE |
| Indie Board Games | Card Game 6/15/25/1 | Small Box 11/30/40/2 | Big Box 22/45/65/5 | Wooden Deluxe 40/120/120/5 | ESTIMATE |
| Bike Lights | Clip 7/20/24/1 | USB Headlight 14/30/45/1 | Turn-Signal Pack 28/60/79/2 | Laser Lane Kit 45/90/119/1 | ESTIMATE |

SKUs 2–4 unlock with R&D (30 / 90 / 180 points). Build time and material cost fall slightly with R&D.

## Limitations
- The robot founder's labor is free (10 h/day, every day). A human owner needs a salary, which would turn many "profitable" months negative. Unit economics *do* charge paid maker labor so you can see the real margin.
- Demand curves (Etsy growth, organic traffic, price elasticity, footfall growth with reputation) are modeled, not measured.
- The game never closes the business: the rescue ladder (including the robot's own savings and freelance income) always keeps it alive. Real businesses can run out of options; the cash and P&L numbers stay honest — a run can be alive but still losing money.
- Cash timing is simplified: marketplace payouts are instant, rent and subscriptions are charged on the 1st, wages daily, income tax monthly as a set-aside; no Etsy payment reserves, no inventory financing, no depreciation.
- Sales tax is a flat 7%; real Shopify nexus rules vary by state once you pass thresholds elsewhere.
- One average shipping zone; no dimensional weight; no international orders.
- Wages are local medians from salary aggregators (BLS OEWS-based) — real offers vary.
