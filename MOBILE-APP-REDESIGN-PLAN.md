# DailyFixz — mobile-app redesign ("Everyday App")
claude --resume b66fdcbe-687a-4f48-9437-9be01dc1b991

**Store:** DailyFixz sells **general household products** (not grocery-specific). The
supplied mockup is a grocery app, but it's a *visual/UX reference only* — copy,
imagery, promo text, brand examples and product unit lines must stay
catalogue-neutral for general household goods, not food-specific.

> Target plan file. Reference this in a future prompt (e.g. "continue the Everyday
> App plan, Phase 2") to resume. Status checkboxes track progress.

## Status

- [ ] Phase 0 — clear deploy blocker (ghost `.liquid` templates) — **do first** (local untracked `templates/404.liquid` deleted 2026-10-03; removing the old `.liquid` templates from the remote dev theme is still the owner's step)
- [x] Phase 1 — App tokens (static-pass 2026-10-03)
- [x] Phase 2 — Mobile app shell (sticky header + bottom tab bar) (static-pass 2026-10-03)
- [x] Phase 3 — Home screen (promo carousel, Top Brands, Recommended + quick-add card) (static-pass 2026-10-03)
- [x] Phase 4 — Inner pages app polish (static-pass 2026-10-03)
- [x] Phase 5 — Locales, checks, docs (smoke test not run: needs `shopify theme dev`)

## Context

Make the storefront look and feel like the supplied mobile-app mockup: light, rounded, friendly — applied to a **general household-products** catalogue (the mockup's grocery items are placeholders only). Screenshot traits:

- **Sticky top bar:** small logo left; two circular icon buttons right (cart, notifications/account); a prominent **rounded pill search** below.
- **Promo banner:** rounded card, teal→dark gradient, headline ("50% OFF"), subcopy, cyan pill CTA ("Get Now"), product image right, **carousel dots**.
- **Top Brands:** horizontal-scroll row of **circular brand avatars** + labels + "See all".
- **Recommended Products:** 2-up grid of white rounded cards showing **price first (bold)**, title, muted unit line ("Per 0.5KG (Pcs)"), round dark **"+" quick-add**.
- **Sticky bottom tab bar:** Home / Explore / Orders / Profile; active tab dark, others muted.
- Light grey canvas, white rounded cards, soft shadows, pill buttons, mobile-first.

**Confirmed decisions:** whole store adopts the aesthetic; bottom tab bar is **mobile-only** (hidden ≥768px); typography is **DM Sans** (Shopify-hosted).

Builds on the current Online Store 2.0 architecture (sections + JSON templates + section groups) and the existing token system — a re-skin + new app chrome + new home sections, not an architecture change.

> **Phase 0 blocker (deploy, not code):** the dev theme 500s because old `.liquid` templates (product, cart, search, blog, article, page, 404) still exist on the remote dev theme beside the new `.json` ones ("Filename … already exists with liquid extension"). Restart `shopify theme dev` and allow it to **delete** the remote files, or `shopify theme remove` those 7 paths (dev server stopped). Nothing renders until cleared.

---

## New design language — "Everyday App"

Tokens in `snippets/css-variables.liquid`; defaults in `config/settings_schema.json` + `settings_data.json`; fallbacks in `critical.css`.

**Color**
| Token | Value | Use |
| --- | --- | --- |
| `--color-background` | `#F6F7F9` | app canvas |
| `--color-surface` | `#FFFFFF` | cards, header, nav |
| `--color-foreground` | `#1A1D1F` | ink, primary buttons, active nav |
| `--color-muted` | `#6C7278` | secondary text |
| `--color-border` | `#EDEFF2` | hairlines |
| `--color-accent` | `#16B6CE` | links, focus, highlights (cyan/teal) |
| `--color-accent-contrast` | `#FFFFFF` | — |
| `--color-promo-from` / `--color-promo-to` | `#1E8294` → `#0E4C5A` | promo gradient |
| `--color-sale` | `#C0392B` | sale |

Primary buttons and the quick-add "+" use **ink** (`--color-foreground`); cyan accent is for links, dots, focus and the promo CTA.

**Shape:** `--radius` 16px, `--radius-lg` 20px (cards/banner), `--radius-pill` 999px (buttons, search, chips, avatars). Buttons/search/chips use the pill token in `base.css`; the setting controls card radius.

**Depth:** softer card shadow — `--shadow-card: 0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)`.

**Type:** **DM Sans** headings + body (`type_header_font: dm_sans_n7`, `type_body_font: dm_sans_n4`); keep the fluid type-scale tokens, headings slightly smaller.

---

## Implementation — phased

### Phase 1 — App tokens
- `css-variables.liquid`: new palette + promo gradient vars, pill/large radius tokens, softer `--shadow-card`.
- `settings_schema.json` + `settings_data.json`: new colour/font/radius defaults (DM Sans, canvas, ink, cyan accent; promo colours if merchant-editable).
- `critical.css`: update fallback colours + shell paint.
- `base.css`: `.button`/search/chips/avatars use `--radius-pill`; cards use `--radius-lg`; apply `--shadow-card`; retune focus ring on the light canvas.

### Phase 2 — Mobile app shell (sticky)
- **Header** (`sections/header.liquid`): row 1 = logo left + two circular icon buttons right (cart w/ count, account/notifications); row 2 = full-width **pill search** (`form GET → routes.search_url`). Sticky top. Mobile hides the hamburger/menu drawer (nav via bottom bar + search + "See all"); desktop shows inline menu + search. Announcement bar optional (blank by default).
- **Bottom tab bar** (new `snippets/mobile-tab-bar.liquid`, in `layout/theme.liquid`): sticky bottom, mobile only (`display:none` ≥48em). Home `routes.root_url`; Explore `routes.all_products_collection_url`; Orders (`routes.account_url` if `shop.customer_accounts_enabled` else `routes.cart_url`); Profile `routes.account_url`. Active via `request.page_type`/`request.path` → `aria-current`. Add bottom padding to `<main>`/body on mobile.
- **Icons** (`snippets/icon.liquid`): add `home`, `compass`, `bell`; reuse `cart`, `account`, `plus`.
- Shell CSS in `base.css`.

### Phase 3 — Home screen
- **Promo banner carousel** — new `sections/promo-banner.liquid` + theme block `blocks/promo-slide.liquid` (heading, subheading, image, CTA label/link, gradient colours). Rounded gradient card, text left + image right, pill CTA; multiple slides via `{% content_for 'blocks' %}` with **dots** + swipe. New `assets/carousel.js` (scroll-snap + dots + optional autoplay; degrades to horizontal scroll). Retire full-bleed `hero` from default home (keep section available).
- **Top Brands** — new `sections/brand-row.liquid` + theme block `blocks/brand.liquid` (image, name, link). Circular avatar scroll-snap row + "See all" via `section-heading` `url`/`link_text`.
- **Recommended Products** — restyle `sections/featured-collection.liquid` to the app 2-up grid + "See all"; pass `quick_add: true` to the card.
- **Product card** (`snippets/product-card.liquid`): white rounded card, tinted media, body = **price (bold) → title → muted unit line** (`variant.title` when not default), round **ink "+" quick-add** bottom-right. Quick-add = `/cart/add.js` form (first available variant) dispatching `cart:updated`; multi-variant products link to the product page. New `assets/quick-add.js` (`[data-quick-add]`).
- `templates/index.json` default order: `promo-banner`, `brand-row`, `featured-collection`. `collection-tiles`, `trust-strip`, `brand-story`, `newsletter` remain available.
- Home CSS in `assets/home.css`.

### Phase 4 — Inner pages, app polish
- **Collection** (`main-collection`): 2-up app cards on mobile, pill sort/filter controls; keep filter drawer.
- **Product** (`main-product`): token re-skin + **sticky mobile buy bar** (price + add-to-cart pinned bottom, above the tab bar).
- **Cart** (`main-cart`): token re-skin + **sticky mobile checkout bar** (subtotal + checkout).
- **Content** (search/blog/article/page/404): inherit tokens; search results reuse app cards.

### Phase 5 — Locales, checks, docs
- `t:` keys: nav labels (home/explore/orders/profile), brands title + "See all", recommended "See all", quick-add aria, promo defaults, search placeholder. Update `en.default.json` + `en.default.schema.json`.
- `npm run check` clean per phase; `npm run smoke` after the Phase 0 blocker is cleared.
- Update `harness/specs/storefront.md` (identity → "Everyday App") + `harness/progress.md`.

---

## Key files

- **Tokens:** `snippets/css-variables.liquid`, `config/settings_schema.json`, `config/settings_data.json`, `assets/critical.css`, `assets/base.css`.
- **Shell:** `sections/header.liquid`, new `snippets/mobile-tab-bar.liquid`, `layout/theme.liquid`, `snippets/icon.liquid`.
- **Home:** new `sections/promo-banner.liquid` + `blocks/promo-slide.liquid`; new `sections/brand-row.liquid` + `blocks/brand.liquid`; `sections/featured-collection.liquid`; `snippets/product-card.liquid`; `templates/index.json`; `assets/home.css`, `assets/carousel.js`, `assets/quick-add.js`.
- **Inner pages:** `sections/main-collection.liquid`, `sections/main-product.liquid` (+ sticky buy bar), `sections/main-cart.liquid` (+ sticky checkout bar), `assets/product.css`, `assets/cart.css`, `assets/content.css`.
- **Reused primitives (restyle, don't fork):** `section-heading`, `button`, `price`, `badge`, `quantity-input`, `variant-picker`, `product-gallery`, `pagination`.

## Verification

- **Static:** `npm run check` → 0 errors after each phase.
- **Deploy:** clear ghost `.liquid` templates, then `shopify theme dev`.
- **Smoke:** `npm run smoke` (no console errors; no horizontal overflow at 375px/1280px).
- **Owner browser pass (mobile-first, 375px):** sticky header + search stay pinned on scroll; bottom tab bar pinned, correct active tab, content not obscured; promo carousel swipes + dots (and works without JS); Top Brands scrolls; product cards show price-first + "+" quick-add updating the header count via `cart:updated`; quick-add on multi-variant products routes to the product page; product/cart sticky bars work; all degrade without JS. Desktop (1280px): bottom bar hidden, header nav + wider grids correct. Contrast ≥ 4.5:1 (cyan-on-white, ink buttons), visible focus rings.

## Implementation notes (2026-10-03)

Deviations from the plan above, made deliberately:

- **Slides and brands are section blocks** (`blocks` inside `sections/promo-banner.liquid` and `sections/brand-row.liquid`), not `blocks/*.liquid` theme blocks, because the theme dialect is plain OS 2.0 (see CLAUDE.md).
- **`--color-accent-contrast` defaults to ink `#0B2B33`, not white**: white on cyan `#16B6CE` is about 2.4:1. Added `--color-accent-strong` (accent darkened 22%) for text links and focus rings.
- **Brand row falls back to product vendors** (initial in a circle) when no brand blocks are added.
- **Quick-add**: single-variant products add in place; multi-variant products show the "+" as a link to the product page, with an "N options" unit line.
- **Tab bar**: with customer accounts off, Orders becomes Cart and Profile is dropped.
- **Mobile menu drawer removed** (no hamburger); `header.js` now only handles desktop dropdowns and the cart count.
- Sticky buy bar (product) and checkout bar (cart) work by making the form/footer `display: contents` below 48em so `position: sticky` spans the page.
