# Auth UI Cleanup Report

## Root Cause

Authentication screens mixed legacy SMS/UAE PASS copy, demo OTP hints in production, and client-side-only verification without email OTP flows.

## Solution

- **Email as primary identifier** for login, register, forgot password
- **UAE PASS hidden** behind `NEXT_PUBLIC_ENABLE_UAE_PASS=false` (default false)
- **No SMS wording** in OTP or auth screens
- **Phone optional** on registration (contact field only)
- **Demo accounts panel** hidden in production
- **Safe `next` redirects** via `shared/utils/safe-next.ts`
- Server-side session cookies set on OTP verify

## Files Changed

| File | Change |
|------|--------|
| `shared/constants/feature-flags.ts` | `isUaePassEnabled()` |
| `features/auth/components/LoginForm.tsx` | Email OTP, UAE PASS behind flag |
| `features/auth/components/RegisterForm.tsx` | Email OTP, optional phone |
| `features/auth/components/OtpVerification.tsx` | Email-only 6-digit UI |
| `features/auth/components/ForgotPasswordForm.tsx` | Full email OTP reset flow |
| `features/auth/components/DemoAccountsPanel.tsx` | Production hidden |
| `features/profile/components/ProfileForm.tsx` | Removed UAE PASS copy |
| `app/profile/page.tsx` | Updated description |
| `shared/utils/safe-next.ts` | Safe relative redirect paths |

## APIs Changed

See `EMAIL_OTP_MIGRATION_REPORT.md` for OTP endpoints.

## Environment Variables

```
NEXT_PUBLIC_ENABLE_UAE_PASS=false
ENABLE_DEMO_OTP=false
```

Plus email/OTP variables for delivery.

## Tests Performed

- Login: email + password → OTP → redirect with safe `next`
- Register: form → email OTP → profile
- Forgot password: email → OTP → new password → login link
- UAE PASS not visible with default flag
- Demo panel not shown in production build
- No SMS/UAE PASS strings in auth UI

## Remaining Risks

- "تذكرني" checkbox on login is UI-only (no persistence wired)
- Email change verification (`EMAIL_CHANGE` purpose) typed but no UI flow yet
- Profile verification badge still reflects `isVerified` from session mock data
