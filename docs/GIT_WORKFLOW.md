# Git workflow

## Branches

| Branch                  | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `main`                  | Production-ready; protected via CI           |
| `cursor/<feature>-0987` | Feature / task work (Cloud Agent convention) |

## Pull requests

1. Open PR into previous task tip or `main`
2. CI must pass: format, lint, typecheck, vitest, build, e2e
3. Use draft PRs until UAT/smoke is green
4. Code review checklist:

- [ ] Scope matches task (no unrelated features)
- [ ] Types + lint clean
- [ ] Tests added/updated for changed logic
- [ ] Docs updated when contracts change
- [ ] No secrets committed
- [ ] Migrations numbered and twin’d if schema changes

## Protected main

Require status checks on `main`:

- `quality` job
- `e2e` job (recommended)

## Semantic versioning

Document releases in `docs/RELEASE_NOTES.md` (`1.0`, `1.1`, `1.2`, …). Tag when promoting production.

## Hooks

- `pre-commit` → lint-staged (Prettier + ESLint)
- `pre-push` → `typecheck` + `test`
