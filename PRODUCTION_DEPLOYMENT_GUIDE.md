# Production Deployment Guide — UAE Sales

This guide covers deploying the UAE Sales Next.js application to Vercel with PostgreSQL (Prisma), optional Redis rate limiting, and production security settings.

## Prerequisites

- Vercel account with project access
- PostgreSQL database (Neon, Supabase, Railway, or self-hosted)
- Optional: Upstash Redis for distributed rate limiting
- Domain configured with HTTPS

## Environment Variables

Copy `.env.production.example` and configure in **Vercel → Project Settings → Environment Variables**.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string with `sslmode=require` in production |
| `NEXT_PUBLIC_USE_API` | Yes | Set to `true` to enable API/DB mode and route protection |
| `SESSION_SECRET` | Yes | Min 32 characters; use a cryptographically random 64-char secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical public URL, e.g. `https://uaesales.com` |
| `PAYMENT_PROVIDER` | No | `mock`, `stripe`, or `checkout` (placeholder) |
| `STORAGE_PROVIDER` | No | `local`, `s3`, or `cloudinary` (placeholder) |
| `REDIS_URL` / `UPSTASH_REDIS_REST_URL` | No | Distributed rate limiting across instances |
| `NEXT_PUBLIC_API_BASE_URL` | No | Leave empty when using same-origin `/api` routes |

> **Important:** Map `VERCEL_URL` to `NEXT_PUBLIC_APP_URL` in the Vercel dashboard for preview deployments, or set a fixed production domain.

## Vercel Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `.next` (default) |
| Node.js Version | 20.x or later |

The build script runs `prisma generate && next build`. Prisma client generation is also triggered on `postinstall`.

## Database Workflow

### Initial Setup (first deploy)

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Apply schema (choose one approach)
npm run db:push          # prototyping / first-time setup
# OR
npm run db:migrate       # create migration locally, then deploy

# 3. Seed demo data (optional for staging)
npm run db:seed
```

### Production Migrations

```bash
# Check migration status
npm run db:migrate:status

# Apply pending migrations (CI/CD or manual)
npm run db:migrate:deploy
```

### `db push` vs Migrations

| Approach | When to use |
|----------|-------------|
| `prisma db push` | Local dev, staging prototypes, schema sync without migration history |
| `prisma migrate dev` | Creating versioned migration files during development |
| `prisma migrate deploy` | **Production** — applies committed migration files safely |

**Production recommendation:** Use `migrate deploy` with committed migration files. Avoid `db push` in production unless you accept schema drift risk.

### Backup Strategy

- Enable automated daily backups from your PostgreSQL provider (Neon/Supabase include this).
- Before major migrations, take a manual snapshot.
- Store backup retention ≥ 30 days.
- Test restore procedure quarterly on a staging database.
- Document RPO/RTO targets with your team.

## Prisma on Vercel

1. Set `DATABASE_URL` in Vercel environment variables.
2. Run migrations before or during first deploy:
   - **Option A:** Vercel build hook + external CI runs `npm run db:migrate:deploy`
   - **Option B:** Manual migration via `npx prisma migrate deploy` against production DB
3. Do **not** run `db:seed` in production unless seeding a staging environment.

## Image Domains

`next.config.ts` allows `images.unsplash.com`. Add additional `remotePatterns` for your CDN/S3 bucket before go-live:

```ts
images: {
  remotePatterns: [
    { hostname: "images.unsplash.com", protocol: "https", pathname: "/**" },
    { hostname: "your-cdn.example.com", protocol: "https", pathname: "/**" },
  ],
},
```

## Security Headers

Configured in `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation disabled)
- `Strict-Transport-Security` (HSTS)
- `poweredByHeader: false`

## Route Protection

`middleware.ts` enforces authentication when `NEXT_PUBLIC_USE_API=true` or `NODE_ENV=production`:

- Protected: `/dashboard`, `/profile`, `/listings/new`, `/wallet`, `/orders`, `/chat`, `/notifications`, `/checkout`, `/escrow`, listing edit routes
- Admin-only: `/admin/*` (role `ADMIN` via signed session meta cookie)
- CSRF: Origin/Referer validation on API mutation requests

## Post-Deploy Checklist

- [ ] `DATABASE_URL` connected; `npm run db:migrate:deploy` succeeded
- [ ] `SESSION_SECRET` is unique and ≥ 32 characters
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain
- [ ] `NEXT_PUBLIC_USE_API=true`
- [ ] Login → OTP → protected route access works
- [ ] Admin login (`admin@uaesales.demo`) redirects non-admins from `/admin`
- [ ] `/api/health` returns OK
- [ ] Rate limiting active (optional Redis configured)
- [ ] `robots.txt` and `sitemap.xml` accessible
- [ ] Legal pages load: `/terms`, `/privacy`, `/escrow-policy`, `/refund-policy`, `/contact`, `/safety`
- [ ] Security headers verified (securityheaders.com or browser devtools)
- [ ] Error tracking configured (Sentry or equivalent)
- [ ] Uptime monitoring configured (Better Uptime, Pingdom, etc.)

## Monitoring (see also SECURITY_REVIEW_REPORT.md)

- **Error tracking:** Integrate Sentry (`@sentry/nextjs`) for client and server errors
- **Logging:** Use Vercel Logs + structured JSON logging for API routes
- **API monitoring:** Track `/api/health`, auth endpoints, and order creation latency
- **Uptime:** External ping every 1–5 minutes on `/` and `/api/health`
- **Admin audit:** Admin PATCH routes log actions; extend with dedicated audit table in Phase 2

## Rollback

1. Revert Vercel deployment to previous build in dashboard.
2. If a migration was applied, restore database from snapshot before redeploying.
3. Verify session cookies and auth still work after rollback.

## Demo Credentials (staging only)

| Role | Email | Password | OTP |
|------|-------|----------|-----|
| Admin | `admin@uaesales.demo` | `Admin@123` | `123456` |

Remove or rotate demo accounts before public launch.
