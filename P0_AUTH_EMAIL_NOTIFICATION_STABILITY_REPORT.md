# P0 — Authentication, Email & Notification Stability Report

**Branch:** `cursor/p0-auth-email-stability-37ba`  
**Date:** 2026-08-19  
**Status:** Code fixes merged onto current `main`; production E2E requires live `DATABASE_URL` + `RESEND_API_KEY` on sooqna.site.

---

## 1. Exact root cause of old login failures

Register and login already called the same code paths (`createStandardUser` / `findUserByEmail` in `services/auth/user-store.ts`) with compatible scrypt hashing (`services/auth/password.service.ts`).

**The failure was storage, not hashing or UI.**

`services/payments/data-store.ts` wrote `users.json` to:

1. An in-process `memoryStore` (lost on every new serverless instance)
2. On Vercel, `/tmp/sooqna-data/users.json` (ephemeral — wiped on freeze, scale-out, deploy)
3. If disk write failed, the API still returned success (memory-only)

**Observed user journey:**

| Step | What happened |
|------|----------------|
| Register | User saved on lambda **A** (`/tmp` + RAM) |
| Verify OTP / session | `sooqna_session` cookie + `localStorage` session opened the account |
| Logout | Session cleared correctly — **user record was NOT deleted** |
| Login | Request hit lambda **B** with empty store → `INVALID_CREDENTIALS` |
| Restart/deploy | All `/tmp` and RAM accounts gone |

Emergency workarounds (`accountProof` in API responses, `sooqna_proof` cookie, `localStorage` account proofs) recreated users on login but were **not durable** and could desync across devices/browsers.

---

## 2. Where old users were stored

| Store | Role | Durable in production? |
|-------|------|------------------------|
| `.data/users.json` / `/tmp/sooqna-data/users.json` | Primary user CRUD (before fix) | **No** on Vercel |
| In-memory `Map` in `data-store.ts` | Per-instance cache | **No** |
| `sooqna_accounts` / `sooqna_proof` cookies | Password-hash vault fallback | **No** (size/expiry/desync) |
| `localStorage` `sooqna-session` | Client UI session mirror | Client-only |
| `localStorage` `sooqna-account-proofs` | Password-hash proofs | Client-only |
| `mock/demo-accounts.mock.ts` | Demo data | **Not wired** to login API |
| Prisma / external DB | — | **Not present** in repo |

No production Postgres `User` model existed before this fix.

---

## 3. Final production authentication source

**One authoritative store:** `services/auth/user-persistence.ts`

| Runtime | Driver | Location |
|---------|--------|----------|
| Production (Vercel/serverless) | **Postgres** | `auth_users` table via `DATABASE_URL` / `POSTGRES_URL` |
| Local long-lived Node | Durable JSON | `.data/sooqna-auth-users.json` (atomic write + verify). **Never `/tmp`.** |

All auth paths use the same store:

- Register (password + OTP)
- Login (password)
- Forgot password (email link + token table)
- OTP verification
- Guest checkout → register conversion
- Profile / admin user edits
- Password reset

**Fail-closed:** Serverless without `DATABASE_URL` throws `AUTH_STORE_NOT_DURABLE` on register/login persistence — no silent memory-only success.

**Removed from production auth flow:**

- OTP/password in API responses (except explicit dev demo mode)
- `accountProof` in login/register API responses
- Client `accountProof` localStorage round-trip on login

Session remains **httpOnly** `sooqna_session` cookie; client `localStorage` session is a UI mirror only (not authoritative).

---

## 4. Existing-user migration / recovery

`migrations/001_auth_users.sql` creates `auth_users`.

On first Postgres connect, legacy users are imported **insert-only** from:

- `.data/users.json`
- `.data/sooqna-auth-users.json`
- `/tmp/sooqna-data/users.json` (best-effort, may be empty)

`ON CONFLICT (normalized_email) DO NOTHING` — **existing DB passwords are never overwritten**.

Accounts only in ephemeral `/tmp` on a past deploy **cannot be recovered** if that file is gone. Users with valid sessions should reset password via forgot-password once Postgres is live.

Guest checkout accounts (`registrationSource: GUEST_CHECKOUT`, no password) convert in-place when the same email registers — same `id`, orders preserved.

---

## 5. Password hashing verification

| Item | Value |
|------|-------|
| Algorithm | scrypt (Node `crypto.scryptSync`) |
| Format | `salt:hash` (hex) |
| Pepper | `PASSWORD_PEPPER` env (default dev pepper if unset) |
| Register | `hashPassword()` in `POST /api/auth/register` |
| Login | `verifyPassword()` in `POST /api/auth/login/password` |
| Reset | `setUserPassword()` bumps `sessionVersion` |

**Do not change `PASSWORD_PEPPER` in production** — invalidates all existing hashes.

Plaintext passwords are never stored or emailed.

---

## 6. OTP verification results

| Requirement | Implementation |
|-------------|----------------|
| 6 digits | `OTP_LENGTH = 6` |
| 10 min expiry | `OTP_EXPIRY_MINUTES` (default 10) |
| Max 5 attempts | `OTP_MAX_ATTEMPTS = 5` |
| Resend cooldown | `OTP_RESEND_COOLDOWN_SECONDS` (default 60) |
| Single use | `verifyOtpCode` invalidates on success |
| Resend invalidates prior | `createOtpRequest` replaces active record |
| Hash only in store | OTP service stores hash, not plaintext |
| No production bypass | `ENABLE_DEMO_OTP=false`; `123456` rejected in production |
| No client leakage | `canRevealOtpToClient()` — false in production; UI fallback gated by `NEXT_PUBLIC_ENABLE_DEMO_OTP` |

Production registration **fails with 503** if Resend cannot deliver OTP (no on-screen fallback).

---

## 7. Resend / email delivery

**Required production env** (see `.env.production.example`):

```
EMAIL_PROVIDER=resend
EMAIL_FROM_NAME=Sooqna
EMAIL_FROM_ADDRESS=no-reply@sooqna.site
RESEND_API_KEY=<secret>
NEXT_PUBLIC_APP_URL=https://sooqna.site
ENABLE_DEMO_OTP=false
NEXT_PUBLIC_ENABLE_DEMO_OTP=false
DATABASE_URL=postgres://...
```

**Agent VM limitation:** `RESEND_API_KEY` and production Postgres are not available in the Cloud Agent environment. API 200 ≠ inbox delivery.

**Verification required on production:**

1. Resend dashboard → Logs for `no-reply@sooqna.site`
2. SPF/DKIM/domain verification for `sooqna.site`
3. Real inbox tests: register OTP, welcome, forgot-password link, listing approval email

Transactional emails use `services/email/transactional-email.ts` with dedupe + pending/sent/failed tracking.

---

## 8. Session & cookie results

| Property | Value |
|----------|-------|
| Cookie name | `sooqna_session` |
| HttpOnly | Yes |
| Secure | Yes in production |
| SameSite | `lax` |
| Domain | `.sooqna.site` via `SESSION_COOKIE_DOMAIN` or host detection |
| Max age | 30 days |
| Logout | `POST /api/auth/logout` clears cookie only — **never deletes user** |

Password reset invalidates sessions via `sessionVersion` increment on `setUserPassword`.

---

## 9. Forgot-password results

**Flow:** email link (not OTP)

1. `POST /api/auth/password/reset/request-link` — generic response (no email enumeration)
2. Email with link → `/reset-password?token=...`
3. `POST /api/auth/password/reset/confirm` — set password, invalidate token
4. Tokens stored in Postgres (`password_reset_tokens`) or durable JSON fallback
5. Login with new password; old password fails

UI: `/forgot-password`, `/reset-password`, link visible on login form.

---

## 10. Notification E2E (architecture)

Unified flow (from merged activity/notifications work):

```
Business event → createNotification (in-app) → email via transactional-email
```

| Event | In-app | Email |
|-------|--------|-------|
| Welcome | ✓ | ✓ (`completeRegistrationWelcome`) |
| Listing submitted | ✓ | ✓ (`emailListingReceived`) |
| Listing approved | ✓ | ✓ (`emailListingApproved`) |
| Listing rejected | ✓ | ✓ |
| Job application | ✓ | ✓ (activity-status-notify) |
| Viewing booking | ✓ | ✓ |
| Order / payment / escrow | ✓ | ✓ |

Header bell (`NotificationBell`) and `/notifications` page both read `GET /api/notifications` — same source.

Email failure is logged and retried; business action (e.g. listing approval) is **not rolled back**.

---

## 11. Production E2E test checklist

Run manually on https://sooqna.site after deploy with `DATABASE_URL` + `RESEND_API_KEY`:

### TEST A — Registration
- [ ] Register new email → row in `auth_users`
- [ ] OTP in real inbox (not in UI/network/console)
- [ ] Verify OTP → account opens
- [ ] Welcome email received

### TEST B — Persistence
- [ ] Logout → login same credentials → PASS
- [ ] Refresh → session valid
- [ ] Redeploy/restart → login → PASS

### TEST C — Forgot password
- [ ] Reset email received
- [ ] Set new password via link
- [ ] Old password fails, new works

### TEST D — Notifications
- [ ] Create listing → under-review notification + email
- [ ] Admin approve → approval notification + email
- [ ] Bell count matches notifications page

### TEST E — Guest checkout
- [ ] Guest order completes
- [ ] Same email register → converts guest, no duplicate user

---

## 12. Remaining risks

| Risk | Mitigation |
|------|------------|
| `DATABASE_URL` not set on Vercel | Register returns 503 `AUTH_STORE_NOT_DURABLE` — configure Postgres before go-live |
| Legacy users only in dead `/tmp` | Forgot-password recovery; cannot auto-migrate |
| `PASSWORD_PEPPER` rotation | Documented — do not rotate without re-hash migration |
| Resend domain/DKIM misconfiguration | Monitor Resend logs; test real inboxes |
| Client `localStorage` session desync | Authoritative session is httpOnly cookie; `/api/auth/me` is source of truth |
| Real E2E not run in agent VM | **Must pass on production before closing P0** |

---

## Validation (agent environment)

```
npm run lint   — PASS (0 errors)
npm run build  — PASS
```

---

## Files changed (summary)

- `services/auth/user-persistence.ts` — Postgres + durable JSON, legacy import
- `services/auth/user-store.ts` — routes through persistence; guest conversion helpers
- `services/auth/password-reset-token.ts` — secure reset tokens
- `services/auth/guest-account.service.ts` — guest does not block registration
- `services/auth/auth-handlers.ts` — production OTP hardening
- `app/api/auth/*` — register, login, reset routes updated
- `features/auth/components/*` — removed accountProof; OTP UI gated
- `migrations/001_auth_users.sql`, `002_password_reset_tokens.sql`
- `.env.production.example` — documents required vars
