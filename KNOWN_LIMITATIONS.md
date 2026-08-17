# Sooqna — Known Limitations

**Status:** Public launch ready in this codebase

Product flows (register, listings, checkout, orders, disputes, admin, support, emails) are implemented. Remaining items are infrastructure, not missing pages.

## Production keys (required for full live)

| Need | Variable | If missing |
|------|----------|------------|
| Card payments | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout cannot charge; mock pay is blocked in production |
| Emails | `RESEND_API_KEY`, verified `EMAIL_FROM_ADDRESS` | Welcome / booking / support mail stay in-app only |
| Canonical URLs | `NEXT_PUBLIC_APP_URL=https://sooqna.site` | Email links may point at localhost |

See [STRIPE_GO_LIVE.md](./STRIPE_GO_LIVE.md).

## Technical limits

| Area | Limitation |
|------|------------|
| **Data storage** | File/`data-store` (Vercel `/tmp`). Accounts also persist via cookie vault + browser proof so login survives logout. High volume needs a durable DB. |
| **Seller payouts** | No Stripe Connect yet — escrow is an internal ledger; payouts are operational from the platform Stripe balance |
| **Images** | Client-side compression / data URLs; no cloud object storage |
| **UAE PASS** | Hidden until `NEXT_PUBLIC_ENABLE_UAE_PASS=true` |
| **Automated tests** | None — validate with `npm run lint`, `npm run build`, and browser QA |
