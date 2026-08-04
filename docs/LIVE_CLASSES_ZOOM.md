# Live Classes, Zoom & Scheduling

MASTER TASK 007 — Live class management with Zoom integration.

## Scope

Included:

- Live class CRUD (create, edit, duplicate, cancel, reschedule, soft delete)
- Zoom Server-to-Server OAuth integration with **secure mock fallback**
- Scheduling engine (one-time, daily, weekly, monthly) + conflict detection
- Calendar views (month / week / day / agenda) permission-filtered
- Reminder queue (24h / 2h / 15m / live now) — configurable in Platform Settings
- Attendance foundation (present / late / absent / excused / unknown)
- Recording metadata architecture (no video processing)
- Dashboard widgets + activity logging + in-app notifications

**Not included:** quizzes, certificates, payments, wallets, community.

## Credentials

Set server env only (never exposed to the client):

```
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
```

When unset, meetings are created in **mock mode** with join URLs under `/join/[id]`.

Platform Settings → Zoom configures host email, waiting room, passcode, meeting/webinar defaults.

## Runtime store

`.data/aep-classes.json`

Production: `database/migrations/006_live_classes_zoom.sql`

## Permissions

| Role | Capability |
|------|------------|
| Super Admin | Full (`classes.manage`, `system.zoom`) |
| Admin | Manage all classes |
| Instructor | Own sessions (`zoom.sessions`, `attendance.manage`, `schedule.own`) |
| Student | View/join enrolled (`zoom.classes`, `calendar.own`) |

## Key routes

- `/super-admin/classes`, `/admin/classes`, `/instructor/classes`
- `/instructor/calendar`, `/student/calendar`
- `/join/[id]` — seamless join experience
- APIs under `/api/classes/*`, `/api/zoom/status`

## Services

`zoom-service`, `class-service`, `schedule-service`, `attendance-service`, `reminder-service`, `calendar-service`, `recording-service`
