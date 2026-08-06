# Maintenance guide — AviatorPass

## Routine cadence

| Cadence     | Actions                                                         |
| ----------- | --------------------------------------------------------------- |
| Daily       | Ops Center health, alerts, support queue; confirm uptime probe  |
| Weekly      | Weekly backup; spot-check restore test; review failed logins    |
| Monthly     | Monthly backup; secret rotation if staff change; review roadmap |
| Per release | CI green → staging UAT → promote → record release in Ops Center |

## Deploy / promote

1. Merge approved PR to `main` (or promote Vercel production from green commit).
2. Confirm env vars unchanged (or intentionally updated).
3. `curl https://<host>/api/health?ready=1`
4. Spot-check login + student course + Super Admin monitoring.
5. Mark release **deployed** in Ops Center.

Rollback: Vercel previous deployment, or `git revert` + redeploy. Data: `docs/BACKUP_DISASTER_RECOVERY.md`.

## Maintenance mode

- Toggle via Platform Settings → General, Ops Center, or `NEXT_PUBLIC_MAINTENANCE_MODE=true`.
- Public status: `GET /api/public/maintenance`.
- Use for migrations, restores, and emergency freezes.

## Data store notes

- Current runtime may use `.data/*.json` — **not durable across multi-instance serverless**.
- Production target: Supabase Postgres + Storage (`docs/DATABASE_SCHEMA.md`, `docs/ENVIRONMENT_SETUP.md`).
- Until cutover, prefer single-region durable disk or migrate early.

## Performance hygiene

- Keep `experimental.optimizePackageImports` packages in sync (`next.config.ts`).
- Prefer Next.js `<Image>` for media; AVIF/WebP enabled.
- Static assets: long-cache `/_next/static` headers already set.
- Re-run `npm run test:bench` after security-sensitive crypto changes.
- Capture Lighthouse on production URL after DNS/CDN settle (target 90+).

## Logging & monitoring

- Public health: `/api/health`, readiness `?ready=1`
- Super Admin: Monitoring, System logs, Ops Center
- Activity / audit: Activity logs UI
- See `docs/ERROR_MONITORING.md`

## When something breaks

1. Check health + Ops alerts.
2. Confirm maintenance / feature flags.
3. Reproduce with `npm run uat` against staging.
4. Escalate per `docs/WARRANTY_SUPPORT.md` / `docs/SECURITY.md`.
