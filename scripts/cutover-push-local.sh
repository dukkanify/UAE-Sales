#!/usr/bin/env bash
# Local-git cutover: push filtered AviatorPass history to dukkanify/AviatorPass
set -euo pipefail

EXPORT_DIR="${EXPORT_DIR:-/tmp/AviatorPass-export}"
TARGET_URL="${TARGET_URL:-https://github.com/dukkanify/AviatorPass.git}"
LEGACY_URL="${LEGACY_URL:-https://github.com/dukkanify/UAE-Sales.git}"
SOURCE_REF="${SOURCE_REF:-$(git -C "${EXPORT_DIR%/*}/.." rev-parse HEAD 2>/dev/null || git rev-parse HEAD)}"
WORKSPACE="${WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"

if [[ ! -d "$EXPORT_DIR/.git" ]]; then
  PUSH=0 NEW_REMOTE="$TARGET_URL" SOURCE_REF="$SOURCE_REF" ROOT_SRC="$WORKSPACE" \
    bash "$WORKSPACE/scripts/migrate-to-dedicated-repo.sh"
fi

cd "$EXPORT_DIR"

# Restore product tag if present in filtered history
if ! git rev-parse v0.1.0-beta >/dev/null 2>&1; then
  tag_sha="$(git log --all --grep='freeze v0.1.0-beta' --format='%H' | head -1 || true)"
  if [[ -n "$tag_sha" ]]; then
    git tag -a v0.1.0-beta "$tag_sha" -m "chore: freeze v0.1.0-beta for closed beta"
    echo "Tagged v0.1.0-beta at ${tag_sha:0:7}"
  fi
fi

echo "==> Local branches in export"
git branch -v

echo "==> Local tags"
git tag -l

# Remotes: AviatorPass = origin, UAE-Sales = legacy-uae-sales
git remote remove origin 2>/dev/null || true
git remote remove legacy-uae-sales 2>/dev/null || true
git remote add origin "$TARGET_URL"
git remote add legacy-uae-sales "$LEGACY_URL"

push_url="$TARGET_URL"
if [[ -n "${AVIATORPASS_PUSH_TOKEN:-}" ]]; then
  push_url="https://x-access-token:${AVIATORPASS_PUSH_TOKEN}@github.com/dukkanify/AviatorPass.git"
elif [[ -n "${GITHUB_TOKEN:-}" ]]; then
  push_url="https://x-access-token:${GITHUB_TOKEN}@github.com/dukkanify/AviatorPass.git"
else
  echo "ERROR: Set AVIATORPASS_PUSH_TOKEN (GitHub PAT with repo write for dukkanify/AviatorPass)." >&2
  echo "Local git push must not use the Cursor GitHub App token (cursor[bot])." >&2
  exit 1
fi

push_git() {
  GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null git \
    -c "credential.helper=" \
    -c "url.https://github.com/.insteadof=" \
    "$@"
}

echo "==> Pushing all branches"
push_git -C "$EXPORT_DIR" push "$push_url" --all

echo "==> Pushing all tags"
push_git -C "$EXPORT_DIR" push "$push_url" --tags

push_git -C "$EXPORT_DIR" remote set-url origin "$TARGET_URL"
echo "==> Cutover push complete"
git log -1 --oneline main
