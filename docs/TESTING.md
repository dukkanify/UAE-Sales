# Testing strategy — Task 019

Automated quality infrastructure for AviatorPass. **No new business features.**

## Commands

| Script                            | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `npm run test`                    | Unit + integration (Vitest)          |
| `npm run test:watch`              | Vitest watch mode                    |
| `npm run test:coverage`           | Coverage report                      |
| `npm run test:bench`              | Micro-benchmarks                     |
| `npm run test:e2e`                | Playwright E2E (Chromium)            |
| `npm run test:e2e:install`        | Install Chromium for Playwright      |
| `npm run acceptance`              | HTTP smoke (running server)          |
| `npm run uat`                     | Multi-role HTTP UAT (running server) |
| `npm run format` / `format:check` | Prettier                             |
| `npm run lint` / `typecheck`      | Static analysis                      |

## Layers

### Unit (`tests/unit`)

Crypto, permissions, validators, sanitize/RBAC, API envelope pagination, rate limit, `cn`, benchmarks.

### Integration (`tests/integration`)

- Auth store ↔ OTP verify ↔ permissions
- Courses catalog ↔ published filter
- Certificates ↔ public verification
- Payments catalog ↔ instructor wallet
- API OpenAPI + envelope contracts
- SQL migration integrity

### API / auth / permission

Covered by unit + integration + `npm run uat` (Bearer v1, CSRF, escalation).

### E2E (`e2e/`)

Playwright journeys: health, login page, certificate verify, student OTP→Bearer `/api/v1/me`, unauthenticated platform gate.

Role journeys (student enroll/quiz/cert, instructor classes, admin publish, super-admin health) are fully exercised by **`npm run uat`** and partially by E2E; expand Playwright scenarios as UI selectors stabilize.

### Database

Migration file assertions (PKs, tables for auth + API platform). Runtime JSON stores validated via service integration tests.

## CI

`.github/workflows/ci.yml`:

1. format check → lint → typecheck → vitest → build
2. Playwright E2E (build + Chromium)
3. PR branch naming guard

## Local pre-commit / pre-push

- Husky + lint-staged (Prettier + ESLint on staged files)
- Pre-push: typecheck + vitest

## Coverage targets

Aim for high coverage on `lib/`, `utils/`, and pure service helpers. Domain stores and UI pages grow coverage incrementally — see `docs/TECHNICAL_DEBT.md`.
