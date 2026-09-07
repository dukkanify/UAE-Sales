# Sooqna Web

واجهة ويب عربية RTL لمنصة **سوقنا (Sooqna)** — سوق إماراتي موثوق، مبنية باستخدام Next.js وTypeScript وTailwind CSS.

## Current Status

**Live marketplace** on [sooqna.site](https://sooqna.site) — `v0.1.0-beta` going public.

Customer flows that are live in this codebase:

- Register, login (including after logout), profile, and in-app notifications
- Welcome email, listing/order emails, and viewing/job/quote confirmation emails (needs `RESEND_API_KEY`)
- Browse, search, listing details, add/edit listings
- Checkout + Stripe escrow, orders, disputes, wallet (real zeros until payments exist)
- Admin cockpit, support form, chat

Production env checklist: `STRIPE_*` per [STRIPE_GO_LIVE.md](./STRIPE_GO_LIVE.md), `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `NEXT_PUBLIC_APP_URL=https://sooqna.site`.

| Document | Purpose |
|----------|---------|
| [STRIPE_GO_LIVE.md](./STRIPE_GO_LIVE.md) | Stripe keys and webhook |
| [EMAIL_NOTIFICATIONS_PRODUCTION_REPORT.md](./EMAIL_NOTIFICATIONS_PRODUCTION_REPORT.md) | In-app + email channel |

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Copy `.env.example` for Stripe/email keys. Mocks still work without keys; production mail and card payments need Resend + Stripe.

### Production build

```bash
npm run lint
npm run build
npm run start
```

## Accounts

Create accounts via `/register`. There are no public demo logins. Promote the first admin from `/admin/users` after an operator account exists.

## What Works Live

- Register and login (accounts persist across logout on the same browser)
- Welcome email + in-app welcome notification
- Add and edit listings with dynamic category fields
- Search catalog and user listings
- Viewing bookings, job applications, and quote requests with confirmation email
- Stripe checkout, orders, escrow, disputes, wallet ledger
- Admin moderation and support contact form

## Known Limitations

- **Durable DB not on `main` yet** — orders/wallets use file/`data-store` (fine for beta; use durable storage before high volume)
- **Stripe ready for activation** — set live keys + webhook per `STRIPE_GO_LIVE.md`; mock checkout is blocked in production
- **No Stripe Connect payouts yet** — escrow is an internal ledger; seller payouts are operational from the platform Stripe balance
- **No automated tests** — validate via `npm run lint`, `npm run build`, and manual browser testing

See [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) and [STRIPE_GO_LIVE.md](./STRIPE_GO_LIVE.md).

## Project Structure

- `app` — Next.js App Router pages
- `features` — domain features (home, listings, auth, chat, wallet…)
- `shared` — UI components, layouts, brand constants
- `services` — data layer and API stubs
- `mock` — demo catalog and account data
- `public/brand` — brand assets (logo, icon, OG image)

## Brand

See `BRAND_IDENTITY_GUIDE.md` and `BRAND_MIGRATION_REPORT.md`.
