# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 frontend app (`uae-sales-web`), an Arabic RTL classifieds marketplace. There is no backend, database, or Docker stack in the repo; all data comes from in-memory mocks/stubs under `services/`.

Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`); see `README.md`. Notes:

- Dev server: `npm run dev` serves the homepage on `http://localhost:3000` (Turbopack, hot reload).
- Only the `/` route exists today. Nav links point to routes like `/login`, `/search`, `/wallet` that are not implemented yet and will 404 — this is expected, not a bug.
- No env vars are needed for the current mock-data flow. `NEXT_PUBLIC_API_BASE_URL` is referenced by `services/apiClient.ts`, but `apiClient` is not yet wired to any page; leaving it unset is fine.
- No automated tests are configured. Validate changes via `npm run lint`, `npm run build`, and manual browser testing.
