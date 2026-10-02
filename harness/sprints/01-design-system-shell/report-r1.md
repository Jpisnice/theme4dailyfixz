# Sprint 01, round 1: evaluation

- **Commit:** 75da2db
- **Preview:** unreachable (none in this session). All scoring is code-based.
- **Verdict:** FAIL (static review: 1 blocking bug found by reading; a formal PASS also requires the owner's browser verification of B1-B20)

## Hard gates

| Gate | Result | Notes |
| --- | --- | --- |
| G1 Contract | UNVERIFIED | Static 28/29 PASS (S10 literal command is noisy, see below; S29 soft); S15 and S14 PASS on text but header.js has a keyboard-trap bug (see Required fixes). Browser B1-B20 all UNVERIFIED. |
| G2 Static checks | PASS | `npm run check`: dialect 0 errors 0 warnings; theme-check 0 errors 0 other offenses. |
| G3 Smoke | UNVERIFIED | No preview. |
| G4 Shopper flows | UNVERIFIED | No preview. Sprint touches shell only; add-to-cart not in scope. |
| G5 Translations | PASS | Script: no missing `\| t` keys, no missing `t:` schema keys, all settings labels/info/names are `t:` and resolve, depth 3, dynamic `footer.social.<network>` keys all exist. No literal `aria-label`. |
| G6 Accessibility | FAIL (code) | Desktop keyboard trap in header.js (blocking). Contrast defaults all >= 4.5. |

## Contract criteria

Static (re-run independently, self-check.md not trusted).

| ID | Result | Evidence |
| --- | --- | --- |
| S1 | PASS | `npm run check` clean; css-variables and meta-tags start with `{% doc %}`. |
| S2 | PASS | check:dialect exit 0; no `sections/`; no `templates/*.json`. |
| S3 | PASS | shopify_attributes count 1 each, on root element (`<div class="announcement-bar">`, `<header>`, `<footer>`). |
| S4 | PASS | All 7 snippets open with `{% doc %}`; @param counts icon 2, button 7, price 6, badge 1, product-card 5, section-heading 6, social-link 2. Every used param documented. |
| S5 | PASS | theme.liquid order announcement-bar, header, `<main>`, footer, no container; templates still use `container`. |
| S6 | PASS | Skip link first in `<body>`, href `#MainContent`; `<main id="MainContent" tabindex="-1">`. |
| S7 | PASS | Tokens for all categories incl. `--tap-size: 2.75rem`, `--space-1..8` 0.25rem-4rem, `--focus-ring`, `--card-ratio`. |
| S8 | PASS | No colour literals in base.css; critical.css hex only as `var(--x, #hex)`. |
| S9 | PASS | 10 colour, 2 font_picker, 4 range, 2 select, image_picker, announcement (text, link, 2 colours), footer blurb, 6 social URLs; all labels `t:` and resolve. |
| S10 | PASS | settings_data parses after comment strip; every schema id has a use. The literal regex also lists `menu, menu_1..3, show_payment_icons, alignment`; these are `block.settings.*` / other-block settings, false positives of the contract's regex (contract wording flaw, not a code fault). Note logo, announcement_link and socials have no stored value (valid: blank). |
| S11 | PASS | No literal English in changed Liquid. |
| S12 | PASS | See G5. Sentence case values. |
| S13 | PASS | One `<header>`, `<nav aria-label>`, toggle `aria-expanded` + `aria-controls="MenuDrawer"` equals drawer id, cart label in `aria-live="polite"` visually-hidden span, search/cart/account routes correct, account gated by `shop.customer_accounts_enabled`. |
| S14 | PASS on the letter, bug in substance | Escape, focus() in/out, aria-expanded, dataset, no Liquid, `node --check` ok. But the Tab trap is not gated on the drawer being open (see fix 1). |
| S15 | PASS | `js` class added inline; hiding rules (`visibility:hidden`, transform, `.menu__sub{display:none}`, toggles) are under `.js` or inside the min-width 48em block; no-JS mobile: in-flow panel, header `position: relative`. |
| S16 | PASS | `form 'customer'`, hidden `contact[tags]`, label, type email, autocomplete, required, success + error, `aria-describedby` on error. |
| S17 | PASS | Both selectors gated by `.size > 1`, inside `form 'localization'`. Field names `country_code` / `language_code` correct. |
| S18 | PASS | Blurb blank-safe; columns omitted when menu empty; `--footer-cols` from Liquid; copyright uses `'now' \| date: '%Y'` and shop name. |
| S19 | PASS | One `<li><a>` per set URL via social-link; `<ul>` omitted when all blank (concatenated-string blank test is correct); payment list omitted when empty/off. |
| S20 | PASS | Reads all four `settings.announcement_*`; no wrapper when blank; link optional. |
| S21 | PASS | Logo: `image_url` width, explicit width/height, eager, alt shop.name. Card: widths, sizes, lazy param, `alt=""` with doc-header justification. |
| S22 | PASS | placeholder_svg_tag, compare-at + sale badge (only when available), sold-out badge, second image only when `images.size > 1`. |
| S23 | PASS | `tabular-nums` on `.price`; `--tap-size` on toggle, close, icons, sub-toggle, menu links. price.liquid guards compare-at (> price) and unit price (measurement). |
| S24 | PASS | reduced-motion block (also zeroes transition-delay); focus-visible uses `--focus-ring`. |
| S25 | PASS | fg/bg 14.34, muted/bg 5.86, muted/surface 5.20, accent-text/accent 5.35, sale/bg 6.21, announcement 14.34. |
| S26 | PASS | dm_serif_display_n4 vs work_sans_n4; `.accent-underline` in base.css and section-heading; accent #C8321A. |
| S27 | PASS | All render targets and assets exist; check:theme clean. |
| S28 | PASS | No templates changed in HEAD. |
| S29 | OK (soft) | critical.css 3264 B, base.css 19193 B. |

Browser criteria B1, B3-B20 (B2 folded): all **UNVERIFIED** (no preview). Key ones to run first: B6, B8, B9 (keyboard) because of the bug below.

## Code review findings

1. **BLOCKING, `assets/header.js` lines ~58-71: Tab trap is active on desktop.** The `keydown` handler on `[data-menu-drawer]` handles Tab without checking `isOpen()`. At 768px+ the drawer is the inline nav (still a DOM descendant of the drawer element). Tabbing forward from the last visible top-level menu link wraps focus back to the first menu link, so the search, account and cart links in the header (and everything after) are unreachable by keyboard on desktop. WCAG 2.1.2 No Keyboard Trap. Also at open dropdown the last sub-link is "last" so same wrap. Fix: `if (!isOpen()) return;` at the top of the Tab branch (Escape branch too, so it does not `stopPropagation` needlessly).
2. **Related, header.js lines ~19-21:** `role="dialog"` and `aria-modal="true"` are set unconditionally, so on desktop the inline nav is announced as a modal dialog (and aria-modal can make assistive tech ignore the rest of the page). Apply them only while the drawer is open on mobile (set on open, remove on close and on the `DESKTOP` change), or only when `!DESKTOP.matches`.
3. Non-blocking: `data-label-other` uses `t: count: 99999` and JS `replace('99999', n)`. Works for English; fragile for locales with extra plural categories or number formatting that adds separators. Acceptable now; prefer passing a `{{ count }}` template from a dedicated locale key, or fetch the label.
4. Non-blocking: `.theme-check.yml` disables `OrphanedSnippet` for the whole repo. Reaches 0 warnings but hides future dead snippets. Prefer `OrphanedSnippet: ignore:` listing price, badge, product-card, section-heading, and remove the entry once sprint 02 consumes them.
5. Non-blocking: focus ring colour is the accent (#C8321A). On the dark announcement bar (#2A2420) the contrast is about 2.4:1, below the 3:1 non-text minimum, for the announcement link. Give `.announcement-bar a:focus-visible` an `outline-color: currentColor`.
6. Non-blocking: `icon.liquid` `x` network icon is a plain cross (reads as "close"); `return` icon arc runs to y=24 on the viewBox edge and will clip. Cosmetic.
7. Non-blocking: wordmark has no truncation (`min-width:0` on brand but no `text-overflow`), a long shop name could squeeze the icons at 375px. Check in B3.

Checked and found fine: `font_picker` handles `dm_serif_display_n4` / `work_sans_n4` are well-formed Shopify handles (cannot be validated by Theme Check; owner must confirm both appear in the editor font list, B14); `font_face`/`font_modify`/`color_darken` usage; `[hidden]{display:none !important}` in critical.css means the backdrop and cart-count `hidden` attributes work despite `.js .menu-backdrop{display:block}`; removal of `shopify-account` is sound (account is now a plain `routes.account_url` link, old `customer_account_menu` setting removed from schema and no longer referenced); focus return to toggle and visibility transition ordering are correct; the `cart:updated` listener fetches `/cart.js` via `routes.cart_url`, guards errors and keeps the server count; Escape for dropdowns runs before the drawer handler (bubbling order) so it works.

## Scores (code-based only, no rendering seen; provisional)

| Criterion | Score | Threshold | Notes |
| --- | --- | --- | --- |
| Design quality (x2) | 4 | >= 4 | Coherent warm palette, serif display over Work Sans, token-driven scale and spacing, accent bar motif. Unverified visually. |
| Originality (x2) | 4 | >= 3 | Deliberate choices (accent-underline motif, pill buttons, 4/5 image-led card, cream/tomato palette) rather than skeleton defaults. |
| Craft | 3 | >= 4 | Tokens used consistently, but the desktop keyboard trap and dialog roles are real execution bugs. |
| Functionality | 3 | >= 4 | Empty states handled well (no menu, no logo, no socials, no announcement, no payments), but keyboard trap breaks desktop navigation. |
| **Weighted total** | **22/30** | | Craft and functionality below threshold. |

## Required fixes (blocking)

1. `assets/header.js`: gate the Tab-trap (and ideally the whole drawer keydown handler) on `isOpen()` so desktop keyboard users can tab past the menu to search, account and cart.
2. `assets/header.js`: only apply `role="dialog"`/`aria-modal` while the mobile drawer is open.
3. Owner: run browser criteria B1-B20 (needs `shopify theme dev`); until then no formal PASS is possible. Priority: B6, B8, B9, B20, B10, B12.

## Suggestions (non-blocking)

- Items 3-7 above.
- Contract S10 command should scope to `settings\.` excluding `block.settings.` / `section.settings.`.
