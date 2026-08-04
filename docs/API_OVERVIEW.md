# API overview (operations & security)

Base URL: same origin as the app.

## Versioned mobile / integrations API (v1)

**Primary contract for iOS / Android / React Native and partners.**  
See `docs/MOBILE_API.md` and `GET /api/v1/openapi`.

| Auth | Header |
|------|--------|
| Access JWT | `Authorization: Bearer <token>` |
| API key | `x-api-key: aep_live_…` |
| Web session | Cookie `aep_session` (optional fallback) |

Mutating **web** routes under `/api/*` (non-v1) still expect `x-csrf-token`.  
**v1** mobile routes use Bearer/API keys and do not require CSRF.

## Health

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | public | Status + limited checks |
| GET | `/api/health?ready=1` | public | 200/503 readiness |
| GET | `/api/health?deep=1` | public | Broader checks (still no user PII inventory) |

## Ops (Super Admin)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/ops?view=health` | `audit.read` |
| GET | `/api/ops?view=logs` | `audit.read` |
| GET | `/api/ops?view=logs&format=csv` | `audit.read` |
| GET | `/api/ops?view=backups` | `audit.read` |
| GET | `/api/ops?view=checklist` | `audit.read` |
| POST | `/api/ops` `{action:backup\|test_restore\|restore}` | `system.settings` + CSRF |
| GET | `/api/ops/download?token=` | authenticated owner |
| GET/POST | `/api/support-ops` | ops center (Task 017) |
| GET/POST | `/api/v1/platform/*` | API keys, webhooks, queue, I/O |

## Domain APIs (existing web)

Documented in module docs — cookie + CSRF:

- Auth — `/api/auth/*`
- Courses — `/api/courses/*`
- Classes — `/api/classes/*`
- Learning — `/api/learning/*`
- Quizzes — `/api/quizzes/*`
- Certificates / reports — `/api/certificates/*`, `/api/reports/*`
- Communication — `/api/communication/*`
- Payments — `/api/payments/*`
- Analytics — `/api/analytics/*`
- AI — `/api/ai/*`
- Admin settings / monitoring — `/api/admin/*`

## Database schema

See SQL files in `database/migrations/` (`001` … `016`) and `database/README.md`.
