# Production launch checklist

Use before promoting staging → production.

## Build quality

- [ ] `npm run lint` — no errors
- [ ] `npm run typecheck` — no errors
- [ ] `npm run test` — Vitest green
- [ ] `npm run format:check` — quality paths formatted
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
- [ ] Run `npm run uat` against staging (includes Ops Center checks)
- [ ] Ops Center health dashboard loads (`/super-admin/ops-center`)
- [ ] SLA policy reviewed
- [ ] Maintenance page message/ETA configured for planned windows
- [ ] Backup verification report generated

## Documentation

- [ ] `docs/PRODUCTION.md` reviewed
- [ ] `docs/DEPLOYMENT.md` followed
- [ ] `docs/ENVIRONMENT_SETUP.md` applied
- [ ] `docs/BACKUP_DISASTER_RECOVERY.md` shared with ops
- [ ] Admin manual + `docs/TRAINING.md` completed
- [ ] `docs/QA_REPORT.md` / `docs/UAT_APPROVAL.md` signed
- [ ] `docs/FINAL_ACCEPTANCE_CHECKLIST.md` signed
- [ ] `docs/FINAL_SECURITY_AUDIT.md` reviewed
- [ ] `docs/HANDOVER.md` filled (URLs + contacts)
- [ ] `docs/WARRANTY_SUPPORT.md` contacts filled

## Post-launch checklist

- [ ] No critical / high open bugs (`docs/BUG_TRACKER.md`)
- [ ] No unexpected console errors on critical paths
- [ ] No build / typecheck / lint / Vitest errors on `main`
- [ ] No database / store errors in monitoring
- [ ] No permission escalation issues in UAT
- [ ] No broken primary nav links for each role
- [ ] Successful backup + restore test recorded
- [ ] Monitoring active (uptime on `/api/health?ready=1`)
- [ ] Logging active (system logs + activity logs)
- [ ] Emails working (or documented mock limitation)
- [ ] Zoom working (or documented stub limitation)
- [ ] Payments working (mock or live Stripe)
- [ ] Reports working
- [ ] Analytics dashboards loading for allowed roles
- [ ] AI assistant working for enabled roles
- [ ] Mobile API v1 ready (`docs/MOBILE_API.md`)
- [ ] Lighthouse / CWV spot-check on production URL (target 90+)

## Go / No-go

**GO** only if all Security and Build quality boxes pass, backups exist, documentation/training delivered, and UAT is approved (`docs/FINAL_ACCEPTANCE_CHECKLIST.md`).
