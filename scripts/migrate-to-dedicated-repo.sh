#!/usr/bin/env bash
# Migrate AviatorPass history from dukkanify/UAE-Sales → dukkanify/AviatorPass
# Preserves commits from AEP foundation onward; drops marketplace-only ancestry.
set -euo pipefail

ROOT_SRC="${ROOT_SRC:-$(cd "$(dirname "$0")/.." && pwd)}"
EXPORT_DIR="${EXPORT_DIR:-/tmp/AviatorPass-export}"
AEP_ROOT_SHA="${AEP_ROOT_SHA:-381d5b385559e376d8c40d1a52c1dc1347aef085}"
NEW_REMOTE="${NEW_REMOTE:-https://github.com/dukkanify/AviatorPass.git}"
SOURCE_REMOTE="${SOURCE_REMOTE:-https://github.com/dukkanify/UAE-Sales.git}"
PUSH="${PUSH:-0}"

export PATH="${HOME}/.local/bin:${PATH}"

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "Installing git-filter-repo…"
  pip install --user git-filter-repo >/dev/null
fi

echo "==> Source: ${ROOT_SRC}"
echo "==> Export: ${EXPORT_DIR}"
echo "==> AEP root: ${AEP_ROOT_SHA}"
echo "==> Target remote: ${NEW_REMOTE}"

rm -rf "${EXPORT_DIR}"
mkdir -p "${EXPORT_DIR}"

# Fresh clone of source (avoids rewriting the agent workspace)
git clone --no-local "${ROOT_SRC}" "${EXPORT_DIR}"
cd "${EXPORT_DIR}"

# Prefer origin tips when available
git fetch origin aviatorpass develop 2>/dev/null || true
git checkout -B aviatorpass "origin/aviatorpass" 2>/dev/null || git checkout -B aviatorpass
git branch -f develop "origin/develop" 2>/dev/null || git branch develop aviatorpass 2>/dev/null || true

# Drop marketplace default branch from export if present
git branch -D main 2>/dev/null || true

# Cut marketplace parents: make AEP foundation the orphan root of AviatorPass history
if git cat-file -e "${AEP_ROOT_SHA}^{commit}"; then
  git replace --graft "${AEP_ROOT_SHA}"
else
  echo "ERROR: AEP root ${AEP_ROOT_SHA} not found in clone" >&2
  exit 1
fi

# Permanently rewrite history (removes replace refs / marketplace parents)
git filter-repo --force --replace-refs delete-no-add

# Keep product branches only; GitHub default = main (same tip as aviatorpass production)
git checkout aviatorpass
git branch -f main HEAD
if ! git show-ref --verify --quiet refs/heads/develop; then
  git branch develop HEAD
fi

# Drop every other local branch from the export (cursor/*, etc.)
for b in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  case "$b" in
    main|aviatorpass|develop) ;;
    *) git branch -D "$b" ;;
  esac
done
# Drop remote-tracking leftovers
git remote remove origin 2>/dev/null || true
git tag | xargs -r git tag -d


# Scrub remaining Sooqna / UAE-Sales strings in tip tree (non-archive)
python3 - <<'PY'
import pathlib, re
root = pathlib.Path(".")
skip_dirs = {".git", "node_modules", ".next", "docs/archive"}
patterns = [
    (re.compile(r"dukkanify/UAE-Sales"), "dukkanify/AviatorPass"),
    (re.compile(r"github\.com/dukkanify/UAE-Sales"), "github.com/dukkanify/AviatorPass"),
]
# Do not delete historical archive docs; rewrite active config paths.
active_globs = [
    "README.md",
    "AGENTS.md",
    "package.json",
    ".github/**/*",
    "docs/GIT_WORKFLOW.md",
    "docs/VERCEL_SETUP.md",
    "docs/ENTERPRISE_GIT_REPORT.md",
    "docs/DOMAIN_DUBAI_TEST.md",
    "docs/DEPLOYMENT.md",
    ".github/BRANCH_PROTECTION.md",
    "scripts/git-enterprise-status.mjs",
    "REPOSITORY_MIGRATION_PLAN.md",
    "POST_MIGRATION_VERIFICATION.md",
    "PROJECT_SEPARATION_REPORT.md",
]
files = set()
for g in active_globs:
    files.update(root.glob(g))
for p in files:
    if not p.is_file():
        continue
    text = p.read_text(encoding="utf-8", errors="ignore")
    orig = text
    for rx, rep in patterns:
        text = rx.sub(rep, text)
    # Soft-scrub dual-product notes in active docs
    text = text.replace("Sooqna product line", "legacy marketplace (separate repository)")
    if text != orig:
        p.write_text(text, encoding="utf-8")
        print("rewrote", p)
PY

# Point origin at the dedicated remote (push happens only when PUSH=1)
git remote remove origin 2>/dev/null || true
git remote add origin "${NEW_REMOTE}"

echo
echo "==> Export ready at ${EXPORT_DIR}"
echo "    Branches:" 
git branch -v | sed 's/^/    /'
echo "    First commit on main/aviatorpass:"
git log --reverse --oneline main | head -3 | sed 's/^/    /'
echo "    Tip:"
git log -1 --oneline main | sed 's/^/    /'

if [[ "${PUSH}" == "1" ]]; then
  echo "==> Pushing to ${NEW_REMOTE}"
  git push -u origin main
  git push origin aviatorpass:aviatorpass
  git push origin develop:develop
  echo "Push complete."
else
  echo
  echo "Dry-run only. When dukkanify/AviatorPass exists, re-run with:"
  echo "  PUSH=1 NEW_REMOTE=https://github.com/dukkanify/AviatorPass.git bash scripts/migrate-to-dedicated-repo.sh"
fi
