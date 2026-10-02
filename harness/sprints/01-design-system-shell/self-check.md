# Sprint 01 self-check (generator pre-flight, not a verdict)

Run against the AGREED contract. Browser criteria (B1 to B20) are not run: no preview is available this session.

| ID | Result | Evidence |
| --- | --- | --- |
| S1 | PASS | `npm run check`: dialect 0 errors 0 warnings; theme-check 0 errors 0 other offenses. `css-variables` and `meta-tags` now open with `{% doc %}`. |
| S2 | PASS | `check:dialect` exits 0; no `sections/`; no `templates/*.json`. |
| S3 | PASS | `grep -c shopify_attributes`: 1 each in announcement-bar, header, footer (on root element). |
| S4 | PASS | All 7 snippets start with `{% doc %}`; @param counts: icon 2, button 7, price 6, badge 1, product-card 5, section-heading 6, social-link 2. |
| S5 | PASS | theme.liquid order: announcement-bar (l.39), header (41), `<main>` (43), footer (47); no container around them; templates still use `container`. |
| S6 | PASS | Skip link is first child of `<body>`; `<main id="MainContent">`. |
| S7 | PASS | Tokens for all required categories incl. `--tap-size`; spacing `--space-1`..`--space-8` (0.25rem to 4rem). |
| S8 | PASS | No hex/rgb in base.css; critical.css hex only inside `var(--x, #hex)` fallbacks (0 non-var lines). |
| S9 | PASS | 10 colour settings, 6 social URL settings, all label/info/name/content keys resolve in schema locale (script output: bad keys []). Block schema labels also resolve. |
| S10 | PASS | settings_data parses after stripping header comment; undefined `settings.*` ids: none. |
| S11 | PASS | No literal `aria-label="..."`; no literal English found in changed blocks/snippets. Note: `powered_by_link` is Shopify-generated; pre-existing `hello-world.liquid` img has no alt (not touched this sprint). |
| S12 | PASS | Theme Check TranslationKeyExists clean; script found no missing `\| t` keys; depth 3 in both locale files. |
| S13 | PASS | One `<header>`, `<nav aria-label>`, toggle with aria-expanded/aria-controls="MenuDrawer", cart live region, routes.search_url / cart_url / account_url, account inside `shop.customer_accounts_enabled`. |
| S14 | PASS | `node --check` ok; no Liquid in file; Escape, focus trap, focus return, aria-expanded, `dataset` config. |
| S15 | PASS (code review) | Inline script adds `js`; no-JS defaults are in-flow panel, toggles `display:none`, submenus visible; hiding rules are scoped under `.js` or the 48em block. |
| S16 | PASS | form 'customer', hidden contact[tags]=newsletter, label, type=email, autocomplete, required, success and error states, aria-describedby on error. |
| S17 | PASS | Country/language selectors gated by `.size > 1` inside `form 'localization'`. |
| S18 | PASS | Brand + blurb (blank-safe), menu_1..3 columns omitted when empty, `--footer-cols` from Liquid, copyright with year and shop name. |
| S19 | PASS | social-link renders only when URL set; `<ul>` omitted when all blank; payment icons from `shop.enabled_payment_types`, omitted when empty or setting off. |
| S20 | PASS | Reads `settings.announcement_*`; no output when text blank; link optional. |
| S21 | PASS | Logo: image_url with explicit width, eager, alt shop.name, width/height. Card: widths, sizes, lazy param, alt="" with comment. |
| S22 | PASS | Placeholder, sale badge + compare price, sold-out badge, second image only when `images.size > 1`. |
| S23 | PASS | tabular-nums on `.price`; `--tap-size` used 14 times in base.css (toggle, close, icons, links, buttons, inputs). |
| S24 | PASS | reduced-motion block; focus-visible uses `--focus-ring`. |
| S25 | PASS | fg/bg 14.34; muted/bg 5.86; muted/surface 5.20; accent text/accent 5.35; sale/bg 6.21; announcement 14.34. |
| S26 | PASS | heading `dm_serif_display_n4` vs body `work_sans_n4`; `.accent-underline` in base.css and section-heading; accent #C8321A. |
| S27 | PASS | `npm run check:theme` clean; header.js, base.css, critical.css exist. |
| S28 | PASS | No template files changed. |
| S29 | OK (soft) | critical.css 3264 B, base.css 19193 B. |

## Unsure or worth a skeptical look
- `dm_serif_display_n4` is assumed to be a valid font_picker handle; verify in the editor.
- Theme Check `OrphanedSnippet` is disabled in `.theme-check.yml` because price, badge, product-card and section-heading have no consumer until sprint 02 (button is used by the footer). Needed to reach 0 warnings.
- Newsletter redirect-to-anchor behaviour (B12), dropdown Escape, cart refresh and drawer focus management are written defensively but untested in a browser.
- `header.cart_label` pluralisation with count 99999 is used as a placeholder in `data-label-other`, replaced in JS.
- Account is a plain `routes.account_url` link (the old `shopify-account` component and `customer_account_menu` setting were removed).
