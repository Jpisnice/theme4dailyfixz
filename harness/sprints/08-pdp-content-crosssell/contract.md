# Sprint 08: PDP content and cross-sell

Spec: `harness/specs/product-page.md`. Plan: `~/.claude/plans/the-products-page-is-sunny-sutherland.md` (Sprint 08).

## Deliverables

- `sections/product-bundle.liquid` + `assets/bundle.js`: "Frequently bought together". Source is `custom.fbt` (product list), otherwise complementary recommendations loaded lazily. Checkboxes, a running total in the store's money format, and one `/cart/add.js` call with an `items` array. Follows the main variant selection. No bundle-saving claim.
- `sections/product-benefits.liquid`: "Why you'll love it" from `custom.benefits` or icon blocks.
- `sections/product-reviews.liquid` + `assets/reviews.js` (`id="reviews"`): summary (average, count, distribution bars) via `snippets/review-stats.liquid`; review cards (author, verified, date, title, body, photos, store reply) from `custom.reviews` (`product_review` metaobjects); rating and "with photos" filter chips; show more in batches of 6; "Write a review" link setting; `@app` blocks for review apps. Review entries are added to the Product JSON-LD.
- `sections/product-faq.liquid`: shop-wide question blocks plus `custom.faq` (`product_faq` metaobjects), as accordions, with FAQPage JSON-LD.
- `sections/recently-viewed.liquid` + `sections/product-card-item.liquid` + `assets/recently-viewed.js`: reads the `context.js` list, excludes the current product, renders cards via Section Rendering. Hidden when empty.
- `assets/product-content.css`, locale keys, and `templates/product.json` order: main, bundle, benefits, reviews, faq, recommendations, recently viewed.
- Store definitions (owner-approved, via `shopify store execute`): `custom.benefits`, `custom.specs`, `custom.fbt`, `product_faq` + `custom.faq`, `product_review` + `custom.reviews`.

## Static criteria

- S1 `npm run check` clean; `validate_theme` passes.
- S2 All strings via `t`/`t:`; sentence case; no pre-filled claim text (no default FAQ answers, benefits or reviews).
- S3 Every section renders nothing (no hollow heading) when it has no data.
- S4 Bundle total uses real variant prices; no "save" line.
- S5 JSON-LD: FAQPage only when questions exist; Review entries only from real review data.

## Browser criteria (Playwright, 390x844 and 1280x800)

- B1 No horizontal overflow; empty sections take no space.
- B2 Bundle: toggling items updates the total; "Add selected" adds all checked items in one request; header count updates; follows variant changes.
- B3 Reviews (with sample data): filters update the list and the live count; show more reveals the next batch; the rating link in the panel scrolls to `#reviews`.
- B4 FAQ accordions open one at a time; JSON-LD parses.
- B5 Recently viewed shows previously visited products (not the current one) after visiting two products.
- B6 No console errors from theme code.
