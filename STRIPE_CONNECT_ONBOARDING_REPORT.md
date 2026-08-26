# Stripe Connect Automatic Onboarding — Sooqna

## Summary

`/admin/stripe` now starts **Stripe Connect Express** onboarding automatically for authorized admins (payments permission). Sooqna never collects bank, KYC, or identity documents — Stripe’s hosted onboarding does.

## Flow

1. Admin opens `/admin/stripe`
2. Server checks Connect status for the authenticated admin (`ownerUserId`)
3. If no `stripeAccountId`:
   - Create Express account server-side (idempotent per user)
   - Persist Connect fields in Postgres (or local `.data` fallback)
   - Create a fresh Account Link
   - Redirect to Stripe
4. If `stripeAccountId` already exists: **reuse** it — never create a duplicate
5. If requirements are due: create a **new** Account Link and redirect
6. Return URL: `/admin/stripe/return` → retrieve account from Stripe → update DB → show status
7. Refresh URL: `/admin/stripe/refresh` → new Account Link → redirect (expired links are never reused)

## Statuses (server-verified)

| Code | Arabic label |
|------|----------------|
| `NOT_CONNECTED` | غير متصل |
| `SETUP_REQUIRED` | يلزم الإعداد |
| `UNDER_VERIFICATION` | قيد التحقق |
| `REQUIREMENTS_DUE` | معلومات إضافية مطلوبة |
| `ACTIVE` | مفعّل |
| `RESTRICTED` | مقيد |

**Active is never inferred from the redirect alone.** Status comes from Stripe `charges_enabled`, `payouts_enabled`, `details_submitted`, and `requirements.*`.

Auto-redirect message (for `NOT_CONNECTED` / `REQUIREMENTS_DUE`):

> جاري تحويلك إلى Stripe لإكمال إعداد حساب الدفع...

Fallback CTA: **متابعة إعداد Stripe**

## Database fields

Table `stripe_connect_accounts` (Postgres) / `stripe-connect-accounts.json` fallback:

- `stripeAccountId`
- `stripeOnboardingStatus`
- `stripeChargesEnabled`
- `stripePayoutsEnabled`
- `stripeDetailsSubmitted`
- `stripeRequirementsStatus`
- `stripeConnectedAt`
- `stripeUpdatedAt`
- Linked via `ownerUserId` (admin/company entity)

No bank account numbers or KYC documents are stored.

## APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/stripe/connect` | Status (+ live sync when platform keys exist) |
| POST | `/api/admin/stripe/connect` `{ action: "onboard" }` | Ensure account + Account Link URL |
| POST | `/api/admin/stripe/connect` `{ action: "refresh-status" }` | Pull status from Stripe |
| POST | `/api/admin/stripe/connect` `{ action: "dashboard" }` | Express login link when appropriate |

Auth: `requireAdminPermission("payments")`. Ownership is always the session user — client cannot supply `stripeAccountId`.

## Webhooks

`/api/webhooks/stripe` now handles (idempotent via existing event claim):

- `account.updated`
- `account.external_account.created` / `updated`
- `capability.updated`

On status change: DB update + in-app notification + optional email  
(“تم تفعيل حساب Stripe الخاص بك بنجاح.” / “يحتاج Stripe إلى معلومات إضافية…”).

## Security

- Account + Account Link creation: **server-side only**
- `STRIPE_SECRET_KEY` never exposed to the client
- Platform keys remain env-managed or admin-encrypted store (existing flow)
- Webhook signature verification unchanged

## Production env (do not commit values)

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://sooqna.site`

Webhook endpoint should include Connect account events in addition to Checkout events.

## Files

- `services/payments/stripe-connect-store.ts`
- `services/payments/stripe-connect.service.ts`
- `app/api/admin/stripe/connect/route.ts`
- `features/admin/components/AdminStripeConnectPanel.tsx`
- `app/admin/stripe/return/page.tsx`
- `app/admin/stripe/refresh/page.tsx`
- Webhook + notification/email type extensions

## QA checklist

1. Admin with no Connect account → `/admin/stripe` auto-redirects to Stripe (when platform keys exist)
2. Complete onboarding → `/admin/stripe/return` shows server-verified status
3. Abandon onboarding → Continue Setup works later
4. Expired Account Link → `/admin/stripe/refresh` issues a new link
5. Existing `stripeAccountId` → no second Connect account
6. Requirements due → `REQUIREMENTS_DUE` + Continue Setup
7. `account.updated` webhook → Sooqna status updates

## Prerequisite

Connect onboarding requires a valid platform **Secret Key** (env or admin paste). Without it, the Connect panel prompts to configure platform keys first and does not redirect.
