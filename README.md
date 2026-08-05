# Aviation Education Platform (AEP)

**Eager Pilots for Aviation Consultation and Training**

Production-ready foundation for a scalable aviation education web platform.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| UI | Shadcn UI (New York), Framer Motion, Lucide |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| ORM | Prisma (optional) |
| Auth | Supabase Auth — Email OTP |
| Deploy | Vercel |

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

All secrets live in environment variables. See `.env.example` and `.env.production.example`.

Required for full auth/storage:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

Without Supabase credentials the UI foundation still runs; auth calls return a clear configuration error.

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
