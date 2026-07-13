#!/usr/bin/env bash
set -euo pipefail

if [ -z "${VERCEL_DEPLOY_HOOK:-}" ]; then
  echo "Set VERCEL_DEPLOY_HOOK to your Vercel Deploy Hook URL."
  echo "Create one in Vercel → sooqna → Settings → Git → Deploy Hooks (branch: main)."
  exit 1
fi

echo "Triggering production deploy..."
response="$(curl --silent --show-error --write-out '\n%{http_code}' -X POST "$VERCEL_DEPLOY_HOOK")"
body="$(printf '%s' "$response" | sed '$d')"
status="$(printf '%s' "$response" | tail -n 1)"

echo "HTTP $status"
echo "$body"

if [ "$status" -lt 200 ] || [ "$status" -ge 300 ]; then
  exit 1
fi
