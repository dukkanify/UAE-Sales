# Enterprise Git Status Report

Generated: 2026-08-24T18:22:01.623Z

## Repository

| Field                          | Value                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| Remote origin                  | `https://x-access-token:***@github.com/dukkanify/UAE-Sales` |
| Current branch                 | `develop`                                                   |
| Upstream tracking              | `origin/develop`                                            |
| Last commit                    | a3b11e2 docs: refresh enterprise Git status report          |
| Merge conflicts (working tree) | ✅ None                                                     |
| Detached HEAD                  | ✅ No                                                       |

## Working tree

```
## develop...origin/develop
```

## CI / GitHub Actions

| Field                      | Value                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------- |
| PR checks (current branch) | PASSING                                                                               |
| Latest workflow run        | completed / success — https://github.com/dukkanify/UAE-Sales/actions/runs/32761452206 |

Required checks on PRs: `quality`, `e2e`, `merge-gate` (see `.github/workflows/ci.yml`).

## Branch model (AviatorPass only)

| Branch        | Role                            |
| ------------- | ------------------------------- |
| `aviatorpass` | Production (Vercel AviatorPass) |
| `develop`     | Integration / staging           |
| `feature/*`   | Feature work                    |
| `hotfix/*`    | Production hotfixes             |
| `cursor/*`    | Cloud Agent feature tips        |

## Deployment

| Trigger            | Workflow                            | Status                                                                  |
| ------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| Push `aviatorpass` | `deploy-aviatorpass-production.yml` | AviatorPass Vercel (requires `VERCEL_AVIATORPASS_DEPLOY_HOOK` or token) |

> AviatorPass tip no longer ships marketplace deploy workflows. Keep secrets isolated.

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
