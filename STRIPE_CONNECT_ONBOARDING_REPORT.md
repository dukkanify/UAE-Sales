# Stripe Connect One-Click Onboarding — Sooqna

**Date (UTC):** 2026-08-30  
**Production host:** https://sooqna.site  
**Live deployment commit:** `4d3408d` (Merge #267 — one-click Connect UX)  
**`main` tip:** `4d3408d` — **MATCH**

## Overall status

# NOT COMPLETE

One-click Connect code is **deployed to Production**, but the Production **runtime still does not see Stripe keys**.

Live `GET https://sooqna.site/api/auth/status`:

| Flag | Value |
|------|--------|
| `stripeConfigured` | **false** |
| `stripePublishableConfigured` | **false** |
| `stripeWebhookConfigured` | **false** |
| `featuredCheckoutAvailable` | **false** |
| `mockCheckoutAllowed` | **false** |
| `missing` includes | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (+ `CRON_SECRET`) |

`POST /api/webhooks/stripe` (invalid/missing signature) → **503 `STRIPE_NOT_CONFIGURED`**  
(Expected when configured + bad signature: **400**)

Therefore LIVE Connect redirect → Stripe → return → status sync **cannot** be marked COMPLETE.

---

## Verification checklist (requested)

| # | Requirement | Result |
|---|-------------|--------|
| 1 | `stripeConfigured = true` | **FAIL** — still `false` after Production deploy `4d3408d` |
| 2 | No Stripe keys exposed to browser | **PASS** (so far) — `/api/auth/status` has no `sk_`/`whsec_`/`pk_live_…` values; secrets are boolean flags only |
| 3 | `/admin/stripe` no longer shows missing-config warning when configured | **N/A / PARTIAL** — platform not configured, so warning **correctly** shows «إعداد Stripe الرئيسي غير مكتمل…». Key paste form **removed** in deployed #267 code |
| 4 | One-click Connect E2E | **BLOCKED** — needs `stripeConfigured=true` + admin session |
| 5 | Reuse existing `stripeAccountId` | Code **PASS** (`ensureConnectAccount`); live **BLOCKED** |
| 6 | charges/payouts/details/requirements | Code **PASS**; live **BLOCKED** |
| 7 | Webhook endpoint live | Endpoint exists; returns **503** until secret key present |
| 8 | Signature validation + idempotency | Code **PASS**; live signature reject not proven (blocked by 503) |
| 9 | Checkout / Featured / Orders not broken | Featured still correctly unavailable (`featuredCheckoutAvailable=false`); mock off; no architecture change to payment path in #267 |
| 10 | `npm run lint` / `npm run build` | **PASS** on Connect branch prior to merge; re-run on this verify branch |
| 11 | Latest `main` on Production | **PASS** — Production deployment `6166501767` = `4d3408d` |
| 12 | Report updated | This document |

---

## Code shipped (#267)

- Removed browser Secret/Publishable/Webhook paste fields from `/admin/stripe`
- `PUT /api/admin/stripe` → **403 `USE_VERCEL_ENV`**
- Connect auto-redirect for `NOT_CONNECTED` (~1.5s) + fallback CTA
- Smart A–F status CTAs; return/refresh sync from Stripe API
- Account reuse; Checkout/Featured/Orders untouched

---

## Root cause of LIVE blocker

User reported keys configured in Vercel, but **sooqna Production runtime still lists all three Stripe vars in `missing`**.

Likely causes to check manually:

1. Variables attached to **Preview** only, not **Production**
2. Wrong Vercel project (not **sooqna**)
3. Name typo / different env names
4. Keys saved but Production deploy did not pick them up (already redeployed as `4d3408d` — still missing)

**Required action:** On Vercel → project **sooqna** → Settings → Environment Variables → **Production**:

- `STRIPE_SECRET_KEY` = `sk_live_…`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_…`
- `STRIPE_WEBHOOK_SECRET` = Live webhook `whsec_…` for `https://sooqna.site/api/webhooks/stripe`

Then **Redeploy Production** and confirm:

```http
GET https://sooqna.site/api/auth/status
→ stripeConfigured: true
→ missing does not include Stripe keys

POST https://sooqna.site/api/webhooks/stripe  (bad signature)
→ HTTP 400 (not 503)
```

Then provide admin credentials for Connect E2E (`SOOQNA_ADMIN_EMAIL` / `SOOQNA_ADMIN_PASSWORD`).

---

## Definition of Done

**NOT met.** Do not mark Stripe Connect COMPLETE until:

1. `stripeConfigured=true` on sooqna.site  
2. LIVE Connect: `/admin/stripe` → Stripe → return → server-side status sync passes  
3. Webhook signature rejection proven (400)  
4. No secrets exposed  

## Final verdict

**NOT COMPLETE** — Production code is current (`4d3408d`); Production Stripe env injection is still failing at runtime.
