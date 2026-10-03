# Sprint 06: PDP purchase core

Spec: `harness/specs/product-page.md`. Plan section "Sprint 1".

## Deliverables

- `snippets/breadcrumbs.liquid` with BreadcrumbList JSON-LD.
- Gallery rewrite (`snippets/product-gallery.liquid`, `assets/product-gallery.js`): scroll-snap track, counter, dots, thumbnails, lightbox `<dialog>`, video, badge.
- `sections/main-product.liquid` as a block-driven purchase panel: `rating`, `value_prop`, `price`, `variant_picker`, `availability`, `buy_buttons`, `delivery`, `trust_signals`, `description`, plus `highlight` tiles.
- Variant updates via the Section Rendering API (`assets/product.js`).
- Delivery checker (`assets/delivery.js`), rule-based, works without JS for the static summary.
- Mobile sticky Add to Cart (`snippets/product-sticky-bar.liquid`) via IntersectionObserver.
- `snippets/product-structured-data.liquid` replacing `structured_data` for products.
- `assets/analytics.js`, `assets/context.js`.
- Locale keys, `templates/product.json` defaults.

## Static criteria (agent-verifiable)

- S1 `npm run check` clean; `validate_theme` passes on every changed file.
- S2 No hard-coded user-facing strings; sentence case.
- S3 No claim text is pre-filled except "Secure payments".
- S4 Savings, low-stock and free-shipping copy are conditional on real data.
- S5 `{{ product | structured_data }}` is no longer output on product pages; a single Product JSON-LD remains.
- S6 Without JS: variant `<select name="id" form="ProductForm">` submits a valid variant; native add-to-cart POST works.

## Browser criteria (owner, `shopify theme dev`, 375px first)

- B1 Gallery: swipe, counter and dots update; thumbnails (desktop) sync; lightbox opens, arrows and Esc work; video does not autoplay.
- B2 Variant change updates price, savings, availability, button state, sticky bar and URL; sold-out values are marked; a single-option product shows variant prices on the buttons.
- B3 Quantity stepper respects min, max and step.
- B4 Add to Cart shows "Added to cart" inline with View cart and Checkout links; header count updates; no popup.
- B5 Delivery checker: valid serviceable PIN, non-serviceable PIN, invalid PIN; PIN persists on reload.
- B6 Sticky bar appears only after the buy block leaves the viewport, sits above the tab bar, and is hidden on desktop.
- B7 No horizontal overflow at 375px or 1280px; touch targets at least 44px.
- B8 Events fire: `view_product`, `view_product_image`, `select_variant`, `check_delivery`, `add_to_cart`, `begin_checkout`, `buy_now`, `play_product_video`.
- B9 Rich Results Test shows valid Product with offers per variant.
