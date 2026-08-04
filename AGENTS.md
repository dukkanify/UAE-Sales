# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Aviation Education Platform (AEP)** — Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 for **ATPL PASS**.

Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`, `typecheck`); see `README.md`. Notes:

- Dev server: `npm run dev` serves the app on `http://localhost:3000` (Turbopack, hot reload).
- Super Admin auto-seeded from `SUPER_ADMIN_EMAIL` (default `superadmin@eagerpilots.com`)
- Demo OTP: `ENABLE_DEMO_OTP=true`, code `123456`
- Auth works without Supabase via local store `.data/aep-auth.json`
- Platform settings work via `.data/aep-settings.json` (Super Admin → Platform Settings)
- No env vars are required for the mock/local data flow.
- Validate changes via `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `npm run uat` / `npm run test:e2e` when a server is available.

**ATPL PASS** — English LTR — aviation theme (deep blue / sky blue / light gray). Official brand guidelines pending; update via `config/branding.ts` or Super Admin branding settings.
