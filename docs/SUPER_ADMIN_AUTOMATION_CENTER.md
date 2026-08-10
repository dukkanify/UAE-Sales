# Super Admin Automation Center (CR010)

Single control plane so Super Admin can operate AviatorPass **without developer intervention**.

## Domains

| Domain            | Controls                                                    |
| ----------------- | ----------------------------------------------------------- |
| Courses           | Module flag, public delivery filter (all / recorded / live) |
| Publishing        | Deep-link to publishing console                             |
| Instructors       | Approval / verification policies                            |
| Zoom              | Feature flag, enable, waiting room, passcode, meeting type  |
| Schedules         | Module flag, reminder emails, offsets                       |
| Payments          | Tax, platform fee, Apple/Google Pay                         |
| Installments      | Count, grace days, auto-suspend, reminder days              |
| Messages          | Messaging / communities / in-app notifications              |
| Email             | Email automation module + notification kill-switches        |
| Certificates      | Module flag + templates console                             |
| Reports           | Module flag + reports console                               |
| CGI               | ATPL package SKU, default first subject                     |
| Assignment engine | Auto Zoom, look-ahead, slot step, duration, queue attempts  |
| Mock exams        | Enable, pricing mode, auto Zoom, auto certificate           |
| Bookings          | Enable, guest booking, confirmation, Zoom, advance days     |

Plus platform **maintenance mode** toggle.

## Surfaces

- UI: `/super-admin/automation`
- API: `GET/POST /api/automation`
- Facade: `services/automation/automation-center-service.ts`
- Prefs: `.data/aep-automation-center.json`
- SQL: `database/migrations/027_super_admin_automation_center.sql`

Domain stores remain authoritative; the Center aggregates and patches them.
