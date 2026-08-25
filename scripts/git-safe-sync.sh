#!/usr/bin/env bash
# Safe sync before push — fetch upstream; rebase only when behind/diverged.
# Skip rebase when HEAD already contains upstream (ahead via merge or FF).
set -eu

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
LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "$REMOTE/$REMOTE_BRANCH")"

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
  echo "git-safe-sync: already matches $REMOTE/$REMOTE_BRANCH."
  exit 0
fi

# Upstream already contained in HEAD → we are ahead (FF or merge). Do not rebase
# merge commits; that rewrites history and often conflicts on release branches.
if git merge-base --is-ancestor "$REMOTE_SHA" "$LOCAL_SHA"; then
  AHEAD="$(git rev-list --count "$REMOTE_SHA..$LOCAL_SHA")"
  echo "git-safe-sync: ahead of $REMOTE/$REMOTE_BRANCH by $AHEAD commit(s); skip rebase."
  exit 0
fi

# Remote has commits we lack — rebase to incorporate them safely.
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
