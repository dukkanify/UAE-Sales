#!/usr/bin/env bash
# Verify local branches before/after AviatorPass cutover
set -euo pipefail
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
EXPORT="${EXPORT_DIR:-/tmp/AviatorPass-export}"

echo "=== Workspace local branches ($ROOT) ==="
git -C "$ROOT" branch -v

echo
echo "=== AviatorPass product branches (package.json name=aviatorpass) ==="
for b in $(git -C "$ROOT" branch --format='%(refname:short)'); do
  name="$(git -C "$ROOT" show "$b:package.json" 2>/dev/null | rg '"name"' | head -1 || true)"
  if echo "$name" | rg -q aviatorpass; then
    echo "  $b  $(git -C "$ROOT" log -1 --oneline "$b")"
  fi
done

echo
echo "=== Export repo branches (push target: $EXPORT) ==="
if [[ -d "$EXPORT/.git" ]]; then
  git -C "$EXPORT" branch -v
  echo
  echo "Tags:"
  git -C "$EXPORT" tag -l || true
  echo
  echo "Commit count:" $(git -C "$EXPORT" rev-list --count --all)
  echo "First commit:" $(git -C "$EXPORT" log --reverse --oneline | head -1)
  echo "Tip:" $(git -C "$EXPORT" log -1 --oneline main)
else
  echo "  (export not built — run scripts/migrate-to-dedicated-repo.sh)"
fi

echo
echo "=== Remotes ($ROOT) ==="
git -C "$ROOT" remote -v
