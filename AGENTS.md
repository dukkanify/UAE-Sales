# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 frontend app (`sooqna-web`), an Arabic RTL marketplace for **Sooqna (سوقنا)**. There is no backend, database, or Docker stack in the repo; all data comes from in-memory mocks/stubs under `services/`.

Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`); see `README.md`. Notes:

- Dev server: `npm run dev` serves the app on `http://localhost:3000` (Turbopack, hot reload).
- Implemented routes include `/`, `/categories`, `/categories/[slug]`, `/search`, `/listings/[slug]`, `/login`, `/register`, `/profile`, and `/dashboard/listings`. Some forward-looking nav links such as `/wallet`, `/escrow`, and `/listings/new` are still placeholders.
- No env vars are needed for the current mock-data flow. `NEXT_PUBLIC_API_BASE_URL` defaults to `https://api.sooqna.ae/v1` when wired; leaving it unset is fine for mocks.
- No automated tests are configured. Validate changes via `npm run lint`, `npm run build`, and manual browser testing.
- Brand: use `Sooqna` / `سوقنا` in all user-facing copy. Legacy `uae-sales-*` keys are migrated automatically — see `BRAND_MIGRATION_REPORT.md`.
