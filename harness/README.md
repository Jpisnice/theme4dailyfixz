# Development harness

How features get built in this theme. It follows Anthropic's
[Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps),
adapted to a standard Online Store 2.0 Shopify theme (sections, JSON templates
and section groups). It was migrated off an earlier block-first dialect on
2026-10-02; see `progress.md`.

## The idea in one paragraph

A single agent that builds *and* judges its own work praises mediocre output.
So the work is split across three roles that talk to each other **only through
files in this folder**: a **planner** turns a short request into a product spec,
a **generator** builds it one sprint at a time, and a separate, skeptical
**evaluator** clicks through the running storefront and grades the result
against hard pass/fail thresholds. The generator iterates until the evaluator
passes the sprint. Git records every step, and a progress file lets any fresh
session (or a context reset) pick up where the last one stopped.

```
 request (1-4 sentences)
        │
        ▼
 ┌──────────┐  harness/specs/<slug>.md
 │ planner  │──────────────────────────────┐
 └──────────┘                              ▼
                       for each sprint in the spec:
            ┌──────────────────────────────────────────────┐
            │ 1. generator drafts   sprints/NN-x/contract.md│
            │ 2. evaluator reviews it, both agree (≤2 rounds)│
            │ 3. generator builds, runs `npm run check`,     │
            │    commits                                     │
            │ 4. evaluator tests the live preview →          │
            │    sprints/NN-x/report-rN.md  (PASS / FAIL)    │
            │ 5. FAIL → generator fixes → back to 4          │
            └──────────────────────────────────────────────┘
                                   │
                                   ▼
                      harness/progress.md (handoff)
```

## Commands

| Command | What it does |
| --- | --- |
| `/harness-plan <request>` | Planner writes `harness/specs/<slug>.md` and seeds `progress.md`. |
| `/harness-sprint [spec] [NN]` | Runs one full sprint: contract → build → evaluate → fix loop. |
| `/harness-evaluate [sprint]` | Runs the evaluator alone on the current state (e.g. after a manual change). |
| `/harness-handoff` | Writes a clean handoff into `progress.md` before ending or resetting a session. |

The agents live in `.claude/agents/` (`planner`, `generator`, `evaluator`). For any
Liquid edit, the `liquid-theme-dev` skill (`.claude/skills/liquid-theme-dev/`) holds this
theme's dialect and patterns; the generator should follow it.

## Files

```
harness/
├── README.md          # this file
├── criteria.md        # grading rubric + hard thresholds (the evaluator's contract with you)
├── calibration.md     # scored examples that keep the evaluator's judgement stable
├── progress.md        # living handoff: where we are, what's next
├── templates/         # spec, contract, report and handoff skeletons
├── specs/<slug>.md    # planner output, one per feature/request
└── sprints/NN-slug/
    ├── contract.md    # agreed, testable "done" criteria for the sprint
    ├── report-r1.md   # evaluator findings, one per round
    └── screenshots/   # smoke-test output (git-ignored)
```

## Checks the agents rely on

| Command | Gate |
| --- | --- |
| `npm run check:dialect` | OS 2.0 dialect conventions: sections and theme blocks include `{% schema %}`; theme blocks also have a `{% doc %}` header and output `{{ block.shopify_attributes }}`; snippets should open with `{% doc %}`. |
| `npm run check:theme` | Shopify Theme Check (`.theme-check.yml`): missing translations, missing snippets, invalid schema, Liquid errors, … |
| `npm run check` | Both of the above. Must be clean before any commit. CI runs it too. |
| `npm run smoke` | Playwright visits home, collection, product, cart, search and 404 at 375px and 1280px against `BASE_URL`, and fails on console errors, HTTP errors, failed requests and horizontal overflow. |

The evaluator also has the **Playwright MCP** (`.mcp.json`) to click through
flows by hand: add to cart, change variant, update quantity, search, open menus.

## Running the storefront preview

The evaluator needs a live preview. Locally:

```bash
npm install
shopify theme dev --store <your-store>.myshopify.com   # serves http://127.0.0.1:9292
```

In a cloud or CI session, set `SHOPIFY_FLAG_STORE` and `SHOPIFY_CLI_THEME_TOKEN`
(a Theme Access password) and start `shopify theme dev` in the background.
If no preview can be reached, the evaluator still runs the static checks and
code review, but it must mark functionality **UNVERIFIED**. An unverified sprint
cannot pass.

## Principles we're keeping from the article

1. **Separate the builder from the judge.** The generator never grades its own
   sprint. Its self-check is a pre-flight, not a verdict.
2. **Plan scope, not implementation.** The spec says *what* and *why*; it stays
   high-level so one wrong technical guess doesn't cascade.
3. **Agree on "done" before building.** The sprint contract turns spec features
   into concrete, browser-testable criteria. Over-specify and errors cascade;
   under-specify and scope drifts.
4. **Hard thresholds, not vibes.** Any failed contract criterion or check fails
   the sprint. Subjective criteria have minimum scores (see `criteria.md`).
5. **Calibrate the evaluator.** `calibration.md` holds scored examples. Add one
   whenever you disagree with a verdict, so the next one is closer to your taste.
6. **Communicate through files.** Specs, contracts, reports and progress are
   files in git, never just chat. That's what makes context resets cheap.
7. **Commit every sprint.** One or more commits per sprint, with the sprint ID
   in the message, so any round can be diffed or reverted.
8. **Hand off cleanly.** Before a session ends or the context resets, update
   `progress.md` with state, decisions and the next step.
9. **Stress-test the scaffolding.** Every piece here encodes an assumption about
   what the model can't do alone. For small changes, skip sprints: run
   `/harness-plan` with one sprint, or edit directly and run `/harness-evaluate`.
   Keep the evaluator: it catches the last-mile gaps.

## Theme rules all agents follow

- **Architecture:** standard Online Store 2.0 — `sections/` with `{% schema %}`
  and `presets`, JSON templates, and section groups for the header/footer.
  `scripts/dialect-check.mjs` is the source of truth for the conventions.
- Every shopper-facing string goes through `| t` with keys in `locales/en.default.json`.
- Editor strings use `t:` keys in `locales/en.default.schema.json`.
- CSS and JS live in `assets/`.
