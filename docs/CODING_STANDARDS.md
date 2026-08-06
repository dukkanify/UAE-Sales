# Coding standards — AviatorPass

## Principles

- **SOLID** — single-responsibility services; depend on typed interfaces/constants
- **Clean architecture** — UI (`app/`, `features/`) → services → stores/lib
- **DRY / KISS** — reuse helpers in `lib/`, `utils/`; avoid speculative abstraction
- **Modular services** — one domain per `services/<domain>/`
- **Clear naming** — verbs for functions (`listCourses`), nouns for types

## Stack conventions

| Layer                | Location                                 |
| -------------------- | ---------------------------------------- |
| Routes               | `app/**/page.tsx`, `app/api/**/route.ts` |
| Features/UI          | `features/<domain>/`                     |
| Domain logic         | `services/<domain>/`                     |
| Shared libs          | `lib/`, `utils/`, `constants/`, `types/` |
| Versioned mobile API | `app/api/v1/**` + `lib/api/**`           |

## TypeScript

- Strict mode on (`tsconfig.json`)
- Prefer explicit domain types under `types/`
- API responses: `{ success, data, error }` (web) or v1 `{ success, data, error, meta }`

## React

- Server Components by default; `"use client"` only when needed
- Prefer existing design-system / Radix primitives
- Do not add `useMemo`/`useCallback` by default
- Icon-only buttons need `aria-label`
- Lazy-load heavy chart libraries via `@/components/dashboard` exports

## Shared client helpers

- CSRF / authenticated fetch: `@/features/auth/services/auth-api`
- Ops status chips: `@/features/ops/components/ops-status-badge`
- List query parsing (server): `parsePagination` in `@/lib/api/envelope`

## Git

- Feature branches: `cursor/<descriptive-name>-0987`
- PRs require CI green (lint, typecheck, tests, build)
- Conventional commit style: `feat|fix|chore|docs|test(scope): summary`
- Semantic version docs: `docs/RELEASE_NOTES.md`

See also: `docs/GIT_WORKFLOW.md`, `docs/MODULE_TEMPLATE.md`.
