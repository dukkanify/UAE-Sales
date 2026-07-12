# OTP Feature Postponement Report

## Decision

Email OTP authentication is **postponed** to a future phase. Code is preserved but disabled via feature flag.

## Feature Flag

```
NEXT_PUBLIC_ENABLE_EMAIL_OTP=false   # production default
```

When `false`:
- OTP UI hidden on login, register, verify-email.
- OTP APIs return controlled response:
  ```json
  { "code": "FEATURE_DISABLED", "message": "هذه الميزة غير متاحة حاليًا." }
  ```
- No OTP emails sent.

## Preserved OTP Architecture

| Component | Status |
|-----------|--------|
| `services/otp/otp.service.ts` | Kept |
| `services/auth/auth-handlers.ts` | Kept |
| `app/api/auth/*/request-otp` | Guarded |
| `app/api/auth/*/verify-otp` | Guarded |
| `app/api/auth/otp/*` (legacy) | Guarded |
| `features/auth/components/OtpVerification.tsx` | Kept |
| `app/verify-email/page.tsx` | Shows disabled message |

## Active Registration Strategy

**One active path:** standard email + password registration at `/register` via `POST /api/auth/register`.

OTP registration (`/api/auth/register/request-otp`) disabled when flag is off.

## Active Login Strategy

**Primary:** email + password (`/api/auth/login/password`).

OTP login disabled when flag is off.

## Migration from PR #26

- OTP security improvements retained (rate limits, hashed OTP storage, demo OTP rules).
- Checkout no longer requires OTP or registration.
- No conflicting dual registration flows in production UI.
- Auth docs updated in this report set.

## Enabling OTP Later

1. Set `NEXT_PUBLIC_ENABLE_EMAIL_OTP=true` in Vercel.
2. Configure `RESEND_API_KEY`.
3. Login/register forms automatically show OTP primary flow.
4. No code removal required.

## QA Results

| Test | Result |
|------|--------|
| No OTP elements in login (flag off) | Pass |
| No OTP elements in register (flag off) | Pass |
| `/verify-email` shows disabled message | Pass |
| OTP API returns `FEATURE_DISABLED` | Pass |
| Password login still works | Pass |
| Demo accounts still work | Pass |

## Remaining Risks

- Forgot-password flow still references OTP endpoints (returns disabled response).
- Future enablement requires production email provider configuration.
