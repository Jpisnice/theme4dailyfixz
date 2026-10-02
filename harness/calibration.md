# Evaluator calibration

Scored reference examples. The evaluator reads these before grading so that a
"3" or "4" means the same thing in every sprint. They are a starting set:
**whenever you disagree with a verdict, add a short example here** with the
score you would have given and why. That's how the evaluator learns your taste.

---

## Example A: product page, first pass

**Observed:** Product title, price and description render. Variant `<select>`
works and add to cart succeeds. Quantity is a plain `type="text"` input. Images
stack full-width on desktop with no gallery. The "Add to cart" button uses the
browser default style. The price uses the same size and weight as body text.

| Criterion | Score | Why |
| --- | --- | --- |
| Design quality | 2 | No hierarchy: price and CTA don't stand out; the page reads as unstyled. |
| Originality | 1 | It's the skeleton default. |
| Craft | 2 | Desktop images aren't constrained; the quantity input accepts letters. |
| Functionality | 3 | The happy path works; sold-out variants are still selectable with no message. |

**Verdict: FAIL** (Design < 4, Originality < 3, Craft < 4).

---

## Example B: product card in a collection grid

**Observed:** A 2-column mobile / 4-column desktop grid. Cards use a 4:5
image ratio with `image_url: width: 600` and `srcset`, title in 2 lines max
with ellipsis, price below and compare-at price struck through in a muted
colour, and a "Sold out" badge. The hover state swaps to the second image.
Spacing uses the theme's spacing variables. At 375px, a long title wraps
cleanly. The badge text comes from `locales/en.default.json`.

| Criterion | Score | Why |
| --- | --- | --- |
| Design quality | 4 | Consistent and clear. The price/compare-at treatment reads instantly. |
| Originality | 3 | Well made but a familiar pattern; nothing yet says "DailyFixz". |
| Craft | 5 | Correct image sizing, no layout shift, tidy truncation. |
| Functionality | 4 | Sold-out state handled. There's no placeholder when a product has no image (minor). |

**Verdict: PASS** (all thresholds met). Notes passed to the generator: add an
image placeholder, and push originality in the next design sprint.

---

## Example C: "looks done" but isn't

**Observed:** A new header with a mobile menu drawer looks polished in the
screenshot. In the browser, the drawer opens but can't be closed with Escape,
focus isn't trapped, and the page behind still scrolls. The cart count doesn't
update after add to cart until a reload.

| Criterion | Score | Why |
| --- | --- | --- |
| Design quality | 4 | Visually strong. |
| Originality | 4 | A distinctive header treatment. |
| Craft | 3 | Scroll bleed behind the drawer. |
| Functionality | 2 | Stale cart count; the drawer is a keyboard trap in reverse (can't exit). |

**Verdict: FAIL** (G6 accessibility floor, Craft < 4, Functionality < 4).
The lesson: screenshots alone overrate work. Always interact.
