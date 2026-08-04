# AEP Database

## Overview

PostgreSQL on **Supabase** is the **production target**. Runtime demos may still use JSON stores under `.data/` — see `docs/DATABASE_SCHEMA.md` and `docs/KNOWN_LIMITATIONS.md`.

Target capabilities:

- Auth profiles, roles, permissions, sessions, notifications, activity/audit logs
- LMS, live classes, learning, quizzes, certificates, communication, payments, analytics, AI, ops
- Row Level Security on sensitive early-schema tables

## Migrations

Apply in order on a fresh Supabase project:

| File                                     | Purpose                                               |
| ---------------------------------------- | ----------------------------------------------------- |
| `001_initial_schema.sql`                 | Legacy slim profiles (superseded)                     |
| `002_auth_rbac_schema.sql`               | Full auth + RBAC schema                               |
| `003_seed_permissions_countries.sql`     | Permissions, role maps, countries, settings           |
| `004_platform_settings_optimization.sql` | Settings indexes, soft-delete profiles, feature flags |
| `005_course_management_lms.sql`          | Courses, categories, modules, lessons, enrollments    |
| `006_live_classes_zoom.sql`              | Live classes, Zoom, attendance, recordings            |
| `007_student_learning.sql`               | Learning journey                                      |
| `008_assessment_quizzes.sql`             | Quizzes / question bank                               |
| `009_certificates_reports.sql`           | Certificates / reports                                |
| `010_communication_center.sql`           | Messaging, community, blog, support                   |
| `011_payments_billing.sql`               | Payments / wallets                                    |
| `012_analytics_bi.sql`                   | Analytics                                             |
| `013_ai_assistant.sql`                   | AI assistant                                          |
| `014_ops_production.sql`                 | Ops / production                                      |
| `015_support_ops.sql`                    | Support ops                                           |
| `016_api_platform.sql`                   | Mobile / API platform                                 |
| `017_post_launch_ops.sql`                | Hypercare, features, KB, feedback                     |

Prefer starting at `002` for greenfield (skip or archive `001`).

## Local development store

When Supabase env vars are unset, the app uses `.data/aep-*.json` domains (auth, settings, courses, classes, learning, quizzes, certificates, communication, payments, analytics, AI, ops, support-ops, api-platform).

## Super Admin seeder

On first boot, a Super Admin is created from:

- `SUPER_ADMIN_EMAIL` (default `superadmin@eagerpilots.com`)
- `SUPER_ADMIN_FIRST_NAME` / `SUPER_ADMIN_LAST_NAME`

Sign in with that email and demo OTP `123456` (when `ENABLE_DEMO_OTP=true`). Production must set `ENABLE_DEMO_OTP=false`.

## Roles

| Role          | Dashboard                |
| ------------- | ------------------------ |
| `student`     | `/student/dashboard`     |
| `instructor`  | `/instructor/dashboard`  |
| `admin`       | `/admin/dashboard`       |
| `super_admin` | `/super-admin/dashboard` |

## Prisma (optional)

Covers auth + LMS subset today — expand during cutover (`docs/TECHNICAL_DEBT.md` TD-016).

```bash
npm run db:generate
```
