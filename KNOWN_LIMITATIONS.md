# Sooqna — Known Limitations

**Status:** Public launch ready in this codebase

Product flows (register, listings, checkout, orders, disputes, admin, support, emails) are implemented. Remaining items are infrastructure, not missing pages.

## Production keys (required for full live)

| Need | Variable | If missing |
|------|----------|------------|
| Card payments | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout cannot charge; mock pay is blocked in production |
| Emails | `RESEND_API_KEY`, verified `EMAIL_FROM_ADDRESS=no-reply@sooqna.site` | In-app notifications still work; Resend mail is logged as failed |
| Canonical URLs | `NEXT_PUBLIC_APP_URL=https://sooqna.site` | Email links may point at localhost |

See [STRIPE_GO_LIVE.md](./STRIPE_GO_LIVE.md).

## Technical limits

| Area | Limitation |
|------|------------|
| **Data storage** | Listings/orders still use file `data-store` (Vercel `/tmp`). **User accounts** use Postgres (`DATABASE_URL`) in production, or `.data/sooqna-auth-users.json` locally. Cookie/localStorage proofs are not the source of truth. |
| **Seller payouts** | No Stripe Connect yet — escrow is an internal ledger; payouts are operational from the platform Stripe balance |
| **Images** | Client-side compression / data URLs; no cloud object storage |
| **UAE PASS** | Hidden until `NEXT_PUBLIC_ENABLE_UAE_PASS=true` |
| **Automated tests** | None — validate with `npm run lint`, `npm run build`, and browser QA |
