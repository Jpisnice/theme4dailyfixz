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
