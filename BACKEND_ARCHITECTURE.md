# Backend Architecture

**Date:** July 5, 2026  
**Stack:** Next.js API Routes + Prisma 5 + PostgreSQL

## Overview

UAE Sales now has a real backend foundation inside the same Next.js monorepo. The frontend remains unchanged — services keep the same function signatures and fall back to mock data when the database is unavailable.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (unchanged UI)                  │
│  app/ pages → services/*.service.ts → types/domain/*        │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
     DATABASE_URL set              DATABASE_URL unset
              │                           │
              ▼                           ▼
   lib/repositories/*              mock/*.mock.ts
              │
              ▼
        lib/mappers/*  →  Frontend domain types
              │
              ▼
         Prisma Client
              │
              ▼
         PostgreSQL
```

## Directory Structure

```
app/api/                  # REST API routes
lib/
  prisma.ts               # Prisma singleton
  auth/                   # Password, session, guards, rate limit
  api/                    # Response helpers, Zod validation
  mappers/                # DB → frontend type mappers
  repositories/           # Data access (shared by API + services)
  data/fallback.ts        # Mock fallback helper
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Demo seed from existing mocks
services/
  api/client.ts           # Browser API client (auth, future client calls)
  auth/auth.service.ts    # Login with API + mock fallback
  categories/             # Wired to repository
  listings/               # Wired to repository
  profile/                # Wired to session + repository
```

## Data Flow Patterns

### Server Components (SSR/SSG)

Pages call `services/*.service.ts` which:

1. Check `isDatabaseConfigured()` (`DATABASE_URL` present)
2. Call `lib/repositories/*` directly (no HTTP round-trip)
3. On failure → fall back to `mock/` data

### Client Auth (Login)

`LoginForm` → `auth.service.ts`:

1. If `NEXT_PUBLIC_USE_API=true` → `POST /api/auth/login` + `POST /api/auth/verify-otp`
2. On failure → existing demo mock flow
3. Session stored in httpOnly cookie + localStorage profile

## Security

| Layer | Implementation |
|-------|----------------|
| Password hashing | bcrypt (12 rounds) |
| Sessions | DB-backed tokens + httpOnly cookie |
| Input validation | Zod schemas in `lib/api/validation.ts` |
| Rate limiting | In-memory per-IP (`lib/auth/rate-limit.ts`) |
| Role checks | `requireAuth()` / `requireRole()` in `lib/auth/guards.ts` |
| API errors | Standardized `ApiHttpError` responses |

## Integrated Services (Phase 1)

| Service | Source | Fallback |
|---------|--------|----------|
| Categories | `getAllCategoriesFromDb` | `mockCategories` |
| Listings | `getAllListings` | `mockListings` |
| Listing detail | `getListingBySlugFromDb` | mock merge |
| Search | `searchListingsFromDb` | in-memory filter |
| Login demo | `/api/auth/*` | `demo-accounts.mock` |
| Dashboard listings | `getUserListingsFromDb` | `mockUserListings` |

## Not Yet Wired to DB

- Wallet UI (API ready, service still inline mock)
- Escrow UI (API ready)
- Chat (API not wired to UI)
- Register flow (API ready, UI still client-only)
- Homepage content (static)
- Local listings (localStorage — unchanged)

## Environment Flags

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Enables Prisma + repository layer |
| `NEXT_PUBLIC_USE_API` | Enables client auth via API routes |
| `NEXT_PUBLIC_API_BASE_URL` | Optional external API base (empty = same-origin) |

## Next Phase Recommendations

1. Add `middleware.ts` for server-side route protection
2. Wire wallet/escrow/chat services to API
3. Replace localStorage listings with `POST /api/listings`
4. Add Prisma migrations in CI
5. Add Redis-backed rate limiting for production
