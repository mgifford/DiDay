#!/usr/bin/env bash
# Opens an issue with a report, or comments on the open issue with the same title.
# This is the only GitHub-specific script. On Codeberg, replace it with a call
# to the Forgejo API; the checks themselves do not change.
# Usage: scripts/report-issue.sh "Issue title" path/to/report.md
set -euo pipefail
title="$1"
report="$2"

existing=$(gh issue list --state open --search "in:title \"$title\"" --json number,title \
  --jq ".[] | select(.title == \"$title\") | .number" | head -n 1)

if [ -n "$existing" ]; then
  gh issue comment "$existing" --body-file "$report"
  echo "Commented on issue #$existing"
else
  gh issue create --title "$title" --body-file "$report"
fi
