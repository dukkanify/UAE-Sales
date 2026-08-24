# Enterprise Git Status Report

Generated: 2026-08-24T18:14:08.886Z

## Repository

| Field                          | Value                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| Remote origin                  | `https://x-access-token:***@github.com/dukkanify/UAE-Sales` |
| Current branch                 | `develop`                                                   |
| Upstream tracking              | `origin/develop`                                            |
| Last commit                    | 8ac44e3 fix: improve enterprise Git status report accuracy  |
| Merge conflicts (working tree) | ✅ None                                                     |
| Detached HEAD                  | ✅ No                                                       |

## Working tree

```
## develop...origin/develop
```

## CI / GitHub Actions

| Field                      | Value                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| PR checks (current branch) | unknown                                                                         |
| Latest workflow run        | in_progress / — https://github.com/dukkanify/UAE-Sales/actions/runs/32761229521 |

Required checks on PRs: `quality`, `e2e`, `merge-gate` (see `.github/workflows/ci.yml`).

## Branch model (AviatorPass)

| Branch        | Role                                  |
| ------------- | ------------------------------------- |
| `aviatorpass` | Production (Vercel AviatorPass)       |
| `develop`     | Integration / staging                 |
| `feature/*`   | Feature work                          |
| `hotfix/*`    | Production hotfixes                   |
| `main`        | Sooqna product line (separate deploy) |

## Deployment

| Trigger            | Workflow                            | Status                                                                  |
| ------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| Push `main`        | `deploy-main-production.yml`        | Sooqna Vercel (requires `VERCEL_SOOQNA_DEPLOY_HOOK` or token)           |
| Push `aviatorpass` | `deploy-aviatorpass-production.yml` | AviatorPass Vercel (requires `VERCEL_AVIATORPASS_DEPLOY_HOOK` or token) |

Production health (AviatorPass): `200` on `/api/health`

## Safe push

Pre-push hook runs `scripts/git-safe-sync.sh` (fetch + rebase) before typecheck and tests. Never force-pushes.

```bash
npm run git:sync   # manual safe sync
git push           # runs hook automatically
npm run git:status # regenerate this report
```

## Branch protection

Configure via GitHub Settings or see [.github/BRANCH_PROTECTION.md](../.github/BRANCH_PROTECTION.md).
