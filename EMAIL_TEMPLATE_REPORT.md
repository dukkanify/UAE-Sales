# Email Template Report

## Provider

- Abstraction: `services/email/email.service.ts`
- Default provider: Resend (`EMAIL_PROVIDER=resend`)
- Dev fallback: console log (subject only, no OTP in production logs)

## Purpose-Specific Functions

| Function | Use case |
|----------|----------|
| `sendRegistrationOtp()` | New account verification |
| `sendLoginOtp()` | Passwordless login |
| `sendSetPasswordOtp()` | Optional password setup |
| `sendPasswordResetOtp()` | Forgot password |
| `sendEmailChangeOtp()` | Email change (typed, no UI yet) |
| `sendWelcomeEmail()` | Post-registration welcome |

## Template Spec

**Subject:** رمز التحقق الخاص بك في سوقنا

**Arabic body (purpose-specific intro):**
- Registration: "استخدم رمز التحقق التالي لإكمال التسجيل في سوقنا:"
- Login: "استخدم رمز التحقق التالي لتسجيل الدخول إلى سوقنا:"
- Set password: "استخدم رمز التحقق التالي لإضافة كلمة مرور لحسابك في سوقنا:"
- Reset: "استخدم رمز التحقق التالي لإعادة تعيين كلمة المرور في سوقنا:"

**Shared footer:**
- Expires in 10 minutes
- Ignore if not requested
- Do not share code
- فريق سوقنا

## Requirements Met

| Requirement | Status |
|-------------|--------|
| Sooqna branding | ✅ Header in HTML |
| Responsive RTL | ✅ Tahoma, RTL direction |
| Plain-text fallback | ✅ `buildOtpEmailText()` |
| Clear OTP block | ✅ Large centered digits |
| No password in email | ✅ OTP only |
| No demo wording in production | ✅ No dev text in template |
| No raw template variables | ✅ Interpolated before send |

## Environment Variables

```
EMAIL_PROVIDER=resend
EMAIL_FROM_NAME=Sooqna
EMAIL_FROM_ADDRESS=no-reply@sooqna.site
RESEND_API_KEY=
```

## Tests Performed

- Template renders with Arabic intro per purpose
- Dev mode logs without exposing OTP in production code path
- `EMAIL_SEND_FAILED` thrown in production when provider unavailable

## Remaining Risks

- Logo is text-only ("سوقنا Sooqna") — add hosted image URL when CDN asset available
- No email localization for English users yet
