# Branch protection (AviatorPass)

This tip is **AviatorPass only**. Protect AviatorPass integration and production branches.

| Branch        | Product                 | Production deploy                   |
| ------------- | ----------------------- | ----------------------------------- |
| `aviatorpass` | AviatorPass LMS         | `deploy-aviatorpass-production.yml` |
| `develop`     | AviatorPass integration | CI only (Vercel preview via Git)    |

> Do not open AviatorPass PRs into marketplace `main`. Marketplace product lines must live on their own branch protection / Vercel project / (preferably) repository.

## Recommended protection rules

Apply via **GitHub → Settings → Branches → Add rule** (or `gh api` as org admin).

### `aviatorpass` (AviatorPass production)

- Require pull request before merging
- Require status checks: `quality`, `e2e`
- Require branches to be up to date
- Restrict who can push (release managers / admins)
- Do not allow force pushes
- Do not allow deletions

### `develop`

- Require status checks: `quality` (e2e optional for speed)
- Allow direct push for integration agents with caution

## Admin CLI (requires `gh auth` with admin scope)

```bash
gh api repos/dukkanify/UAE-Sales/branches/aviatorpass/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["quality","e2e"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

Repeat for `develop` with the desired check contexts.

## Secrets isolation

| Environment                | Allowed secrets                                                           |
| -------------------------- | ------------------------------------------------------------------------- |
| `Production – aviatorpass` | `VERCEL_AVIATORPASS_DEPLOY_HOOK`, AviatorPass `VERCEL_TOKEN` / project id |

Never store marketplace (`sooqna`) deploy hooks in the AviatorPass environment.
