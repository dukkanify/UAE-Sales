# OTP Verification System Audit — AviatorPass / AEP

**Date:** 2026-08-24  
**Branch:** `cursor/enterprise-otp-0987`  
**Method:** Full-flow audit before centralized rebuild

## Current state (pre-rebuild)

OTP logic is **split** between `auth-service.ts` (login / reset / booking) and `registration-service.ts` (register). No shared OTP engine. Hashing is inconsistent (HMAC for register, SHA-256 elsewhere). Resend API exists for register only. Platform `otpExpirationMinutes` setting is **not wired** to runtime.

## Findings

| ID  | Severity | Issue                                                                             |
| --- | -------- | --------------------------------------------------------------------------------- |
| O1  | Critical | No centralized OTP service — duplicated issue/verify/email logic                  |
| O2  | Critical | Login/reset/booking use unsalted SHA-256; register uses HMAC                      |
| O3  | High     | Super Admin OTP expiry setting ignored (`AUTH_OTP_EXPIRY_MINUTES` only)           |
| O4  | High     | Resend only for register; other flows can re-request without cooldown enforcement |
| O5  | High     | No expired OTP cleanup job / on-read purge beyond verify path                     |
| O6  | High     | `verify_email` purpose unused; no change-email / 2FA / sensitive-action purposes  |
| O7  | Medium   | Demo OTP may surface in UI whenever API returns it                                |
| O8  | Medium   | Max attempts / lockout / resend cooldown not configurable from settings           |
| O9  | Medium   | Booking OTP UI bypasses shared `OtpInput`                                         |
| O10 | Low      | Email template lacks explicit expiry + support contact block                      |

## Rebuild target

Single `services/auth/otp-service.ts` used by registration, login, password reset, email verification, change-email, sensitive actions, and future 2FA.

Policy from Super Admin authentication settings (+ env fallback). HMAC hashing, single-use, 60s resend, max attempts, lockout, activity logs, fail-closed email for auth OTPs.
