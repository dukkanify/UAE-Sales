# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Aviation Education Platform (AEP)** — a Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 frontend for **Eager Pilots for Aviation Consultation and Training**.

Backend services are provided by **Supabase** (Auth, PostgreSQL + RLS, Storage, Realtime). Optional Prisma schema lives under `database/prisma/`.

### Commands

Standard scripts in `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`.

- Dev server: `npm run dev` → `http://localhost:3000`
- No automated tests yet — validate with `npm run lint`, `npm run build`, and manual browser testing.

### Environment

Copy `.env.example` → `.env.local`. Leaving Supabase vars unset is fine for UI-only foundation work; auth/storage APIs will return configuration errors until wired.

### Brand

User-facing name: **Eager Pilots** / legal: Eager Pilots for Aviation Consultation and Training. English only, LTR. Aviation theme (deep blue primary, sky blue accent, light gray background).

### Architecture notes

- Route groups: `(marketing)`, `(auth)`, `(dashboard)`, `(system)`
- Protected routes via `middleware.ts` + `constants/routes.ts`
- Roles: `student`, `instructor`, `admin`, `super_admin`
- Do not hardcode secrets; use `config/env.ts`
