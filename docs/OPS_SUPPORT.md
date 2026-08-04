# Production support & continuous improvement — Task 017

Post-launch operations for ATPL PASS: monitoring, support, SLA, bugs, change requests, releases, maintenance, health dashboard, backup verification, and roadmap.

## Ops Center

**UI:** `/super-admin/ops-center`  
**API:** `GET|POST /api/support-ops`  
**Store:** `.data/aep-support-ops.json`  
**SQL twin:** `database/migrations/015_support_ops.sql`

### Views (`GET ?view=`)

| View | Purpose |
|------|---------|
| `dashboard` | System health dashboard + alerts + backup summary |
| `summary` | Open counts (support, bugs, CRs, incidents, alerts) |
| `sla` | Configurable SLA policy |
| `support` / `bugs` / `change-requests` / `releases` / `roadmap` / `incidents` / `alerts` | Lists |
| `maintenance-logs` / `health-logs` / `backup-reports` | History |

### Actions (`POST` JSON `{ action }`)

`update_sla` · `create_support` · `update_support` · `create_bug` · `update_bug` · `create_cr` · `update_cr` · `create_release` · `deploy_release` · `create_roadmap` · `update_roadmap` · `create_incident` · `update_incident` · `ack_alert` · `resolve_alert` · `capture_health` · `backup_report` · `set_maintenance`

Requires `system.settings` (mutations) or `audit.read` (reads). CSRF required on POST.

## Monitoring & alerts

Deep health checks cover app, data store, storage, email, Zoom, payments, Supabase, auth, sessions, backups, error rate, and security events.

Failed checks raise **critical alerts** in Ops Center. Acknowledge / resolve from the Health tab.

Deep health snapshots are cached **5 seconds** in-process to keep dashboards responsive.

Public readiness: `GET /api/health?ready=1`  
Public maintenance flag: `GET /api/public/maintenance`

## Support workflow

Channels: ticket · email · admin report  
Categories: technical · user · course · live_class · zoom · payment · general  

Existing communication tickets remain under `/super-admin/support`; Ops Center tracks formal support requests with SLA breach flags.

## SLA (configurable)

Defaults (hours):

| Priority | Response | Resolution |
|----------|----------|------------|
| Critical | 2 | 8 |
| High | 8 | 24 |
| Medium | 24 | 72 |
| Low | 48 | 120 |

Edit in Ops Center → **SLA** tab.

## Bug workflow

Statuses: New → Confirmed → In Progress → Ready for Testing → Verified → Closed  
Priorities: Critical · High · Medium · Low  
Full history retained on each bug.

## Change requests

Fields: number, description, business impact, estimated time/cost, approval status, development status.  
**Approved** CRs auto-create a roadmap item for a future phase.

## Releases

Versioned release notes (e.g. `1.0.0`, `1.1.0`). Mark deployed when production ships.

## Maintenance mode

1. Ops Center → Maintenance, or Platform Settings → Maintenance toggle.  
2. Middleware honors settings **and** `NEXT_PUBLIC_MAINTENANCE_MODE`.  
3. Super Admins bypass the redirect so they can disable mode.  
4. Public page `/maintenance` shows status message, ETA, and contact details.

## Backup verification

Generate reports from Ops Center → Backups (optional restore test). Daily/weekly presence shown on the health dashboard. CLI: `npm run backup`.

## Roadmap manager

Statuses: Planned · Approved · In development · Completed · Deferred.

## Related docs

- `docs/SUPPORT.md` — triage & contacts  
- `docs/ADMINISTRATOR_GUIDE.md` / `docs/ADMIN_MANUAL.md`  
- `docs/BACKUP_DISASTER_RECOVERY.md`  
- `docs/PRODUCTION_CHECKLIST.md`  
- `docs/ROADMAP.md` / `docs/RELEASE_NOTES.md`
