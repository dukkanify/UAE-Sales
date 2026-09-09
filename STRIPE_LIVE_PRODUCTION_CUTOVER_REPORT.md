# Sooqna — Stripe LIVE Production Cutover Report

**Date (UTC):** 2026-08-29  
**Production host:** https://sooqna.site  
**Live deployment commit:** `a9b39d2` (matches `main` tip at cutover audit)  
**Stripe mode target:** **LIVE** (`sk_live_` / `pk_live_` / Live webhook `whsec_`)  
**Overall cutover status:** **NOT COMPLETE**

---

## 1) Audit — existing implementation (no redesign)

| Area | Status | Implementation |
|------|--------|----------------|
| Checkout | EXISTS | Hosted Stripe Checkout via `createCheckoutSession()` / `createFeaturedCheckoutSession()` in `services/payments/stripe.service.ts` |
| Session creation | EXISTS | `POST /api/checkout/session`, `POST /api/listings/[id]/feature` |
| Success URL | EXISTS | `{NEXT_PUBLIC_APP_URL}/checkout/success?...` and featured → `/dashboard/listings?featured=1&session_id=...` via `getAppUrl()` |
| Cancel URL | EXISTS | `{appUrl}/checkout?...&payment=cancelled` / featured cancel on dashboard |
| Webhook | EXISTS | `POST /api/webhooks/stripe` — raw body + `stripe.webhooks.constructEvent` |
| Orders / payment status | EXISTS | `handleCheckoutSessionCompleted` → `markOrderPaid` → `paid_held_in_escrow` |
| Refunds | EXISTS | Admin `POST /api/orders/[id]/refund` + dispute resolve buyer + `charge.refunded` sync |
| Escrow / held | EXISTS (Sooqna-internal) | Ledger `escrow_hold` / release; **not** Stripe regulated escrow / destination charges |
| Featured payment | EXISTS | Draft until webhook `markListingFeatured` → `pending_review` + `isFeatured` |
| Stripe Connect | EXISTS (admin onboarding only) | Express account AE; **not** wired into checkout payment path |

**Architecture decision preserved:** platform collects payment; Sooqna escrow state is internal. Connect is separate KYC/onboarding for admin — does not block basic customer Checkout activation.

---

## 2) Environment variables the code actually reads

| Variable | Required for LIVE | Notes |
|----------|-------------------|--------|
| `STRIPE_SECRET_KEY` | **YES** | `sk_live_...` — drives `stripeConfigured` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **YES** | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | **YES** | Live endpoint `whsec_...` only |
| `NEXT_PUBLIC_APP_URL` | **YES** | Must be `https://sooqna.site` (already present live) |
| `STRIPE_CURRENCY` | Optional | Defaults to `aed` |
| `ALLOW_MOCK_CHECKOUT` | Must be `false` | Already `false` on Production runtime |
| `NEXT_PUBLIC_ENABLE_MOCK_CHECKOUT` | Must be `false` | Already documented for Production |

**Not invented:** no new env var names. Do **not** use `APP_URL` (code reads `NEXT_PUBLIC_APP_URL` only).

Alternate path (existing): admin can store credentials in Postgres via `/admin/stripe` (`stripe-credentials-store.ts`) when env secret is empty. **Cutover preference remains Vercel Production env LIVE keys** as specified.

---

## 3) Vercel Production write — STOPPED (agent cannot write)

**Blocker:** Vercel MCP is unauthenticated; no `VERCEL_TOKEN` in agent environment. Agent **cannot** set Production env vars.

### Add manually on Vercel → project **sooqna** → Production

1. `STRIPE_SECRET_KEY` = `sk_live_...`
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
3. `STRIPE_WEBHOOK_SECRET` = `whsec_...` from the **Live** webhook for `https://sooqna.site/api/webhooks/stripe`
4. Confirm `NEXT_PUBLIC_APP_URL=https://sooqna.site`
5. Confirm `ALLOW_MOCK_CHECKOUT=false`
6. Confirm `NEXT_PUBLIC_ENABLE_MOCK_CHECKOUT=false`
7. Optional: `STRIPE_CURRENCY=aed`

Then **Redeploy Production**.

**Do not commit keys to GitHub. Do not paste keys into chat.**

---

## 4) LIVE runtime validation (current)

| Check | Result |
|-------|--------|
| Host | https://sooqna.site |
| Commit | `a9b39d2` |
| `appUrl` | `https://sooqna.site` |
| `stripeConfigured` | **false** |
| `stripePublishableConfigured` | **false** |
| `stripeWebhookConfigured` | **false** |
| `stripeCurrency` | `aed` |
| `mockCheckoutAllowed` | **false** (good — no mock on Production) |
| `featuredCheckoutAvailable` | **false** (blocked by missing Stripe) |
| `missing` includes Stripe trio | **YES** |
| `POST /api/webhooks/stripe` (invalid/empty) | **503** `STRIPE_NOT_CONFIGURED` (expected until keys set; after keys → expect **400** on bad signature) |

---

## 5) LIVE webhook to configure (Stripe Dashboard → Live mode)

**Endpoint:** `https://sooqna.site/api/webhooks/stripe`

Subscribe **only** to events the app handles:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `account.updated`
- `account.external_account.created`
- `account.external_account.updated`
- `capability.updated`

Use the signing secret from **this Live endpoint**. Do **not** reuse test / CLI / Preview secrets.

### Security (code-verified)

| Control | Status |
|---------|--------|
| Signature validation | `constructEvent` with `STRIPE_WEBHOOK_SECRET` |
| Raw body | `request.text()` |
| Invalid signature | Rejected (400) when configured |
| Idempotency | `claimStripeWebhookEvent(event.id)` (Postgres preferred) |
| Duplicate order pay | Guarded by `pending_payment` / transition checks |
| Client totals trusted? | **No** — server `fee-calculator` + Stripe line amounts in fils |

---

## 6) Checkout / Featured / Escrow / Refund — E2E status

| Flow | Result |
|------|--------|
| Normal purchase LIVE | **BLOCKED** — keys unset |
| Featured payment LIVE | **BLOCKED** — keys unset |
| Cancelled checkout | **BLOCKED** — cannot open LIVE Checkout |
| Duplicate payment protection | Code EXISTS; live not proven |
| Webhook delivery | **BLOCKED** — 503 until secret key |
| Escrow state after pay | Code EXISTS (internal hold); live not proven |
| Refund | Code EXISTS (admin); live not proven |
| Connect onboarding | Code EXISTS; optional for basic Checkout; live not proven |
| Real low-value charge | **NOT RUN** — no owner approval + no LIVE keys in agent |

**Currency:** AED → Stripe amount = `Math.round(aed * 100)` (fils). Default currency `aed`.

**URLs:** Production `getAppUrl()` falls back to `https://sooqna.site`; live `appUrl` already confirms canonical host (no localhost/Preview in Production status).

---

## 7) Connect note

Stripe Connect Express onboarding is implemented under `/admin/stripe` for account status (`chargesEnabled`, `payoutsEnabled`, `detailsSubmitted`). Checkout does **not** use destination charges today. Basic LIVE customer payment activation is **not** blocked on Connect completion.

---

## 8) Definition of Done vs current

| Criterion | Met? |
|-----------|------|
| Production uses LIVE keys | **NO** |
| `stripeConfigured=true` | **NO** |
| LIVE webhook works | **NO** |
| Signature verification live-proven | **NO** |
| Real payment completes | **NO** |
| Order created once | **NO** |
| Featured after confirmed payment only | Code YES / live **NO** |
| AED amounts correct | Code YES / live **NO** |
| Cancel / refund live | **NO** |
| Escrow/order consistent | Code YES / live **NO** |
| Stripe Dashboard ↔ Sooqna agree | **NO** |
| No mock fallback on Production | **YES** (`mockCheckoutAllowed=false`) |
| No secrets exposed | **YES** |
| Production commit verified | **YES** (`a9b39d2`) |

**Stripe LIVE cutover: NOT COMPLETE.**

---

## 9) Remaining blockers (exact)

1. **Manual:** Set the three LIVE Stripe env vars (+ confirm APP URL / mock flags) on Vercel **sooqna** Production and redeploy.
2. **Manual:** Create Live webhook endpoint at `https://sooqna.site/api/webhooks/stripe` with the events listed above; paste its `whsec_` into Production.
3. **Manual:** Provide admin credentials (and optional approval) for one low-value LIVE purchase + Featured + refund verification.
4. After (1–2): re-check `/api/auth/status` until `stripeConfigured=true` and Stripe keys leave `missing`; webhook without valid signature returns **400** not **503**.
5. Then run QA matrix A–N from the cutover brief and update this report to COMPLETE only when all DoD rows are YES.

---

## 10) Agent actions taken

- Audited existing Stripe/Checkout/webhook/escrow/featured/refund/Connect code paths
- Verified live Production commit and config snapshot (no secrets logged)
- Confirmed mock checkout already disabled on Production runtime
- Requested external setup for LIVE keys + admin access
- **Did not** invent env vars, redesign payments, commit secrets, or run uncontrolled charges
