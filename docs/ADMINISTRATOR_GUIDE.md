# Administrator guide — AviatorPass

Companion to the short ops checklist in `docs/ADMIN_MANUAL.md`.

## Roles

| Role        | Primary duties                                                                 |
| ----------- | ------------------------------------------------------------------------------ |
| Admin       | Users, courses, support tickets, learning analytics, payments ops              |
| Super Admin | Platform settings, monitoring, activity logs, backups, feature flags, security |

## Daily operations

1. **Ops Center** — health checks, open alerts, SLA breaches.
2. **Monitoring** — online users, failed logins, warnings.
3. **Ops / Backups** (system logs) — error category filter; run backups.
4. Uptime probe: `GET /api/health?ready=1`.

## Support & bugs

- Communication tickets: `/super-admin/support`
- Formal support + bug workflow + CRs: `/super-admin/ops-center`
- Configure SLA targets under Ops Center → SLA

## User & course management

- Approve / suspend users under Users.
- Create and publish courses; assign instructors.
- Review enrollment and support tickets.

## Payments

- Confirm catalog prices and order states.
- Investigate failed checkouts in payments reports (Super Admin).
- Keep Stripe keys only in server env.

## Releases & roadmap

- Record versioned releases and mark deployed after each production ship.
- Manage roadmap statuses (planned → completed / deferred).
- Approved change requests auto-appear on the roadmap.

## Security settings

- Maintenance mode, IP blocklist, rate limits, feature flags (`ai`, `payments`, …).
- Prefer Ops Center for maintenance (message + ETA + contact).
- Keep `ENABLE_DEMO_OTP=false` in production.
- Rotate `AUTH_SECRET` if compromised.

## Backups

- Run daily/weekly/monthly backups from System logs or `npm run backup`.
- Always run a **test restore** after the first production backup.

## Escalation

- Security: `docs/SECURITY.md`
- Data loss: `docs/BACKUP_DISASTER_RECOVERY.md`
- Deploy: `docs/DEPLOYMENT.md`
