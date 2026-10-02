---
name: harness-evaluate
description: Run the independent evaluator on the current state of the DailyFixz theme (a sprint or ad-hoc changes) and report pass/fail against harness/criteria.md.
argument-hint: "[sprint folder or 'adhoc']"
disable-model-invocation: true
---

Evaluate the theme with the **evaluator** subagent (mode 2). Target: `$ARGUMENTS`.

- If a sprint folder is given (or is active in `harness/progress.md`), evaluate
  against its `contract.md` and write the next `report-rN.md` in it.
- For `adhoc` or uncommitted changes, create `harness/sprints/adhoc-<YYYYMMDD>/` and
  write a short `contract.md` there first, derived from the diff (`git diff`,
  `git log -5`), with one criterion per user-visible change. Then evaluate against it.

Relay the verdict, scores and blocking fixes to the user. Don't fix anything in this
command. Suggest `/harness-sprint` (or a generator fix round) if it failed.
