# Project architecture

## Overview

AviatorPass is a Next.js App Router application with role-based dashboards for students, instructors, **Chief Ground Instructors**, admins, and super admins.

```
app/                     Route groups + API routes
  (student|instructor|cgi|admin|super-admin)/
    api/{auth,courses,classes,learning,quizzes,certificates,
       communication,payments,analytics,ai,ops,admin,cgi}/
components/              Shared UI, dashboard, layout
features/                Domain UI modules + client API helpers
services/                Server domain logic + JSON stores
lib/security/            CSRF, sessions, rate limit, uploads, signed URLs
constants/               Permissions, roles, nav, activity actions
types/                   Domain TypeScript types
database/migrations/     Aspirational SQL twin
docs/                    Technical documentation
scripts/                 Backup + acceptance harness
.data/                   Runtime JSON databases (gitignored)
.backups/                Backup archives (gitignored)
```

## Roles (CR004)

| Role                    | Prefix         | Notes                                                                                                                   |
| ----------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| student                 | `/student`     | Learner console                                                                                                         |
| instructor              | `/instructor`  | Teaching console                                                                                                        |
| chief_ground_instructor | `/cgi`         | ATPL journey: distribute subjects/lectures, change instructor, reschedule, first subject, follow students & instructors |
| admin                   | `/admin`       | Operations                                                                                                              |
| super_admin             | `/super-admin` | Full platform                                                                                                           |

CGI demo account: `cgi@eagerpilots.com`.

## Request path

1. `middleware.ts` — maintenance, session JWT, role prefixes
2. Server Component / API route
3. `requireAuth` / `requirePermission`
4. Domain service → store (`.data`) or future Supabase

## Cross-cutting modules (Task 015)

- `services/ops/*` — health, backups, centralized logs
- `lib/security/api-guard.ts` — CSRF + rate limit + IP block
- `/api/ops` — operator endpoints
- `/api/health` — public/readiness probes

## SOLID services

Each business domain (courses, payments, AI, analytics, …) keeps:

- `store.ts` — persistence
- `access.ts` — authorization errors
- `*-service.ts` — use cases
- `seed.ts` — demo data

Route handlers stay thin. Prefer shared helpers:

- Pagination: `parsePagination` / `paginate` (`lib/api/envelope.ts`)
- Browser CSRF: `csrfHeaders` / `authFetch` (`features/auth/services/auth-api.ts`)
- Dashboard charts: lazy exports from `components/dashboard`

Task 024: `docs/ENTERPRISE_REFACTOR_024.md`. Onboarding: `docs/DEVELOPER_GUIDE.md`.
