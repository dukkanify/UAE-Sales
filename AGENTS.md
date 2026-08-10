# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Aviation Education Platform (AEP)** — Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 for **AviatorPass**.

Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`, `typecheck`); see `README.md`. Notes:

- Dev server: `npm run dev` serves the app on `http://localhost:3000` (Turbopack, hot reload).
- Super Admin auto-seeded from `SUPER_ADMIN_EMAIL` (default `superadmin@eagerpilots.com`)
- Demo OTP: `ENABLE_DEMO_OTP=true`, code `123456`
- Auth works without Supabase via local store `.data/aep-auth.json`
- Platform settings work via `.data/aep-settings.json` (Super Admin → Platform Settings)
- No env vars are required for the mock/local data flow.
- Validate changes via `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `npm run uat` / `npm run test:e2e` when a server is available.
- Closure / handover docs: `docs/DOCUMENTATION_INDEX.md`, `docs/PROJECT_CLOSURE_REPORT.md`.

### Brand (official guidelines)

**AviatorPass** — English LTR — tagline **YOUR AVIATION JOURNEY STARTS HERE**.

| Token           | Hex       | Role              |
| --------------- | --------- | ----------------- |
| Aero Blue       | `#2E7DAA` | Primary           |
| Altitude Orange | `#DD9B30` | Accent / PASS     |
| Academic Grey   | `#7C7B80` | Secondary / muted |

Typography: **Stimulatio Flat** (headings; Space Grotesk web substitute until licensed files land) + **IBM Plex Sans** (body). Logos under `public/brand/`; guidelines PDF at `public/brand/source/AVIATORPASS_Brand_Guidelines.pdf`. Update via `config/branding.ts` or Super Admin branding settings.
