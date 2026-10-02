---
name: harness-sprint
description: Run one harness sprint on the DailyFixz theme end to end - contract negotiation, build, independent evaluation, and fix rounds until it passes.
argument-hint: "[spec slug] [sprint number]"
disable-model-invocation: true
---

Run one sprint with the harness in `harness/README.md`. Arguments: `$ARGUMENTS`
(optional spec slug and sprint number; default to the next step in `harness/progress.md`).

You are the orchestrator. The generator and evaluator are separate subagents and
must stay separate: never let the generator grade its own work, and never fix code
yourself in place of the generator.

## 0. Orient
Read `harness/progress.md` and the spec. Work out the sprint number `NN`, its slug,
and its features. Create `harness/sprints/NN-slug/`. Check whether a preview is
reachable (`curl -s -o /dev/null -w '%{http_code}' ${BASE_URL:-http://127.0.0.1:9292}`).
If it isn't, tell the user once that functionality can't be verified, and ask
whether to continue with static evaluation only (the sprint can't PASS without one).

## 1. Contract (at most 2 rounds)
- **generator** (mode 1): draft `contract.md`.
- **evaluator** (mode 1): review it.
- If changes were requested, have the generator revise and the evaluator re-review.
  After two rounds, settle any remaining disagreement yourself in favour of
  testability, and mark it AGREED.
- Commit: `sprint NN: contract`.

## 2. Build
- **generator** (mode 2): build against the contract, run `npm run check`, commit.
- Confirm `npm run check` passes yourself before evaluating. If it doesn't, send it
  straight back to the generator.

## 3. Evaluate → fix loop (at most 5 rounds)
- **evaluator** (mode 2): write `report-rN.md`.
- PASS → go to 4.
- FAIL → **generator** (mode 3) with the report path → evaluate again as round N+1.
- If the same finding fails twice in a row, tell the generator to step back and fix
  the root cause rather than patching again.
- After 5 FAIL rounds, stop and bring the user the latest report and your read on
  what's blocking.

## 4. Close out
- Commit the reports: `sprint NN: evaluation`.
- Update `harness/progress.md`: sprint history row (rounds, verdict, weighted score,
  commit), decisions log, and the next step.
- If the user disagreed with any verdict during the sprint, add a short scored
  example to `harness/calibration.md`.
- Commit `progress: sprint NN` and push to the current branch.
- Summarise for the user: what was built, the verdict and score, and what comes next.
