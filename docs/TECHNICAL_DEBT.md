# Technical debt tracker

Statuses: `open` · `scheduled` · `in_progress` · `done` · `wontfix`

Effort bands: **S** (&lt; 1 engineer-day) · **M** (1–3 days) · **L** (multi-day / multi-PR) · **XL** (program)

| ID     | Description                                       | Priority | Impact                         | Recommendation                               | Effort | Target | Status    | Notes                                 |
| ------ | ------------------------------------------------- | -------- | ------------------------------ | -------------------------------------------- | ------ | ------ | --------- | ------------------------------------- |
| TD-001 | JSON stores → Supabase cutover                    | high     | Blocks true multi-instance DB  | Cut over stores using migrations 001–017     | XL     | v1.8+  | open      | Migrations ready                      |
| TD-002 | In-memory rate limit → Redis                      | medium   | Multi-pod rate limits diverge  | Shared Redis / Upstash limiter               | M      | v1.8   | open      | Multi-instance                        |
| TD-003 | Expand Playwright to full role UI journeys        | medium   | Gaps in UI regression coverage | Role journeys beyond smoke                   | L      | v1.9   | open      | UAT HTTP covers APIs                  |
| TD-004 | PDF/XLSX real export workers                      | low      | Placeholder exports            | Background workers + storage                 | L      | v2.0   | open      | Placeholders in v1 export             |
| TD-005 | CSP report-only → enforce                         | medium   | Weaker XSS defense             | Collect violations then enforce              | M      | v1.8   | open      | Collect first                         |
| TD-006 | Replace demo OTP paths in prod docs automation    | high     | Auth bypass risk               | Hard-fail in production                      | S      | —      | done      | Task 022                              |
| TD-025 | OTP email delivery not implemented                | high     | Non-demo login impossible      | Wire SMTP/ESP send on `requestOtp`           | M      | v1.8   | open      | Audit final 2026-08-04                |
| TD-026 | Analytics hub static Recharts import              | low      | Undoes lazy-chart win          | Import from `lazy-charts` / dashboard barrel | S      | v1.8   | open      | `analytics-hub-view.tsx`              |
| TD-007 | Component Testing Library suite for design system | low      | Slow UI refactors              | Add RTL unit suite                           | M      | v1.9   | open      | `cn` unit exists                      |
| TD-008 | Deprecated cookie-only mobile clients             | low      | Dual auth paths                | Prefer `/api/v1` Bearer                      | S      | v1.9   | open      | Document deprecation                  |
| TD-009 | Queue worker process (not in-request)             | medium   | Request latency / reliability  | Separate worker process                      | L      | v1.8   | open      | `processQueue` today                  |
| TD-011 | Apply Prettier across legacy codebase             | low      | Review noise                   | Gradual `format:all` + CI widen              | M      | v1.9   | open      | Quality paths already checked         |
| TD-012 | CSRF on all cookie-authenticated mutations        | high     | CSRF gaps on older routes      | Extend `api-guard` coverage                  | M      | v1.8   | open      | Client helpers unified in Task 024    |
| TD-013 | Middleware session revocation check               | high     | Revoked JWT still accepted     | Check revocation list in middleware          | M      | v1.8   | open      | JWT-only gate today                   |
| TD-014 | Next.js 16 + nested postcss/sharp advisories      | high     | Dependency CVEs                | Planned upgrade; avoid `--force`             | L      | v1.8   | scheduled | `npm audit` high                      |
| TD-015 | Harden migrations 010–017 (UUID/FK/index/RLS)     | medium   | Weaker SQL twin                | Align later migrations with early standards  | L      | v1.8   | open      | Early migrations stronger             |
| TD-016 | Expand Prisma schema beyond auth/LMS              | medium   | Dual schema story              | Expand Prisma or drop and use SQL only       | L      | v1.9   | open      |                                       |
| TD-017 | React Query for list/detail screens               | low      | Manual fetch/cache             | Introduce QueryClient per role shell         | M      | v2.0   | open      | Auth Context only today               |
| TD-018 | Narrow communication directory PII                | medium   | Email enumeration              | Field-level ACLs / redaction                 | M      | v1.8   | open      | Authenticated email listing           |
| TD-019 | Consolidate navigation constants                  | low      | Drift between nav sources      | Single source of truth                       | S      | v1.9   | open      | `navigation.ts` vs `dashboard-nav.ts` |
| TD-020 | Metrics/charts lazy-load Recharts                 | low      | Dashboard bundle weight        | Dynamic import charts                        | S      | —      | done      | Task 024 `lazy-charts.tsx`            |
| TD-021 | Duplicate client CSRF cookie parsers              | medium   | Drift / missed headers         | Single `auth-api` helpers                    | S      | —      | done      | Task 024                              |
| TD-022 | Shared Ops status badge duplication               | low      | Inconsistent chips             | `OpsStatusBadge`                             | S      | —      | done      | Task 024                              |
| TD-023 | Full WCAG 2.2 AA audit                            | medium   | A11y gaps beyond spot fixes    | Automated + manual audit; remediation sprint | L      | v1.9   | open      | Task 024 fixed FAB / language labels  |
| TD-024 | Materialized views / query indexes (Postgres)     | medium   | Slow analytics at scale        | Add after Supabase cutover                   | L      | v1.8+  | open      | N/A on JSON stores                    |

## Process

1. Log debt when shipping intentional shortcuts
2. Link PRs that create or retire debt
3. Review monthly in Ops Center / planning

Related: `docs/KNOWN_LIMITATIONS.md`, `docs/ROADMAP.md`, `docs/ENTERPRISE_READINESS_022.md`, `docs/ENTERPRISE_AUDIT_FINAL.md`, `docs/ENTERPRISE_REFACTOR_024.md`.
