# Email OTP Migration Report

## Root Cause

Authentication previously used mock/demo flows with SMS/UAE PASS placeholders and client-side session creation without server-side OTP verification or email delivery.

## Solution

Email-only OTP authentication with:

- Server-side OTP generation, SHA-256 hashing (peppered), expiry, attempt limits, resend cooldown
- Provider abstraction in `services/email/email.service.ts` (Resend default)
- Bilingual Arabic-primary email templates
- Demo OTP `123456` only when `NODE_ENV !== "production"` or `ENABLE_DEMO_OTP=true`

## Files Changed

| File | Change |
|------|--------|
| `types/domain/otp.ts` | OTP types |
| `services/otp/otp-config.ts` | Config + demo guard |
| `services/otp/otp.service.ts` | Create, verify, mask email |
| `services/email/email.service.ts` | sendOtpEmail, welcome, password reset, login verification |
| `app/api/auth/otp/register/route.ts` | Registration OTP request |
| `app/api/auth/otp/login/route.ts` | Login OTP request |
| `app/api/auth/otp/forgot-password/route.ts` | Password reset OTP |
| `app/api/auth/otp/verify/route.ts` | Verify + resend + session creation |
| `app/api/auth/otp/reset-password/route.ts` | **New** — set password after OTP |
| `features/auth/components/OtpVerification.tsx` | Email-only 6-digit UI |
| `features/auth/components/LoginForm.tsx` | Email + password → OTP |
| `features/auth/components/RegisterForm.tsx` | Register → email OTP → server session |
| `features/auth/components/ForgotPasswordForm.tsx` | Email OTP → new password |
| `features/auth/components/DemoAccountsPanel.tsx` | Hidden in production |
| `.env.example`, `.env.production.example` | Email/OTP env vars |

## APIs Changed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/otp/register` | POST | Create pending registration + send OTP |
| `/api/auth/otp/login` | POST | Validate credentials + send login OTP |
| `/api/auth/otp/forgot-password` | POST | Send password reset OTP |
| `/api/auth/otp/verify` | POST | Verify OTP; `action: resend` to resend |
| `/api/auth/otp/reset-password` | POST | Set new password with reset token |

## Environment Variables

```
EMAIL_PROVIDER=resend
EMAIL_FROM_NAME=Sooqna
EMAIL_FROM_ADDRESS=no-reply@sooqna.site
RESEND_API_KEY=
OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_PEPPER=
ENABLE_DEMO_OTP=false
```

## Tests Performed

- Registration → OTP verify → session cookie + welcome email (server)
- Login → OTP verify → session + safe `next` redirect
- Forgot password → OTP → reset token → new password
- Demo OTP disabled in production build (`NODE_ENV=production`)
- Resend cooldown handling
- Email send failure blocks registration (`EMAIL_SEND_FAILED`)

## Remaining Risks

- OTP store uses JSON file (`otp-requests.json`) — replace with DB/Redis for production scale
- New registrations create in-memory users only; no persistent user DB yet
- Password reset for demo accounts acknowledges success but does not mutate mock passwords
