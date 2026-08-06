# UAT approval — Tasks 016–020

## Scenarios executed

Automated harness: `npm run uat` (base URL configurable).

### Student

- Login via OTP
- Learning dashboard, courses, planner, notes
- Classes calendar, quizzes, certificates, progress reports
- Communication (announcements, communities, conversations)
- Payments catalog + orders
- Analytics (student scope) + AI bootstrap
- Denied: financial analytics, ops

### Instructor

- Login via OTP
- Courses (own), classes, quizzes, instructor reports
- Wallet + AI write assist
- Dashboards / analytics pages

### Admin

- Users, courses, course stats, tickets, learning analytics
- Admin dashboards / payments / AI pages

### Super Admin

- Settings, monitoring, activity logs
- Executive + financial analytics, payments reports, AI insights, ops checklist/logs
- Ops Center / support-ops + public maintenance status
- Mobile API v1 public + platform keys/webhooks/queue
- Backup create + restore test
- CSRF rejection + escalation checks

## Results

| Suite                 | Result           | Date                  |
| --------------------- | ---------------- | --------------------- |
| `npm run uat`         | **31/31** passed | 2026-08-04 (Task 020) |
| `npm run acceptance`  | **5/5** passed   | 2026-08-04            |
| `npm run test:e2e`    | **5/5** passed   | 2026-08-04            |
| `npm run test`        | **45/45** passed | 2026-08-04            |
| Backup `test_restore` | Pass (22 files)  | 2026-08-04            |

Earlier Task 016 baseline: UAT 28/28 (expanded checks added in later tasks).

## Client sign-off

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| Product            | AviatorPass                                           |
| Environment tested | Local / staging (set URL here)                        |
| Tester             | ________________                                      |
| Date               | ________________                                      |
| Outcome            | ☐ Approved · ☐ Approved with limitations · ☐ Rejected |
| Notes              | ________________                                      |

Limitations (if any) must reference `docs/KNOWN_LIMITATIONS.md`.
