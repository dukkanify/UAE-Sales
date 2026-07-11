# Auth Migration Report

## Overview

Migrated from password-required registration/login to **passwordless email OTP** with optional user-created passwords.

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register/request-otp` | POST | Public | Start registration |
| `/api/auth/register/verify-otp` | POST | Public | Activate account + session |
| `/api/auth/login/request-otp` | POST | Public | Send login OTP |
| `/api/auth/login/verify-otp` | POST | Public | Verify login OTP + session |
| `/api/auth/login/password` | POST | Public | Optional password login |
| `/api/auth/otp/resend` | POST | Public | Resend OTP by purpose |
| `/api/auth/password/set/request-otp` | POST | Session | Request set-password OTP |
| `/api/auth/password/set/verify-otp` | POST | Session | Set password after OTP |
| `/api/auth/password/reset/request-otp` | POST | Public | Forgot password OTP |
| `/api/auth/password/reset/verify-otp` | POST | Public | Verify reset OTP → token |
| `/api/auth/password/reset/confirm` | POST | Public | Apply new password |
| `/api/auth/me` | GET | Session | Current user |
| `/api/auth/logout` | POST | Public | Clear session cookie |
| `/api/auth/business/onboarding` | POST | Session | Save business profile |

### Legacy (retained for compatibility)

- `/api/auth/otp/login`, `/api/auth/otp/register`, `/api/auth/otp/verify`
- `/api/auth/otp/forgot-password`, `/api/auth/otp/reset-password`
- `/api/auth/session`

## Database / Storage Changes

| Store | File | Contents |
|-------|------|----------|
| Users | `.data/users.json` | User profiles + `passwordHash` |
| OTP | `.data/otp-requests.json` | Hashed OTP records |
| Reset tokens | `.data/password-reset-tokens.json` | Password reset tokens |
| Rate limits | `.data/auth-rate-limits.json` | Email/IP counters |

## UI Changes

| Screen | Change |
|--------|--------|
| Register | Email only — no password/phone |
| Login | Passwordless primary; optional password toggle |
| `/verify-email` | Dedicated OTP page with auto-submit |
| Profile | Security settings for optional password |
| `/dashboard/business-onboarding` | Post-registration business flow |

## Backward Compatibility

- Demo accounts (`user@sooqna.demo`, etc.) work via OTP and password login
- Legacy OTP API routes unchanged

## Tests Performed

- `npm run lint` ✅
- `npm run build` ✅ (122 routes)

## Remaining Risks

- Migrate JSON stores to persistent database
- Wire `GET /api/auth/me` into profile SSR instead of mock user
