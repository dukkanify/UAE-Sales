# Aviation Education Platform (AEP)

**ATPL PASS — Professional ATPL training**

Next.js App Router platform with role-based dashboards, LMS, live classes, payments, analytics, AI assistant, mobile API, and production operations.

**Project status:** **Version 1.0 GA** — Phase 2 (v2.0) enterprise expansion roadmap under `docs/PHASE2_ENTERPRISE_ROADMAP.md`.

## Tech stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| Frontend       | Next.js 15, React 19, TypeScript, Tailwind CSS 4       |
| UI             | Shadcn UI (New York), Framer Motion, Lucide            |
| Auth (current) | Email OTP + secure session cookies (RBAC)              |
| Data (current) | Local JSON stores under `.data/`                       |
| Data (target)  | Supabase PostgreSQL + Storage (`database/migrations/`) |
| Deploy         | Vercel + GitHub Actions CI                             |

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo OTP `123456` (**must be disabled in production**).

## Environment

| File                      | Use                                   |
| ------------------------- | ------------------------------------- |
| `.env.example`            | Local / development template          |
| `.env.production.example` | Production / Vercel secrets checklist |

Never commit real secrets. Use `docs/CREDENTIALS_REGISTER.md` (external vault).

## Validation & build

```bash
npm run lint && npm run typecheck && npm run test && npm run build
npm run backup
npm run acceptance   # requires running server
npm run uat
npm run test:e2e
```

| Command             | Description             |
| ------------------- | ----------------------- |
| `npm run dev`       | Development server      |
| `npm run build`     | Production build        |
| `npm run start`     | Start production server |
| `npm run lint`      | ESLint                  |
| `npm run typecheck` | TypeScript check        |

## Documentation (Version 1.0 GA)

| Doc                                | Purpose                |
| ---------------------------------- | ---------------------- |
| `docs/DOCUMENTATION_INDEX.md`      | Master index           |
| `docs/FINAL_RELEASE_025.md`        | GA release package     |
| `docs/CLIENT_ACCEPTANCE_025.md`    | Formal v1.0 acceptance |
| `docs/PRODUCTION_READINESS_025.md` | Readiness verification |
| `docs/OWNERSHIP_TRANSFER_025.md`   | Ownership transfer     |
| `docs/WARRANTY_ACTIVATION_025.md`  | Warranty activation    |
| `docs/SUCCESS_METRICS_90D.md`      | First-90-day KPIs      |
| `docs/V2_BACKLOG.md`               | Version 2.0 backlog    |
| `docs/PROJECT_CLOSURE_REPORT.md`   | Closure report         |
| `docs/HANDOVER.md`                 | Client handover        |
| `docs/SOURCE_CODE_HANDOVER.md`     | Repository delivery    |
| `docs/TRAINING.md`                 | Admin training         |

Also: `DEPLOYMENT.md`, `SECURITY.md`, `BACKUP_DISASTER_RECOVERY.md`, `WARRANTY_SUPPORT.md`, `PHASE2_ENTERPRISE_ROADMAP.md`, `ROADMAP_V2.md`, `DEVELOPER_GUIDE.md`.

## Project structure

```
app/              App Router pages, layouts, API routes
apps/mobile/      Phase 2 React Native bootstrap (see README)
components/       UI primitives + layout shells
features/         Domain UI modules
services/         Domain logic + JSON / integration services
hooks/            Shared React hooks
providers/        App-wide providers
types/            Shared TypeScript types
utils/            Validation, sanitization, formatting
constants/        Routes, roles, navigation, permissions
config/           Env, site, theme
styles/           Global CSS + design tokens
lib/              Security, API helpers, Supabase clients
middleware/       Helper modules
database/         SQL migrations + Prisma schema
docs/             Full documentation package
scripts/          Backup, UAT, acceptance harnesses
e2e/ tests/       Playwright + Vitest
public/           Static assets
assets/           Design assets
```

## Database

1. Create a Supabase project (production target).
2. Apply `database/migrations/002` → `017` in order (see `database/README.md`).
3. Create storage bucket `aep-uploads`.
4. Until cutover, local JSON under `.data/` powers demos (not multi-instance safe).

## Support

Vendor: dukkanify@gmail.com · Process: `docs/WARRANTY_SUPPORT.md` · Ops: `/super-admin/ops-center`
