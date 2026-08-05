# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Aviation Education Platform (AEP)** — Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 for **Eager Pilots for Aviation Consultation and Training**.

### Auth & data

- Local auth store (`.data/aep-auth.json`) when Supabase is unset — OTP login works with `ENABLE_DEMO_OTP=true` / `DEMO_OTP_CODE=123456`
- Super Admin auto-seeded from `SUPER_ADMIN_EMAIL` (default `superadmin@eagerpilots.com`)
- Role dashboards: `/student`, `/instructor`, `/admin`, `/super-admin`
- SQL migrations under `database/migrations/` (002 + 003 for full RBAC)
- Permission checks via `constants/permissions.ts` + `services/auth/guards.ts`

### Commands

- `npm run dev` → `http://localhost:3000`
- Validate with `npm run lint`, `npm run typecheck`, `npm run build`

### Brand

**Eager Pilots** — English LTR — aviation theme (deep blue / sky blue / light gray).
