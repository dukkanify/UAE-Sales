# Production readiness — Task 015

This guide covers security, environments, monitoring, backups, CI/CD, and launch readiness for ATPL PASS (Next.js App Router).

## Architecture (runtime)

- **Frontend / BFF:** Next.js 15 on Vercel (recommended)
- **Data (current):** JSON stores under `.data/` (auth, courses, learning, payments, analytics, AI, ops logs)
- **Data (target):** Supabase Postgres + Storage — see `database/migrations/` and `database/README.md`
- **Auth:** OTP + signed session cookies (`lib/security/session-token.ts`)
- **RBAC:** `constants/permissions.ts` + `services/auth/guards.ts`

## Environments

| Env | `NEXT_PUBLIC_APP_ENV` | Notes |
|-----|----------------------|--------|
| Development | `development` | Demo OTP allowed |
| Staging | `staging` | Production-like secrets, demo OTP off preferred |
| Production | `production` | Strong `AUTH_SECRET` required; `ENABLE_DEMO_OTP=false` |

Templates: `.env.example`, `.env.production.example`

## Security controls

- Middleware route/role gates — `middleware.ts`
- CSRF on mutating APIs — `lib/security/csrf.ts` + `lib/security/api-guard.ts`
- Rate limits + IP blocklist from platform settings
- Security headers + CSP report-only + HSTS (prod) — `next.config.ts` / `vercel.json`
- Upload validation + AV hook stub — `lib/security/upload.ts`
- Signed temporary downloads — `lib/security/signed-url.ts` + `/api/ops/download`
- Audit/activity logs — `services/auth/activity-log.ts` (immutable append + search UI)
- Ops logs — `.data/aep-ops-logs.json`

## Monitoring & health

- Public: `GET /api/health` (no user inventory)
- Ready: `GET /api/health?ready=1`
- Deep (admin): `GET /api/ops?view=health`
- UI: `/super-admin/monitoring`, `/super-admin/system-logs`

## Backups

```bash
npm run backup           # daily
npm run backup:weekly
npm run backup:monthly
```

Or Super Admin → System logs → **Run backup**. Archives land in `.backups/`.

See `docs/BACKUP_DISASTER_RECOVERY.md`.

## CI/CD

- GitHub Actions: `.github/workflows/ci.yml` (lint, typecheck, build, checklist docs)
- Deploy target: Vercel project linked to GitHub
- Backend services: Supabase project (when promoted from JSON mocks)

Branch strategy: feature branches `cursor/*-0987` → PR → `main`.

## Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run acceptance   # requires running dev server
```

## Related docs

- `docs/PRODUCTION_CHECKLIST.md`
- `docs/SECURITY.md`
- `docs/DEPLOYMENT.md`
- `docs/BACKUP_DISASTER_RECOVERY.md`
- `docs/ARCHITECTURE.md`
- `docs/ADMIN_MANUAL.md`
- `docs/API_OVERVIEW.md`
