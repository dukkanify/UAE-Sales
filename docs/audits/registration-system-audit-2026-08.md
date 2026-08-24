# Registration System Audit — AviatorPass / AEP

**Date:** 2026-08-24  
**Branch:** `cursor/enterprise-registration-0987`  
**Method:** Full flow inspection before rebuild (Phase 1)

## Current architecture (before rebuild)

Landing → Register (name/email/role only) → OTP request (no user yet) → Email/outbox → Verify OTP → Create user → Session → Complete profile (students) → Dashboard

Auth runtime uses `.data/aep-auth.json` (not live Supabase). SQL/Prisma schemas exist but are largely unwired.

## Critical / High findings

| ID  | Severity | Area              | Issue                                                                            |
| --- | -------- | ----------------- | -------------------------------------------------------------------------------- |
| R1  | Critical | Store             | JSON file store — no unique constraints; race can duplicate emails               |
| R2  | Critical | OTP API           | CSRF check on `/api/auth/otp/request` is a no-op                                 |
| R3  | Critical | OTP email         | `requestOtp` returns success even when email delivery fails                      |
| R4  | High     | Register form     | Missing phone, country, nationality, password, terms, privacy, marketing consent |
| R5  | High     | Password          | Forgot/reset sets password but login is OTP-only — confusing dead-end UX         |
| R6  | High     | Phone             | No uniqueness / normalization                                                    |
| R7  | High     | OTP UX            | No resend, email editable on verify, demo OTP always advertised                  |
| R8  | High     | Secrets           | Weak default `AUTH_SECRET` only warns in production                              |
| R9  | High     | Session           | Middleware trusts JWT without revocation check                                   |
| R10 | High     | Instructor        | Approval setting default off; no approve API/UI                                  |
| R11 | High     | v1 OTP            | Weaker validation / no CSRF on mobile API routes                                 |
| R12 | High     | Email kill-switch | Global emailNotifications can block OTP delivery                                 |

## Medium / Low findings

| ID  | Severity | Issue                                            |
| --- | -------- | ------------------------------------------------ |
| R13 | Medium   | No per-user notification preferences             |
| R14 | Medium   | OTP hashed with unsalted SHA-256                 |
| R15 | Medium   | Rate limit is in-memory only                     |
| R16 | Medium   | `LOGIN_FAILED` defined but not logged on bad OTP |
| R17 | Medium   | `next` redirect query ignored after login        |
| R18 | Medium   | Phone validation is length-only                  |
| R19 | Low      | `OtpInput` component unused                      |
| R20 | Low      | Admin alert always says “New student”            |

## Ideal enterprise flow (rebuild target)

Landing → Register → Validate → Pending registration + password hash → OTP → Email (fail closed) → Verify OTP → Atomic user + profile + role + notification prefs + security settings + activity log → Session → Dashboard / complete-profile / instructor-pending

## Acceptance after rebuild

- Enterprise register form with all required fields
- Unique email + phone
- Strong password rules + confirm
- Terms + privacy required; marketing optional
- OTP: 6 digits, expiry, resend timer, max attempts, invalidate on resend
- Fail closed if OTP email fails
- CSRF on mutating auth routes
- Atomic account creation on verify
- Activity logs for registration lifecycle
- Friendly errors; no console/type/lint regressions
