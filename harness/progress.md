# Progress

The handoff file. Read this first in every new session. Update it at the end
of every sprint and before any context reset (`/harness-handoff`).

## Current state

- **Active spec:** `harness/specs/storefront.md`
- **Architecture:** Online Store 2.0 (sections + JSON templates + section groups). Migrated off the block-first `{% block %}` developer-preview dialect on 2026-10-02.
- **Design identity:** "Everyday App" (grey canvas `#F6F7F9`, white cards, ink `#1A1D1F`, cyan `#16B6CE` accent, DM Sans, pill buttons). Supersedes "Crisp Modern Retail". Plan and notes: `MOBILE-APP-REDESIGN-PLAN.md`.
- **Last verdict:** n/a (static-only; `npm run check` clean)
- **Preview URL:** http://127.0.0.1:9292 (via `shopify theme dev`). No preview is available to agent sessions; owner previews locally.

## Next step

Owner: add real discount codes to the PDP `offer` block in the theme editor (create them in Shopify Discounts first) and review sprint 07 on a phone. Then sprint 08 (PDP content and cross-sell), which needs owner approval to create the metafield/metaobject definitions.

## Decisions log

- 2026-10-02: Harness set up (planner / generator / evaluator, block-first dialect gate, Theme Check, Playwright smoke).
- 2026-10-02: Planned `storefront` spec (5 sprints: shell, home and collections, product and cart, search/404/content, customer/polish). Assumed brand-neutral, warm "everyday done well" identity with one accent colour, because the catalogue is undecided. Templates stay Liquid (not JSON), so editability is via block and theme settings. Sprint passes are static-only until the owner verifies in `shopify theme dev`.

## Sprint history

| Sprint | Rounds | Verdict | Weighted score | Commit |
| --- | --- | --- | --- | --- |

## Sprint 01 status (2026-10-02)

- Built (75da2db), evaluated statically (report-r1: FAIL on a drawer keyboard trap), fixed (ff9cda9). Fix not yet re-evaluated.
- **Static-pass, awaiting owner browser check.** No preview was available in the agent session. Browser criteria B1-B20 in `harness/sprints/01-design-system-shell/contract.md` are UNVERIFIED; start with B6, B8, B9, B20, B10, B12.
- Owner to confirm both fonts (dm_serif_display_n4, Work Sans) appear in the theme editor.
- Next: sprint 02 (home and collection). Remove the OrphanedSnippet ignore list in `.theme-check.yml` once sprint 02 uses price, badge, product-card and section-heading.

## Sprint 02 status (2026-10-02)

- Built (4e82829), evaluated statically (report-r1: static-pass, 3 fixes required), fixed (314d058: drawer focus handling, contract wording, hero fallback escape). Fixes not re-evaluated.
- **Static-pass, awaiting owner browser check.** Browser criteria B1-B26 in `harness/sprints/02-home-collections/contract.md` are UNVERIFIED. Watch items: B7 (footer and home newsletter share a form type, so a success message may show on both), B13 (click blank space in the open filter drawer, then Escape and Tab), B9/B10 (pagination inside a block), B12/B14/B15/B18 (needs Search and Discovery filters), B3, B16.
- Next: sprint 03 (product page and cart). It must dispatch `cart:updated` so the header cart count updates. `product-card` and grid CSS currently load only on index and collection; sprints 03-04 need them on other pages.

## Architecture pivot + "Crisp Modern Retail" redesign (2026-10-02)

Done outside the sprint loop (planner/generator/evaluator agents were unavailable this session). `npm run check` is clean; `npm run smoke` NOT run (needs owner's local `shopify theme dev`).

- **Pivot to OS 2.0:** `{% block %}` is an unreleased Shopify developer preview and was causing upload errors. Converted the 13 blocks to `sections/` + JSON templates + header/footer section groups; rewrote `scripts/dialect-check.mjs` for the new conventions.
- **New design system (Phase 1):** rebuilt `snippets/css-variables.liquid` + `assets/base.css`/`critical.css` with a fluid type scale (`--text-*`), elevation (`--shadow-*`), motion (`--transition-*`/`--ease`), border-width and radius tokens, plus table + `.rte` base styles. New palette/fonts set as defaults in `config/settings_schema.json` + `settings_data.json`.
- **Pages:** home (6 home sections), collection (`main-collection`), and the shell restyled via tokens. Built product (`sections/main-product.liquid` + `product.json` + `assets/product.js`/`product.css`; variant picker, gallery, AJAX add-to-cart dispatching `cart:updated`, related products from the product's first collection), cart (`main-cart` + `cart.json` + `cart.js`/`cart.css`; AJAX `/cart/change.js`, steppers, note, optional free-shipping bar), and content pages (`main-search`/`main-blog`/`main-article`/`main-page`/`main-404` + JSON templates + `content.css`). New shared snippets: `quantity-input`, `product-gallery`, `variant-picker`.
- **UNVERIFIED (owner browser pass needed):** all pages render + are legible; product variant switch updates price/availability/URL/gallery; AJAX add-to-cart updates header count via `cart:updated`; cart steppers update totals + header; no-JS fallbacks (variant `<select>`, cart `updates[]`, gallery stacked); deep-green `#1F6F5C` contrast on white; focus-visible rings; sold-out/empty states; Archivo + Inter + new colours appear in the theme editor.
- **Watch items:** related products use `product.collections.first` (not the recommendations API); `list-collections.liquid` kept as a Liquid template (loads `collection.css`); customer/account pages not styled (out of scope this round).

## Everyday App redesign (2026-10-03)

Static-only; `npm run check` clean and `validate_theme` passes. `npm run smoke` NOT run (needs `shopify theme dev`).

- **Built:** tokens + DM Sans defaults, sticky app header with pill search, mobile bottom tab bar (`snippets/mobile-tab-bar.liquid`), `promo-banner` (carousel, `assets/carousel.js`), `brand-row`, app-style `product-card` with quick-add (`assets/quick-add.js`), sticky buy bar (product) and checkout bar (cart), new locale keys.
- **Owner to do:** remove the old `.liquid` product/cart/search/blog/article/page/404 templates from the remote dev theme (the untracked local `templates/404.liquid` stub is already deleted; `404.json` replaces it), then restart `shopify theme dev`.
- **UNVERIFIED in a browser (375px first):** sticky header + search pinned; tab bar active state and content not hidden behind it; promo swipe, dots and autoplay pause; brand row scroll; quick-add updates the header count and announces; "+" link on multi-variant cards; sticky buy and checkout bars sit above the tab bar and the sticky `display: contents` approach holds in Safari; cyan focus ring and link contrast; desktop (1280px) hides the tab bar and shows inline nav.
- **Watch items:** `collection-tile`, banner and filter-drawer radii still use `--radius`, not `--radius-lg`; notifications icon from the plan was skipped (no Shopify equivalent).

## PDP sprint 06: purchase core (2026-10-03)

Spec: `harness/specs/product-page.md`. Contract: `harness/sprints/06-pdp-purchase-core/contract.md`. Static-pass only: `npm run check` clean, `validate_theme` passes. NOT evaluated by the evaluator agent and NOT browser-tested.

- **Built:** breadcrumbs, scroll-snap gallery with lightbox and video, block-driven purchase panel (rating, value prop, price + saving, variant buttons/swatches, availability, quantity + Add to Cart + Buy now, delivery + PIN checker, trust signals, description), Section Rendering variant updates, mobile sticky bar (IntersectionObserver), one custom Product JSON-LD, `analytics.js`, `context.js`, global `free_shipping_threshold` setting (cart migrated to it).
- **Browser criteria B1-B9** in the contract are UNVERIFIED. Watch items: Section Rendering section id (`section.id` for a JSON template section), `option_value.available` marking, quantity stepper limits, sticky bar vs tab bar, lightbox focus return, dynamic checkout button styling, Shopify.analytics.publish signature.
- **Content to configure:** delivery block (dispatch/transit/serviceable PINs/COD/returns text), trust signal text, low-stock threshold, and the `reviews.rating` metafields (or sprint 3 native reviews) for the rating row. Metafield/metaobject definitions are not created yet (need owner approval).
- **Next:** sprint 07 (content sections: benefits, story, callouts, specs, comparison, FAQ), then sprint 08 (reviews, UGC, bundle, recommendations, recently viewed).

## PDP sprint 07: redesign, CTA and offers (2026-10-03)

Contract: `harness/sprints/07-pdp-redesign-cta/contract.md`. `npm run check` and `validate_theme` are clean. **Browser-verified with Playwright** against `shopify theme dev` at 390x844 and 1280x800 (this is the first round with a working preview). It has NOT been graded by the evaluator agent, because no evaluator agent type was available in this session.

- **Unblocked the preview:** `config/settings_schema.json` `announcement_text` had `"default": ""`, which made theme dev return a 500.
- **Verified:** no horizontal overflow (B1); full-bleed gallery with peek, dots that sync on swipe, and a desktop vertical thumb rail (B2); the sticky bar shows on load when the CTA is below the fold, hides while the CTA is visible, and is hidden on desktop (B4); variant switch updates the URL, sticky variant and best price (B5); add to cart opens the sheet with the correct line and subtotal, 4 recommendations and a header count of 1, and focus returns on close (B6); Copy announces "Code copied" (B7, copy half); the sale product shows MRP, 11% off and "You save" (S4).
- **Not verifiable locally:**
  - Offer "Apply": the theme dev proxy answers `/discount/CODE` with 401, so the UI shows its fallback message. Re-test on the live storefront.
  - Free-shipping bar in the sheet: `free_shipping_threshold` is unset in the dev store.
  - Console errors seen were only Shop Pay iframe CSP errors on localhost.
- **CTA position:** Add to Cart sits at 1099px on a 5-variant product at 390px (B3 limit ~1097px). The sticky bar covers this from first paint.
- **Owner content:**
  - The `offer-1` block ships empty, so the offers card is hidden until a code is entered.
  - Highlight chip defaults ("Fast delivery", "Easy returns") are claims carried over from the earlier template. Confirm or edit them.
  - `custom.specs` metafield definition is not created yet; the specs accordion falls back to brand, type and weight.

## PDP sprint 08: content and cross-sell (2026-10-03)

Contract: `harness/sprints/08-pdp-content-crosssell/contract.md`. `npm run check` and `validate_theme` are clean. Browser-verified with Playwright at 390 and 1280. NOT graded by the evaluator agent, because none was available.

- **Built:**
  - `product-bundle` + `bundle.js` (frequently bought together)
  - `product-benefits`
  - `product-reviews` + `reviews.js`, plus Review entries in the Product JSON-LD
  - `product-faq` with FAQPage JSON-LD
  - `recently-viewed` + `product-card-item` + `recently-viewed.js`
  - `product-content.css`
  - Template order: main, bundle, benefits, reviews, faq, recommendations, recently viewed.
- **Store definitions created** on devdailyfixz.myshopify.com through `shopify store execute`, with owner approval:
  - Metaobjects: `customer_review` (`product_review` is reserved by Shopify) and `product_faq`.
  - Product metafields: `custom.benefits`, `specs`, `value_prop`, `cod_available`, `fbt`, `faq`, `reviews`.
- **Verified:**
  - Empty sections render nothing (B1).
  - Bundle (tested with related products, then reverted to complementary): toggling updates the total, it follows the variant, and it added 2 items in one request (B2).
  - Reviews, using 7 temporary TEST entries that were deleted afterwards (0 remain): average 3.9 from 7, filters by chip and by bar, show more, panel rating, and AggregateRating + 5 Review entries in the JSON-LD (B3).
  - FAQ: one answer open at a time, and the FAQPage JSON-LD parses. Tested with temporary blocks, then removed (B4).
  - Recently viewed shows the 2 prior products, excluding the current one (B5).
- **Watch items:**
  - Complementary recommendations need setup in the Search & Discovery app. Until then the bundle only shows with `custom.fbt`.
  - Reviews show at most 50 entries, and a metaobject list holds 128 per product.
  - The bundle is hidden without JS.

## PDP: feature gallery + offer ribbons (2026-10-03)

`npm run check` and `validate_theme` are clean. Browser-verified at 390 and 1280.

- **Feature gallery:**
  - `feature_gallery` block in `main-product` (default position: right after Buy it now), rendered by `snippets/product-features.liquid`.
  - Swipeable 4:3 cards (image, title, text) from `custom.features` → `product_feature` entries.
  - Hidden when the product has none.
- **Offer ribbons:**
  - Notched strips at the top-left of the slider (`.ribbons`, a `data-variant-region` so the sale ribbon follows the variant).
  - Sources, in order: the automatic "Sale X% off" (section setting `auto_sale_ribbon`, only when compare-at > price), then up to 3 from `custom.ribbons`, then the `badge:` tag.
- **Store:**
  - Created the `product_feature` metaobject, plus product metafields `custom.features` and `custom.ribbons` (owner approved).
  - Temporary TEST content was used for the check and then deleted; 0 entries remain.

## Minimal footer + collapsible reviews (2026-10-03)

`npm run check` and `validate_theme` are clean. Browser-verified at 390 and 1280.

- **Footer** (`sections/footer.liquid`, footer CSS in `assets/base.css`):
  - Two light rows: store name, one inline menu and social icons; then ©, a compact country picker that submits on change (the button only shows without JS), and optional payment icons.
  - Newsletter band, blurb and payment icons are now settings, all off by default. Menus 2 and 3 were removed.
  - Footer height dropped to 166px.
- **Reviews:**
  - `product-reviews` content now sits inside `<details id="reviews">`, collapsed by default (setting: `open_by_default`).
  - The summary row shows the heading, stars, average and count.
  - The panel rating link and a `#reviews` URL open it.
  - `view_reviews` fires on first open.
- **Product cards:** prices no longer wrap ("Rs." / "785.95").

## Search page + uniform product cards (2026-10-03)

`npm run check` and `validate_theme` are clean. Browser-verified with Playwright at 390 and 1280. NOT graded by the evaluator agent.

- **Search page** (`sections/main-search.liquid`, `assets/search-page.js`, `assets/content.css`):
  - The page's own search form is gone; the header search is the only input.
  - Header shows "Results for “x”" plus a count, or "Search" plus a hint before any search.
  - Type tabs are one swipeable chip row on mobile. Tabs and sort update in place through Section Rendering, and focus returns to the active control.
  - Fixed: the "Articles" tab showed as active on unfiltered searches (`search.types | first`).
  - Collection, article and page results use the product card shell with a type label.
- **Product card** (`snippets/product-card.liquid`, `assets/base.css`):
  - Fixed slots: contained (uncropped) image, a 2-line clamped title, a one-line price (current price first and large), and a footer with the rating, the options count and the "+".
  - Cards fill their grid cell; measured as equal heights in the search, collection and recommendation grids.
  - Sale badge now reads "X% off" (`badge` snippet takes `text`). Sold-out cards dim the image.
  - Base `.rating` / `.rating__stars` CSS moved from `product.css` to `base.css`.
- **Unverified:** the card rating row, because the dev store has 0 reviews. Unit-price products, where the price row is allowed to wrap.

## PDP: trust row removed, smaller variant picker (2026-10-03)

- Removed the `trust` block ("Secure payments") from `templates/product.json`. The `trust_signals` block type stays in `main-product` so it can be re-added in the editor.
- Variant picker (`assets/product.css`): option buttons went from 92x54 to 84x43 at 390px, with tighter gaps, `text-sm` and the `--radius` corner. The picker is 117px tall instead of 146px, and Add to Cart moved up 29px. Taps are still 40px or more.

## PDP: key features as a full-width image list (2026-10-03)

- `snippets/product-features.liquid` now renders only the feature images, stacked vertically. Feature titles are used as alt text, and the per-feature title and text are no longer shown. The block heading ("Key features") is still a block setting.
- `assets/product.css`: `.features__list` uses negative margins so the images run edge to edge. Measured at 390px: images at x=0, 390px wide, no gaps. At 1280 they span the info panel (692 to 1260).
- Verified with 3 temporary TEST `product_feature` entries on the-complete-snowboard, which were then deleted along with the metafield. Two older `product_feature` entries (…4839161, …5330681) still exist in the store and were not created in this session.

## Product card quick-add button (2026-10-03)

- The card's "+" is now a 48px round button with the `cart` icon, in a muted style: a 12% accent tint background, a deep-teal `--color-accent-strong` icon and a faint border. After an add it turns solid deep teal with a `check` icon. The aria labels are unchanged.
- A bright cyan "BUY" text version was tried first and dropped because it was too loud.
- Verified at 390px: 48x48 and circular. Quick-add updated the header count to 1 (cart cleared afterwards). The check state was verified by toggling `.is-added`. Card heights are still uniform (333px).

## PDP offer marquee (2026-10-03)

- New `snippets/product-offer-marquee.liquid`, rendered first inside `main-product`, so it sits directly under the header. It is a full-width red strip (`--color-sale` #C0392B, white text, about 5.4:1 contrast).
- Messages: the selected variant's sale ("11% off today, now Rs. 785.95"), then each applicable `offer` block code ("Title: use code CODE"), then up to 3 `custom.ribbons`, then the optional section setting `marquee_text`. It is hidden when there is none. The wrapper is a `data-variant-region`, so it follows variant changes.
- **Continuous, with no controls (owner request):**
  - The messages repeat inside each of two copies until a copy is about 200 characters wide, and the track scrolls one copy-width, so there is never a gap.
  - The loop time comes from the text length, so the pace is steady. `marquee_speed` is in characters per second (2-10, default 4, about 29px/s).
  - There is no pause button and no hover pause.
  - Screen readers get one visually-hidden list, and the animated track is aria-hidden.
  - With reduced motion it is static and scrollable.
- WCAG 2.2.2 (pause, stop, hide) is not met for motion-tolerant users, because there is no pause control, by owner choice. Reduced-motion users get a static strip.
- Verified at 390px: top equals the header bottom (117). A copy is 1652px wide, so the screen is never uncovered. It scrolls at 29px/s, and there is no toggle. Offer-code messages were checked earlier with a temporary local TESTCODE (reverted).

## Combo-offer ribbons + faster marquee (2026-10-03)

- **Image ribbon** now shows only combo offers (`custom.ribbons`, up to 3, e.g. "Buy 1 get 1 free"), as `.ribbon--combo` in deep accent `--color-accent-strong`.
  - Removed the automatic "Sale X% off" ribbon, the `auto_sale_ribbon` setting (schema + product.json) and the `products.ribbon.sale` key, because the marquee and the price pill already show the sale.
  - Removed the `badge:` tag ribbon and its tag parsing. If a "Bestseller"-type badge is wanted again it needs a new home.
  - The marquee still lists combo offers too.
- **Marquee:** `marquee_speed` default 4 → 6 chars/s (range now 2-12), measured at 43px/s (was 29).
- Verified with a temporary TEST `custom.ribbons` value on the-compare-at-price-snowboard. Only the combo ribbon showed, and it also appeared in the marquee. The value was then deleted.

## PDP trust and conversion pass (2026-10-04)

`npm run check` and `validate_theme` are clean. Browser-checked with Playwright (Edge) at 390 and 1280: no overflow and no page errors. NOT graded by the evaluator agent.

- **Payment methods under the CTA:** the `buy_buttons` setting `show_payment_icons` (on) shows a "Secure payments" line plus `shop.enabled_payment_types`, up to 8. 6 icons were verified.
- **Delivery promise** (`assets/delivery.js`):
  - "Estimated delivery: Wed, Oct 7 – Fri, Oct 9" shows before any PIN is entered.
  - New `cutoff_hour` setting (0 = off) adds "Order within X h Y min to dispatch today". It refreshes every minute and uses the shop's UTC offset (`'now' | date: '%z'`).
  - Before the cutoff, orders dispatch the same day. After it, they follow the dispatch range, or the next business day when none is set.
  - A successful PIN check replaces the generic estimate.
  - Verified with temporary dispatch 0-1, transit 3-5 and cutoff 23 (reverted). The promise stays hidden while transit days are blank, as shipped.
- **Policy links** in the delivery card: `show_policy_links` links to `shop.shipping_policy` and `shop.refund_policy` when they are set. Neither is set in the dev store, so the links are hidden.
- **Review highlight block** (`review_highlight` → `snippets/product-review-pick.liquid`):
  - Shows the highest-rated real review with text (at least `min_rating`, default 4) under the buy block, with a "See all N reviews" link that opens `#reviews`.
  - UNVERIFIED in a browser, because the dev store has 0 reviews.
  - `product.js` now binds every `[data-rating-link]`.
- **Block order:** buy → review highlight → delivery → key-feature images. Delivery and returns info now sit right after the CTA instead of below the full-width feature images.
- **Owner to do:** fill in the delivery block's dispatch and transit days (and the cutoff, if you dispatch same day). Set the shipping and refund policies. Add reviews.

## Playwright layout and flow audit (2026-10-04)

Ran Playwright (Edge) against `shopify theme dev` at 390 and 1280 on 13 pages: home, collections, 4 product pages, search, cart, 404, the collection list and the blog. The checks covered CLS (on load and while scrolling), horizontal overflow, JS errors, failed requests, image sizing, h1 count and tap targets. A second script ran the shopping flow: variant switch, add to cart and the sheet, sticky bar, PIN check, quick add, and the cart stepper. All checks now pass. CLS is 0 on every page.

- **Fixed:**
  - Home CLS 0.012 (desktop). `carousel.js` appended the dots after first paint. `.promo--paged` now reserves the dots row.
  - Added-to-cart sheet CLS 0.35 (mobile). Recommendations loaded after `showModal()`. They now start with the add request, and the sheet waits up to 1.2s for them.
  - The cart stepper showed "₹1,899.95" against the server's "Rs.". New `assets/money.js` uses `shop.money_format` (set on `<html>`) when the store currency is active, and Intl otherwise. Cart, bundle and predictive search share it, and the bundle's local copy was removed.
  - The home page had no h1. Added a visually hidden shop-name h1 on the index page only.
  - Tap targets: the sticky variant button went from 19 to 24px tall (negative margin, so the bar does not grow), and the gallery dots from 20 to 24px wide.
- **Not issues:**
  - Skip link and radio inputs at 1x1 (visually hidden by design).
  - "Unnamed" buttons inside the closed filter drawer (visibility hidden).
  - `origin_trials` CORS, `shop.app` 403 and the monorail/pixel aborts, which come from the local proxy.
  - Card title links are short, but `::after` stretches them over the whole card.
- **Unverified:** the bundle total in the new format (no recommendation data in the dev store); the multi-currency fallback.

## Bundle/currency tests + subtle motion (2026-10-04)

`npm run check` is clean. Browser-verified with Playwright (Edge) at 390 and 1280. A rerun of the full CLS audit (13 pages × 2 sizes) still gives 0 everywhere, and the flow test gives 33/33.

- **Bundle** (tested with a temporary local `intent=related`, reverted):
  - Totals and row prices use "Rs." and equal the sum of the checked items.
  - Unchecking updates the total and the button label.
  - The variant switch keeps the format.
  - Adding the bundle put 3 items in the cart in one request.
- **Money fallback** (`assets/money.js`, imported in the page):
  - INR and no currency info use the store format.
  - USD and EUR fall back to Intl.
  - An invalid code gives a plain number.
  - The comma, no-decimal and apostrophe formats are all correct.
  - Predictive search showed "$" prices with a USD presentment currency.
- **Motion** ("Motion" block in `assets/base.css`):
  - Everything that moves is gated on `prefers-reduced-motion: no-preference`.
  - Animations are opacity and transform only, so there is no CLS.
  - The effects:
    - scroll-driven reveal of home and PDP sections and collection grid cards (`animation-timeline: view()`, no JS, nothing hidden where unsupported)
    - button press scale to 0.98 and card "+" press to 0.92
    - card lift of 2px on hover
    - cart badge bump (`header.js`, only when the count rises)
    - fade of variant regions that actually changed (`product.js` now skips unchanged regions)
    - accordion and reviews drop-in
    - delivery estimate and result fade
    - cart sheet backdrop fade, plus a 180ms fade/slide out on close (`allow-discrete`; elsewhere it just closes)
  - Verified with reduced motion: all content visible, no reveal and no lift.
