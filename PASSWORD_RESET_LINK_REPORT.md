# Password Reset Link Report

## Context

OTP is disabled (`NEXT_PUBLIC_ENABLE_EMAIL_OTP=false`). Forgot-password now uses secure email links.

## Flow

1. User enters email at `/forgot-password`
2. `POST /api/auth/password/reset/request-link`
3. Generic response always (no email enumeration)
4. If account has password: create hashed token, send email
5. User opens `/reset-password?token=...`
6. `POST /api/auth/password/reset/complete-link`
7. Token consumed, password hashed, success message

## Token Security

| Property | Value |
|----------|-------|
| Storage | `password-reset-link-tokens.json` |
| Hash | SHA-256 with pepper |
| TTL | 45 minutes |
| Use | Single-use (`consumedAt`) |

## Email

`sendPasswordResetLinkEmail()` in `services/email/order-email.service.ts`

- Subject: إعادة تعيين كلمة المرور — سوقنا
- Queued to `pending-emails.json` if Resend unavailable
- Order/checkout never fails due to email errors

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `request-link` | 5 / 15 min per IP |
| `complete-link` | 5 / 15 min per IP |

## UI

- `ForgotPasswordForm` — link flow when OTP off, OTP flow when OTP on
- `ResetPasswordContent` + `/reset-password` page

## Does Not

- Send passwords by email
- Reveal if email exists
- Use OTP when flag is false

## Files

- `services/auth/token.service.ts` (`createPasswordResetToken`, `consumePasswordResetToken`)
- `app/api/auth/password/reset/request-link/route.ts`
- `app/api/auth/password/reset/complete-link/route.ts`
- `features/auth/components/ForgotPasswordForm.tsx`
- `features/auth/components/ResetPasswordContent.tsx`
- `app/reset-password/page.tsx`

## QA Matrix

| Case | Expected |
|------|----------|
| Known email with password | Generic success + email queued/sent |
| Unknown email | Same generic success |
| Valid reset link | Password updated |
| Expired/reused token | Generic error |
| OTP disabled UI | No OTP step shown |
