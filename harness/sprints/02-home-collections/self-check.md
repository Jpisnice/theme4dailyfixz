# Sprint 02 self-check (generator pre-flight, not a verdict)

Run against the AGREED contract (Round 2). Browser criteria B1 to B26 are not run: no preview is available this session, so all are UNVERIFIED. `learn_shopify_api` was not available as a tool in this session; Liquid objects were checked against `search_docs_chunks` and sprint 01 patterns only.

| ID | Result | Evidence |
| --- | --- | --- |
| S1 | PASS | `npm run check`: `dialect-check: 0 error(s), 0 warning(s)`; `theme-check: 0 error(s), 0 other offense(s)`. |
| S2 | PASS | dialect check 0/0; no `sections/`; no `templates/*.json`. All 10 new blocks have `{% doc %}`, `{% schema %}` and `shopify_attributes`; `{% block %}` only in templates. |
| S3 | PASS with listed non-card hits | All four snippets consumed (price and badge via product-card; section-heading by 6 blocks and list-collections). `product-card` rendered in featured-collection and collection-grid; no `render 'image'` in either. The extended grep still hits `templates/product.liquid` (l.10, 26) and `templates/search.liquid` (l.34): untouched sprint-03/04 templates, not product tiles on home or collection. No hits in sprint 02 files. |
| S4 | PASS | `.theme-check.yml` is now only `extends` plus `OrphanedSnippet: enabled: true`; grep returns nothing; theme-check 0 offenses (no orphan). |
| S5 | PASS | index: hero, featured-collection, trust-strip, collection-tiles, brand-story, newsletter, in one container. |
| S6 | PASS | hello-world, liquid-tips blocks, `assets/liquid-tips.js` (and the unused `shoppy-x-ray.svg`) deleted; `hello_world` keys and `general.hello_world`/`liquid_tips` schema keys removed; the legacy `.welcome/.highlight` and old collection CSS removed from base.css; grep over templates, layout, blocks, assets, locales, snippets, config returns nothing. (README still mentions the svg in prose; not touched.) |
| S7 | PASS | Script: all `t:` labels/info/names resolve. Settings: hero image, heading, subheading, button_label, button_link, button_2_label, button_2_link, text_alignment, overlay; featured heading, collection, product_count (2..12, default 4), show_view_all; tiles heading + collection_1..4; trust-strip delivery/returns/checkout text; brand-story heading, text, image; newsletter heading, text. |
| S8 | PASS | Four collection settings with specified ranges/defaults; all four in `settings_data.json`; script: no undefined `settings.*` usage. |
| S9 | PASS (code review) | See "Unsure" for the guard design. hero: placeholder svg, button and sub guarded; featured: empty/unset collection falls back to `collections.all`, then placeholder cards; tiles: picks, then `collections` first 4, then placeholder tiles; brand-story: placeholder svg, heading/text guarded. List markup is captured and tested before output so no empty `<ul>` from fallbacks. |
| S10 | DEVIATION | Template composes banner, toolbar, filters, grid in order, but `{% paginate collection.products by settings.collection_products_per_page %}` lives in `blocks/collection-grid.liquid`, not in the template. Reason: Shopify's paginate scope is only safely known to work when the product loop is in the same file as the tag (Dawn does this); I could not verify the scope crosses a block boundary. Please decide whether to relax S10's grep. |
| S11 | PASS | sort_options loop, selected from `collection.sort_by | default: collection.default_sort_by`, GET `sort_by`, visible label, `<noscript>` submit. |
| S12 | PASS | `method="get"` and `action="{{ collection.url }}"`; hidden `sort_by` guarded by `collection.sort_by != blank`; list/boolean chips, price_range inputs with labels; disabled when count 0 and not active. |
| S13 | PASS | pills per active value via `url_to_remove`; price range pill via `filter.url_to_remove`; aria-label keys include the value; Clear all to `collection.url`, only when a filter is active (`filters-active` snippet). |
| S14 | PASS | all filter UI inside one `if collection.filters.size > 0 and settings.collection_show_filters`; toolbar button and template layout class guarded identically. |
| S15 | PASS | key `collections.product_count` has `one`/`other`; `aria-live="polite"` p; only when `collection_show_count`. |
| S16 | PASS | `products_count == 0` splits filter-active (no-match + clear link) from empty collection (message + all-products link); no grid wrapper in either; pagination only in the non-empty branch. |
| S17 | PASS | no availability filtering in grid or featured; card shows sold-out badge. |
| S18 | PASS | CSS grid, 2 columns below 48em, 3 at 48em, `var(--columns-desktop, 4)` at 64em; property set inline by Liquid; no `settings.*` in CSS; `sizes` per breakpoint. |
| S19 | PASS | `<nav aria-label>`, prev/next omitted at ends, `aria-current="page"`, numbered links and non-link gaps from `paginate.parts`. |
| S20 | PASS | banner uses `section-heading` level 1; `level: 1` hits: banner (collection), hero (home), list-collections (own page); no literal `<h1` in collection files. |
| S21 | PASS with note | list template paginates 24, uses section-heading, empty state, pagination; tile link/placeholder/count live in `snippets/collection-tile.liquid` (shared with the home tiles), so the grep against the template alone will not show `collection.url`, `placeholder_svg_tag`, `products_count`. |
| S22 | PASS | hero eager, fetchpriority high, widths + `sizes="100vw"`; grid first 4 cards `lazy: false`; others lazy; below-fold images lazy. |
| S23 | PASS | no colour literals in collection.css/home.css; scrim uses `var(--color-foreground)` and opacity from `--hero-overlay`; hero uses `button` snippet. Interpretation: a button renders when its label is set; the first button link falls back to the all-products URL when blank, so the pair is always set. The second button needs both. |
| S24 | PASS | three items, `icon` snippet, item omitted when blank, strip omitted when all blank; styles in base.css so sprint 03 can reuse it. |
| S25 | PASS | `form 'customer'`, `contact[tags]`, label, email, autocomplete, required, success/error with aria-describedby; ids are `PromoNewsletter{block.id}...`, footer uses `FooterNewsletter...`. |
| S26 | PASS | `node --check` ok; Escape, aria-expanded, focus(), dataset-free but config is `data-*` hooks; drawer CSS is under `.js` and inside the max-width block. |
| S27 | PASS | GET forms, anchor pills and pagination; JS only adds auto-submit and the drawer. |
| S28 | PASS | pill radius 9999px, `min-height: var(--tap-size)`, focus ring via `--focus-ring` on the label, checked state = border + inset shadow + check icon. |
| S29 | PASS | aria-label grep (with `-r`) empty; theme-check TranslationKeyExists clean; script: no missing `\| t` keys; locale depth 3 and 3. One h1: hero heading (level 1) or a visually hidden shop-name h1 when blank, in `hero.liquid` only. |
| S30 | PASS (maths) | no colour literals. Light text over the scrim on a mid-grey (#808080) image: 0% overlay about 3.9:1, 20% about 4.8:1, default 40% about 6.2:1. Range min is 20; `info` states the figures. Placeholder hero sits on the dark foreground colour. Sale badge and chip text reuse sprint 01 token pairs (6.2 and 14.3 earlier). |
| S31 | PASS | only `layout/theme.liquid` appears in the diff from 3e03835; added lines: a `case request.page_type` loading `collection.css` and `home.css` on index, `collection.css` on collection and list-collections. `collection.js` is loaded from `blocks/collection-toolbar.liquid`. |
| S32 | OK (soft) | base.css 17,987 B + collection.css 10,821 + home.css 3,745 (+ critical 3,264); collection.js 3,657 B. |

## Unsure or worth a skeptical look
- Everything is unrendered; the Liquid parses under Theme Check but I could not render it. Highest risk: `{% paginate %}` plus `paginate.parts` inside the block, `filter.active_values` for price ranges, price filter values (`money_without_currency | replace: ',', ''` as in Dawn), and `block.id` in a static block (used for the newsletter id; the prefix alone is already unique against the footer).
- Schema `default` values cannot be `t:` keys (the docs list `default` only for presets), so block text defaults are literal English in the schema, and "sample copy from locale keys" applies only to placeholder tiles and cards. A cleared setting hides that element rather than falling back to copy.
- Hero button fallback link (see S23) is my interpretation.
- S10 and S21 greps differ from the file layout as noted above.
- The filter drawer uses the toolbar button as opener (outside the filters block) found via `document.querySelector`, and `collection.js` loads from the toolbar so sort auto-submit works even with no filters.
- Active filters in the sort form are carried by hidden inputs; price values go through `money_without_currency`, which could mis-round on non-decimal currencies.
- Desktop chips auto-submit on change; the Apply button stays visible everywhere (simpler than hiding it).
- `placeholder_svg_tag` names (`lifestyle-1`, `lifestyle-2`, `collection-1..6`, `product-1..4`) are assumed valid.
- B26 focus clause: added one `base.css` rule so keyboard focus on the card link also reveals the second image (`:has(:focus-visible)`); hover is from sprint 01. S26 grep note: collection.js has no `dataset` use (hooks are `data-*` attribute selectors), so that grep term will not match.

## Round 1 fixes
- R1: `assets/collection.js` attaches the keydown handler (Escape and Tab trap) to `document` in `open()` and removes it in `close()`; if focus is outside the panel on Tab it moves to the first (or last on Shift+Tab) item. Desktop (>=768px) still never opens the drawer, so no trap.
- R2: contract S10, S21, S23 reworded to match the code; added a "Round 2 fixes" note.
- R3: hero fallback h1 outputs `shop.name | escape`.
- Extras: hero image alt is the image's own alt or empty (decorative), no longer the heading; `aria-labelledby` removed from the panel markup and set by JS only while it is a dialog.
