# Sooqna Web

واجهة ويب عربية RTL لمنصة **سوقنا (Sooqna)** — سوق إماراتي موثوق، مبنية باستخدام Next.js وTypeScript وTailwind CSS.

## Current Status

**Closed Beta Ready** — `v0.1.0-beta`

This release is frozen for closed beta testing. All critical demo flows pass (register, login, dynamic listings, search, chat, wallet). Payment completion, orders, and admin moderation remain placeholders — see [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md).

| Document | Purpose |
|----------|---------|
| [CLOSED_BETA_PLAN.md](./CLOSED_BETA_PLAN.md) | Beta scope, test accounts, success criteria |
| [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) | Placeholder surfaces and technical limits |
| [BETA_FEEDBACK_FORM.md](./BETA_FEEDBACK_FORM.md) | Feedback questions for testers |
| [FINAL_E2E_QA_REPORT.md](./FINAL_E2E_QA_REPORT.md) | Full QA flow matrix |

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

No environment variables are required for the current mock-data flow. `NEXT_PUBLIC_API_BASE_URL` is referenced by `services/apiClient.ts` but is not wired to any page yet.

### Production build

```bash
npm run lint
npm run build
npm run start
```

## Demo Credentials

| Role | Email | Password | OTP | After login |
|------|-------|----------|-----|-------------|
| User | `user@sooqna.demo` | `User@123` | `123456` | `/profile` |
| Business | `company@sooqna.demo` | `Company@123` | `123456` | `/dashboard/listings` |
| Admin | `admin@sooqna.demo` | `Admin@123` | `123456` | `/admin` |

New accounts can also be created via `/register`. Data is stored in the browser (`localStorage`) and does not sync across devices.

## What Works in Beta

- Register and login (demo accounts + new local accounts)
- Add and edit listings with dynamic category fields (cars, real estate, mobiles, electronics, jobs, services)
- Search catalog and locally created listings
- Listing detail pages with data-integrity specs (no fake fields on user listings)
- Chat with sellers (demo and local listings)
- Wallet and escrow overview (mock balances and transactions)
- Profile editing (persists locally)

## Known Placeholders

These routes exist but are **not fully functional** in `v0.1.0-beta`:

| Surface | Route | Status |
|---------|-------|--------|
| Checkout completion | `/checkout` | Coming Soon — shows listing context only |
| Order details | — | Not implemented |
| Admin moderation | `/admin` | Coming Soon — no approve/reject actions |
| Disputes form | `/disputes/new` | Coming Soon |
| Notifications page | — | Mock panel on profile only; no `/notifications` route |
| Mark order delivered | — | Not implemented |

See [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) for the full list.

## Known Limitations

- **No backend** — all catalog data is in-memory mocks; user listings and sessions use `localStorage`
- **No cross-device sync** — data is per-browser only
- **No real payments** — buy-now routes to a placeholder checkout page
- **No automated tests** — validate via `npm run lint`, `npm run build`, and manual browser testing
- **Admin actions are mock** — escrow and wallet show static demo data

## Project Structure

- `app` — Next.js App Router pages
- `features` — domain features (home, listings, auth, chat, wallet…)
- `shared` — UI components, layouts, brand constants
- `services` — data layer and API stubs
- `mock` — demo catalog and account data
- `public/brand` — brand assets (logo, icon, OG image)

## Brand

See `BRAND_IDENTITY_GUIDE.md` and `BRAND_MIGRATION_REPORT.md`.
