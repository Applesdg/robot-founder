# NiftyNestGifts AI founder playbook v1.23.0

Generated from playbook.json - edit the JSON, not this file.

## updated
```json
"2026-10-11"
```

## shop
```json
{
 "name": "NiftyNestGifts",
 "positioning": "General gift store (not pet-focused): occasions, hobbies, professions, family roles, locations; pets are one category among many."
}
```

## pricing
```json
{
 "free_us_shipping": true,
 "shipping_baked_into_price": true,
 "strategy": "Price competitively: at or slightly below competitor benchmarks (research/competitors.json). Margins don't need to be high.",
 "min_profit_worst_case": 4,
 "worst_case_includes": [
  "Etsy fees 6.5% + 3% + $0.45",
  "Printify item cost",
  "Printify free Standard shipping charge (mug $7.29)",
  "Etsy Offsite Ads 12%"
 ],
 "example": "Mug 11oz $25.99 -> worst-case profit $6.22",
 "shopify_margin_floor": 0.3,
 "printify_free_shipping_toggle": "sales_channel_properties.free_shipping=true (API)",
 "mug_price": 15.99,
 "worst_case_at_15_99": "≈$4.09 (fees 6.5%+3%+$0.25 payment+$0.20 listing and 12% offsite ads on item+shipping; shipping passed through to Printify); ≈$6.89 without offsite ads",
 "note": "Dom accepted the lower margin (2026-10-11). Free-shipping pricing rules retired."
}
```

## timing
```json
{
 "line": "Made to order: ships in 2-7 business days, then 2-5 business days US delivery (standard shipping).",
 "sources": [
  {
   "claim": "Printify production time 2-7 business days",
   "url": "https://help.printify.com/hc/en-us/articles/4483629751825-What-are-Printify-s-production-times-like"
  },
  {
   "claim": "Printify standard US shipping 2-5 business days",
   "url": "https://help.printify.com/hc/en-us/articles/4483626155409-What-are-Printify-s-shipping-options"
  }
 ]
}
```

## description
```json
{
 "must_include": [
  "Made to order: ships in 2-7 business days",
  "production partner, Printify"
 ],
 "banned_regex": [
  "\\bAI\\b",
  "AI-assisted",
  "artificial intelligence",
  "generated",
  "free (us )?shipping"
 ],
 "note": "No AI wording in descriptions; the Etsy AI flag is set separately in listing settings."
}
```

## production_partner
```json
{
 "etsy_setting": "none for now (Dom's choice, 2026-10-11)",
 "description_note": "description may still say printed and shipped by Printify (transparency)"
}
```

## title
```json
{
 "pattern": "<Design/phrase> Mug, <design detail>, <recipient/occasion only if essential> (11oz/15oz)",
 "min": 60,
 "max": 90,
 "keyword_within": 40,
 "no_repeated_words": true,
 "product_word_once": true,
 "title_case": true,
 "max_words": 14,
 "banned_filler": [
  "holiday gift",
  "christmas gift",
  "halloween gift",
  "gift idea",
  "perfect gift",
  "stocking stuffer",
  "accent mug",
  "in 10 colors",
  "in colors",
  "colorful mug"
 ],
 "examples": [
  "Boho Christmas Mug, Eucalyptus Berry Wreath, Sleigh All Day (11oz or 15oz)",
  "Teacher of Little Elves Mug, Watercolor Apple, Holly, Elf Hat, 11oz/15oz",
  "Mountain Man Birthday Mug, Line Art Hiking Coffee Cup, Outdoorsy Gift (11oz/15oz)",
  "Disc Golf Birthday Mug, Watercolor Fairway Throw, Ceramic Coffee Cup (11oz/15oz)"
 ]
}
```

## tags
```json
{
 "count": 13,
 "max_len": 20,
 "unique": true
}
```

## photos
```json
{
 "min": 5,
 "max_etsy": 20,
 "order": [
  "#1 styled lifestyle scene, handle RIGHT (from Printify right mockup)",
  "#2 styled lifestyle scene of the OTHER side, handle LEFT (from left mockup)",
  "#3+ more styled shots and Printify left/right/context mockups"
 ],
 "never": [
  "front seam mockup (camera 6400) showing the gap/edges between the two design copies",
  "plain white mockup as #1"
 ],
 "qa": "layout-exact vision QA (same arrangement/clusters/text placement, not just same elements), no seam/gap, handle side recorded; photo #2 handle must be opposite photo #1",
 "where_edited": "ONLY in Printify (Mockup Library: upload styled photos to My uploads, select/deselect, order, default) then publish/republish with Mockups checked. NEVER upload or edit photos/designs in Etsy.",
 "api_limits": "Printify public API cannot upload custom mockups, select mockups, or reorder them (PUT images is ignored) - these are browser tasks in Printify; the worker generates the photos, QA, contact sheet and a task list.",
 "verify_after_sync": "after publish, verify selected Printify images >=5 and Etsy shows the same order (browser check until Etsy OAuth is live)"
}
```

## design
```json
{
 "print_ready": "Create at the provider print-area size (11oz mug: 2700x1120, white background)",
 "text_spelled_exactly": true,
 "no_trademarks": true,
 "no_real_people": true,
 "both_sides": "Every mug: design on BOTH sides (two copies at x=0.25 and x=0.75 of the wrap) so handle-left and handle-right views each show one complete design.",
 "no_drawn_products": "Design prompts ask for flat standalone print artwork; never \"mug wrap\"; no mugs/panels/boxes/frames/overlays in the art. Print artifact check (vision + pixel) at design step and in the gate."
}
```

## consistency
```json
{
 "rule": "Every lifestyle photo/video is generated FROM the real Printify mockup as reference/first frame. Keep the exact product: plain glossy white 11oz ceramic mug, C-handle, identical design, text and colors. Never generic, speckled, colored or different mugs.",
 "qa": "xAI vision compares each generated asset to the mockup (same shape, handle, design, text spelled identically); mismatches are rejected before use."
}
```

## lifestyle
```json
{
 "rules": [
  "Show the product in use (liquid in mugs, steam ok)",
  "Seasonal props that match the design",
  "No visible brand names or logos on props",
  "Warm, eye-catching, uncluttered background"
 ]
}
```

## video
```json
{
 "recipe": [
  "Animate from a still that already shows the FINAL scene (e.g. liquid already in the mug)",
  "Locked-off camera - no pans, zooms or orbits",
  "Only subtle motion: steam, twinkle lights, light flicker",
  "Big camera moves cause morphing (handle vanished, marshmallows appeared) - never use them"
 ],
 "model": "grok-imagine-video",
 "duration_s": 5,
 "enabled_by_default": false
}
```

## branding
```json
{
 "banner": "Etsy shop banner 3360x840 with all text in the center band (safe on mobile crop)"
}
```

## etsy_post_publish_checklist
```json
[
 "After EVERY publish/republish: verify the Etsy listing's shipping profile is 'NiftyNestGifts' ($7.29/$3.09), NOT Printify's 'Standard: SPOKE...' profile; fix in Etsy if reassigned",
 "How it's made > What tools are used: ONLY 'An AI generator' checked",
 "Renewal: Automatic",
 "Production partner: none for now (Dom's choice)",
 "Photos: VERIFY only - never upload/edit in Etsy; fix in Printify and republish Mockups",
 "Etsy Offsite Ads ON (shop setting)",
 "Post-release flags review: Etsy listing health/search visibility/pricing warnings/attribute suggestions/recommendations; Printify listing health (e.g. 'Pricing: Too high') + publish status",
 "After EVERY new upload/publish: open the Etsy listing's improvement suggestions (search visibility factors, listing health, attribute suggestions, pricing warnings) and APPLY them - synced fields (title, tags, description, price, photos) in Printify first then republish; Etsy-only items (attributes, category details, settings) directly in Etsy"
]
```

## lessons
```json
[
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Shop is a general gift store, not dog-focused."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Always free US shipping, baked into price; keep 30% margin floor."
 },
 {
  "date": "2026-10-11",
  "source": "Etsy",
  "lesson": "Etsy flagged repeated title words ('christmas', 'mug'): never repeat words; product word once with synonyms."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Remove AI wording from descriptions; AI disclosure is a listing setting only."
 },
 {
  "date": "2026-10-11",
  "source": "QA",
  "lesson": "Video with big camera moves morphed the product (handle vanished, marshmallows appeared): use locked-off camera, subtle motion only, start from final-scene still."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Product consistency across ALL images/videos: generate from the real Printify mockup; exact plain glossy white 11oz mug, C-handle, identical design; QA-reject mismatches."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Main (first) listing photo must be a styled lifestyle scene, never a plain white mockup."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Listings need 5-10 photos; Etsy auto-renew on."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Enable Printify free Standard shipping ($7.29) and Etsy Offsite Ads (12%) on every release; price so worst-case margin (incl. ads) stays >= 30% (mug $29.99)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Every lifestyle photo/video must start from the real Printify mockup; automated vision QA rejects mismatched mugs."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Price competitively at/slightly below benchmarks; margins don't need to be high; floor = $5-6 worst-case profit (incl. 12% offsite ads). Sleigh All Day stays $25.99."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Enable personalization on every release (~20% higher price for personalized); proofs need Dom approval before production."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Printify delayed orders auto-send to production; flag held orders in the digest."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Standard release checks = Dom's Printify store settings (auto-send delayed orders, 1-hour auto submission incl. personalized, details-to-publish: mockups and shipping profile OFF). Verify per-product settings before publish + daily audit; monthly confirm store settings."
 },
 {
  "date": "2026-10-11",
  "source": "QA",
  "lesson": "Conflict: personalized orders auto-submit after 1 hour, so worker proofs may arrive after production starts - proofs are best-effort unless Dom changes that setting."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Personalized orders set to Manual in Printify so proofs are approved before production (resolves the auto-submit conflict)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Deleted 'Cozy Electric Sparks' electrician mug draft: did not meet requirements (1 photo, no lifestyle main photo, personalization off). Only release ideas that pass the full playbook."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Standard personalization buyer instructions: \"Please add only the text you want printed on your product. Reach out to us directly for any additional requests.\" (Printify format captured; applied to every release)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Mandatory pre-publish review gate: vision review of every photo + full listing-details review; any failure blocks publish and goes to Dom with reasons."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Teacher Elves published with only 1 photo synced: the API cannot select mockups (PUT images is ignored) and Printify keeps only the default mockup selected; store 'details to publish: mockups' is OFF. Fix: select all mockups in the Printify editor (or turn store mockups ON) before publish; gate blocks <5 selected; post-publish sync check flags it."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Mountain Man (worker draft) was NOT published: it waited for approval because guardrails failed (4 photos, 68-char title, no lifestyle main photo). Its Printify photo 1 is a plain white mockup, so photo 1 must be a QA'd lifestyle upload."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Etsy 'How it's made > What tools are used' must have ONLY 'An AI generator' checked; not readable via API, so daily digest reminds."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Fairway Birthday Throw print file had a gray semi-transparent mug/panel over the right half (the image model drew a mug because the prompt said 'mug wrap'). Every print file now gets a vision + pixel artifact check in the design step and the pre-publish gate; prompts ask for flat artwork only."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Design prompts must never ask for a 'mug wrap' - the image model drew a gray mug/panel into the Fairway art. Flat artwork only + print artifact check (vision + pixel)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Photo QA must compare LAYOUT/arrangement, not just elements present (Teacher gift photo split the single cluster into two and still passed the old QA)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Never use Printify's front camera (seam view between the two design copies) as a listing photo; exclude/deselect it (Teacher last photo, Fairway #4)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "All mugs: design on both sides (two copies), handle-left and handle-right views each show one full design."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Photo #2 = styled shot of the other side with the handle opposite photo #1."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Styled lifestyle photo is ALWAYS #1; 5+ photos; verify after sync that Etsy shows them in order."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Never click Publish without the pre-publish gate (Mountain Man was published by an accidental click and skipped the gate)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Etsy checklist after every release: NiftyNestGifts free shipping profile, 'What tools are used' = ONLY 'An AI generator', Renewal = Automatic.",
  "superseded": "2026-10-11: free shipping retired"
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "No Etsy production partner for now (Dom's choice)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Never upload/edit photos or designs in Etsy; ALL photo/design changes happen in Printify (Mockup Library supports custom uploads in the UI, not the API) and sync to Etsy."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "After every release review all flags on Etsy (listing health, search visibility, pricing warnings, attribute suggestions, recommendations) and Printify (listing health e.g. 'Pricing: Too high', publish status); collect Etsy recommendations into the playbook."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Preview contact sheet of all photos in order before every publish; weekly cleanup of all live products."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Free shipping retired (Dom, 2026-10-11 4:41 PM): mugs $15.99 + buyer-paid Printify Standard shipping (US $7.29 first / $3.09 additional). Worst-case profit floor $4.00 (≈$4.09 at $15.99). Never say 'free shipping' in listings."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Shipping = Printify Standard profile published from Printify (publish setting 'Shipping profile' ON), not a custom Etsy profile.",
  "superseded": "2026-10-11: shipping profile publish setting OFF; Etsy 'NiftyNestGifts' paid profile"
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Order of operations: all updates in Printify first, publish from Printify, then change in Etsy only what Printify cannot sync."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Printify republish with 'Shipping profile' ON can reassign the Etsy listing to Printify's 'Standard: SPOKE...' profile (happened on Fairway). Keep publish setting 'Shipping profile' OFF; after every republish the flags review verifies the Etsy profile is 'NiftyNestGifts' ($7.29/$3.09)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "New mugs default to blueprint 478 (SPOKE, provider 1) with both 11oz and 15oz white variants in one listing; two-sided print file 2475x1155. Printify cannot change an existing product's blueprint."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "New mugs = sizes + colors: Accent Coffee Mug (635, Printify Choice) 11oz $15.99 / 15oz $19.49 in all colors; white companion on 478 (SPOKE) 11oz $16.49 / 15oz $19.99. Costs read from temporary drafts (deleted)."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Sell COLOR mugs only (635 accent, all colors, 11oz $15.99 / 15oz $21.49). White-only listings are retired once the color versions are live."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "After every new upload, check Etsy improvement suggestions and apply them: Printify-first for synced fields, Etsy-only for attributes/settings."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Titles: <=14 words, aim 60-90 chars, no non-essential occasion phrases ('holiday gift') and no 'accent mug in 10 colors' filler; sizes as '(11oz/15oz)'."
 },
 {
  "date": "2026-10-11",
  "source": "Dom",
  "lesson": "Research competitors per new product type (variants, buyer price incl. shipping, personalization, styles, reviews) with cited sources and real Printify costs before drafting; wait for Dom's go."
 },
 {
  "date": "2026-10-11",
  "lesson": "New product types (ornaments, sweatshirts, totes, tumblers) need a per-type competitor research report and Dom's go before any draft."
 },
 {
  "date": "2026-10-11",
  "lesson": "Post-checkout sim: proofs must use the product's real blueprint (635 two-sided), Printify has no order-edit/reprint API (browser tasks), Printify auto-imports Etsy orders (never create a second order), and 'pending' within the 1h auto-submit window is not 'held'."
 },
 {
  "date": "2026-10-11",
  "lesson": "Dom removed personalization from all products."
 },
 {
  "date": "2026-10-11",
  "lesson": "Never retire seasonal listings; only roll/remove the order-by line."
 }
]
```

## orders
```json
{
 "delayed_orders": "Dom set Printify to auto-send delayed orders to production; the worker flags any held/on-hold orders in the daily digest."
}
```

## release_checks
```json
{
 "store_settings_monthly_confirm": {
  "delayed_orders": "auto send to production",
  "order_submission": "automatically (1 hour)",
  "skip_review_imported_other_orders": false,
  "publishing": {
   "hide_in_store": false,
   "variant_visibility": "in-stock available + out-of-stock shown as sold out",
   "details_to_publish": {
    "title": true,
    "description": true,
    "variants_prices_skus": true,
    "tags": true,
    "category_attributes": true,
    "mockups": true,
    "shipping_profile": false
   }
  },
  "note": "Store-level Printify settings are not readable via API - confirmed monthly by Dom (digest checklist)."
 },
 "per_product": {
  "free_shipping": false,
  "personalization": false,
  "visible": true,
  "min_photos": 5,
  "offsite_ads": "Etsy checklist (shop setting)"
 },
 "publish_payload": {
  "first_publish": "all details",
  "republish": {
   "title": true,
   "description": true,
   "variants": true,
   "tags": true,
   "keyFeatures": true,
   "images": false,
   "shipping_template": false
  }
 },
 "audit": "Worker verifies readable per-product settings before every publish and in a daily audit of all products; mismatches are flagged in the digest (free_shipping auto-fixed)."
}
```

## pre_publish_review
```json
{
 "mandatory": true,
 "applies_to": [
  "worker auto-publish",
  "approval-link publish",
  "manual publish via POST /api/review/:pid"
 ],
 "photo_review": "xAI vision review of EVERY photo vs the exact Printify front mockup: main photo = styled lifestyle scene with background; same product/print/colors; text legible and spelled right; exactly one mug, no artifacts or brand marks; design not split/duplicated",
 "details_review": [
  "title rules (70-140 chars, Title Case, no repeated words, keyword front-loaded)",
  "13 tags <=20 chars",
  "description has timing line",
  "no AI wording",
  "worst-case profit >= $5.50 (12% offsite ads)",
  "free shipping on",
  "",
  "5+ photos selected for publishing",
  "print file passes artifact check (vision + pixel)",
  "no front seam mockup selected",
  "photo #2 handle opposite photo #1",
  "layout-exact photo QA"
 ],
 "on_fail": "block publish; reasons to approval queue (state \"blocked by review gate\"), Live Ops panel and daily digest",
 "post_publish": "verify photos that actually synced (Printify selected images >= 5); flag in audit/digest if fewer"
}
```

## memory
```json
{
 "deleted_on_request": "Products Dom asks to delete are removed from Printify/Etsy/queues and recorded in worker state + lessons so the worker never re-creates them (e.g. Cozy Electric Sparks).",
 "deleted_products": [
  {
   "printify_id": "6acbbfaa5a6821eb40039815",
   "etsy_listing_id": "4593215092",
   "title": "Sleigh All Day Coffee Mug, Boho Christmas Gift, Eucalyptus Holiday Cup 11oz",
   "reason": "white-only mug retired; color version live",
   "date": "2026-10-11"
  },
  {
   "printify_id": "6acbd03b18604c240802c8d6",
   "etsy_listing_id": "4593258460",
   "title": "Teacher Christmas Mug, Little Elves Holiday Coffee Cup, Gift for Daycare Staff 11oz",
   "reason": "white-only mug retired; color version live",
   "date": "2026-10-11"
  },
  {
   "printify_id": "6acbd060afd0ae1b7e0edca9",
   "etsy_listing_id": "4593261775",
   "title": "Mountain Man Birthday Coffee Mug, Minimalist Line Art Hiking Cup, Outdoorsy Gift for Him 11oz",
   "reason": "white-only mug retired; color version live",
   "date": "2026-10-11"
  },
  {
   "printify_id": "6acbde7c18604c240802d548",
   "etsy_listing_id": "4593339300",
   "title": "Fairway Birthday Throw Disc Golf Coffee Mug, Farmhouse Gift for Him or Her, Rustic Cup 11oz",
   "reason": "white-only mug retired; color version live",
   "date": "2026-10-11"
  }
 ]
}
```

## print_artifacts
```json
{
 "mandatory": true,
 "where": [
  "design step (reject + regenerate once, then reject idea)",
  "pre-publish gate (actual print file on the Printify product)"
 ],
 "vision": "xAI prompt asks explicitly about gray/white semi-transparent rectangles, panels, boxes, frames, seams/hard straight edges, drawn mugs/mockups, smudges, garbled text, logos",
 "pixel": "flat light-gray panel >4% of print OR a straight vertical/horizontal edge spanning >40% of height/width (src/artifact.js pixelArtifact; tools/artifact_check.py)",
 "prompt_rule": "Design prompts say \"flat standalone print artwork, NOT a product photo\"; never ask the image model for a \"mug wrap\" (it draws a mug into the art)."
}
```

## release_flow
```json
[
 "generate design (flat art, both sides) -> artifact check",
 "create Printify draft (title/tags/desc/price; free shipping OFF; personalization OFF)",
 "generate styled #1 (handle right) and #2 (handle left) from exact mockups -> layout QA",
 "contact sheet preview (all photos in order, numbered, title/price) -> approval item/email/Live Ops",
 "browser: Printify Mockup Library upload + order + deselect seam view",
 "pre-publish review gate (never click Publish without it)",
 "publish via Printify with Mockups checked",
 "post-publish: sync verify (photos/order), flags review, Etsy checklist"
]
```

## weekly_cleanup
```json
"Mondays: recheck every live product (flags, photo count/order, no seam view, free shipping, price floor, settings drift) -> digest."
```

## etsy_recommendations
```json
{
 "status": "to collect",
 "note": "Record Etsy's listing recommendations (attribute suggestions, search visibility tips) per listing during the post-release flags review and add durable ones here as rules."
}
```

## etsy_oauth
```json
{
 "app": "NiftyNest Robot",
 "status": "keys not present in worker (no ETSY_CLIENT_ID/SECRET secrets)",
 "redirect_uri": "https://robot-founder-server.dominicgiordanodg.workers.dev/oauth/etsy/callback",
 "scopes": "listings_r listings_w listings_d transactions_r transactions_w shops_r shops_w email_r"
}
```

## shipping
```json
{
 "free_shipping": false,
 "who_pays": "buyer",
 "profile": "Etsy shipping profile 'NiftyNestGifts' (buyer-paid, $7.29 first / $3.09 additional, US). Printify publish setting 'Shipping profile' OFF.",
 "printify_rates_us_11oz_mug": {
  "first_item": 7.29,
  "additional_item": 3.09,
  "note": "Printify catalog (blueprint 68, provider 1) also lists a US profile at $6.69/$2.99; worst case uses $7.29",
  "checked": "2026-10-11"
 },
 "listing_text": "never mention free shipping; keep timing line \"Made to order: ships in 2-7 business days, then 2-5 business days US delivery (standard shipping).\""
}
```

## order_of_operations
```json
[
 "1. Make ALL changes in Printify first: price, title/description/tags, print files, photos (Mockup Library), shipping (Printify Standard, free shipping OFF), personalization",
 "2. Publish/republish from Printify (selected fields)",
 "3. Only afterwards change in Etsy what Printify cannot sync: shipping profile assignment if needed, listing settings (Renewal Automatic, What tools are used = An AI generator), shop settings (Offsite Ads)",
 "Never upload/edit photos, designs, prices or descriptions in Etsy."
]
```

## products
```json
{
 "mug_default": {
  "note": "Dom 2026-10-11 6:10 PM: sell COLOR mugs only. Every mug idea = ONE Accent Coffee Mug (635, Printify Choice) with all colors, 11oz $15.99 / 15oz $21.49, Etsy profile 'NiftyNestGifts Accent' $7.29/$3.09. No white products, no cross-links to white versions.",
  "accent": {
   "blueprint_id": 635,
   "print_provider_id": 99,
   "provider": "Printify Choice (auto-routed, FL 33014 listed)",
   "colors_11oz": [
    "Black",
    "Light Blue",
    "Light Green",
    "Maroon",
    "Navy",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "Yellow"
   ],
   "extra_15oz": [
    "Blue"
   ],
   "cost": {
    "11oz": 6.4,
    "15oz": 8.44
   },
   "ship_us": {
    "11oz": [
     7.29,
     3.09
    ],
    "15oz": [
     9.39,
     3.99
    ]
   },
   "prices": {
    "11oz": 15.99,
    "15oz": 21.49
   },
   "worst_case": {
    "11oz": 4.13,
    "15oz": 4.31
   },
   "alt_provider": "SwiftPOD 39 (CA 95131): 11oz $6.41, 15oz $8.06"
  },
  "print_area_px": [
   2475,
   1155
  ],
  "two_sided": true,
  "photos": "main styled lifestyle; #2 opposite handle; include a color-swatch/lineup photo of all accent colors"
 }
}
```

## removal
```json
{
 "method": "Delete the product in Printify (permanently deletes the linked Etsy listing; cannot be restored) - only after Dom confirms color versions live",
 "hide_alternative": "Printify My Products > More actions > 'Hide on Etsy' (reversible)",
 "avoid": "Deleting/deactivating in Etsy first leaves an unlinked Printify product",
 "api": "POST /products/{id}/unpublish.json only NOTIFIES Printify that a custom channel removed it - it does not touch Etsy; DELETE /products/{id}.json deletes in Printify (help docs: also removes from the sales channel)"
}
```

## etsy_improvements
```json
{
 "when": "after every new upload/publish",
 "check": [
  "search visibility factors",
  "listing health",
  "attribute suggestions",
  "pricing warnings"
 ],
 "apply": {
  "printify_first": [
   "title",
   "tags",
   "description",
   "price",
   "photos"
  ],
  "etsy_only": [
   "attributes",
   "category details",
   "listing settings"
  ]
 },
 "record": "note applied suggestions as a lesson if they generalize"
}
```

## new_product_types
```json
{
 "rule": "Before drafting ANY new product type: research competitors (typical sizes/colors/variants, buyer price item+shipping, free vs paid shipping, top styles, review themes) from real public sources with links + dates (Etsy pages where fetchable, eRank/Marmalead/RankHero, articles; never invent numbers), read real Printify costs via a temporary draft (then delete), compute worst-case profit (>= $4), and get Dom's go before drafts.",
 "status": {
  "ornament": "researched 2026-10-12, awaiting Dom pick",
  "tee": "researched 2026-10-12, awaiting Dom pick",
  "sweatshirt": "researched 2026-10-12, awaiting Dom pick",
  "tote": "researched 2026-10-12, awaiting Dom pick",
  "poster": "researched 2026-10-12, awaiting Dom pick",
  "blanket": "researched 2026-10-12, awaiting Dom pick",
  "tumbler": "researched 2026-10-12, recommend skip for now",
  "sticker": "researched 2026-10-12, recommend skip singles"
 },
 "report": "/workspace/niftynest/types/product_type_recommendations.json"
}
```

## rules
```json
{
 "new_product_types": {
  "rule": "Before drafting ANY new product type, research competitors for that type independently (typical sizes/colors/variants, buyer price item+shipping, free vs paid shipping, top-seller styles, review themes) from real public sources with links+dates; never invent numbers. Compare to real Printify cost (temp draft, then delete), keep worst-case profit >= $4 with 12% offsite ads and buyer-paid shipping, and wait for Dom's go before drafts.",
  "since": "2026-10-11"
 },
 "orders": {
  "webhooks": "Printify order events update order state + Live Ops feed (created, production, shipped+tracking, delivered, cancelled, address issue).",
  "late": "No ship after 7 business days in production -> delay message DRAFT for Dom (never auto-sent; Etsy messages sent by Dom).",
  "damaged_misprint": "Prepare Printify 'Report a problem' reprint request (browser, within 30 days, customer photo) + buyer reply draft.",
  "address": "Keep order on hold, email Dom, buyer address-confirmation draft.",
  "cancellation": "Flag in digest + confirmation draft."
 },
 "personalization": {
  "rule": "NO personalization on any product (Dom 2026-10-11). personalisation=null, no wording; personalized-text orders only flagged in digest.",
  "since": "2026-10-11"
 },
 "seasonal": {
  "rule": "NEVER retire, deactivate or delete seasonal listings - always keep them live. After the order-by date passes, only update the description's order-by line via Printify (remove it or roll it to next year's date), then republish description only.",
  "since": "2026-10-11"
 },
 "variation_order": {
  "rule": "Every mug: variations Size FIRST, then Color; price varies by Size only ($15.99 11oz / $21.49 15oz). Printify blueprint 635 already orders options size > color (not settable via API); verify in Etsy Variations that Size is first and 'Prices vary for each' = Size only.",
  "since": "2026-10-11"
 },
 "props_on_theme": {
  "rule": "Every background prop in every photo relates to the product theme (or coffee/gifting) - no random or confusing objects (e.g. a ring in a disc golf scene). Vision-checked per photo in the gate.",
  "since": "2026-10-11"
 },
 "styled_only": {
  "rule": "EVERY photo has a styled background (main, side2, swatch, size compare, lifestyle); photo 1 shows the design straight on from the front. Printify's plain white views are deselected; at least 5 styled photos.",
  "since": "2026-10-11"
 },
 "self_critique": {
  "rule": "Before anything reaches Dom, an independent strict reviewer grades photos+listing against the rule list, fixes listing text via Printify and re-checks, up to 3 rounds.",
  "since": "2026-10-11"
 },
 "risk_layer": {
  "rule": "Daily: final-state audit + Printify-vs-Etsy drift, ops risks (blanks/colors, payments), seasonal order-by roll (never retire). Weekly: platform watch of official Etsy/Printify policy & fee pages.",
  "since": "2026-10-11"
 },
 "tee_pricing": {
  "rule": "Tees: $24.99 S-XL, $27.99 2XL, $29.99 3XL, $34.99 4XL (4XL at $31.99 would only clear $2.30) - every size must clear $4 worst case.",
  "since": "2026-10-12"
 },
 "main_thumbnail_legible": {
  "rule": "Main photo must be thumbnail-legible: product fills ~65-75% of the frame height, centered close-up, front design big and readable; background styled but SIMPLE and softly blurred (shallow depth of field), at most 2-3 on-theme props kept away from the product, good contrast. Gate: main is downscaled to 300px and vision must read the design text, or the photo fails.",
  "since": "2026-10-12",
  "by": "Dom (phone shop-grid screenshots)"
 }
}
```

## corrections_log
```json
{
 "note": "Every Dom correction as a machine-checked rule (src/rules.js). auto = checked in the pre-publish gate (blocks publish); manual = Etsy-only, on the browser checklist; Dom can add more via Live Ops > Teach him a rule.",
 "rules": [
  {
   "id": "styled_all",
   "text": "Every photo has a styled background (no plain white anywhere, incl. side2, swatch, size compare)",
   "check": "auto"
  },
  {
   "id": "main_front",
   "text": "Photo 1 shows the design straight on from the front, handle to the side, fully readable",
   "check": "auto"
  },
  {
   "id": "two_sided",
   "text": "Mugs: design on BOTH sides (two copies at x=.25/.75)",
   "check": "auto"
  },
  {
   "id": "side2_flipped",
   "text": "Photo 2 = other side, handle opposite photo 1",
   "check": "auto"
  },
  {
   "id": "props_on_theme",
   "text": "Every background prop relates to the product theme (no random/confusing objects)",
   "check": "auto"
  },
  {
   "id": "no_seam",
   "text": "Never use the front seam mockup view",
   "check": "auto"
  },
  {
   "id": "art_match",
   "text": "Photos match the print art exactly (layout, colors, spelling)",
   "check": "auto"
  },
  {
   "id": "no_free_shipping",
   "text": "No free shipping (buyer-paid Printify Standard)",
   "check": "auto"
  },
  {
   "id": "prices",
   "text": "Mugs $15.99 (11oz) / $21.49 (15oz)",
   "check": "auto"
  },
  {
   "id": "color_only",
   "text": "Mugs: colored accent mugs only (blueprint 635), all colors enabled",
   "check": "auto"
  },
  {
   "id": "variation_order",
   "text": "Variations: Size FIRST, then Color; price varies by size only",
   "check": "auto"
  },
  {
   "id": "etsy_variation_order",
   "text": "Etsy Variations: Size listed first; Prices vary for each = Size only (check in Etsy)",
   "check": "manual"
  },
  {
   "id": "no_personalization",
   "text": "No personalization (setting off, no wording)",
   "check": "auto"
  },
  {
   "id": "offsite_profit",
   "text": "Worst-case profit >= $4 incl. 12% offsite ads, buyer-paid shipping",
   "check": "auto"
  },
  {
   "id": "title_rules",
   "text": "Title 60-90 chars, <=14 words, no repeats, no filler",
   "check": "auto"
  },
  {
   "id": "tags",
   "text": "13 tags, each <=20 chars, no duplicates",
   "check": "auto"
  },
  {
   "id": "timing_line",
   "text": "Description has the production/delivery timing line, no AI wording",
   "check": "auto"
  },
  {
   "id": "order_by",
   "text": "Seasonal items carry an honest, future order-by line (rolled/removed after it passes; never retired)",
   "check": "auto"
  },
  {
   "id": "photo_count",
   "text": "At least 5 styled photos",
   "check": "auto"
  },
  {
   "id": "preview_sheet",
   "text": "One preview image of all photos in order exists before Dom sees it",
   "check": "auto"
  },
  {
   "id": "trademark",
   "text": "No trademarked/copyrighted terms (pre-mortem)",
   "check": "auto"
  },
  {
   "id": "claims",
   "text": "No misleading/unsupported claims (pre-mortem)",
   "check": "auto"
  },
  {
   "id": "duplicate",
   "text": "No duplicate/near-duplicate listings (pre-mortem)",
   "check": "auto"
  },
  {
   "id": "print_dpi",
   "text": "Print file covers the 2475x1155 print area (pre-mortem: DPI/bleed)",
   "check": "auto"
  },
  {
   "id": "research_new_type",
   "text": "New product types need competitor research + Dom go before drafting",
   "check": "auto"
  },
  {
   "id": "ai_checkbox",
   "text": "Etsy 'How it's made > tools': ONLY 'An AI generator'",
   "check": "manual"
  },
  {
   "id": "auto_renew",
   "text": "Etsy renewal = Automatic",
   "check": "manual"
  },
  {
   "id": "offsite_ads",
   "text": "Etsy offsite ads enrolled (12% fee assumed in pricing)",
   "check": "manual"
  },
  {
   "id": "printify_first",
   "text": "All changes in Printify first, publish from Printify; Etsy only for what Printify cannot sync",
   "check": "process"
  },
  {
   "id": "etsy_suggestions",
   "text": "After every upload: open Etsy improvement suggestions and apply them",
   "check": "manual"
  },
  {
   "id": "shipping_profile",
   "text": "Etsy listing uses 'NiftyNestGifts' $7.29/$3.09 (republish can reassign it)",
   "check": "manual"
  }
 ]
}
```

## tees
```json
{
 "since": "2026-10-12",
 "approved_by": "Dom 2026-10-12",
 "product": "Comfort Colors 1717 garment-dyed tee - Printify blueprint 706, provider Monster Digital (29), US",
 "colors": [
  "Black",
  "White",
  "Pepper",
  "Ivory",
  "Blue Jean",
  "Moss"
 ],
 "sizes": "S M L XL 2XL 3XL 4XL",
 "pricing": [
  {
   "size": "S",
   "cost": 13.04,
   "price": 24.99
  },
  {
   "size": "M",
   "cost": 13.04,
   "price": 24.99
  },
  {
   "size": "L",
   "cost": 13.04,
   "price": 24.99
  },
  {
   "size": "XL",
   "cost": 13.04,
   "price": 24.99
  },
  {
   "size": "2XL",
   "cost": 14.28,
   "price": 27.99
  },
  {
   "size": "3XL",
   "cost": 16.44,
   "price": 29.99
  },
  {
   "size": "4XL",
   "cost": 21.4,
   "price": 34.99
  }
 ],
 "shipping": "buyer pays Printify US rate $4.49 first / $2.09 each additional; no free shipping",
 "profit_floor": "worst case ≥ $4/unit after Etsy 6.5% transaction + 3% + $0.25 processing + $0.20 listing + 12% offsite ads (on item+shipping)",
 "comps": "Etsy 2026-10-12 (Dom): funny teacher Comfort Colors tees sell $15-17 on sale, originally ~$26 -> we list $24.99 S-XL with no fake sale",
 "photos": [
  "1 main: FRONT design, real Printify flat/ghost mockup composited on a styled on-theme scene",
  "2: model/lifestyle shot or back/flat-lay (real mockup)",
  "3: color chart from real mockups of all 6 colors",
  "4: size chart (S-4XL body length/width from Printify spec)",
  "5: styled lifestyle (real mockup)"
 ],
 "rules": [
  "no personalization",
  "AI-generator disclosure",
  "Printify production partner",
  "auto-renew ON",
  "design text readable at thumbnail size; print area front only",
  "growth target: about 10 tees"
 ]
}
```
