# Product page (PDP) spec

Status: approved 2026-10-03. Full plan: `~/.claude/plans/plan-the-product-page-cheeky-sparkle.md`.

## Purpose

A conversion-focused, mobile-first product page: ATTENTION → UNDERSTANDING → DESIRE → TRUST → OBJECTIONS → ADD TO CART → CROSS-SELL. Every component must help the customer understand, trust, choose or buy; otherwise it is removed.

Market: India (INR, 6-digit PIN code, COD). No default claim text beyond what the platform guarantees; returns window, dispatch time and similar claims are merchant settings.

## Honesty rules (hard requirements)

- "Only N left" shows only for inventory-tracked variants at or below a merchant threshold.
- A saving shows only when `compare_at_price > price`.
- Free-shipping messaging uses the real cart total and the global threshold.
- No timers, fake visitor counts, fake reviews or fake purchase notifications.
- Delivery dates are labelled "Estimated" and are rule-based, not carrier data.

- The automatic "Sale X% off" ribbon uses the selected variant's real compare-at price. Merchant ribbons (`custom.ribbons`) must match an active Shopify discount (stated in the field description and editor info).
- Offers show only merchant-entered codes. The theme can't verify a code, so the editor says to create it in Shopify Discounts first. "Get it for X with this code" shows only when the merchant sets `percent_off`, and no expiry timers.

## Sprints

1. **Purchase core** (`harness/sprints/06-pdp-purchase-core`): breadcrumbs, gallery + lightbox + video, reorderable purchase-panel blocks, variant buttons/swatches with Section Rendering updates, availability, quantity, Add to Cart + Buy Now, PIN delivery checker, trust signals, mobile sticky bar, Product JSON-LD, analytics, personalization hooks.
2. **Redesign, CTA and offers** (`harness/sprints/07-pdp-redesign-cta`): full-bleed mobile gallery with peek, info sheet, India price row, highlight chips, `offer` blocks (copy + apply via `/discount/CODE`), restyled panel, specs/collapsible accordions, sticky bar fix + redesign, added-to-cart sheet (cart-added section + recommendations), `product-recommendations` section, desktop vertical thumb rail.
3. **Content and cross-sell** (`harness/sprints/08-pdp-content-crosssell`): frequently bought together, benefits, reviews, FAQ, recently viewed. Store definitions created 2026-10-03.

## Merchant content model

Definitions are created in the store (owner approval required); none live in the theme.

| Definition | Type | Used by |
| --- | --- | --- |
| `custom.value_prop` | single_line_text | Short value proposition |
| `custom.benefits` | list.single_line_text | Benefits (sprint 2) |
| `custom.specs` | list.single_line_text, `Label: Value` | Specs, comparison (sprint 2) |
| `custom.best_for` | single_line_text | Comparison (sprint 2) |
| `custom.cod_available` | boolean | Overrides the delivery block COD setting |
| `custom.faq` | list.metaobject_reference → `product_faq` (question, answer rich_text) | FAQ (sprint 2) |
| `custom.reviews` | list.metaobject_reference → `customer_review` | Rating, reviews (sprint 3) |
| `customer_review` (the name `product_review` is reserved by Shopify) | author (text), **rating (integer 1-5)**, title, body, date, verified (boolean), photos (list.file_reference), reply | Reviews |
| `custom.ugc` | list.metaobject_reference → `ugc_item` | UGC (sprint 3) |
| `custom.fbt`, `custom.compare_products` | list.product_reference | Bundle, comparison |
| `custom.features` | list.metaobject_reference → `product_feature` (image, title, text) | Feature gallery below Buy now |
| `custom.ribbons` | list.single_line_text_field (max 3 shown) | Offer ribbons over the slider |
| tags `badge:Text`, `fact:Text` | product tags | Gallery badge, fact pills |
| `reviews.rating`, `reviews.rating_count` | standard review-app metafields | Preferred over the native list when set |

Known limits: a metaobject list holds at most 128 entries, so native reviews are not suited to thousands of reviews; the distribution is computed from the loaded reviews only; there is no on-site review submission in this phase.

## Gallery guidance for merchants

Each image should answer a different question: what it looks like, another angle, how big it is (in scale), how it looks in use, what arrives at the door. Add a video where useful. Avoid near-duplicate shots.

## Analytics events

`view_product`, `view_product_image`, `play_product_video`, `select_variant`, `check_delivery`, `add_to_cart`, `buy_now`, `view_offer`, `copy_offer`, `apply_offer`, `view_reviews`, `filter_reviews`, `view_ugc`, `click_related_product`, `click_bundle`, `begin_checkout`.

Published through `Shopify.analytics.publish` when present, then `window.dataLayer`, plus a `theme:analytics` DOM event. Delivery events send only the first 3 digits of a PIN.
