# Administrator guide — ATPL PASS

Companion to the short ops checklist in `docs/ADMIN_MANUAL.md`.

## Roles

| Role | Primary duties |
|------|----------------|
| Admin | Users, courses, support tickets, learning analytics, payments ops |
| Super Admin | Platform settings, monitoring, activity logs, backups, feature flags, security |

## Daily operations

1. **Monitoring** — online users, failed logins, warnings.  
2. **System logs** — filter errors; confirm checklist items.  
3. Uptime probe: `GET /api/health?ready=1`.

## User & course management

- Approve / suspend users under Users.  
- Create and publish courses; assign instructors.  
- Review enrollment and support tickets.

## Payments

- Confirm catalog prices and order states.  
- Investigate failed checkouts in payments reports (Super Admin).  
- Keep Stripe keys only in server env.

## Security settings

- Maintenance mode, IP blocklist, rate limits, feature flags (`ai`, `payments`, …).  
- Keep `ENABLE_DEMO_OTP=false` in production.  
- Rotate `AUTH_SECRET` if compromised.

## Backups

- Run daily/weekly/monthly backups from System logs or `npm run backup`.  
- Always run a **test restore** after the first production backup.

## Escalation

- Security: `docs/SECURITY.md`  
- Data loss: `docs/BACKUP_DISASTER_RECOVERY.md`  
- Deploy: `docs/DEPLOYMENT.md`
