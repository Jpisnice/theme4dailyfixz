# Grading criteria

The evaluator grades every sprint against this file. A sprint **passes only if
every hard gate passes and every scored criterion meets its threshold.** There
is no averaging: one failing gate fails the sprint.

Design and originality carry extra weight because the model already does
craft and functionality reasonably well by default. A storefront that works
but looks like every other skeleton theme is not done.

## Hard gates (pass/fail)

| # | Gate | Passes when |
| --- | --- | --- |
| G1 | **Contract** | Every criterion in the sprint's `contract.md` is verified PASS in the live preview. Untested counts as FAIL. |
| G2 | **Static checks** | `npm run check` exits 0 (dialect check + Theme Check, zero errors). |
| G3 | **Smoke** | `npm run smoke` passes: no console errors, failed requests, unexpected HTTP status or horizontal overflow at 375px and 1280px. |
| G4 | **Shopper flows** | Nothing the sprint touched breaks the core purchase path: browse a collection → open a product → choose a variant → add to cart → change quantity → reach checkout. |
| G5 | **Translations** | No hard-coded shopper-facing strings. All new keys exist in `locales/en.default.json` / `en.default.schema.json`, in sentence case. |
| G6 | **Accessibility floor** | Images have meaningful `alt` (or `alt=""` if decorative); form controls have labels; interactive elements are reachable and visibly focused with the keyboard; text contrast is at least 4.5:1. |

If the preview could not be reached, G1, G3 and G4 are **UNVERIFIED**, and an
unverified sprint fails.

## Scored criteria (1–5)

| Criterion | Weight | Threshold | What it measures |
| --- | --- | --- | --- |
| **Design quality** | ×2 | ≥ 4 | The pages add up to one coherent identity: a consistent type scale, spacing rhythm, colour palette and mood that fit a daily-essentials store. Hierarchy makes the next action obvious (price, add to cart, checkout). |
| **Originality** | ×2 | ≥ 3 | Evidence of deliberate choices rather than defaults: the layout, imagery treatment, product card and header are decided for this brand, not left as skeleton-theme or generic-template patterns. |
| **Craft** | ×1 | ≥ 4 | Technical execution: alignment, consistent spacing tokens, typography (line length, leading), responsive behaviour at 375 / 768 / 1280, image sizing (`image_url` widths, `loading="lazy"` below the fold), no layout shift. |
| **Functionality** | ×1 | ≥ 4 | Beyond the contract: empty states (empty cart, no search results, sold-out variant), error states, and merchant editability (sensible schema settings with `t:` labels) all behave sensibly. |

Scoring anchors (apply to every criterion):

- **5**: would ship as-is on a paid theme; nothing to point at.
- **4**: solid, with only small polish notes.
- **3**: acceptable but generic or uneven; a shopper notices nothing wrong but nothing stands out.
- **2**: visible problems: misalignment, inconsistent styles, confusing hierarchy, or a broken secondary state.
- **1**: broken or clearly unfinished.

The weighted total (max 30) is reported for tracking trends across sprints.
It does not override a failed threshold.

## How the evaluator must behave

- **Be skeptical.** Assume it's broken until you've seen it work in the browser.
  "The code looks right" is not verification.
- **Test like a shopper**, then like a merchant: click, type, resize, tab
  through, try the empty and sold-out states.
- **Be specific.** Every FAIL names the route, viewport, steps to reproduce,
  expected vs actual, and where in the code the fix probably belongs.
- **Don't fix anything.** The evaluator reports; the generator fixes.
- **Compare against `calibration.md`** before scoring, so scores mean the same
  thing from sprint to sprint.
