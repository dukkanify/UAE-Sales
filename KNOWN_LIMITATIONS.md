# Sooqna — Known Limitations

**Status:** Public launch ready in this codebase for core flows; full spreadsheet remediation is **not** complete.

Product flows (register, listings, checkout, orders, disputes, admin, support, emails) are implemented. Remaining items are infrastructure, ops secrets, and unfinished P1/P2.

## Production keys (required for full live)

| Need | Variable | If missing |
|------|----------|------------|
| Card payments | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout cannot charge; mock pay is blocked in production |
| Emails | `RESEND_API_KEY`, verified `EMAIL_FROM_ADDRESS=no-reply@sooqna.site` | In-app notifications still work; Resend mail is logged as failed |
| Canonical URLs | `NEXT_PUBLIC_APP_URL=https://sooqna.site` | Email links may point at localhost |
| Session HMAC | `SESSION_SECRET` (or `NEXTAUTH_SECRET`) | Weak/default signing if unset |
| Dispute cron | `CRON_SECRET` + Vercel Cron (`vercel.json` hourly → `/api/cron/dispute-reminders`) | Without secret Production returns `CRON_SECRET_REQUIRED` (fail-closed) |

See [STRIPE_GO_LIVE.md](./STRIPE_GO_LIVE.md).

## Technical limits

| Area | Limitation |
|------|------------|
| **Data storage** | **Users, OTP, notifications, listings, featured payments, orders, disputes, escrow evidence, jobs/viewings/quotes, webhook claims, dispute reminders** prefer Postgres (`DATABASE_URL`). Chat/favorites/some admin JSON may still use file `data-store`. |
| **Sessions** | Signed HMAC session cookies (`SESSION_SECRET` / `NEXTAUTH_SECRET`). Client cannot forge profiles via `/api/auth/session`. |
| **Seller payouts** | Stripe Connect onboarding available from `/admin/stripe`; seller marketplace payouts still operational pending full Connect payout wiring |
| **Escrow evidence** | Seller can upload photos/video for مضمون verification; durable evidence records in Postgres. Object storage (S3) not yet wired. |
| **Images** | Client-side compression / data URLs; no cloud object storage |
| **RBAC** | Module-level flags (not full View/Add/Edit/Delete/Approve/Export matrix). Super Admin empty permissions; Sub Admin assigned modules; Save Permissions required. |
| **UAE PASS** | Hidden until `NEXT_PUBLIC_ENABLE_UAE_PASS=true` |
| **Automated tests** | None — validate with `npm run lint`, `npm run build`, and browser QA |
