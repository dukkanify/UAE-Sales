#!/usr/bin/env bash
# Local-git cutover: push filtered AviatorPass history to dukkanify/AviatorPass
set -euo pipefail

EXPORT_DIR="${EXPORT_DIR:-/tmp/AviatorPass-export}"
TARGET_URL="${TARGET_URL:-https://github.com/dukkanify/AviatorPass.git}"
LEGACY_URL="${LEGACY_URL:-https://github.com/dukkanify/UAE-Sales.git}"
SOURCE_REF="${SOURCE_REF:-$(git -C "${EXPORT_DIR%/*}/.." rev-parse HEAD 2>/dev/null || git rev-parse HEAD)}"
WORKSPACE="${WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
TMP_GIT_CONFIG="${TMP_GIT_CONFIG:-$(mktemp)}"
trap 'rm -f "$TMP_GIT_CONFIG"' EXIT

if [[ ! -d "$EXPORT_DIR/.git" ]]; then
  PUSH=0 NEW_REMOTE="$TARGET_URL" SOURCE_REF="$SOURCE_REF" ROOT_SRC="$WORKSPACE" \
    bash "$WORKSPACE/scripts/migrate-to-dedicated-repo.sh"
fi

cd "$EXPORT_DIR"

if [[ -z "${AVIATORPASS_PUSH_TOKEN:-}" && -z "${GITHUB_TOKEN:-}" ]]; then
  echo "ERROR: Set AVIATORPASS_PUSH_TOKEN (GitHub PAT with Contents: Read and write on dukkanify/AviatorPass)." >&2
  exit 1
fi

export GH_TOKEN="${AVIATORPASS_PUSH_TOKEN:-${GITHUB_TOKEN}}"

can_write=false
if GH_TOKEN="$GH_TOKEN" gh api -X PUT repos/dukkanify/AviatorPass/contents/.cutover-preflight \
  -f message='cutover preflight' -f content='b2s=' >/dev/null 2>&1; then
  can_write=true
  echo "PAT write check: OK"
else
  echo "WARN: PAT cannot write via Contents API (fine-grained token needs Contents: Read and write)."
fi

use_ssh=false
if [[ -f "${AVIATORPASS_SSH_KEY:-/tmp/aviatorpass-deploy}" ]]; then
  use_ssh=true
  echo "Using SSH deploy key: ${AVIATORPASS_SSH_KEY:-/tmp/aviatorpass-deploy}"
fi

if [[ "$can_write" != true && "$use_ssh" != true ]]; then
  echo "ERROR: No working push credentials." >&2
  echo "Fix fine-grained PAT (Contents: Read and write on dukkanify/AviatorPass)" >&2
  echo "OR add deploy key to the repo and set AVIATORPASS_SSH_KEY to the private key path." >&2
  if [[ -f /tmp/aviatorpass-deploy.pub ]]; then
    echo "Suggested deploy key (add at GitHub → AviatorPass → Settings → Deploy keys):" >&2
    cat /tmp/aviatorpass-deploy.pub >&2
  fi
  exit 1
fi

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

git remote remove origin 2>/dev/null || true
git remote remove legacy-uae-sales 2>/dev/null || true
git remote add origin "$TARGET_URL"
git remote add legacy-uae-sales "$LEGACY_URL"

GIT_CONFIG_GLOBAL="$TMP_GIT_CONFIG" GIT_CONFIG_SYSTEM=/dev/null gh auth setup-git >/dev/null 2>&1 || true

push_git() {
  if [[ "$use_ssh" == true ]]; then
    local key="${AVIATORPASS_SSH_KEY:-/tmp/aviatorpass-deploy}"
    GIT_CONFIG_GLOBAL="$TMP_GIT_CONFIG" GIT_CONFIG_SYSTEM=/dev/null \
      GIT_SSH_COMMAND="ssh -i ${key} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
      git -c "credential.helper=" "$@"
  else
    GIT_CONFIG_GLOBAL="$TMP_GIT_CONFIG" GIT_CONFIG_SYSTEM=/dev/null git \
      -c "credential.helper=" \
      "$@"
  fi
}

push_remote="origin"
if [[ "$use_ssh" == true ]]; then
  git remote set-url origin "git@github.com:dukkanify/AviatorPass.git"
  push_remote="origin"
fi

echo "==> Pushing all branches"
push_git -C "$EXPORT_DIR" push "$push_remote" --all

echo "==> Pushing all tags"
push_git -C "$EXPORT_DIR" push "$push_remote" --tags

echo "==> Cutover push complete"
git log -1 --oneline main
