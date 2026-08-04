# Administrator training — ATPL PASS

Suggested live session: **~90 minutes**. Pair with hands-on walkthrough on staging.

## Agenda

| Block                         | Duration | Topics                                        |
| ----------------------------- | -------- | --------------------------------------------- |
| 1. Platform overview          | 10 min   | Brand, roles, navigation, Ops Center          |
| 2. User management            | 15 min   | Invite/suspend, RBAC, activity logs           |
| 3. Course management          | 15 min   | Categories, publish, enrollments, instructors |
| 4. Live classes & Zoom        | 10 min   | Schedule, join links, attendance              |
| 5. Assessments & certificates | 10 min   | Quizzes, grading, verify certificates         |
| 6. Payments & wallets         | 10 min   | Catalog, orders, instructor payouts           |
| 7. Reports & analytics        | 5 min    | Role-scoped dashboards, exports               |
| 8. Settings & security        | 10 min   | Feature flags, maintenance, rate limits       |
| 9. Backups & recovery         | 5 min    | Run backup, test restore, DR doc              |

## Role map (quick reference)

| Role        | Primary UI       | Must not                                          |
| ----------- | ---------------- | ------------------------------------------------- |
| Student     | `/student/*`     | Access finance/ops                                |
| Instructor  | `/instructor/*`  | Manage global settings                            |
| Admin       | `/admin/*`       | Rotate platform secrets alone without Super Admin |
| Super Admin | `/super-admin/*` | Leave demo OTP enabled in production              |

## Hands-on exercises

1. Log in as Super Admin → disable a feature flag → confirm UI hides it.
2. Create a support ticket / bug in Ops Center → assign → close after verify.
3. Run **backup** → **Test restore** → confirm green result.
4. Place platform in maintenance mode → confirm `/api/public/maintenance` → disable.
5. Open Monitoring + `/api/health?ready=1` in uptime tool.

## Training materials (self-serve)

| Audience           | Doc                                                   |
| ------------------ | ----------------------------------------------------- |
| Students           | `docs/STUDENT_GUIDE.md`                               |
| Instructors        | `docs/INSTRUCTOR_GUIDE.md`                            |
| Admins / operators | `docs/ADMINISTRATOR_GUIDE.md`, `docs/ADMIN_MANUAL.md` |
| Ops / SLA          | `docs/OPS_SUPPORT.md`, `docs/SUPPORT.md`              |
| Security incidents | `docs/SECURITY.md`                                    |
| DR                 | `docs/BACKUP_DISASTER_RECOVERY.md`                    |

## Demo accounts (non-production only)

| Role        | Email                            |
| ----------- | -------------------------------- |
| Super Admin | `superadmin@eagerpilots.com`     |
| Admin       | `admin@eagerpilots.com`          |
| Instructor  | `instructor.one@eagerpilots.com` |
| Student     | `student.one@eagerpilots.com`    |

Demo OTP `123456` — **must be disabled** in production (`ENABLE_DEMO_OTP=false`).

## Completion record

| Field       | Value                |
| ----------- | -------------------- |
| Trainer     | ________________     |
| Attendees   | ________________     |
| Date        | ________________     |
| Environment | staging / production |
| Signed off  | ☐                    |
