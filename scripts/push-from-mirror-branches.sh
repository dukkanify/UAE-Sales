#!/usr/bin/env bash
# Push prepared AviatorPass history from UAE-Sales mirror branches → dukkanify/AviatorPass
# Requires write access to AviatorPass (PAT or GitHub App with Contents: write).
set -euo pipefail

MIRROR_REMOTE="${MIRROR_REMOTE:-https://github.com/dukkanify/UAE-Sales.git}"
TARGET_REMOTE="${TARGET_REMOTE:-https://github.com/dukkanify/AviatorPass.git}"
WORKDIR="${WORKDIR:-/tmp/AviatorPass-mirror-push}"

rm -rf "${WORKDIR}"
git clone --branch aviatorpass-dedicated-main "${MIRROR_REMOTE}" "${WORKDIR}"
cd "${WORKDIR}"

git remote add aviatorpass "${TARGET_REMOTE}"
git push -u aviatorpass HEAD:main

git fetch origin aviatorpass-dedicated-aviatorpass:refs/heads/aviatorpass
git push aviatorpass aviatorpass:aviatorpass

git fetch origin aviatorpass-dedicated-develop:refs/heads/develop
git push aviatorpass develop:develop

echo "==> Pushed main, aviatorpass, develop to ${TARGET_REMOTE}"
git log -1 --oneline main
