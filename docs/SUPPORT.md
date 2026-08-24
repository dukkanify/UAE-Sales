# Support documentation — ATPL PASS

## Channels

1. In-app support tickets / conversations (students & instructors).  
2. Admin review under communication tickets (`/super-admin/support`).  
3. Formal Ops Center support requests (`/super-admin/ops-center`) with SLA tracking.  
4. Escalation to Super Admin for security, outages, data issues.  
5. Email support to the platform support address (Platform Settings → General).

## Categories

Technical · User · Course · Live class · Zoom · Payment · General questions

## Triage

| Severity | Examples | Target response |
|----------|----------|-----------------|
| Critical | Auth outage, payment double-charge, data loss | Per SLA (default ≤ 2h) |
| High | Role cannot access primary workflow | Per SLA (default ≤ 8 business hours) |
| Medium | UI glitch, non-blocking API error | Per SLA (default ≤ 24 business hours) |
| Low | Copy / cosmetic | Per SLA (default ≤ 2 business days) |

SLA hours are **configurable** in Ops Center → SLA.

## Bug workflow

New → Confirmed → In Progress → Ready for Testing → Verified → Closed  
Track in Ops Center → Bugs (history retained). Close only after verification.

## Change requests

Submit via Ops Center with business impact + estimates. Approved items become roadmap phases.

## Diagnostics

1. Check `/api/health` and `/api/health?ready=1`.  
2. Super Admin → Monitoring + Ops Center + System logs (ops/backups).  
3. Reproduce with `npm run uat` / `npm run acceptance`.  
4. Confirm feature flags and maintenance mode.

## Common fixes

| Symptom | Action |
|---------|--------|
| OTP never arrives | Verify ESP env; demo OTP only in non-prod |
| 403 on APIs | Confirm role permissions; CSRF header on mutations |
| Empty dashboards | Confirm seed/data store or Supabase connection |
| Backup failure | Disk space on `.backups/`; re-run `npm run backup` |
| Stuck in maintenance | Super Admin → Ops Center → Disable maintenance |

## References

- `docs/OPS_SUPPORT.md` — Ops Center reference  
- `docs/SECURITY.md` — incidents  
- `docs/BACKUP_DISASTER_RECOVERY.md` — restore  
- `docs/BUG_TRACKER.md` — legacy Task 016 log  
- `docs/KNOWN_LIMITATIONS.md` — expected gaps  
