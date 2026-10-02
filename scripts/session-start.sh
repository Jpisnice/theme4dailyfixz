#!/usr/bin/env bash
# Claude Code SessionStart hook: installs check tooling if missing and loads the
# harness handoff so a fresh session (or context reset) resumes from progress.md.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"

if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund >/dev/null 2>&1 || echo "note: npm install failed; run it before npm run check"
fi

echo "=== harness/progress.md (resume from here; workflow in harness/README.md) ==="
cat harness/progress.md
