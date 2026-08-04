# Production launch checklist

Use before promoting staging → production.

## Build quality

- [ ] `npm run lint` — no errors
- [ ] `npm run typecheck` — no errors
- [ ] `npm run build` — succeeds
- [ ] No unexpected browser console errors on critical paths
- [ ] Responsive check: mobile / tablet / desktop

## Security

- [ ] `AUTH_SECRET` strong and unique (≥24 chars)
- [ ] `ENABLE_DEMO_OTP=false` in production
- [ ] `DEMO_OTP_CODE` unset in production
- [ ] CSRF enforced on mutating admin/auth routes
- [ ] Security headers present (frame deny, nosniff, HSTS on HTTPS)
- [ ] Upload MIME allowlist excludes executable / SVG-as-script
- [ ] Super Admin account MFA plan documented (2FA flag ready in settings)
- [ ] Stripe/Zoom secrets only in server env

## Data & backups

- [ ] At least one successful backup (`npm run backup` or ops UI)
- [ ] Restore test passed (System logs → Test restore)
- [ ] Retention policy understood (daily/weekly/monthly)
- [ ] Supabase PITR enabled when database is live

## Monitoring

- [ ] `/api/health` returns ok without leaking user counts
- [ ] `/api/health?ready=1` returns ready
- [ ] Super Admin monitoring page loads
- [ ] System logs page shows ops + checklist
- [ ] Uptime monitor pointed at `/api/health?ready=1`

## Functional acceptance

- [ ] Auth login / logout / suspended redirect
- [ ] Role dashboards (student, instructor, admin, super admin)
- [ ] Courses catalog + enrollment
- [ ] Live classes calendar
- [ ] Quizzes attempt flow
- [ ] Certificates verify
- [ ] Messaging / community / support
- [ ] Payments checkout (mock or Stripe)
- [ ] Analytics / reports
- [ ] AI assistant FAB + hub
- [ ] Run `npm run acceptance` against staging

## Documentation

- [ ] `docs/PRODUCTION.md` reviewed
- [ ] `docs/DEPLOYMENT.md` followed
- [ ] `docs/BACKUP_DISASTER_RECOVERY.md` shared with ops
- [ ] Admin manual available to operators

## Go / No-go

**GO** only if all Security and Build quality boxes pass and backups exist.
