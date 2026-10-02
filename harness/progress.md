# Progress

The handoff file. Read this first in every new session. Update it at the end
of every sprint and before any context reset (`/harness-handoff`).

## Current state

- **Active spec:** `harness/specs/storefront.md`
- **Active sprint:** none started (next: 01)
- **Last verdict:** n/a
- **Preview URL:** http://127.0.0.1:9292 (via `shopify theme dev`). No preview is available to agent sessions; owner previews locally. Contracts must split criteria into static (`npm run check`, code review) and browser-verified-later.

## Next step

Run `/harness-sprint storefront 01`: Design system and global shell (tokens, settings, base components, header with announcement bar, footer). Draft `harness/sprints/01-design-system-shell/contract.md` with static and browser criteria separated.

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
