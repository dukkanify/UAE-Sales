# Post-launch support & Version 1.1 roadmap — Task 021

AviatorPass operates as an enterprise SaaS product with structured hypercare, support, SLA, incidents, feature intake, versioning, knowledge base, feedback, and continuous optimization — without major architecture changes.

## Ops Center

**UI:** `/super-admin/ops-center`  
**API:** `GET|POST /api/support-ops`  
**Store:** `.data/aep-support-ops.json`  
**SQL twins:** `015_support_ops.sql`, `017_post_launch_ops.sql`

### New / extended views (`GET ?view=`)

| View                            | Purpose                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `maintenance-dashboard`         | Availability, open issues, releases, support metrics, hypercare |
| `hypercare`                     | Hypercare window + check-ins                                    |
| `features`                      | Feature request register (`FEAT-*`)                             |
| `knowledge`                     | Internal knowledge base articles                                |
| `feedback` / `feedback-summary` | Customer feedback + monthly summary                             |
| `optimization`                  | Continuous optimization notes                                   |

Existing views remain: `dashboard`, `summary`, `sla`, `support`, `bugs`, `change-requests`, `releases`, `roadmap`, `incidents`, `alerts`, backups/health/maintenance logs.

### New actions (`POST`)

`update_hypercare` · `hypercare_checkin` · `create_feature` · `update_feature` · `create_knowledge` · `update_knowledge` · `create_feedback` · `update_feedback` · `create_optimization` · `update_optimization`

Incidents now accept `affectedModule`, `rootCause`, `resolution`, `preventiveAction`.

## Hypercare

Enable in Ops Center → Hypercare. Log daily check-ins (stability, open critical/high). Watch modules default to auth, courses, live classes, payments, Zoom, email, API, jobs.

## SLA (configurable)

| Priority | Response (default) |
| -------- | ------------------ |
| Critical | 2 hours            |
| High     | 8 business hours   |
| Medium   | 24 business hours  |
| Low      | 48 business hours  |

Edit under Ops Center → SLA (also stores resolution hour targets).

## Support workflow

Channels: ticket · email · admin report  
Priorities: critical / high / medium / low  
Track: created date, assignee, priority, status, first response, resolution, SLA breach flag.

## Incidents

Register fields: ID, description, severity, affected module, root cause, resolution, preventive action, status.

Critical/high incidents auto-raise Ops alerts.

## Feature requests vs change requests

| Entity          | Prefix  | Use                                                                            |
| --------------- | ------- | ------------------------------------------------------------------------------ |
| Feature request | `FEAT-` | Product intake with business value, effort, cost, approval, development status |
| Change request  | `CR-`   | Internal change control (existing Task 017)                                    |

## Version management

Ops Center → Releases tracks `version`, features, fixes, breaking changes, deploy date. Seed includes `1.0.0` and `1.0.1`; roadmap targets `1.1.0` / `2.0.0`.

## Knowledge base

Categories: FAQ, troubleshooting, admin/instructor/student guides, common issues, best practices. Audience: internal / admin / instructor / student / all.

## Customer feedback

Categories: bug report, feature request, satisfaction, comment, improvement. Monthly summary via `?view=feedback-summary`.

## Version 1.1 roadmap (seeded)

Native mobile apps · Microsoft Teams · Google Meet · AI proctoring · advanced exam security · multi-language · multi-tenant · advanced CRM · marketing automation · enterprise reporting — plus prior items (Supabase cutover, live Stripe/Zoom).

## Continuous optimization

Track notes by area (database, API, dashboard, search, analytics, storage, caching, jobs). Prefer measuring before changing production architecture.

## Related docs

- `docs/OPS_SUPPORT.md` — Task 017 baseline
- `docs/WARRANTY_SUPPORT.md` — warranty contacts
- `docs/ROADMAP.md` — narrative roadmap
- `docs/MAINTENANCE.md` — cadence
- `docs/SUPPORT.md` — triage
