#!/usr/bin/env bash
# Safe sync before push — fetch, rebase onto upstream, abort on conflicts.
# Never force-pushes or overwrites remote without local verification.
set -euo pipefail

REMOTE="${GIT_SAFE_REMOTE:-origin}"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"

if [ "$BRANCH" = "HEAD" ] || [ -z "$BRANCH" ]; then
  echo "git-safe-sync: detached HEAD — checkout a branch before pushing." >&2
  exit 1
fi

echo "git-safe-sync: fetching $REMOTE…"
git fetch "$REMOTE" --prune --tags

UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
if [ -z "$UPSTREAM" ]; then
  echo "git-safe-sync: no upstream configured for $BRANCH (first push is OK)."
  exit 0
fi

REMOTE_BRANCH="${UPSTREAM#*/}"
echo "git-safe-sync: rebasing $BRANCH onto $REMOTE/$REMOTE_BRANCH…"

if ! git rebase "$REMOTE/$REMOTE_BRANCH"; then
  echo "" >&2
  echo "git-safe-sync: REBASE CONFLICT — push stopped." >&2
  echo "  1. Run: git status" >&2
  echo "  2. Resolve conflicts, then: git add <files> && git rebase --continue" >&2
  echo "  3. Or abort: git rebase --abort" >&2
  exit 1
fi

echo "git-safe-sync: branch is up to date with $REMOTE/$REMOTE_BRANCH."
exit 0
