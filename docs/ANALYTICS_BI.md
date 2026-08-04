# Analytics, Business Intelligence & Executive Reporting

Task 013 delivers a read-only BI layer over existing AEP modules (auth, courses, learning, quizzes, certificates, live classes, communication, payments, monitoring).

## Architecture

| Service | Path | Responsibility |
|---------|------|----------------|
| Aggregator | `services/analytics/aggregator.ts` | Cross-module KPI + chart snapshots |
| KPI Service | `services/analytics/kpi-service.ts` | Scope resolution + RBAC + cache |
| Chart Service | `services/analytics/chart-service.ts` | Chart series extraction |
| Dashboard Service | `services/analytics/dashboard-service.ts` | Widgets, saved filters, favorites, schedules |
| Report Service | `services/analytics/report-service.ts` | Report bundles + export orchestration |
| Export Service | `services/analytics/export-service.ts` | CSV / print-HTML (PDF via print) |
| Cache Service | `services/analytics/cache-service.ts` | Short-TTL analytics cache |
| Monitoring Service | `services/analytics/monitoring-service.ts` | Platform health facade |

Facts stay in module stores (`.data/aep-*.json`). Analytics persistence (`.data/aep-analytics.json`) holds prefs, saved/scheduled reports, history, and cache only.

SQL twin: `database/migrations/012_analytics_bi.sql`.

## Scopes

- `executive` — students, instructors, courses, live today, revenue, engagement, completion
- `learning` / `course` — enrollments, completion, study time, quiz, drop-off
- `instructor` — assigned courses, students, attendance, revenue, live classes
- `student` — progress, streak, certificates, weekly/monthly performance
- `financial` — revenue, AOV, refunds, payouts, top courses (finance permission)
- `live` — sessions, attendance, cancelled/rescheduled
- `community` — posts, comments, likes, growth
- `support` — tickets, response times, categories
- `health` — online users, DB, storage, queues, Zoom (`audit.read`)

## APIs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/analytics/overview?scope=` | Snapshot + filters; `view=scopes\|charts` |
| GET/PATCH/POST | `/api/analytics/dashboard` | Prefs, save report, toggle/reorder widgets |
| GET/POST | `/api/analytics/reports` | Scheduled reports + history (`view=history\|run_due`) |
| GET | `/api/analytics/export?scope=&format=` | `csv` \| `xlsx` \| `print` \| `pdf` |
| GET | `/api/analytics/health` | Platform health (Super Admin) |

## UI

- `/super-admin/analytics`, `/admin/analytics`, `/instructor/analytics`, `/student/analytics`
- Reports pages also embed the BI hub above academic certificate reports
- Nav: **Analytics** for all roles

## Security

- Scope checks in `services/analytics/access.ts`
- Financial → `finance.reports` / `system.payments`
- Health → `audit.read`
- Executive → `reports.view`
- Exports audited via `analytics.exported`

## Demo

OTP `123456` for `superadmin@eagerpilots.com`, `admin@`, `instructor.one@`, `student.one@`.
