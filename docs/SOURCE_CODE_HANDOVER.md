# Source code handover — AviatorPass

## Repository

| Item                       | Value                                                  |
| -------------------------- | ------------------------------------------------------ |
| Product                    | AviatorPass / AEP (`aep-web`)                          |
| Branch tip (v1.0 GA)       | `cursor/aep-final-release-0987`                        |
| Prior closure tip          | `cursor/aep-project-closure-0987`                      |
| Preferred merge base chain | Tasks 016→025 feature tips → `main` per client process |
| License                    | `UNLICENSED`                                           |

Access granted per contract — see `docs/CREDENTIALS_REGISTER.md`.

## Cleanliness verification

| Check                                                      | Status                                       |
| ---------------------------------------------------------- | -------------------------------------------- |
| `.env*.local` / production secrets gitignored              | ✅                                           |
| `.data/`, `.backups/` gitignored                           | ✅                                           |
| `public/exports/*` artifacts ignored (`.gitkeep` only)     | ✅                                           |
| `test-results/`, `playwright-report/`, `coverage/` ignored | ✅                                           |
| Env templates without live secrets                         | ✅ `.env.example`, `.env.production.example` |
| README with install + build                                | ✅                                           |
| No new debug credentials committed                         | ✅                                           |

## Build instructions

```bash
cp .env.example .env.local   # local only
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run start                # or npm run dev
```

Production: configure Vercel env from `.env.production.example` — see `docs/DEPLOYMENT.md`.

## Folder structure (high level)

```
app/            Routes + API
components/     UI primitives
features/       Domain UI
services/       Domain logic + stores
lib/            Security, API helpers, Supabase clients
database/       SQL migrations + Prisma
docs/           Full documentation package
scripts/        Backup, UAT, acceptance
e2e/ tests/     Playwright + Vitest
```

## What was removed / excluded from delivery

- Runtime JSON data and backups (generated locally, not source)
- Temporary export JSON under `public/exports/`
- Node modules / `.next` build output
- Real credentials (never in git)

Demo users in seed data are for non-production; rotate or disable for live.
