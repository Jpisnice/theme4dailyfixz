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
