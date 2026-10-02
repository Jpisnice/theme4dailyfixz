# Spec: DailyFixz storefront

- **Slug:** storefront
- **Request:** "Let's build the best theme, that works." Context from the owner: the store DailyFixz sells a mixed / not-yet-decided catalogue, so design a flexible, brand-neutral-but-distinctive catalogue theme and record the assumptions.
- **Date:** 2026-10-02

## Goal

Turn the Skeleton starter into a complete, polished, fast catalogue storefront. A shopper can land on the home page, browse or search, pick a product and variant, add to cart, adjust the cart and reach checkout, on a phone first. A merchant can change the look (colours, type, radius, density) and the content (menus, announcement, home promos, trust points, footer) from the theme editor without touching code. The theme must work for any catalogue (grocery-adjacent, home, personal care, gadgets, mixed) because the range is undecided.

"Works" comes first: no broken flows, no console errors, no overflow, every empty and sold-out state handled. Beauty is second but is graded (see `harness/criteria.md`).

## Users and moments

- **Shopper on mobile (primary):** arrives from social, search or a repeat bookmark. Wants to see prices, find the product, add it, and pay within a few taps.
- **Returning "daily fix" customer:** reorders familiar items; needs fast search, a clear cart, and an account link.
- **Merchant in the theme editor:** is still deciding the catalogue, so needs to re-theme and re-merchandise cheaply as the range changes.
- **Owner reviewing locally:** runs `shopify theme dev`; the agent sessions cannot see a live store (see "Verification model").

## Design direction

Concept: "the everyday, done well". Practical and warm, not clinical, not luxury. A daily-essentials store should feel dependable, quick and a little friendly.

- **Mood:** calm, confident, utilitarian with personality. Think a well-run neighbourhood shop with great packaging, not a generic template.
- **Palette (defaults, merchant-editable):** warm off-white background, near-black ink with a slight warm cast, one saturated accent (a fresh "fix" colour, e.g. a vivid tomato or marigold) reserved for primary actions, sale and focus. A soft secondary surface tint for cards and banners. Prices and add-to-cart are always the highest-contrast elements. All text at least 4.5:1.
- **Type:** one distinctive-but-neutral display face for headings plus a highly legible body face, both from the Shopify font picker (current `work_sans_n4` default can stay for body). Tight, confident heading scale with generous line height in body copy; tabular figures for prices where available.
- **Shape and rhythm:** a single radius token applied consistently (merchant-adjustable), an 4/8px spacing scale, hairline borders instead of heavy shadows, generous tap targets (at least 44px).
- **Product card:** image-led with fixed aspect ratio (editable), title, price (with compare-at and a clear sale badge), a sold-out badge, optional quick add on hover/focus and always reachable on touch. Second image on hover where present, never required.
- **Signature details (originality):** a slim announcement bar, a "trust strip" (delivery, returns, secure checkout) reused on home, product and cart, chunky pill-style filter chips on collections, and an accent underline motif on headings. Avoid generic centred-hero-plus-three-columns defaults.
- **Imagery:** merchant images only; clean placeholder SVGs when absent so a fresh store with no content still looks designed.
- **Motion:** minimal and respectful of `prefers-reduced-motion`.

## Features

1. **Design system and global settings:** colour, type, radius, spacing, button and input styles as CSS custom properties fed by `config/settings_schema.json` and `snippets/css-variables.liquid`; shared component CSS in `assets/`; reusable snippets for icons, buttons, price, badges, product card, and a section-heading pattern. Great means the merchant can re-skin the store from Theme settings alone and every later page inherits it.
2. **Header, announcement bar, mobile navigation and footer:** sticky, compact header with logo or shop name, menu (with nested links via a mobile drawer), search entry, account and cart count; announcement bar block; footer with link-list columns, newsletter signup (`{% form 'customer' %}`), payment icons, social links and country/language selectors when enabled. Skip link, keyboard-operable drawer, visible focus. Great means the cart count updates after add-to-cart without a reload.
3. **Home page:** composed from blocks the merchant can reorder via editable blocks in the template: hero/promo banner, featured collection(s) with product cards, collection tile list, trust strip, short brand-story or testimonial, newsletter. Works with zero configured content (graceful placeholders) and with a catalogue of one product or hundreds.
4. **Collection page and collection list:** responsive product grid (2 columns on mobile), pagination, sort-by, tag/filter UI using storefront filtering (`collection.filters`) shown as a drawer on mobile and sidebar or chips on desktop, active-filter pills with clear-all, result count, collection banner image/description, and an empty state ("No products match", with reset). `list-collections` shows tiles.
5. **Product page:** gallery (swipe on mobile, thumbnails on desktop), title, vendor, price with compare-at and unit price, variant picker (buttons for options, with sold-out and unavailable styling, URL updates with `?variant=`), quantity stepper, add-to-cart with loading, success and error feedback, dynamic checkout button, delivery/returns trust points, collapsible description/details, stock hint when low inventory is tracked, sold-out state ("Sold out" disabled button), and a related-products row (`recommendations`). Includes structured data and good meta. Great means it is usable one-handed on a phone with the buy box reachable without hunting.
6. **Cart:** line items with image, options, unit price, line price, quantity stepper, remove, discounts shown, order note, subtotal, free-shipping progress (merchant-set threshold, optional), checkout button, trust points, empty-cart state with collection links. Updates via the Cart AJAX API (`/cart/change.js`) with a no-JS fallback form. Optional cart drawer is a stretch goal, not required.
7. **Search and 404:** search page with form, result grid mixing products/articles/pages, result count, pagination, empty/no-results state with suggestions; predictive search dropdown in the header (`/search/suggest`) with graceful fallback. 404 page with search box and links back to popular collections.
8. **Content pages and customer basics (if cheap):** blog index and article (reading width, date, author, tags, prev/next), generic page, password page polish, and styled customer templates only where they exist as Liquid templates and are cheap (login, register, account, order, addresses, reset/activate). Gift card template styled lightly. Skip any customer template that would require large new surface area; record it in the sprint report instead.
9. **Polish, performance, accessibility and editor QA:** responsive image sizing and lazy loading across all templates, no layout shift, preload hero, reduced motion, focus order, landmark structure, `aria-live` cart/status messages, SEO/meta/structured data review, locale key completeness, a "theme editor friendliness" pass (labels, info text, sensible defaults and ranges), and README/handoff notes for the owner.

## Out of scope

- Any section-based or JSON-template architecture, presets, or `{% stylesheet %}`/`{% javascript %}` tags (README "Non-negotiables").
- Third-party apps, subscriptions, reviews, wishlist, loyalty, multi-currency banners, mega-menus with imagery, product bundles, quick-view modals.
- Non-English translations (English only; translators handle the rest).
- Cart drawer (stretch only), size guides, back-in-stock forms.
- Creating store data (products, collections, menus) in Shopify. Fresh-store placeholders cover empty data.

## Constraints

- Block-first dialect (README "Non-negotiables"): compose pages from blocks and inline markup in `templates/*.liquid` and `layout/`; blocks have `{% doc %}`, `{% schema %}` and `{{ block.shopify_attributes }}`; `{% block %}` calls only in layout/templates; render caller bodies with `{{ content }}`.
- All CSS and JS in `assets/` (shared `base.css` plus per-feature files; modest, dependency-free ES modules, config via `data-*`). `critical.css` only for above-the-fold essentials.
- All shopper strings via `| t` in `locales/en.default.json` (max 3 levels, sentence case); editor strings as `t:` keys in `locales/en.default.schema.json`.
- Mobile first at 375px; verified also at 768 and 1280.
- Use `routes.*` for URLs; Shopify `{% form %}` tags for forms; no Liquid inside JS.
- Run the `liquid-theme-dev` skill and call `learn_shopify_api` once before Liquid work; check object/filter names rather than guessing, since wrong names fail silently.
- Hard-won gotcha: the dialect check forbids `{% block %}` inside block files, so block-in-block composition happens in the template or layout.

## Verification model

The agent sessions have no store preview. Therefore every sprint contract must split criteria into two lists:

- **Static (agent-verifiable now):** `npm run check` clean (dialect plus Theme Check), translation keys present, schema valid with `t:` labels, no hard-coded strings, no forbidden tags, `{% doc %}` headers, image tags with width/height/alt/lazy, `<label>`s present, ARIA attributes present by code review, CSS tokens used rather than hard-coded colours, files referenced exist.
- **Browser (owner verifies later with `shopify theme dev`, plus `npm run smoke` and Playwright when a preview exists):** layouts at 375/768/1280, console errors, add-to-cart and cart updates, variant switching, filtering, predictive search, drawer behaviour, keyboard focus, contrast, empty and sold-out states, merchant editing in the theme editor.

Per `harness/README.md`, a sprint with unverified browser criteria cannot formally PASS. The evaluator should therefore report static criteria PASS/FAIL and mark browser criteria UNVERIFIED, and `progress.md` records the sprint as "static-pass, awaiting owner browser check". The generator should write code defensively (progressive enhancement, no-JS fallbacks) because it cannot see the result.

## Sprints

Ordered so each sprint leaves the store shippable and working (templates fall back to the previous sprint's basic markup until their own sprint rewrites them).

| # | Sprint | Features | Depends on |
| --- | --- | --- | --- |
| 01 | Design system and global shell (tokens, settings, base components, header with announcement bar, footer) | 1, 2 | – |
| 02 | Home page and collection browsing (home blocks, collection grid, filters, sort, pagination, collection list) | 3, 4 | 01 |
| 03 | Product page and cart (gallery, variants, add to cart with feedback, related products, cart page with AJAX updates) | 5, 6 | 01, 02 (product card) |
| 04 | Search, 404 and content pages (search results, predictive search, 404, blog, article, page, password) | 7, 8 | 01, 02 |
| 05 | Customer basics, polish and launch QA (customer templates where cheap, performance, a11y, SEO, editor QA, owner handoff notes) | 8 (customer part), 9 | 01-04 |

Notes for sprint order: sprint 03 is the purchase path, so it comes before search so the store can sell as early as possible. Predictive search (in sprint 04) is a header enhancement and must not regress the sprint-01 header.

## Open questions

Assumptions made so work is not blocked; the owner can overrule any of them.

1. **Catalogue and brand:** undecided, so the theme is category-neutral with a warm, practical identity. Assumed "everyday essentials" tone and a single accent colour; no vertical-specific features (size charts, subscriptions, allergen labels). Defaults are tuned for 1:1 or 4:5 product imagery but the card ratio is editable.
2. **Logo and brand name:** assumed text wordmark from `shop.name` with an optional logo image setting; no logo asset supplied.
3. **Currency and market:** assumed single market; money formatting uses the store's settings. Country/language selector only appears when the store has multiple localisations.
4. **Customer accounts:** assumed new customer accounts may be on; account link uses `shopify-account` as the current header does, with classic customer templates styled only if cheap.
5. **Fonts:** assumed Shopify-hosted fonts via the font picker; no external font CDN or custom font files.
6. **Quick add and cart drawer:** quick add on product cards is in scope only for single-variant products (multi-variant go to the product page); cart drawer deferred.
7. **Free-shipping progress bar:** assumed off by default; enabled by setting a threshold in the theme editor.
8. **Newsletter:** uses Shopify's native customer form (marketing tag), no app integration.
9. **Filtering:** assumes the store has Shopify Search and Discovery filters configured; without them the filter UI hides itself and sort remains.
10. **Languages:** English only; strings are structured for translation.
11. **Browser support:** evergreen browsers (last two versions), progressive enhancement for JS-dependent features.
12. **Template architecture:** existing `templates/*.liquid` stay Liquid templates (not JSON), so "merchant editability" means block settings (schema) and theme settings, not drag-and-drop sections. If the owner expected full drag-and-drop page building, that conflicts with the README dialect and needs a decision.
