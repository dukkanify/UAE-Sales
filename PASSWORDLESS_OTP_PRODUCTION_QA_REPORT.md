# Passwordless OTP Production QA Report

**PR:** #26 (`cursor/passwordless-email-otp-37ba`)  
**Date:** 2026-07-11  
**Scope:** Production readiness verification only — no new features, no redesign.

---

## 1. Email Delivery

| Check | Result | Notes |
|-------|--------|-------|
| `RESEND_API_KEY` configured | ⚠️ Manual | Not available in CI/agent environment. Must be set in Vercel production dashboard. |
| `EMAIL_FROM_ADDRESS` verified domain | ⚠️ Manual | Default `no-reply@sooqna.site` — confirm domain verified in Resend for `sooqna.site`. |
| Real OTP email send | ⚠️ Manual | Requires live `RESEND_API_KEY` on Vercel. Dev falls back to console (subject only, no OTP). |
| Arabic HTML template | ✅ Pass | RTL layout, Arabic intro per purpose in `services/email/email.service.ts` |
| Plain-text fallback | ✅ Pass | `buildOtpEmailText()` included in every OTP email |
| No OTP in logs | ✅ Pass | Production: throws on failure, no OTP logged. Dev: logs `to` + `subject` only (no OTP, no body). |

**Fix applied:** On email send failure, OTP record is invalidated and pending registration user is rolled back.

---

## 2. Demo OTP Safety

| Check | Result | Evidence |
|-------|--------|----------|
| `ENABLE_DEMO_OTP=false` in production | ✅ Pass | `.env.production.example` documents `false` |
| `123456` fails in production | ✅ Pass | `NODE_ENV=production ENABLE_DEMO_OTP=false` → generated codes ≠ `123456` |
| Demo OTP local-only | ✅ Pass | `isDemoOtpEnabled()` requires **both** `NODE_ENV !== "production"` **and** `ENABLE_DEMO_OTP=true` |
| Automated script | ✅ Pass | `scripts/verify-passwordless-otp.ts` — 9/9 checks |

---

## 3. Registration

| Check | Result | Evidence |
|-------|--------|----------|
| Email-only form fields | ✅ Pass | `RegisterForm` — name, email, account type, terms only |
| OTP request API | ✅ Pass | `POST /api/auth/register/request-otp` → generic Arabic response |
| Correct OTP activates account | ✅ Pass | `verify-otp` → `activateUser` + `setSessionCookie` |
| Auto session + redirect | ✅ Pass | Returns `user` + `redirectTo` (individual `/profile`, company `/dashboard/business-onboarding`) |
| Reused OTP fails | ✅ Pass | Script: second verify → `NOT_FOUND` |
| Email failure blocks activation | ✅ Pass | `503` + pending user deleted; no session created |
| Refresh preserves session | ✅ Pass | HttpOnly cookie + localStorage sync via `persistSessionCookie` |

---

## 4. Login

| Check | Result | Evidence |
|-------|--------|----------|
| Passwordless OTP login | ✅ Pass | `POST /api/auth/login/request-otp` → `/verify-email` |
| Password login (demo) | ✅ Pass | `user@sooqna.demo` + `User@123` → session + `redirectTo` |
| OTP login for demo users | ✅ Pass | Demo users seeded in `users.json`; OTP sent on request |
| Generic unknown email | ✅ Pass | Same message for unknown: `إذا كان البريد صالحًا...` |
| Safe `next` redirect | ✅ Pass | `next=https://evil.com` → `redirectTo: "/profile"` |

---

## 5. OTP Security

| Check | Result | Evidence |
|-------|--------|----------|
| 10-minute expiry | ✅ Pass | `OTP_EXPIRY_MINUTES=10` default |
| Max 5 attempts | ✅ Pass | Wrong code → `attemptsRemaining: 4` |
| Resend cooldown 60s | ✅ Pass | `RESEND_COOLDOWN` error + Arabic message |
| Old OTP after resend | ✅ Pass | New request replaces prior record for same email+purpose |
| Purpose-bound | ✅ Pass | LOGIN code rejected for REGISTER purpose |
| Hash-only storage | ✅ Pass | `otpHash` SHA-256, never plaintext in `.data/otp-requests.json` |

---

## 6. Error Handling (Arabic)

| Scenario | Message | Status |
|----------|---------|--------|
| Email send failure | تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى. | ✅ |
| Invalid code | رمز التحقق غير صحيح. (+ attempts remaining) | ✅ |
| Expired code | انتهت صلاحية الرمز. اطلب رمزًا جديدًا. | ✅ |
| Too many attempts | تجاوزت الحد المسموح من المحاولات. | ✅ |
| Resend cooldown | يرجى الانتظار قبل إعادة إرسال الرمز. (N ثانية) | ✅ |
| Session failure | تعذر إنشاء الجلسة. يرجى المحاولة مرة أخرى. | ✅ Fixed |

---

## 7. Production Environment Audit

| Variable | Expected | Documented |
|----------|----------|------------|
| `RESEND_API_KEY` | Set in Vercel | `.env.production.example` |
| `EMAIL_PROVIDER` | `resend` | ✅ |
| `EMAIL_FROM_NAME` | `Sooqna` | ✅ |
| `EMAIL_FROM_ADDRESS` | `no-reply@sooqna.site` | ✅ |
| `ENABLE_DEMO_OTP` | `false` | ✅ |
| `OTP_EXPIRY_MINUTES` | `10` | ✅ |
| `OTP_RESEND_COOLDOWN_SECONDS` | `60` | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` | ✅ |
| `PASSWORD_PEPPER` | Set (non-empty) | ✅ Added to `.env.production.example` |

---

## 8. QA Matrix

| Flow | Automated | Manual |
|------|-----------|--------|
| Desktop / Mobile / RTL | — | ⚠️ Requires browser QA on live deploy |
| Register → verify → profile | API partial | ⚠️ Full E2E with real email |
| Login OTP | API partial | ⚠️ Full E2E with real email |
| Forgot password | Code review | ⚠️ Manual |
| Set password | Code review | ⚠️ Manual |
| Business onboarding | Route exists | ⚠️ Manual |
| Logout / re-login | `GET /api/auth/me` → 401 | ⚠️ Manual |

---

## Fixes Applied in This Pass

1. Roll back pending user if registration OTP email fails
2. Invalidate OTP record if email delivery fails after creation
3. Arabic resend cooldown message in API + UI
4. Session creation failure handling (API + `VerifyEmailContent`)
5. `persistSessionCookie` returns boolean; blocks redirect on failure
6. Build fix: Arabic string encoding in `OtpVerification` resend handler
7. Added `scripts/verify-passwordless-otp.ts` for automated OTP security checks
8. Added `PASSWORD_PEPPER` to production env example

---

## Validation Commands

```bash
npm run lint          # ✅ Pass
npm run build         # ✅ Pass (122 routes)
npx tsx scripts/verify-passwordless-otp.ts   # ✅ 9/9
NODE_ENV=production ENABLE_DEMO_OTP=false npx tsx scripts/verify-passwordless-otp.ts  # ✅ 9/9
```

---

## Remaining Risks

1. **Live email delivery** — Must confirm `RESEND_API_KEY` and domain verification on Vercel before production OTP works end-to-end.
2. **JSON user/OTP stores** — Not durable across serverless instances; acceptable for demo, needs DB for scale.
3. **Rate limits** — File-based; reset on cold start in serverless.
4. **Browser E2E** — Full register/login/forgot-password flows need manual smoke test on https://sooqna.site after deploy.

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Real OTP email delivery works | ⚠️ Pending Vercel `RESEND_API_KEY` |
| Demo OTP disabled in production | ✅ |
| Account activates and opens automatically | ✅ |
| No password ever emailed | ✅ |
| Existing password accounts work | ✅ |
| No redirect loop or session bug | ✅ (safe `next`, session failure handled) |
