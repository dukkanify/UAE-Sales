# Sooqna — Full Technical Remediation Report

**Date:** 2026-08-27 (updated)  
**Production:** https://sooqna.site  

**Merged:** `#260` → `main` `5903294` (includes `1a5140e`)  
**Open:** `#261` `cursor/vercel-dispute-cron-37ba` — daily Vercel cron + secret presence booleans  

Statuses: **PASS** | **PARTIAL** | **FAIL** | **BLOCKED**

**Project is NOT COMPLETE.**

---

## Critical production verification (this pass)

| Check | Status | Evidence (no secret values) |
|------|--------|------------------------------|
| PR #260 on main / prior Production deploy | **PASS** | `5903294` Production deployment success |
| `CRON_SECRET` visible to running Production | **FAIL** | `POST /api/cron/dispute-reminders` → `503 CRON_SECRET_REQUIRED` (not `401`) |
| `SESSION_SECRET` visible to running Production | **BLOCKED** | Cannot confirm until deploy with `sessionSecretConfigured` boolean ships; status `missing` currently lists Stripe keys only (pre-boolean code) |
| Cron unauthorized rejected | **PARTIAL** | Fail-closed `503` while unset; expected after set: `401 UNAUTHORIZED` |
| Cron authorized execution | **BLOCKED** | Secret not loaded on live process; agent has no secret to send |
| PR #261 CI / Preview | **FAIL** → fix in progress | Vercel: Hobby limited to **daily** crons; hourly `0 * * * *` rejected. Updated to `0 6 * * *` |
| Merge #261 | **BLOCKED** | CI must be green; agent cannot merge (gh write disabled) |
| Vercel Cron registered | **BLOCKED** | Needs #261 merge + Hobby-compatible schedule + working `CRON_SECRET` |
| Stripe Live | **FAIL** | `stripeConfigured=false`; webhook `STRIPE_NOT_CONFIGURED` |
| Postgres + Resend | **PASS** | `databaseConfigured=true`, `resendConfigured=true`, `demoOtpServerEnabled=false` |

---

## Critical flows

| Flow | Status | Notes |
|------|--------|-------|
| Register | **PASS** | Durable; `emailDelivered`; **no OTP in API** |
| Email verify → activate | **BLOCKED** | Needs readable inbox / test account |
| Login / Logout / Login | **BLOCKED** | Needs verified account |
| Forgot / Reset password | **PARTIAL** | Request-link smoke **PASS**; complete reset **BLOCKED** |
| Create listing → review → approve → publish → search | **BLOCKED** | Needs user + admin sessions |
| Featured → Stripe → approve | **BLOCKED** | Stripe unset |
| Job apply → activities → employer → admin → notify | **BLOCKED** | Needs auth |
| Property viewing booking end-to-end | **BLOCKED** | Needs auth |
| Services quote/booking end-to-end | **BLOCKED** | Needs auth |
| Purchase → payment → order → escrow | **BLOCKED** | Stripe unset |
| مضمون evidence → buyer confirm | **BLOCKED** | Needs paid order |
| Dispute open + 48h/24h/expired reminders | **BLOCKED** | Needs orders + cron secret + cron registration |
| Persistence after refresh/redeploy | **PARTIAL** | Auth Postgres configured; full marketplace proof incomplete |
| No cross-user leakage / RBAC live | **BLOCKED** | Needs multi-account E2E |
| Cron spoofing protection | **PARTIAL** | Fail-closed without secret; full Bearer matrix **BLOCKED** |
| Arabic RTL | **PASS** | `dir=rtl` `lang=ar` |
| English LTR without Arabic UI leak | **FAIL** / **PARTIAL** | `dir=ltr` after locale cookie; Arabic category labels still visible |
| Contact field-level errors | **PASS** | `fieldErrors` returned |
| Notifications/admin unauthenticated | **PASS** | `401` |

---

## Tasks 1–27 (summary)

| Band | Status |
|------|--------|
| P0 Auth/email/listings/notifications code | **PARTIAL** (live E2E incomplete) |
| P0 Stripe/Featured/Orders/Escrow/Dispute cron | **FAIL** / **BLOCKED** |
| P1 forms/search/dashboard/ratings/activities UX | **PARTIAL** |
| P2 legal/visuals/i18n/perf/E2E suite | **PARTIAL** / **FAIL** |

---

## Code changes in #261 (this iteration)

1. `vercel.json` schedule → `0 6 * * *` (Hobby-compatible daily)  
2. `/api/auth/status` config gains **booleans only**: `sessionSecretConfigured`, `cronSecretConfigured`; names added to `missing` when absent in production  
3. Cron route comment documents Hobby daily limit  

---

## Manual actions still required

1. Confirm `SESSION_SECRET` + `CRON_SECRET` are on Vercel project **sooqna** → Environment **Production**, then **Redeploy** until unauthorized cron returns **401** (not 503).  
2. Wait for #261 Preview/CI green, then **merge #261** to main (agent cannot merge).  
3. Confirm Vercel Cron Jobs UI shows daily job for `/api/cron/dispute-reminders`.  
4. Configure Stripe Live keys + webhook.  
5. Provide verified test accounts or a readable inbox for full auth + marketplace E2E.  

Do **not** paste secret values into chat, git, logs, or screenshots.
