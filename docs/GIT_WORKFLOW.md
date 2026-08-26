# Git workflow (AviatorPass only)

## Product isolation

This branch tip is **AviatorPass only**. Do **not** merge AviatorPass work into marketplace `main`, and do **not** check out Sooqna trees into this working directory without a clean `node_modules` / `.next` wipe (prefer a separate git worktree or Cloud Agent environment).

| Branch        | Purpose                                               |
| ------------- | ----------------------------------------------------- |
| `aviatorpass` | AviatorPass production; deploys to AviatorPass Vercel |
| `develop`     | AviatorPass integration / staging                     |
| `feature/*`   | Feature work (preferred for new tasks)                |
| `hotfix/*`    | Production hotfixes off `aviatorpass`                 |
| `cursor/*`    | Cloud Agent convention (equivalent to `feature/*`)    |

> Historical note: GitHub remote `dukkanify/UAE-Sales` still hosts a divergent Sooqna product on branch `main`. That product must use its own Vercel project, secrets, and ideally a separate repository. AviatorPass workflows on this tip no longer include Sooqna deploy jobs.

## Flow

```
feature/* or cursor/*  →  develop  →  aviatorpass  (AviatorPass production)
hotfix/*               →  aviatorpass (urgent AviatorPass fixes)
```

## Pull requests

1. Open PR into `develop` (integration) or `aviatorpass` (production hotfix)
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
| Push `aviatorpass` | `deploy-aviatorpass-production.yml` | AviatorPass Vercel |

Requires AviatorPass-only secret `VERCEL_AVIATORPASS_DEPLOY_HOOK` (or `VERCEL_TOKEN` + AviatorPass project id). Never reuse marketplace deploy hooks.

## Semantic versioning

Document releases in `docs/RELEASE_NOTES.md`. Tag when promoting production.
