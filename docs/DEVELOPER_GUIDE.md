# Developer guide — ATPL PASS

Onboarding guide for engineers extending the Aviation Education Platform after enterprise refactoring (Task 024).

## Prerequisites

- Node.js 22+
- npm 10+
- Optional: Docker / Postgres / Redis when cutting over from JSON stores (see `TECHNICAL_DEBT.md` TD-001 / TD-002)

## Quick start

```bash
npm ci
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm run test
npm run build
```

Demo OTP (non-production only): `123456`. Production hard-fails demo OTP paths.

## Architecture at a glance

| Layer             | Path                   | Rule                                         |
| ----------------- | ---------------------- | -------------------------------------------- |
| Routes / RSC      | `app/`                 | Thin; auth + call services                   |
| Feature UI        | `features/<domain>/`   | Client shells, forms, domain widgets         |
| Shared UI         | `components/`          | Design-system primitives + dashboard widgets |
| Domain logic      | `services/<domain>/`   | Business rules; JSON stores today            |
| Cross-cutting     | `lib/`                 | API envelope, security, utils                |
| Types / constants | `types/`, `constants/` | Shared contracts                             |
| SQL twin          | `database/migrations/` | Target schema (not runtime yet)              |

See `docs/ARCHITECTURE.md` for diagrams and request flow.

## Coding conventions

Follow `docs/CODING_STANDARDS.md`. Highlights:

- Prefer Server Components; mark `"use client"` only when needed
- Web API shape: `{ success, data, error }`
- Mobile/public v1: `{ success, data, error, meta }` via `lib/api/envelope`
- List endpoints: use `parsePagination` / `paginate` from `@/lib/api/envelope`
- Browser mutations: `authFetch`, `csrfHeaders`, or `ensureBrowserCsrf` from `@/features/auth/services/auth-api` — do not re-implement cookie CSRF parsing
- Ops status chips: `OpsStatusBadge` from `@/features/ops/components/ops-status-badge`
- Charts: import from `@/components/dashboard` (lazy Recharts wrappers)

## Security checklist for new endpoints

1. Authenticate (`requireAuth` / `requireApiUser`)
2. Authorize (`requirePermission` / role gates)
3. CSRF on cookie-authenticated mutations (`api-guard` / `requireCsrf`)
4. Validate and bound pagination (`parsePagination` caps `pageSize` at 100)
5. Never log secrets, OTPs, tokens, or PII beyond what audit requires

## Quality gates

CI / local must pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Optional: `npm run uat`, `npm run acceptance`, `npm run test:e2e`.

## Where to put new work

| Change                      | Location                                             |
| --------------------------- | ---------------------------------------------------- |
| New page                    | `app/(role)/.../page.tsx` + feature shell if complex |
| New API                     | `app/api/.../route.ts` → `services/...`              |
| New v1 mobile endpoint      | `app/api/v1/...` + `withApiHandler`                  |
| Shared button/table pattern | Prefer existing `components/ui` / dashboard widgets  |
| Ops / hypercare             | `features/ops`, `services/ops`                       |

## Related docs

- `CODING_STANDARDS.md`, `GIT_WORKFLOW.md`, `MODULE_TEMPLATE.md`
- `API_OVERVIEW.md`, `MOBILE_API.md`, `DATABASE_SCHEMA.md`
- `SECURITY.md`, `DEPLOYMENT.md`, `MAINTENANCE.md`
- `ENTERPRISE_REFACTOR_024.md` — Task 024 change log
- `TECHNICAL_DEBT.md` — open debt register
