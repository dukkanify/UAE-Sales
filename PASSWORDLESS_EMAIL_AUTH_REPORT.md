# Passwordless Email Auth Report

## Final User Flows

### Registration (email only)
1. User enters full name, email, account type (فرد/شركة), accepts terms
2. `POST /api/auth/register/request-otp` creates pending user + sends OTP
3. Redirect to `/verify-email?purpose=REGISTER`
4. User enters 6-digit OTP (auto-submit on completion)
5. `POST /api/auth/register/verify-otp` activates account, creates session, sends welcome email
6. Auto-redirect: individual → `/profile`, company → `/dashboard/business-onboarding`

### Login (passwordless primary)
1. User enters email → `POST /api/auth/login/request-otp`
2. Redirect to `/verify-email?purpose=LOGIN`
3. OTP verify → session created → safe `next` redirect
4. Optional: toggle "الدخول بكلمة المرور" for demo/password accounts

### Optional password
1. Profile → Security → "إضافة كلمة مرور"
2. Email OTP (`SET_PASSWORD`) + user-chosen password
3. Password hashed with scrypt; never emailed

### Forgot password
1. Email → `PASSWORD_RESET` OTP → new password (never emailed)

### Business onboarding
1. After company registration verify → `/dashboard/business-onboarding`
2. Business name, license, emirate, category, phone → `/dashboard/listings`

## Files Changed

| Area | Key files |
|------|-----------|
| Types | `types/domain/user.ts`, `types/domain/otp.ts` |
| User store | `services/auth/user-store.ts` |
| Password | `services/auth/password.service.ts` |
| OTP | `services/otp/otp.service.ts`, `services/otp/otp-config.ts` |
| Email | `services/email/email.service.ts` |
| API | `app/api/auth/register/*`, `login/*`, `password/*`, `otp/resend`, `me`, `logout`, `business/onboarding` |
| UI | `RegisterForm`, `LoginForm`, `OtpVerification`, `VerifyEmailContent`, `/verify-email`, `SecuritySettingsPanel`, `BusinessOnboardingForm` |
| Analytics | `services/analytics/auth-events.ts` |

## APIs

See `AUTH_MIGRATION_REPORT.md` for full endpoint list.

## Environment Variables

```
EMAIL_PROVIDER=resend
EMAIL_FROM_NAME=Sooqna
EMAIL_FROM_ADDRESS=no-reply@sooqna.site
RESEND_API_KEY=
OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
ENABLE_DEMO_OTP=true   # local only; false in production
PASSWORD_PEPPER=
```

## Tests Performed

- `npm run lint` — pass (warnings only)
- `npm run build` — pass (122 routes)
- Registration form: no password/phone fields
- Login: passwordless primary + optional password toggle
- Verify-email page with auto-submit OTP
- Demo OTP requires `ENABLE_DEMO_OTP=true` AND non-production

## Remaining Risks

- User store is JSON file (`.data/users.json`) — migrate to DB for scale
- Demo accounts still use mock passwords for backward-compat password login
- `getCurrentUser()` server stub still returns mock user on profile page SSR
