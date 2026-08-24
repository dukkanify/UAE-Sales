# Git workflow

## Branch model

This repository contains **Sooqna** (`main`) and **AviatorPass** (`aviatorpass` production, `develop` integration).

| Branch        | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `main`        | Sooqna production-ready; CI + deploy to Sooqna Vercel     |
| `aviatorpass` | AviatorPass production; CI + deploy to AviatorPass Vercel |
| `develop`     | AviatorPass integration / staging                         |
| `feature/*`   | Feature work (preferred for new tasks)                    |
| `hotfix/*`    | Production hotfixes off `aviatorpass`                     |
| `cursor/*`    | Cloud Agent convention (equivalent to `feature/*`)        |

## Flow

```
feature/* or cursor/*  →  develop  →  aviatorpass  (AviatorPass production)
feature/*              →  main       (Sooqna production)
hotfix/*               →  aviatorpass (urgent AviatorPass fixes)
```

## Pull requests

1. Open PR into `develop` (AviatorPass) or `main` (Sooqna)
2. CI must pass: format, lint, typecheck, vitest, build, e2e
3. Use draft PRs until UAT/smoke is green
4. Merge only when required checks are green (branch protection)

## Protected branches

See [.github/BRANCH_PROTECTION.md](../.github/BRANCH_PROTECTION.md).

Required status checks:

- `quality`
- `e2e` (recommended for production merges)

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: registration improvements
fix: authentication bug
refactor: dashboard architecture
docs: update project documentation
```

`.husky/commit-msg` warns when the format is not followed.

## Hooks

| Hook         | Action                                        |
| ------------ | --------------------------------------------- |
| `pre-commit` | lint-staged (Prettier + ESLint)               |
| `commit-msg` | Conventional commit warning                   |
| `pre-push`   | safe sync (fetch + rebase) → typecheck → test |

## Safe push

Before every push, `scripts/git-safe-sync.sh`:

1. Fetches `origin`
2. Rebases onto upstream tracking branch
3. **Stops** if conflicts exist (never force-pushes)

Manual sync:

```bash
npm run git:sync
git push
```

Status report:

```bash
npm run git:status
```

## Deployment

| Trigger            | Workflow                            | Target             |
| ------------------ | ----------------------------------- | ------------------ |
| Push `main`        | `deploy-main-production.yml`        | Sooqna Vercel      |
| Push `aviatorpass` | `deploy-aviatorpass-production.yml` | AviatorPass Vercel |

## Semantic versioning

Document releases in `docs/RELEASE_NOTES.md`. Tag when promoting production.
