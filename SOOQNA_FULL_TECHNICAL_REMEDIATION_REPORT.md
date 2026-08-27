# Sooqna — Full Technical Remediation Report

**Date:** 2026-08-27  
**Production:** https://sooqna.site  
**main tip:** `639bd20` (merge #261)  
**Production deploy:** `6122452501` Ready / success  

Statuses: **PASS** | **PARTIAL** | **FAIL** | **BLOCKED**

**Project is NOT COMPLETE.**

---

## Secret presence (Production, values never exposed)

| Variable | Detected on live process | How verified |
|----------|--------------------------|--------------|
| `SESSION_SECRET` | **PASS** (`sessionSecretConfigured: true`) | `GET /api/auth/status` boolean only |
| `CRON_SECRET` | **FAIL** (`cronSecretConfigured: false`, listed in `missing`) | Same endpoint + cron still `503 CRON_SECRET_REQUIRED` |

---

## Cron `/api/cron/dispute-reminders`

| Check | Status | Evidence |
|------|--------|----------|
| No auth | **PASS** (fail-closed) | `503 CRON_SECRET_REQUIRED` while unset |
| Wrong Bearer / x-cron-secret | **PASS** (fail-closed) | Same `503` while unset; after secret set must become `401` |
| Authorized execution | **BLOCKED** | Secret not loaded on Production; agent has no secret |
| Idempotent reminders | **BLOCKED** | Needs successful authorized runs |
| Vercel Cron registered | **PARTIAL** | `vercel.json` daily `0 6 * * *` on `main` (Hobby-compatible); cannot confirm Cron Jobs UI without Vercel MCP/token; execution blocked until `CRON_SECRET` present |

---

## Critical flow table

| Critical flow | Status |
|---------------|--------|
| Register (durable, no OTP leak, email delivered) | **PASS** |
| Email verification → account activation | **BLOCKED** |
| Login → Logout → Login again | **BLOCKED** |
| Forgot password → Reset → Login with new password | **BLOCKED** (request-link smoke PARTIAL/PASS earlier) |
| Create listing → Pending Review → My Listings → Admin approve → Publish → Search | **BLOCKED** |
| Featured listing → Stripe pay → Review → Approve → Featured | **BLOCKED** / **FAIL** (`stripeConfigured: false`) |
| Job apply → User Activity → Employer → Admin → Notifications | **BLOCKED** |
| Property viewing book → User → Owner → Admin → Notifications | **BLOCKED** |
| Services quote/booking → Provider → Customer → Admin → Notifications | **BLOCKED** |
| Purchase → Payment → Order → Escrow → parties → Admin → Notifications | **BLOCKED** / **FAIL** (Stripe) |
| مضمون: held → seller evidence → buyer confirm → escrow transition | **BLOCKED** |
| Dispute open → evidence → admin → 48h/24h/expiry reminders | **BLOCKED** |
| Persistence after refresh / logout / new session / redeploy | **PARTIAL** (auth Postgres PASS; marketplace E2E incomplete) |
| No cross-user data leakage | **BLOCKED** |
| Seller sees only related activity | **BLOCKED** |
| Admin permissions enforced server-side | **PARTIAL** (code on main; live multi-role E2E BLOCKED) |
| Cron endpoint protected | **PARTIAL** (fail-closed; full Bearer matrix BLOCKED until secret live) |
| Stripe webhooks verified | **FAIL** (`STRIPE_NOT_CONFIGURED`) |
| Critical actions not spoofable client-side | **PARTIAL** (session signing PASS via `SESSION_SECRET`; payment/order E2E BLOCKED) |
| Arabic RTL | **PASS** |
| English LTR without Arabic UI leakage | **FAIL** / **PARTIAL** |
| Contact field-level validation | **PASS** |
| Unauth notifications / admin / activity APIs | **PASS** (`401`) |

---

## Manual actions still required

1. **Add `CRON_SECRET` on Vercel project `sooqna` → Production** (and redeploy). Live process still reports `cronSecretConfigured: false`. Do not paste the value into chat.  
2. After redeploy: confirm `GET /api/auth/status` → `cronSecretConfigured: true` and unauthorized cron → **`401`**.  
3. In Vercel → Cron Jobs, confirm daily job for `/api/cron/dispute-reminders`.  
4. Set **Stripe Live** keys + webhook secret.  
5. Provide **verified test accounts** or a **readable mailbox** for Register→Verify→Reset and full marketplace E2E.  
6. Optional: authenticate Vercel MCP / provide `VERCEL_TOKEN` for cron UI verification.

---

## Definition of done

**NOT COMPLETE** while any critical flow above is BLOCKED / PARTIAL / FAIL.
