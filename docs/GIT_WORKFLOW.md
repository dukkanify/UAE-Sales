# Git workflow (AviatorPass — dedicated repository)

## Repository

| Item      | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| GitHub    | [`dukkanify/AviatorPass`](https://github.com/dukkanify/AviatorPass) |
| Product   | AviatorPass only                                                    |
| Migration | See `REPOSITORY_MIGRATION_PLAN.md`                                  |

Do **not** use `dukkanify/UAE-Sales` as the AviatorPass origin after cutover.

## Branches

| Branch                   | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `main`                   | Production tip (default); deploys to AviatorPass Vercel       |
| `aviatorpass`            | Optional production alias during cutover (same tip as `main`) |
| `develop`                | Integration / staging                                         |
| `feature/*` / `cursor/*` | Feature work                                                  |
| `hotfix/*`               | Production hotfixes                                           |

## Flow

```
feature/* or cursor/*  →  develop  →  main  (production)
hotfix/*               →  main
```

## Pull requests

1. Open PR into `develop` (integration) or `main` (hotfix)
2. CI must pass: format, lint, typecheck, vitest, isolation, build, e2e
3. Merge only when required checks are green

## Deployment

| Trigger                      | Workflow                            | Target             |
| ---------------------------- | ----------------------------------- | ------------------ |
| Push `main` or `aviatorpass` | `deploy-aviatorpass-production.yml` | AviatorPass Vercel |

Secret: `VERCEL_AVIATORPASS_DEPLOY_HOOK` (never marketplace hooks).

## Protection

See `.github/BRANCH_PROTECTION.md`.
