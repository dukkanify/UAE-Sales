# Branch protection (repository admin)

This repo hosts **two product lines** on different branches:

| Branch        | Product                 | Production deploy                            |
| ------------- | ----------------------- | -------------------------------------------- |
| `main`        | Sooqna                  | `deploy-main-production.yml`                 |
| `aviatorpass` | AviatorPass LMS         | `deploy-aviatorpass-production.yml`          |
| `develop`     | AviatorPass integration | CI only (Vercel preview via Git integration) |

## Recommended protection rules

Apply via **GitHub → Settings → Branches → Add rule** (or `gh api` as org admin).

### `main`

- Require pull request before merging
- Require status checks: `quality`, `e2e`
- Require branches to be up to date
- Do not allow force pushes
- Do not allow deletions

### `aviatorpass` (AviatorPass production)

- Require pull request before merging
- Require status checks: `quality`, `e2e`
- Require branches to be up to date
- Restrict who can push (release managers / admins)
- Do not allow force pushes

### `develop`

- Require status checks: `quality` (e2e optional for speed)
- Allow direct push for integration agents with caution

## Admin CLI (requires `gh auth` with admin scope)

```bash
# Example — adjust team slugs for your org
gh api repos/dukkanify/UAE-Sales/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["quality","e2e"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

Repeat for `aviatorpass` with the same check contexts.

## Safe push (local)

`git push` runs `.husky/pre-push`:

1. `scripts/git-safe-sync.sh` — fetch + rebase; **stops on conflict**
2. `npm run typecheck`
3. `npm run test`

Never use `git push --force` on protected branches.
