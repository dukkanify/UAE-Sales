# Enterprise Git Status Report

Generated: 2026-08-24T18:02:48.593Z

## Repository

| Field                          | Value                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| Remote origin                  | `https://x-access-token:***@github.com/dukkanify/UAE-Sales` |
| Current branch                 | `develop`                                                   |
| Upstream tracking              | `origin/develop`                                            |
| Last commit                    | n/a                                                         |
| Merge conflicts (working tree) | ✅ None                                                     |

## Working tree

```
## develop...origin/develop
```

## CI / GitHub Actions

| Field                      | Value                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| PR checks (current branch) | unknown                                                                         |
| Latest workflow run        | in_progress / — https://github.com/dukkanify/UAE-Sales/actions/runs/32760130369 |

## Branch model (AviatorPass)

| Branch        | Role                                  |
| ------------- | ------------------------------------- |
| `aviatorpass` | Production (Vercel AviatorPass)       |
| `develop`     | Integration / staging                 |
| `feature/*`   | Feature work                          |
| `hotfix/*`    | Production hotfixes                   |
| `main`        | Sooqna product line (separate deploy) |

## Deployment

- **AviatorPass production:** push to `aviatorpass` → `.github/workflows/deploy-aviatorpass-production.yml`
- **Sooqna production:** push to `main` → `.github/workflows/deploy-main-production.yml`

## Safe push

Pre-push hook runs `scripts/git-safe-sync.sh` (fetch + rebase) before tests and push.
