# Stripe Connect One-Click Onboarding — Sooqna

**Date (UTC):** 2026-08-29  
**Production host:** https://sooqna.site  
**Branch:** `cursor/stripe-connect-onboarding-37ba`

## Overall status

**NOT COMPLETE on Production** — platform LIVE keys are still unset (`stripeConfigured=false`). Code UX for one-click Connect (no browser key paste) is implemented and ready once Vercel Production keys are configured.

## What changed

### Removed from normal `/admin/stripe` UX
- Editable Secret Key / Publishable Key / Webhook Secret fields
- “حفظ وتفعيل” paste flow
- Step-by-step paste instructions

### Platform configuration (Vercel only)
Required Production env vars:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://sooqna.site`

`PUT /api/admin/stripe` now returns **403 `USE_VERCEL_ENV`** — secrets must not be pasted from the browser.

If platform config is missing, UI shows only:

> إعداد Stripe الرئيسي غير مكتمل. يرجى إكمال إعدادات المنصة.

### One-click Connect
When platform is configured and no connected account exists:

1. Admin opens `/admin/stripe`
2. Message: «جاري تحويلك إلى Stripe لإكمال ربط حساب الدفع...» (~1.5s)
3. Server creates/reuses Express account (`ensureConnectAccount` — no duplicates)
4. Fresh Account Link → redirect to Stripe hosted onboarding
5. Fallback CTA: **متابعة إلى Stripe**

Stripe collects KYC/bank/company data. Sooqna never does.

### Return / refresh
| URL | Behavior |
|-----|----------|
| `/admin/stripe/return` | Server `refresh-status` → retrieve account from Stripe API → update DB |
| `/admin/stripe/refresh` | New Account Link (never reuse expired URLs) → redirect |

Status is **never** trusted from query params.

### Smart statuses (A–F)

| Case | Status | UI |
|------|--------|-----|
| A | Platform missing | Config warning only |
| B | `NOT_CONNECTED` | Auto-redirect + **ربط Stripe** |
| C | `SETUP_REQUIRED` | **إكمال إعداد Stripe** |
| D | `UNDER_VERIFICATION` | **قيد التحقق من Stripe** |
| E | `REQUIREMENTS_DUE` | **معلومات إضافية مطلوبة** + **إكمال الإعداد** |
| F | `ACTIVE` | **Stripe متصل ومفعّل** + Charges/Payouts/Verification |
| — | `RESTRICTED` | Reason + **إكمال الإعداد** |

Actions: ربط Stripe · إكمال الإعداد · تحديث الحالة · فتح Stripe Dashboard

### Persistence (`stripe_connect_accounts`)
- `stripeAccountId`
- `stripeOnboardingStatus`
- `stripeChargesEnabled` / `stripePayoutsEnabled` / `stripeDetailsSubmitted`
- `stripeRequirementsStatus` / `stripeDisabledReason`
- `stripeConnectedAt` / `stripeUpdatedAt`
- Owned by `ownerUserId` (session admin)

### Webhooks (idempotent)
`https://sooqna.site/api/webhooks/stripe` continues to sync:

- `account.updated`
- `account.external_account.created` / `updated`
- `capability.updated`

Notifications on status change (activation / additional info).

### Unchanged (must not break)
Checkout · Featured · Orders · Refunds · Internal escrow ledger · Platform webhook payment events

## Security
- Browser never receives `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`
- No bank/KYC documents stored in Sooqna
- Client cannot supply `stripeAccountId`
- Connect APIs require `payments` admin permission + session ownership

## Production QA checklist

| # | Test | Result |
|---|------|--------|
| 1 | `stripeConfigured=true` after Vercel LIVE keys | **BLOCKED** — keys unset |
| 2 | `/admin/stripe` → auto-redirect when not connected | **BLOCKED** — needs keys + admin session |
| 3 | Complete Stripe onboarding → return → status sync | **BLOCKED** |
| 4 | Incomplete onboarding → Continue Setup | **BLOCKED** |
| 5 | Expired Account Link → `/refresh` new link | **BLOCKED** |
| 6 | Existing account → no duplicate | Code YES / live **BLOCKED** |
| 7 | Additional requirements UI | Code YES / live **BLOCKED** |
| 8 | Charges/Payouts from Stripe API | Code YES / live **BLOCKED** |
| 9 | Persist across refresh/relogin | Code YES / live **BLOCKED** |

## Manual blocker

Set LIVE Stripe env vars on Vercel project **sooqna** Production and redeploy. Then run Connect E2E with an admin that has `payments` permission.

## Validation

- `npm run lint`
- `npm run build`

Do **not** mark COMPLETE until the real Connect redirect → Stripe → return → status sync passes on https://sooqna.site.
