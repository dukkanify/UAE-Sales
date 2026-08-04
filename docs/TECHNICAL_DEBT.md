# Technical debt tracker

Statuses: `open` · `scheduled` · `in_progress` · `done` · `wontfix`

| ID     | Item                                              | Category     | Severity | Status    | Notes                                               |
| ------ | ------------------------------------------------- | ------------ | -------- | --------- | --------------------------------------------------- |
| TD-001 | JSON stores → Supabase cutover                    | architecture | high     | open      | Migrations 001–017 ready                            |
| TD-002 | In-memory rate limit → Redis                      | scalability  | medium   | open      | Multi-instance                                      |
| TD-003 | Expand Playwright to full role UI journeys        | testing      | medium   | open      | UAT HTTP covers APIs                                |
| TD-004 | PDF/XLSX real export workers                      | feature-debt | low      | open      | Placeholders in v1 export                           |
| TD-005 | CSP report-only → enforce                         | security     | medium   | open      | Collect violations first                            |
| TD-006 | Replace demo OTP paths in prod docs automation    | security     | high     | done      | Task 022 hard-fails demo OTP in production env      |
| TD-007 | Component Testing Library suite for design system | testing      | low      | open      | `cn` unit exists                                    |
| TD-008 | Deprecated cookie-only mobile clients             | deprecation  | low      | open      | Prefer `/api/v1` Bearer                             |
| TD-009 | Queue worker process (not in-request)             | architecture | medium   | open      | `processQueue` today                                |
| TD-011 | Apply Prettier across legacy codebase             | quality      | low      | open      | CI checks new quality paths; `format:all` available |
| TD-012 | CSRF on all cookie-authenticated mutations        | security     | high     | open      | Today: settings/ops/auth subset                     |
| TD-013 | Middleware session revocation check               | security     | high     | open      | JWT-only gate today                                 |
| TD-014 | Next.js 16 + nested postcss/sharp advisories      | dependencies | high     | scheduled | `npm audit` high; avoid `--force` until planned     |
| TD-015 | Harden migrations 010–017 (UUID/FK/index/RLS)     | database     | medium   | open      | Early migrations are stronger                       |
| TD-016 | Expand Prisma schema beyond auth/LMS              | database     | medium   | open      | Or drop Prisma and use SQL only                     |
| TD-017 | React Query for list/detail screens               | frontend     | low      | open      | Auth Context only today                             |
| TD-018 | Narrow communication directory PII                | security     | medium   | open      | Authenticated email listing                         |
| TD-019 | Consolidate navigation constants                  | quality      | low      | open      | `navigation.ts` vs `dashboard-nav.ts`               |
| TD-020 | Metrics/charts lazy-load Recharts                 | performance  | low      | open      | Bundle weight on dashboards                         |

## Process

1. Log debt when shipping intentional shortcuts
2. Link PRs that create or retire debt
3. Review monthly in Ops Center / planning

Related: `docs/KNOWN_LIMITATIONS.md`, `docs/ROADMAP.md`, `docs/ENTERPRISE_READINESS_022.md`.
