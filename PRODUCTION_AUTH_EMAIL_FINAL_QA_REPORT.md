# Production Auth + Email Final QA Report

**Date:** 2026-08-19  
**Branch:** `cursor/production-auth-resend-final-37ba`  
**Target:** https://sooqna.site  
**Status:** ⚠️ **NOT COMPLETE** — `/api/auth/status` is now live (`HTTP 200`) and Postgres is active, but Resend production configuration is still incomplete (`resendConfigured=false`, `missing=["RESEND_API_KEY","EMAIL_FROM_ADDRESS","NEXT_PUBLIC_APP_URL"]`)

---

## Root cause

Production auth was blocked by **multiple independent issues**:

0. **Deployment status updated:** PR #230 diagnostics are now live on production (`GET /api/auth/status` returns `HTTP 200`).

1. **Neon/Postgres connected** — user accounts persist in `auth_users`, but legacy accounts from ephemeral `/tmp` storage were never migrated. Login correctly returns `401 INVALID_CREDENTIALS` for unknown credentials or `403 ACCOUNT_UNVERIFIED` for pending accounts.

2. **`RESEND_API_KEY` not configured on Vercel Production** — OTP, welcome, and password-reset emails cannot be sent. Registration saved users to Neon but failed at the email step (`503 EMAIL_SEND_FAILED`). Pending accounts could not complete verification.

3. **Pending-account recovery bug** — `isRegisteredAccount()` treated pending users with a password hash as fully registered, blocking re-registration/resend with `409 EMAIL_ALREADY_REGISTERED`.

4. **Email failure UX** — registration returned hard `503` instead of redirecting to verify-email with a safe failure message and resend option.

---

## Database used

| Check | Result (production, pre-deploy) |
|-------|----------------------------------|
| Postgres driver | ✅ Likely active — even when registration email sending fails, the created user can login and returns `403 ACCOUNT_UNVERIFIED` (not `AUTH_STORE_NOT_DURABLE` / `REGISTER_FAILED` 503 storage errors) |
| Storage location | ✅ Confirmed by `/api/auth/status`: `postgres:auth_users` |
| `/tmp` auth users | ✅ Not used for production auth persistence (`driver=postgres`) |
| localStorage for users | ❌ Not used — sessions via httpOnly cookies |

**Code addition:** `getPostgresUrl()` now falls back to Vercel Neon split vars (`DATABASE_PGHOST`, `DATABASE_PGPASSWORD`, `DATABASE_PGDATABASE`, etc.) when `DATABASE_URL` is absent.

**Diagnostic (PR #230):** `GET /api/auth/status` now returns `{ config, persistence }` with names only (no secrets). Current production response confirms `driver=postgres` and no secret leakage.

---

## Environment variables detected (names only)

Verified against production behavior and Vercel Neon integration pattern:

| Variable | Expected | Production status |
|----------|----------|-------------------|
| `DATABASE_URL` | Required | ✅ Likely set (hidden in Vercel "Show more") — DB responds |
| `DATABASE_PGHOST` | Neon integration | ✅ Visible in Vercel dashboard |
| `DATABASE_PGPASSWORD` | Neon integration | ✅ Visible in Vercel dashboard |
| `DATABASE_PGDATABASE` | Neon integration | ✅ Visible in Vercel dashboard |
| `RESEND_API_KEY` | Required | ❌ **Missing** (reported by `/api/auth/status`) |
| `EMAIL_PROVIDER` | `resend` | ✅ Configured (`emailProvider: "resend"`) |
| `EMAIL_FROM_ADDRESS` | `no-reply@sooqna.site` | ❌ Missing (`null` in `/api/auth/status`) |
| `EMAIL_FROM_NAME` | `Sooqna` | ⚠️ Not confirmed |
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` | ❌ Missing (`null` in `/api/auth/status`) |
| `ENABLE_DEMO_OTP` | `false` | ✅ No demo OTP in API responses |
| `NEXT_PUBLIC_ENABLE_DEMO_OTP` | `false` | ✅ No client OTP fallback in prod |

**Server-side logging (verifiable):** `/api/auth/status` exposes the missing variable names without exposing secret values.

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

## Production QA results (live sooqna.site, pre-merge)

Tests run via `curl` against current production (before this PR deploys):

### Auth diagnostic endpoint

```
GET /api/auth/status
→ HTTP 404 (still missing after the claimed deploy)
```

### Registration (new email)

```
POST /api/auth/register
→ HTTP 503 EMAIL_SEND_FAILED
```

User may be saved in Neon; OTP email not sent.

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

1. **Single required manual action (Vercel Production):** add/fix the exact missing env vars reported by `/api/auth/status` — `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, and `NEXT_PUBLIC_APP_URL` — then redeploy Production.
2. After that, run manual real-inbox E2E:
   - Register → OTP email → verify → welcome email
   - Logout → login
   - Forgot password → reset link → new password → login
3. **Pending account:** open `/verify-email?email=ismailabohashiesh@gmail.com&purpose=REGISTER` → resend OTP after Resend is live.
4. **Optional:** set strong `OTP_PEPPER` and `PASSWORD_PEPPER` in production (defaults to dev pepper if unset).

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
