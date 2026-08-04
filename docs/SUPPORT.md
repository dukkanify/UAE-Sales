# Support documentation — ATPL PASS

## Channels

1. In-app support tickets / conversations (students & instructors).  
2. Admin review under communication tickets.  
3. Escalation to Super Admin for security, outages, data issues.

## Triage

| Severity | Examples | Target response |
|----------|----------|-----------------|
| Critical | Auth outage, payment double-charge, data loss | Immediate — page on-call |
| High | Role cannot access primary workflow | Same business day |
| Medium | UI glitch, non-blocking API error | Next maintenance window |
| Low | Copy / cosmetic | Backlog |

## Diagnostics

1. Check `/api/health` and `/api/health?ready=1`.  
2. Super Admin → Monitoring + System logs.  
3. Reproduce with `npm run uat` against the failing environment.  
4. Confirm feature flags and maintenance mode in Platform Settings.

## Common fixes

| Symptom | Action |
|---------|--------|
| OTP never arrives | Verify ESP env; temporarily use staging demo OTP only in non-prod |
| 403 on APIs | Confirm role permissions; CSRF header on mutations |
| Empty dashboards | Confirm seed/data store or Supabase connection |
| Backup failure | Disk space on `.backups/`; permissions; re-run `npm run backup` |

## References

- `docs/SECURITY.md` — incidents  
- `docs/BACKUP_DISASTER_RECOVERY.md` — restore  
- `docs/BUG_TRACKER.md` — defect log  
- `docs/KNOWN_LIMITATIONS.md` — expected gaps  
