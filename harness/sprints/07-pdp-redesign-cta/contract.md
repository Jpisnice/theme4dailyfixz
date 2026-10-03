# Sprint 07: PDP redesign, CTA and offers

Spec: `harness/specs/product-page.md`. Plan: `~/.claude/plans/the-products-page-is-sunny-sutherland.md` (Sprint 07).

Why: owner rated the PDP "trash": plain/unbranded, CTA buried on mobile, highlight tiles squeezing the gallery. Owner chose the offers/coupon card as the acquisition tactic.

## Deliverables

- Mobile-first layout: full-bleed gallery with next-slide peek, no tile column; info "sheet" card; title + inline rating; India price row (MRP, saving pill, "Inclusive of all taxes"); highlight chips.
- `offer` block (repeatable) rendered as one "Offers for you" card: Copy (clipboard) and Apply (`/discount/CODE`), optional best price with `percent_off`, optional product-tag filter.
- Restyled variant pills, buy block, delivery card, trust strip, accordions (description, specifications from `custom.specs`, shipping & returns).
- Sticky bar fix (visible whenever the inline buy block is off screen, including below the fold on load) and redesign (thumbnail, price, variant, CTA).
- Add-to-cart confirmation sheet (`<dialog>`): added line, real free-shipping progress, complementary/related products, View cart / Checkout. Uses the Cart AJAX `sections` parameter (`sections/cart-added.liquid`) and `sections/product-recommendations.liquid`.
- `product-recommendations` section replaces the inline related grid (lazy-loaded).
- Desktop: sticky gallery with vertical thumbnail rail, info card.
- Default `templates/product.json` order: rating, price, offers, variants, availability, buy, delivery, trust, accordions.

## Static criteria

- S1 `npm run check` clean; `validate_theme` passes on changed files.
- S2 All strings via `t`/`t:`; sentence case.
- S3 Offers render only for merchant-entered codes; editor info says the code must exist in Shopify Discounts; "best price" only when `percent_off` is set and is labelled "with code". No timers.
- S4 Saving/MRP only when compare_at > price; free-shipping progress from the real cart and global threshold.
- S5 No-JS: variant select + native add-to-cart still work; offers code text is visible and selectable.

## Browser criteria (Playwright on `shopify theme dev`, 390x844 and 1280x800)

- B1 No horizontal overflow at 390 and 1280.
- B2 Gallery full-bleed on mobile, no tile column; swipe/dots/counter work; desktop vertical thumb rail syncs.
- B3 Add to Cart is within 1.3 viewports at 390 on a multi-variant product.
- B4 Sticky bar visible on load when the inline CTA is below the fold; hidden while the inline CTA is visible; sits above the tab bar; hidden on desktop.
- B5 Variant change updates price, MRP, saving, best price, availability, sticky bar.
- B6 Add to cart opens the sheet; header count updates; free-shipping figure matches `/cart.js`; Escape closes and focus returns.
- B7 Offer Copy announces "Copied"; Apply requests `/discount/CODE` and shows the applied state.
- B8 No console errors.
