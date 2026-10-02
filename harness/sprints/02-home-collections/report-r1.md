# Sprint 02, round 1: evaluation

- **Commit:** 4e82829
- **Preview:** unreachable (none exists this session; owner will run `shopify theme dev` later)
- **Verdict:** STATIC-PASS (conditional). Every Static criterion passes or is a contract-wording deviation I accept (S10, S21, S23); all 26 Browser criteria are UNVERIFIED. A formal PASS needs the owner's browser run after the required fixes below. Scores are from code and CSS only.

## Hard gates

| Gate | Result | Notes |
| --- | --- | --- |
| G1 Contract | UNVERIFIED | Static 32/32 pass or accepted-deviation (see table); Browser 0/26 run |
| G2 Static checks | PASS | `npm run check`: dialect 0/0, theme-check 0 errors, 0 other offenses |
| G3 Smoke | UNVERIFIED | no preview |
| G4 Shopper flows | UNVERIFIED | no preview |
| G5 Translations | PASS | TranslationKeyExists clean; locale depth 3 and 3; keys sentence case; no hard-coded shopper text found; aria-label grep (with -r) empty |
| G6 Accessibility | UNVERIFIED (one code-level risk) | see R1: drawer Escape and Tab trap depend on focus being inside the panel |

## Contract criteria (Static, each command re-run by me; table pipes un-escaped)

| ID | Result | Evidence |
| --- | --- | --- |
| S1 | PASS | `npm run check` output as above |
| S2 | PASS | check:dialect exit 0; no `sections/`; `ls templates/*.json` finds nothing |
| S3 | PASS | all four snippets rendered (price, badge via product-card; section-heading by banner, tiles, hero, newsletter, featured, brand-story, list-collections). product-card in featured-collection and collection-grid; no `render 'image'` there. Extended grep hits in sprint-02 files are only price-filter inputs and pills (`money`, `money_without_currency`), which are not card markup; other hits are untouched `templates/product`, `search`, `gift_card` (out of scope) |
| S4 | PASS | `.theme-check.yml` has only `extends` and `OrphanedSnippet: enabled: true`; grep empty; theme-check clean |
| S5 | PASS | index order: hero, featured-collection, trust-strip, collection-tiles, brand-story, newsletter, all inside one `container`; the hero is a direct child so `.block-container > .full-width` makes it full-bleed |
| S6 | PASS | grep over templates layout blocks assets locales snippets config returns nothing; all three files missing. Also removed `assets/shoppy-x-ray.svg` and dead `.welcome/.highlight` CSS (acceptable) |
| S7 | PASS | node script: no BAD labels; ids per block match the contract (hero 9, featured 4, trust 3, tiles 5, story 3, newsletter 2) |
| S8 | PASS | schema ranges/defaults and `settings_data.json` match; `settings.*` usage diff against schema ids is empty |
| S9 | PASS (code) | all four guards present; list markup is captured and tested before output so no empty `<ul>` from fallbacks; placeholder names `lifestyle-1/2`, `collection-1..6`, `product-1..4` are valid `placeholder_svg_tag` names |
| S10 | DEVIATION, accepted | Literal grep finds no `paginate` in `templates/collection.liquid`; `{% paginate collection.products by settings.collection_products_per_page %}` is in `blocks/collection-grid.liquid`. Shopify docs describe `paginate` as a plain tag usable anywhere Liquid renders (sections, snippets); nothing requires the template file. Recommend relaxing S10 to "the paginate tag with the setting is in the grid block that the collection template composes". Do not move it: the grid and pagination snippet need to be inside the tag. B9/B10 remain the real proof |
| S11 | PASS | `sort_options` loop, selected from `collection.sort_by \| default: collection.default_sort_by`, GET `sort_by`, visible `<label for>`, `<noscript>` apply button |
| S12 | PASS | `method="get"`, `action="{{ collection.url }}"`; hidden `sort_by` at line 68 inside `if collection.sort_by != blank`; list/boolean chips with `param_name`/`value`/`checked`; disabled only when `count == 0` and not active; price inputs labelled |
| S13 | PASS | `filter_value.url_to_remove` pills; price pill via `filter.url_to_remove`; aria-label keys include the value; Clear all shown only when `filters-active` flags something |
| S14 | PASS | whole panel, pills, button and layout class sit behind `collection.filters.size > 0` and `settings.collection_show_filters`; no wrapper outside the `if` |
| S15 | PASS | locale key has `one`/`other`; `aria-live="polite"`; gated on `collection_show_count` |
| S16 | PASS | `collection.products_count == 0` split by `filters_active`; no grid wrapper or pagination in either empty branch |
| S17 | PASS | no availability filtering; card shows sold-out badge |
| S18 | PASS | 2 columns, 3 at 48em, `var(--columns-desktop, 4)` at 64em, set inline by Liquid; no `settings.*` in CSS; `sizes` per breakpoint. Note: with the 15rem sidebar the 4-column cards are about 19vw, the `21vw` hint is slightly large (harmless) |
| S19 | PASS | nav aria-label, prev/next omitted at ends, `aria-current="page"` on the non-link current part, gaps are non-links; `paginate.parts` fields (`is_link`, `title`, `url`) and `paginate.previous/next.url` are correct per docs |
| S20 | PASS | `level: 1` hits: banner, hero, list-collections (own page); no literal `<h1` in collection files |
| S21 | PASS (grep wording deviation) | the literal grep hits only section-heading, paginate and pagination in the template; `collection.url`, `placeholder_svg_tag`, `products_count` live in `snippets/collection-tile.liquid` which the template renders; empty state uses `{%- else -%}`. Behaviour matches. Amend the grep to include the snippet |
| S22 | PASS | hero eager + `fetchpriority="high"` + widths + `sizes="100vw"`; first 4 grid cards eager, others lazy |
| S23 | PASS with interpretation | no colour literals (grep empty); `button` snippet used. Deviation: button 1 renders on label alone and falls back to `routes.all_products_collection_url`. I accept it (a "Shop all" CTA with no link is better than a dead hero) but the contract text says "label and link"; amend it. The info text discloses the behaviour |
| S24 | PASS | `icon` snippet, per-item and whole-strip omission |
| S25 | PASS | `form 'customer'`, `contact[tags]`, label, `type="email"`, `autocomplete`, `required`, success/error, `aria-describedby`; ids `PromoNewsletter{{ block.id }}...` vs footer `FooterNewsletter...` cannot collide even if `block.id` is empty. Risk: see W1 |
| S26 | PASS (with R1) | `node --check` ok; drawer CSS is under `.js` and inside `max-width: 47.999em`; closed panel is `visibility: hidden` so it is not tabbable; `open()` is a no-op at >=768px and a breakpoint change closes it, so the sprint-01 desktop keyboard-trap class is absent. The grep term `dataset` does not match (hooks are `data-*` selectors), as the generator noted |
| S27 | PASS | filters, sort, pills, clear and pagination are GET forms/anchors; open button is `display:none` unless `.js`; no-JS sort has the noscript button; no-JS filters are in-flow with Apply |
| S28 | PASS | 9999px radius, `min-height: var(--tap-size)`, `:focus-visible` ring on the label via the focus token, checked state = border weight + inset shadow + check icon |
| S29 | PASS | exactly one `<h1>` source per page; fallback h1 only in `hero.liquid` and mutually exclusive with the level-1 heading |
| S30 | PASS (maths) | no colour literals; my check of the figures: 40% scrim on #808080 gives about 8:1 for white text (generator's 6:1 is conservative); at the 20% minimum it is about 5.7:1. Fine on mid-grey; a bright photo can still fail, which `info` warns about |
| S31 | PASS | only `layout/theme.liquid` in the guarded paths, and its diff is a `case request.page_type` loading `collection.css`/`home.css` (plus `collection.js` loaded from the toolbar block) |
| S32 | OK (soft) | base 18,087 + collection 10,821 + home 3,745 B; collection.js 3,657 B |

Browser B1 to B26: all UNVERIFIED (no preview).

## Skeptical review: Liquid correctness

- `paginate` in a block with `collection.products`: legitimate. `paginate.pages`, `.parts`, `.previous`, `.next`, `.current_page` used correctly. The toolbar count reads `collection.products_count` outside the tag, which is fine (it reflects active filters).
- Filters: `collection.filters`, `filter.active_values`, `filter_value.url_to_remove`, `filter.url_to_remove`, `min_value/max_value.param_name`, `range_max` are all valid. The `money_without_currency | replace: ',', ''` hack matches Dawn; it is wrong for stores whose format uses a decimal comma (for example `1.234,50`). Non-blocking, document it.
- Sort: correct (`sort_options`, `default_sort_by`, `sort_by`). Active filters are carried into the sort form by `filter-hidden-inputs`.
- `{% form 'customer', id:, class: %}` is valid. Ids are distinct from the footer's.
- Escaping: values are escaped once before `section-heading`, which outputs raw; no double escape found. One miss: `{{ shop.name }}` in the hero fallback h1 is not escaped (R3).
- `image_url`/`image_tag` usage is correct; `widths`/`sizes` present; decorative card/tile images use `alt: ''` beside a text link.
- `layout/theme.liquid` change is limited to CSS loading.

## Scores (from code and CSS only; no rendering seen)

| Criterion | Score | Threshold | Notes |
| --- | --- | --- | --- |
| Design quality (x2) | 4 | >= 4 | Token-only colour, consistent spacing, hero scrim, chip/pill system, designed placeholders everywhere. Provisional: nothing rendered |
| Originality (x2) | 3 | >= 3 | Solid, familiar storefront patterns; accent-underline heading motif and the chip check state carry the brand. Nothing distinctive beyond sprint 01's motif yet |
| Craft | 4 | >= 4 | Careful progressive enhancement, captured-markup emptiness checks, scoped `.js` CSS. Deductions are the small items below |
| Functionality | 3 | >= 4 | Held at 3: nothing was rendered, and R1 is a real keyboard gap. Raise to 4 after R1 and a clean browser run |
| **Weighted total** | 21/30 | | Functionality threshold not yet met, hence conditional |

## Required fixes (before the owner's browser run counts toward PASS)

1. R1 (`assets/collection.js`, G6 risk): the Escape handler and the Tab trap are attached to the panel only. If the user clicks blank space inside the open drawer (focus drops to `body`), Escape does nothing and Tab walks into the page behind the modal. Move the `keydown` listener to `document` while open (add on `open()`, remove on `close()`), and if focus is outside the panel on Tab, send it to the first item.
2. R2 (contract text, `contract.md`): amend S10 (paginate lives in `blocks/collection-grid.liquid`), S21 (grep must include `snippets/collection-tile.liquid`) and S23 (button 1 falls back to all products). No code change.
3. R3 (`blocks/hero.liquid` line 54): `{{ shop.name | escape }}`.

## Judgement on the generator's flagged doubts

- S10 paginate location: relax the criterion, keep the code (R2).
- Literal-English schema defaults: accept. Setting `default` cannot be a `t:` key; the cost is that a cleared setting hides the element instead of falling back to locale copy, which is the stated and safe behaviour. Locale copy is used for placeholders.
- Hero button fallback link: accept and amend wording (R2).

## Suggestions and watch items (non-blocking)

- W1 (B7): two `form 'customer'` forms on one page: Shopify may report `form.posted_successfully?` for both after one submits. The owner must submit each and confirm the other does not show success; if both do, give the home form a distinct `form_type` or hide the message unless the URL hash matches the form id.
- `hero.liquid`: alt falls back to the heading text, so the heading is read twice. Prefer `alt: hero_image.alt` (empty is fine for decoration).
- `collection.css`: `.collection-filters { margin-bottom }` leaves a blank gap on mobile+JS when there are no active pills (the panel is fixed). Apply the margin only at >=48em or when pills exist.
- `blocks/collection-filters.liquid`: `aria-labelledby` on a roleless div (desktop) may be flagged by axe; add `role="group"` and drop it when the dialog role is set, or add the label only in JS.
- `blocks/featured-collection.liquid`: the "View all" link disappears when the heading is blank (it lives in `section-heading`). Fine, but note it in the editor info.
- `product-card`, `.product-grid` and tile CSS ship only on index/collection pages. Sprint 03 and 04 (product recommendations, search) will need `collection.css` loaded on `product` and `search`, or move the card and grid rules to `base.css`.
- A collection with no sort options, no count and no filters renders an empty bordered toolbar; unlikely, cheap to guard.

## Owner browser checklist priorities

B13 (drawer, including click blank area then Escape/Tab), B7 (two newsletter forms), B10/B9 (paginate inside the block, per-page 8), B12/B14/B15/B18 (filters and price range on a collection with Search and Discovery filters), B3 (zero-content and blank hero heading: exactly one h1), B16 (hide filters setting).
