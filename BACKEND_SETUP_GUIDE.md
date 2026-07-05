# Backend Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or cloud)
- npm

## Quick Start (Mock Mode — No Database)

The app works without any setup (existing behavior):

```bash
npm install
npm run dev
```

Open http://localhost:3000 — all data comes from `mock/`.

## Full Backend Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uae_sales?schema=public"
NEXT_PUBLIC_USE_API="true"
SESSION_SECRET="your-random-secret-here"
```

### 3. Create database

```bash
createdb uae_sales
# or via psql:
# CREATE DATABASE uae_sales;
```

### 4. Push schema to database

```bash
npm run db:push
```

For production, use migrations instead:

```bash
npm run db:migrate
```

### 5. Seed demo data

```bash
npm run db:seed
```

This creates:
- 3 demo accounts with hashed passwords
- 13 categories
- ~45 listings with images
- Sellers, wallets, transactions

### 6. Start development server

```bash
npm run dev
```

### 7. Verify

| Check | How |
|-------|-----|
| Health | `curl http://localhost:3000/api/health` |
| Categories | `curl http://localhost:3000/api/categories` |
| Listings | `curl http://localhost:3000/api/listings` |
| Login | Use demo credentials on `/login` with OTP `123456` |

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:migrate` | Create/run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio GUI |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | For DB mode | — | PostgreSQL connection string |
| `NEXT_PUBLIC_USE_API` | No | false | Enable client auth via API |
| `NEXT_PUBLIC_API_BASE_URL` | No | "" | External API URL (empty = same-origin) |
| `SESSION_SECRET` | Production | — | Session signing secret |

## How Frontend Connects

### Without DATABASE_URL

- Services use `mock/` data directly
- Login uses `demo-accounts.mock.ts`
- No API calls

### With DATABASE_URL only

- Server pages (home, search, listings) read from PostgreSQL via repositories
- Client login still uses mock unless `NEXT_PUBLIC_USE_API=true`

### With DATABASE_URL + NEXT_PUBLIC_USE_API=true

- Full stack: SSR from DB + client auth via API
- Automatic mock fallback if DB unreachable

## Docker PostgreSQL (optional)

```bash
docker run --name uae-sales-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=uae_sales \
  -p 5432:5432 \
  -d postgres:16
```

Then set:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uae_sales?schema=public"
```

## Troubleshooting

### Build fails with Prisma error

```bash
npm run db:generate
```

### Seed fails — duplicate data

```bash
npm run db:push -- --force-reset
npm run db:seed
```

### Login works in mock but not API mode

1. Confirm `NEXT_PUBLIC_USE_API=true`
2. Confirm `DATABASE_URL` is set
3. Run `npm run db:seed`
4. Restart dev server after env changes

### Pages show mock data despite DB

- Check `DATABASE_URL` is loaded (restart dev server)
- Check seed completed without errors
- Server logs may show `[data:*] falling back to mock` on DB errors

## Production Checklist

- [ ] Set strong `SESSION_SECRET`
- [ ] Use `prisma migrate deploy` in CI/CD
- [ ] Enable SSL on PostgreSQL connection
- [ ] Replace in-memory rate limit with Redis
- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXT_PUBLIC_USE_API=true`

## Related Docs

- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [TESTING_GUIDE.md](./TESTING_GUIDE.md)
