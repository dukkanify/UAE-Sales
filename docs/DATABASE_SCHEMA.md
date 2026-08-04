# Database schema overview — ATPL PASS

## Runtime today

Primary runtime for demos/staging may use **JSON stores** under `.data/` (gitignored):

| Store                    | Domain                                        |
| ------------------------ | --------------------------------------------- |
| `aep-auth.json`          | Users, sessions, OTP, notifications, activity |
| `aep-settings.json`      | Platform settings                             |
| `aep-courses.json`       | LMS catalog                                   |
| `aep-classes.json`       | Live classes / Zoom                           |
| `aep-learning.json`      | Student learning journey                      |
| `aep-quizzes.json`       | Assessments                                   |
| `aep-certificates.json`  | Certificates / reports                        |
| `aep-communication.json` | Messaging, community, blog, support           |
| `aep-payments.json`      | Catalog, orders, wallets                      |
| `aep-analytics.json`     | BI aggregates                                 |
| `aep-ai.json`            | AI assistant state                            |
| `aep-ops-logs.json`      | Ops logs                                      |
| `aep-support-ops.json`   | Ops Center                                    |
| `aep-api-platform.json`  | API keys, webhooks, jobs                      |

Integrity tooling: `npm run backup`, Ops `test_restore` / `restore`.

## Production target (Supabase Postgres)

SQL twins live in `database/migrations/` (apply in order):

| Migration                                | Scope                 |
| ---------------------------------------- | --------------------- |
| `002_auth_rbac_schema.sql`               | Auth / RBAC core      |
| `003_seed_permissions_countries.sql`     | Seeds                 |
| `004_platform_settings_optimization.sql` | Settings              |
| `005_course_management_lms.sql`          | Courses / enrollments |
| `006_live_classes_zoom.sql`              | Live classes          |
| `007_student_learning.sql`               | Learning journey      |
| `008_assessment_quizzes.sql`             | Quizzes               |
| `009_certificates_reports.sql`           | Certificates          |
| `010_communication_center.sql`           | Communication         |
| `011_payments_billing.sql`               | Payments              |
| `012_analytics_bi.sql`                   | Analytics             |
| `013_ai_assistant.sql`                   | AI                    |
| `014_ops_production.sql`                 | Ops / production      |
| `015_support_ops.sql`                    | Support ops           |
| `016_api_platform.sql`                   | Mobile / API platform |

Also see `database/README.md` and Prisma schema at `database/prisma/schema.prisma` (`npm run db:generate`).

## Data verification checklist (go-live)

- [ ] Roles & permissions seeded
- [ ] Super Admin account exists (rotate credentials)
- [ ] Sample/demo courses either purged or clearly marked
- [ ] Enrollments / payments / certificates consistent
- [ ] Backup + restore test recorded
- [ ] No demo OTP challenges left active

## Multi-instance warning

JSON `.data/` is **not shared** across Vercel serverless instances. Cut over to Supabase (or another durable DB) before multi-region / multi-instance production traffic. See `docs/KNOWN_LIMITATIONS.md`.
