# Aviation Education Platform (AEP)

**ATPL PASS — Professional ATPL training**

Next.js App Router platform with role-based dashboards, LMS, live classes, payments, analytics, and AI assistant. Production readiness guides live under `docs/PRODUCTION.md`.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| UI | Shadcn UI (New York), Framer Motion, Lucide |
| Auth (current) | Email OTP + secure session cookies (RBAC) |
| Data (current) | Local JSON stores under `.data/` |
| Data (target) | Supabase PostgreSQL + Storage (`database/migrations/`) |
| Deploy | Vercel + GitHub Actions CI |

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo OTP `123456` (disabled in production).

## Environment

See `.env.example` and `.env.production.example`. Set a strong `AUTH_SECRET` before production.

## Production ops

```bash
npm run lint && npm run typecheck && npm run build
npm run backup
npm run acceptance   # requires running server
```

Docs: `docs/PRODUCTION.md`, `docs/PRODUCTION_CHECKLIST.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`, `docs/BACKUP_DISASTER_RECOVERY.md`.

## Project structure

```
app/              App Router pages & layouts
components/       UI primitives + layout shells
features/         Feature modules (auth foundation)
services/         Auth, storage, Supabase service layer
hooks/            Shared React hooks
providers/        App-wide providers
types/            Shared TypeScript types
utils/            Validation, sanitization, RBAC, formatting
constants/        Routes, roles, navigation
config/           Env, site, theme
styles/           Global CSS + design tokens
lib/              Utilities + Supabase clients
middleware/       Route protection helpers
database/         SQL migrations + Prisma schema
public/           Static assets
assets/           Design assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Database

1. Create a Supabase project
2. Run `database/migrations/001_initial_schema.sql` in the SQL editor
3. Create storage bucket `aep-uploads`
4. (Optional) `npx prisma generate --schema=database/prisma/schema.prisma`

## Scope of this foundation

This milestone delivers architecture only — no business features yet:

- Theme & design system
- Layout (header, footer, sidebar, breadcrumb)
- System pages (404, 500, maintenance, unauthorized)
- Full reusable UI kit
- Auth structure (Email OTP)
- Middleware & RBAC helpers
- Database schema + RLS
- SEO metadata, robots, sitemap

## License

UNLICENSED — proprietary.
