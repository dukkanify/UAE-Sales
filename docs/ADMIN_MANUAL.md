# Administrator manual (ops)

## Daily

1. Open **Ops Center** — health, alerts, SLA breaches  
2. Open **Monitoring** — online users, failed logins, warnings  
3. Open **Ops / Backups** — error category filter  
4. Confirm `/api/health?ready=1` via uptime tool

## Weekly

1. Run **weekly backup** (or confirm cron)
2. Spot-check restore test on latest backup
3. Review support tickets and AI blocked events

## Monthly

1. Run **monthly backup**
2. Rotate secrets if staff changes
3. Review production checklist before major releases

## Common actions

| Task | Where |
|------|-------|
| Maintenance mode | Platform Settings → General |
| Block IP | Platform Settings → Security |
| Rate limit | Platform Settings → Security |
| Feature flags | Platform Settings → Features (`ai`, `payments`, …) |
| View audit trail | Activity logs |
| Create backup | System logs → Run backup |
| AI usage | Analytics / AI logs via `/api/ai/insights?view=usage` |

## Escalation

Security incident → follow `docs/SECURITY.md` incident response.  
Data loss → `docs/BACKUP_DISASTER_RECOVERY.md`.
