# AEP Database

## Overview

PostgreSQL on **Supabase** with:

- Auth (`auth.users`) + Email OTP
- Profiles, Roles, Permissions, Role Permissions
- Sessions, Notifications, Activity Logs, Audit Logs
- Countries, Settings
- Row Level Security on all sensitive tables

## Migrations

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Legacy slim profiles (superseded) |
| `002_auth_rbac_schema.sql` | Full auth + RBAC schema |
| `003_seed_permissions_countries.sql` | Permissions, role maps, countries, settings |
| `004_platform_settings_optimization.sql` | Settings indexes, soft-delete profiles, feature flags |
| `005_course_management_lms.sql` | Courses, categories, modules, lessons, resources, enrollments, progress |

Run `002` → `003` → `004` → `005` in the Supabase SQL editor for a fresh project.

## Local development store

When Supabase env vars are unset, the app uses:

- `.data/aep-auth.json` — users, sessions, OTP, notifications, logs
- `.data/aep-settings.json` — platform settings
- `.data/aep-courses.json` — LMS catalog (courses, modules, lessons, enrollments)

## Super Admin seeder

On first boot, a Super Admin is created from:

- `SUPER_ADMIN_EMAIL` (default `superadmin@eagerpilots.com`)
- `SUPER_ADMIN_FIRST_NAME` / `SUPER_ADMIN_LAST_NAME`

Sign in with that email and demo OTP `123456` (when `ENABLE_DEMO_OTP=true`).

## Roles

| Role | Dashboard |
|------|-----------|
| `student` | `/student/dashboard` |
| `instructor` | `/instructor/dashboard` |
| `admin` | `/admin/dashboard` |
| `super_admin` | `/super-admin/dashboard` |

## Prisma (optional)

```bash
npx prisma generate --schema=database/prisma/schema.prisma
```
