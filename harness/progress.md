# Progress

The handoff file. Read this first in every new session. Update it at the end
of every sprint and before any context reset (`/harness-handoff`).

## Current state

- **Active spec:** `harness/specs/storefront.md`
- **Architecture:** Online Store 2.0 (sections + JSON templates + section groups). Migrated off the block-first `{% block %}` developer-preview dialect on 2026-10-02.
- **Design identity:** "Crisp Modern Retail" (paper white, near-black ink, deep-green `#1F6F5C` accent, Archivo + Inter, type-scale/elevation/motion tokens).
- **Last verdict:** n/a (static-only; `npm run check` clean)
- **Preview URL:** http://127.0.0.1:9292 (via `shopify theme dev`). No preview is available to agent sessions; owner previews locally.

## Next step

Owner browser pass of the redesign in `shopify theme dev` (see "Redesign" section below), then optionally customer/account pages (sprint 05 scope).

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
