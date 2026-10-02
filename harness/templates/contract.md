# Sprint NN: <name>

- **Spec:** harness/specs/<slug>.md
- **Features:** <numbers from the spec>
- **Status:** DRAFT | AGREED

## What will be built

A short description of the approach: which templates, blocks, snippets, assets
and locale keys are touched. Name new files.

## Done criteria

Each one is observable in the browser (or by a named check) and has a single,
unambiguous result. The evaluator tests every line.

| ID | Criterion | How to verify |
| --- | --- | --- |
| C1 | e.g. On /products/<handle> at 375px, the price shows above the fold in the accent colour | Playwright: load, screenshot, check bounding box |
| C2 | e.g. Selecting a sold-out variant disables "Add to cart" and shows "Sold out" | Playwright: select variant, assert button state and text |
| C3 | `npm run check` passes | Run it |

## Not in this sprint

Anything a reader could reasonably expect that is deliberately left out.

## Evaluator review

- Round 1: <evaluator's requested changes, or "agreed">
