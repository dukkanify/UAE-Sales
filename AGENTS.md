# AGENTS.md

## Cursor Cloud specific instructions

This workspace tip is **Aviation Education Platform (AEP)** — Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 for **AviatorPass**.

### Product isolation (mandatory)

- Treat this tree as **AviatorPass-only**. Package name must be `aviatorpass`.
- Do **not** merge AviatorPass changes into marketplace `main`, and do **not** run marketplace apps from this working tree.
- Prefer a separate git worktree / Cloud Agent environment for other products. After any accidental product branch checkout: `rm -rf node_modules .next *.tsbuildinfo` then `npm ci` for the active product.
- Data files are `.data/aep-*.json` only. Deploy secrets must be AviatorPass-specific (`VERCEL_AVIATORPASS_DEPLOY_HOOK`).
- See `PROJECT_SEPARATION_REPORT.md` and `docs/GIT_WORKFLOW.md`.

Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`, `typecheck`); see `README.md`. Notes:

- Dev server: `npm run dev` serves the app on `http://localhost:3000` (Turbopack, hot reload).
- Super Admin auto-seeded from `SUPER_ADMIN_EMAIL` (default `superadmin@eagerpilots.com`)
- Demo OTP: `ENABLE_DEMO_OTP=true`, code `123456`
- Permanent demo accounts (Super Admin, Student, Instructor, CGI): see `DEMO_ACCOUNTS.md` — temporary password `DemoPass123!`; reset via `POST /api/admin/demo/reset` or `npm run demo:seed`
- Auth works without Supabase via local store `.data/aep-auth.json`
- Platform settings work via `.data/aep-settings.json` (Super Admin → Platform Settings)
- No env vars are required for the mock/local data flow.
- Validate changes via `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `npm run uat` / `npm run test:e2e` when a server is available.
- Closure / handover docs: `docs/DOCUMENTATION_INDEX.md`, `docs/PROJECT_CLOSURE_REPORT.md`.

### Brand (official guidelines)

**AviatorPass** — English LTR — tagline **YOUR AVIATION JOURNEY STARTS HERE**.

| Token                       | Hex       | Role              |
| --------------------------- | --------- | ----------------- |
| Aviator Blue                | `#143048` | Primary           |
| Aviator Gold                | `#CCA04C` | Accent / PASS     |
| Academic Grey               | `#7C7B80` | Secondary / muted |
| Cloud / Sky Mist / Navy Ink | support   | Surfaces (theme)  |

Gold gradient (print/digital accents): `#9E712E → #CCA04C → #F6C36C`.

Typography: **Stimulatio Flat** (headings; Exo 2 web substitute until licensed files land) + **IBM Plex Sans** (body). Logos under `public/brand/`; guidelines PDF at `public/brand/source/AVIATORPASS_Brand_Guidelines.pdf`. Update via `config/branding.ts` or Super Admin branding settings.
