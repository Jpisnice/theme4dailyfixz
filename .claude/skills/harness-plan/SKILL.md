---
name: harness-plan
description: Turn a short feature request for the DailyFixz theme into a product spec with sprints, using the planner agent.
argument-hint: <1-4 sentence feature request>
disable-model-invocation: true
---

Plan this request with the harness described in `harness/README.md`:

> $ARGUMENTS

1. If the request is empty, ask the user what the store needs next and stop.
2. Delegate to the **planner** subagent. Pass it the request verbatim and remind it
   to follow `harness/templates/spec.md` and to update `harness/progress.md`.
3. Read the spec it wrote. Check that every sprint is 1–3 user-visible features,
   that each leaves the store working, and that it doesn't prescribe low-level
   implementation. If not, send it back to the planner with specific notes (once).
4. Commit the spec and progress update: `plan: <slug>`.
5. Show the user the sprint table and open questions, and suggest `/harness-sprint`
   to start sprint 01.
