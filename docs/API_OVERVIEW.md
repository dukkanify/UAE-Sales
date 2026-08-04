# API overview (operations & security)

Base URL: same origin as the app.

All authenticated routes expect session cookie. Mutating routes expect `x-csrf-token`.

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

## Domain APIs (existing)

Documented in module docs:

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

See SQL files in `database/migrations/` (`001` … `013`) and `database/README.md`.
