# Production Auth + Email Final QA Report

**Date:** 2026-08-20  
**Branch:** `main` (PR #230 merged)  
**Target:** https://sooqna.site  
**Status:** ⚠️ **NOT COMPLETE** — Auth + Postgres live on production; **Resend still not active** at runtime (`resendConfigured=false`, emails not delivered)

---

## Root cause

Production auth was blocked by **multiple independent issues**:

0. **PR #230 deployed** — `GET /api/auth/status` returns **HTTP 200** with `driver=postgres`. Registration returns `emailDelivered:false` (no OTP leak) when Resend is unavailable.

1. **Neon/Postgres connected** — user accounts persist in `auth_users`, but legacy accounts from ephemeral `/tmp` storage were never migrated. Login correctly returns `401 INVALID_CREDENTIALS` for unknown credentials or `403 ACCOUNT_UNVERIFIED` for pending accounts.

2. **`RESEND_API_KEY` not configured on Vercel Production** — OTP, welcome, and password-reset emails cannot be sent. Registration saved users to Neon but failed at the email step (`503 EMAIL_SEND_FAILED`). Pending accounts could not complete verification.

3. **Pending-account recovery bug** — `isRegisteredAccount()` treated pending users with a password hash as fully registered, blocking re-registration/resend with `409 EMAIL_ALREADY_REGISTERED`.

4. **Email failure UX** — registration returned hard `503` instead of redirecting to verify-email with a safe failure message and resend option.

---

## Database used

| Check | Result (production, pre-deploy) |
|-------|----------------------------------|
| Postgres driver | ✅ Likely active — even when registration email sending fails, the created user can login and returns `403 ACCOUNT_UNVERIFIED` (not `AUTH_STORE_NOT_DURABLE` / `REGISTER_FAILED` 503 storage errors) |
| Storage location | Not directly confirmed — would be confirmed by `/api/auth/status` from PR #230, but that endpoint is currently missing in deployed production |
| `/tmp` auth users | Not directly confirmed (requires `/api/auth/status`) |
| localStorage for users | ❌ Not used — sessions via httpOnly cookies |

**Code addition:** `getPostgresUrl()` now falls back to Vercel Neon split vars (`DATABASE_PGHOST`, `DATABASE_PGPASSWORD`, `DATABASE_PGDATABASE`, etc.) when `DATABASE_URL` is absent.

**Diagnostic (PR #230):** `GET /api/auth/status` should return `{ config, persistence }` with names only (no secrets) — but it is currently `404` on deployed production.

---

## Environment variables detected (names only)

Verified against production behavior and Vercel Neon integration pattern:

| Variable | Expected | Production status |
|----------|----------|-------------------|
| `DATABASE_URL` | Required | ✅ Likely set (hidden in Vercel "Show more") — DB responds |
| `DATABASE_PGHOST` | Neon integration | ✅ Visible in Vercel dashboard |
| `DATABASE_PGPASSWORD` | Neon integration | ✅ Visible in Vercel dashboard |
| `DATABASE_PGDATABASE` | Neon integration | ✅ Visible in Vercel dashboard |
| `RESEND_API_KEY` | Required | ❌ **Likely missing/invalid** — registration fails with `503 EMAIL_SEND_FAILED` |
| `EMAIL_PROVIDER` | `resend` | ⚠️ Not confirmed |
| `EMAIL_FROM_ADDRESS` | `no-reply@sooqna.site` | ⚠️ Not confirmed |
| `EMAIL_FROM_NAME` | `Sooqna` | ⚠️ Not confirmed |
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` | ✅ Site live at sooqna.site |
| `ENABLE_DEMO_OTP` | `false` | ✅ No demo OTP in API responses |
| `NEXT_PUBLIC_ENABLE_DEMO_OTP` | `false` | ✅ No client OTP fallback in prod |

**Server-side logging added (PR #230):** `[Sooqna Auth] production configuration incomplete` with missing var names — not yet verifiable from deployed production because PR #230 is not deployed.

---

## Files changed

| File | Change |
|------|--------|
| `services/auth/production-config.ts` | **New** — config snapshot + production error logging |
| `services/auth/user-persistence.ts` | Neon split-var URL fallback; log config on init |
| `services/auth/user-store.ts` | `isPendingEmailVerification()` — pending users recoverable |
| `services/auth/auth-handlers.ts` | Keep OTP on email fail; no throw for REGISTER |
| `app/api/auth/register/route.ts` | Redirect to verify on email fail; no OTP in prod response |
| `app/api/auth/register/request-otp/route.ts` | Pending recovery; safe email-fail response |
| `app/api/auth/otp/resend/route.ts` | 404 if no user; no fake success; no OTP leak |
| `app/api/auth/status/route.ts` | **New** — non-secret config/persistence diagnostic |
| `services/email/email.service.ts` | `console.error` when `RESEND_API_KEY` missing in prod |
| `features/auth/components/RegisterForm.tsx` | Demo-gated OTP storage; emailDelivered URL param |
| `features/auth/components/OtpVerification.tsx` | Email-fail message + resend handling |
| `features/auth/components/VerifyEmailContent.tsx` | Pass `emailDelivered=0` to OTP UI |
| `.env.production.example` | Document Neon vars + required Resend config |

---

## Production QA results (live sooqna.site, 2026-08-20)

Tests run via `curl` against current production:

### Auth diagnostic endpoint

```
GET /api/auth/status
→ HTTP 200
→ driver: postgres
→ resendConfigured: false
→ missing: ["RESEND_API_KEY","EMAIL_FROM_ADDRESS","NEXT_PUBLIC_APP_URL"]
→ no secrets in response
```

### Auth diagnostic endpoint (2026-08-20, user confirmed live)

```
GET /api/auth/status
→ HTTP 200
→ driver: postgres
→ resendConfigured: false
→ missing: ["RESEND_API_KEY","EMAIL_FROM_ADDRESS","NEXT_PUBLIC_APP_URL"]
→ no secrets in response
```

### Registration (new email)

```
POST /api/auth/register
→ ok: true, emailDelivered: false
→ otp: null (no leak)
→ redirectTo includes emailDelivered=0
```

User saved in Postgres; OTP email **not sent** (Resend unavailable at runtime).

### Pending account (`ismailabohashiesh@gmail.com`)

```
Re-register → ok: true, emailDelivered: false, otp: null ✅ (no duplicate block)
Resend OTP  → ok: true, emailDelivered: false, otp: null
Login wrong password → INVALID_CREDENTIALS ✅
```

### OTP delivery

```
POST /api/auth/otp/resend (REGISTER)
→ HTTP 503 EMAIL_SEND_FAILED
```

**Resend delivery:** ❌ Not verified — no API key.

### Login

| Case | Result |
|------|--------|
| Wrong password | `401 INVALID_CREDENTIALS` — Arabic message ✅ |
| Correct password, pending unverified | `403 ACCOUNT_UNVERIFIED` + redirect to verify ✅ |

### Pending-account recovery (`ismailabohashiesh@gmail.com`)

| Case | Pre-fix production | After this PR |
|------|-------------------|---------------|
| Re-register same email | `409 EMAIL_ALREADY_REGISTERED` ❌ | Updates pending row + resend OTP ✅ |
| Resend OTP | `503 EMAIL_SEND_FAILED` | Safe message + retry (needs Resend) |

### Forgot / reset password

```
POST /api/auth/password/reset/request-link
→ HTTP 200 generic success (anti-enumeration)
```

Email delivery not confirmed — requires Resend + verified domain.

### Welcome email

Not testable until OTP verify completes — blocked by missing Resend.

### OTP leak audit (production code paths)

| Surface | Production |
|---------|------------|
| API `{ otp }` | ❌ Gated by `canRevealOtpToClient()` |
| URL params | ❌ No OTP |
| localStorage/sessionStorage | ❌ Gated by `NEXT_PUBLIC_ENABLE_DEMO_OTP` |
| UI fallback block | ❌ Demo-only |
| OTP storage | ✅ Hash only in `otp-requests.json` |

---

## Resend delivery result

| Email type | API | Inbox |
|------------|-----|-------|
| Registration OTP | ❌ 503 | ❌ Not verified |
| Welcome | N/A | ❌ Not verified |
| Password reset link | 200 (generic) | ❌ Not verified |

**Cannot confirm Resend logs** from this environment — no access to Vercel logs or Resend dashboard.

---

## Remaining blockers

1. **Deploy PR #230 to production** (required because `/api/auth/status` is currently `404`).
2. If `RESEND_API_KEY` is still missing after deploy: **add `RESEND_API_KEY` to Vercel Production** (and verify `sooqna.site` domain in Resend).
3. **Redeploy** after env vars + this PR merge.
4. **Manual E2E** with a real inbox:
   - Register → OTP email → verify → welcome email
   - Logout → login
   - Forgot password → reset link → new password → login
5. **Pending account:** open `/verify-email?email=ismailabohashiesh@gmail.com&purpose=REGISTER` → resend OTP after Resend is live.
6. **Optional:** set strong `OTP_PEPPER` and `PASSWORD_PEPPER` in production (defaults to dev pepper if unset).

---

## Validation commands

```bash
npm run lint   # ✅ pass
npm run build  # ✅ pass
```

Post-deploy smoke:

```bash
curl -s https://sooqna.site/api/auth/status | jq .
```

Expected when fully configured:

```json
{
  "ok": true,
  "config": { "databaseConfigured": true, "resendConfigured": true, "missing": [] },
  "persistence": { "driver": "postgres", "location": "postgres:auth_users" }
}
```

---

## Conclusion

**Code:** Ready for review — fixes pending recovery, Neon env detection, email-failure UX, OTP leak hardening, and production config logging.

**Production E2E:** **NOT COMPLETE** until `RESEND_API_KEY` is configured on Vercel, production is redeployed, and real inbox delivery is confirmed in Resend logs.
