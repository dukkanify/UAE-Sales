# Branch protection (dukkanify/AviatorPass)

Dedicated AviatorPass repository — no marketplace branches.

| Branch        | Role                       | Deploy                              |
| ------------- | -------------------------- | ----------------------------------- |
| `main`        | Production                 | `deploy-aviatorpass-production.yml` |
| `aviatorpass` | Production alias (cutover) | same                                |
| `develop`     | Integration                | CI / preview                        |

## Rules

### `main` / `aviatorpass`

- Require PR before merge
- Required checks: `quality`, `e2e`
- Up to date before merge
- No force push / no delete

### `develop`

- Required checks: `quality` (e2e optional)

## Admin CLI

```bash
gh api repos/dukkanify/AviatorPass/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["quality","e2e"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Secrets

| Environment | Secrets                                                                          |
| ----------- | -------------------------------------------------------------------------------- |
| Production  | `VERCEL_AVIATORPASS_DEPLOY_HOOK` and/or AviatorPass `VERCEL_TOKEN` + project ids |

Never add marketplace deploy hooks to this repository.
