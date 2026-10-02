---
name: liquid-theme-dev
description: How to write and edit Liquid files in this block-first Shopify theme (DailyFixz) - blocks, snippets, templates/*.liquid, layout, locales, config settings, and CSS/JS in assets/. Use this skill whenever the user asks to add, change, fix or restyle anything in this theme - a product page, header, cart, collection grid, product card, a new block or snippet, a translation string, a theme setting - or mentions .liquid files, Shopify theme, storefront, or theme editor, even if they don't say "block". Also use it when a generator agent builds a harness sprint. It prevents the common mistake of writing generic Shopify sections/JSON templates/{% stylesheet %} that this theme forbids.
---

# Writing Liquid in this theme

This theme is **block-first**, which differs from the Shopify theme most examples (and most of `CLAUDE.md`) describe. Pages are composed directly in `templates/*.liquid` out of blocks, snippets and inline markup. There are no sections and no JSON templates. Follow the dialect below, because the build gate (`npm run check`) rejects anything else, and because mixing models leaves a theme that the editor and the other agents can't reason about.

Where `CLAUDE.md`/`AGENTS.md` generic guidance conflicts with this file or the README "Non-negotiables", this file and the README win.

## The rules (and why)

| Rule | Why |
| --- | --- |
| No `sections/`, no `{% section %}`/`{% sections %}` | One composition model: templates → blocks. |
| No JSON templates, no schema `presets` | Pages are code-composed, so there's nothing for the editor to add from a preset. |
| No `{% stylesheet %}` / `{% javascript %}` | CSS and JS live in `assets/` so blocks stay focused on markup. |
| `{% block %}` calls only in `layout/` and `templates/` | Composition happens at the top; blocks and snippets render caller content via `{{ content }}`. |
| Blocks: `{% doc %}` header, `{% schema %}` footer, `{{ block.shopify_attributes }}` on the root element | Documentation, editor settings, and editor click-to-select. |
| Every shopper-facing string uses `\| t` | The theme is translatable; hard-coded text fails review. |

## Workflow for any change

1. **Look before writing.** Read the neighbouring file (`blocks/header.liquid`, `templates/product.liquid`, `snippets/image.liquid`) and the relevant part of `assets/base.css`. Match its naming and style rather than inventing a new one.
2. **Choose the right unit** (see below), then write markup, then CSS/JS in `assets/`, then locale keys.
3. **Check Liquid objects and filters you're unsure about** using the Shopify Dev MCP (`learn_shopify_api` once, then search docs) instead of guessing. Wrong object names fail silently on the storefront.
4. **Run `npm run check`** and fix every error. It runs the dialect check plus Shopify Theme Check (missing translation keys, missing snippets, bad schema, Liquid syntax). If a preview is up, also `npm run smoke`.
5. Commit with a focused message.

## Choosing the unit

- **Block** (`blocks/x.liquid`): a reusable piece that appears in a template or layout and may expose merchant settings. Product gallery, announcement bar, header.
- **Snippet** (`snippets/x.liquid`): reusable markup with parameters and no merchant settings. Price, product card, icon, image. Called with `{% render 'x', param: value %}` from anywhere, including blocks and templates.
- **Template** (`templates/<page>.liquid`): the page's composition root. Wrap each vertical slice in `{% block 'container' %}`.
- **Inline markup in a template**: fine for one-off page content that no other page reuses.
- **Layout** (`layout/theme.liquid`): header/footer containers, `<main>`, global assets.

Rule of thumb: if two pages need it, extract it. If a merchant should control it in the theme editor, make it a block with a schema.

## Blocks

```liquid
{% doc %}
  One line on what it renders and where it's used.

  @param {string} [heading] - Optional heading override.
  @example
  {% block 'announcement-bar', heading: 'Free delivery over $50' %}{% endblock %}
{% enddoc %}

<div class="announcement-bar" {{ block.shopify_attributes }}>
  {{ block.settings.text }}
  {{ content }}
</div>

{% schema %}
{
  "name": "t:general.announcement_bar",
  "settings": [
    { "type": "text", "id": "text", "label": "t:labels.text", "default": "…" }
  ]
}
{% endschema %}
```

- Parameters are plain named arguments. If a schema setting has the same `id`, the argument also sets `block.settings.<id>`; otherwise it's only the variable.
- The caller's body renders in the **caller's scope** before the block, so it can't read this block's settings or assigns. Output it with `{{ content }}`; self-contained blocks may omit it.
- Don't put `{% block %}` inside another block's file. Nest in the caller instead:
  ```liquid
  {% block 'container' %}
    {% block 'product-gallery' %}{% endblock %}
  {% endblock %}
  ```
- Schema names/labels are `t:` keys resolved from `locales/en.default.schema.json`. No `presets`.

## Snippets

Open with `{% doc %}` listing `@param`s (mark optional ones `[name]`) and an `@example`. Snippets can't see the caller's variables, so pass everything they need. Inline literal arrays are supported by `{% block %}` but **not** by `{% render %}`, so build arrays in the caller's scope or pass a string.

## Templates

Compose with containers; keep logic light; pull repeated markup into snippets or blocks. Use Liquid objects valid for that page type (`product` on product, `collection` on collection, `cart` on cart, `search` on search). Handle the empty states: empty cart, empty collection, no search results, sold-out variants.

## CSS and JavaScript (assets/)

- Put CSS in `assets/base.css` (shared) or a new `assets/<name>.css` loaded from the layout or the owning block. `critical.css` is only for what every page needs above the fold.
- Use the existing CSS variables from `snippets/css-variables.liquid` (`--page-width`, `--content-grid`, fonts, colours) rather than hard-coded values.
- Merchant setting → CSS: pass single values as inline custom properties (`style="--gap: {{ block.settings.gap }}px"`) and consume them in the stylesheet. For settings that change several properties, output a modifier class.
- JS goes in `assets/<name>.js`, loaded with `<script src="{{ 'x.js' | asset_url }}" type="module">` from the block that needs it. Don't put Liquid in JS; read config from `data-*` attributes.
- Design for 375px first, then widen. Cover hover, focus-visible and disabled states.

## Translations

- Shopper strings: `{{ 'products.add_to_cart' | t }}` with keys in `locales/en.default.json`. Max 3 levels, snake_case, sentence case, interpolation instead of string concatenation (`{{ 'cart.items' | t: count: cart.item_count }}`). Only add English; translators handle the rest.
- Editor strings (schema `name`, `label`, `info`, option labels): `t:` keys in `locales/en.default.schema.json`, reusing `general.*`, `labels.*`, `options.*` entries where one already fits.
- Escape interpolated user data (`| escape`) unless it's intentionally HTML (`_html` keys).

## Images, performance, accessibility

- Use `snippets/image.liquid` or `image_url` with an explicit `width:` plus `srcset`/`sizes`; set `loading: 'lazy'` below the fold and give the hero image `fetchpriority: 'high'`. Always set width/height to avoid layout shift.
- `alt` is meaningful (or `alt=""` if decorative). Form controls have labels. Buttons are `<button>`, links are `<a href>`. Keep visible focus styles.
- Keep forms on Shopify's `{% form %}` tags (`'product'`, `'customer_login'`, `'contact'`, …) so CSRF and routing work.
- Build URLs with `routes.*` so locale and market prefixes are preserved.

## Liquid gotchas worth remembering

- No parentheses and no ternaries in conditions; with more than one `and`/`or`, nest `if`s.
- `for` loops stop at 50 iterations. Use `{% paginate %}` for larger lists.
- Don't name variables after Liquid objects (`product`, `collection`, `cart`, `page`, `shop`…).
- Use `{%- -%}` to trim whitespace around logic and `{% liquid %}` for multi-line logic.
- `contains` only works on strings and arrays of strings.
- `{% partial %}` needs `shop.features.agentic_editor_enabled?`; see `blocks/liquid-tips.liquid` before using it.

For ready-to-adapt examples (product page composition, collection grid with pagination, cart line items, a block with a CSS variable setting), read `references/patterns.md`.
