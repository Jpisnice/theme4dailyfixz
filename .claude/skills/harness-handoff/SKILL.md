---
name: harness-handoff
description: Write a clean handoff into harness/progress.md so a fresh session or context reset can resume the DailyFixz harness work without the chat history.
disable-model-invocation: true
---

Update `harness/progress.md` so that someone with **no access to this conversation**
can continue the work. Keep it short and factual:

1. **Current state**: active spec, active sprint, last verdict, preview URL.
2. **Next step**: the exact next command or action, including any half-finished round.
3. **In flight**: uncommitted or unverified work, failing checks, known bugs
   (with file paths).
4. **Decisions log**: append dated lines for decisions made this session and why,
   including assumptions the store owner hasn't confirmed.
5. **Sprint history**: make sure every finished round has a row.

Then run `npm run check`, commit `progress: handoff`, push to the current branch,
and tell the user what the next session should start with.
