# Sooqna — Authentication Persistence Fix

**Status:** Fixed at the storage layer. Register and login now share one durable user store.  
**Branch:** `cursor/auth-persistence-fix-37ba`

## Exact root cause

Register and login already used the same functions (`createStandardUser` / `findUserByEmail` in `services/auth/user-store.ts`) and the same scrypt hasher (`services/auth/password.service.ts`).

The account still disappeared after logout because **users were not written to a durable database**.

`services/payments/data-store.ts` persisted `users.json` like this:

1. In-process `memoryStore` (dies on every new serverless instance)
2. On Vercel, the writable path is **`/tmp/sooqna-data`** (wiped on freeze, scale-out, and deploy)
3. If the filesystem write failed, the write was treated as success anyway (memory only)

What the user experienced:

1. **Register** wrote the hashed user on instance A (`/tmp` + RAM).
2. Email OTP + `setSessionCookie` opened the account immediately (session cookie + `localStorage` session). That does not require a shared user DB.
3. **Logout** correctly cleared only `sooqna_session` (and the client session key). It did **not** delete the user.
4. **Login** hit instance B (cold start / another lambda). `users.json` was empty. Password verify never ran against the registered hash.
5. Cookie vault (`sooqna_accounts` / `sooqna_proof`) and `localStorage` `accountProof` were emergency workarounds. They are not a production user database. If those cookies were dropped (size / `cookies().set` vs `NextResponse`) or localStorage had no proof, login returned **`بيانات الدخول غير صحيحة.`**

That is why:

- Register → use account **worked**
- Logout → login with the same email/password **failed**
- A server restart/deploy made it worse (accounts lived in RAM/`/tmp`)

### Where Register stored the user (before)

- `POST /api/auth/register` → `createStandardUser` → `saveCollection("users.json")`
- Backend: `.data/users.json` locally, **`/tmp/sooqna-data/users.json` on Vercel**, plus RAM cache
- Side channels (not authoritative): `sooqna_accounts` cookie, `sooqna_proof` cookie, `sooqna-account-proofs` in `localStorage`

### Where Login searched (before)

- `POST /api/auth/login/password` → `findUserByEmail` → same `users.json` loader
- If missing: restore from `accountProof` body / `sooqna_proof` cookie into that same ephemeral store

Register and login were the same repository **in code**, but that repository was **not durable in production**. Two instances did not share users.

## Fix

One authoritative store for all auth paths (password register, OTP register, guest checkout conversion, password reset, admin user edits):

| Runtime | Driver | Location |
|---------|--------|----------|
| Production / Vercel / Lambda | **Postgres** | `auth_users` table via `DATABASE_URL` or `POSTGRES_URL` |
| Local / long-lived Node | Durable JSON file | `.data/sooqna-auth-users.json` (atomic write + read-back verify). **Never `/tmp`.** |

Serverless without `DATABASE_URL` now **fails closed** on register (`AUTH_STORE_NOT_DURABLE`) instead of pretending the account was saved.

Migration `migrations/001_auth_users.sql` creates `auth_users`. On first Postgres connect, existing `users.json` / `/tmp` JSON is **imported insert-only** (`ON CONFLICT DO NOTHING`). Existing passwords are never overwritten. No production rows are deleted.

Guest checkout accounts (`registrationSource: GUEST_CHECKOUT`, no password) stay in the same table. A later Register on that email **converts the same user id** (sets `passwordHash`, `isGuestConverted`) instead of colliding or creating a second account.

## Password hashing

Unchanged algorithm; register and login still use the same helpers:

- `hashPassword` / `verifyPassword` in `services/auth/password.service.ts`
- scrypt, format `salt:hash`, pepper `PASSWORD_PEPPER` (default `sooqna-password-pepper` if unset)
- Plain-text passwords are never stored. E2E confirmed the file contains only the scrypt string.

**Do not change `PASSWORD_PEPPER` in production.** Changing it would invalidate existing hashes.

## Email normalization

Register, login, guest checkout, and the store all use **`trim().toLowerCase()`** (`normalizeAuthEmail` / `normalizeEmail`). Stored `email` and `normalizedEmail` are the same normalized value.

## Existing email

Registration with an already-registered email (password or verified) returns **409**:

`يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل. يمكنك تسجيل الدخول.`

Incorrect password still returns:

`بيانات الدخول غير صحيحة.`

## Session

| Check | Result |
|-------|--------|
| Session cookie after login | `sooqna_session` set |
| Survives refresh | `GET /api/auth/me` returns the user |
| Logout | `POST /api/auth/logout` and `DELETE /api/auth/session` clear **only** the session cookie |
| New login | Fresh `sooqna_session` |
| Production flags | `HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=2592000` |
| `sooqna.site` | `SESSION_COOKIE_DOMAIN=.sooqna.site` (unchanged) |

Logout does not delete `auth_users` / the JSON user file.

## Production architecture audit

| Old flow | Production status after this fix |
|----------|----------------------------------|
| Demo `@sooqna.demo` | Filtered from listings; not the live register/login path |
| Email OTP | Still used to **verify** password registration. OTP-only register remains behind `NEXT_PUBLIC_ENABLE_EMAIL_OTP` (off on sooqna.site) |
| Guest checkout | Same user table; convertible; does not block a later password register |
| Temporary / vault / localStorage proofs | Recovery import only if the durable row is missing. Not the source of truth |
| Passwordless login | Flag off; password login is the live path |
| Mock users | `mock/users.mock.ts` is marketplace sellers, not auth |
| Prisma | Not added (previous Cloud installs failed on `prisma generate`). Postgres via `pg` + SQL migration |
| JSON `data-store` `/tmp` | **No longer used for users** |

## Database row after registration (E2E)

Example account `persist.1787113096@sooqna.test`:

| Field | Value |
|-------|--------|
| id | `user-1787113096680-f7389e88` |
| email / normalizedEmail | `persist.1787113096@sooqna.test` |
| passwordHash | scrypt `salt:hash` (161 chars), not plaintext |
| accountType | `individual` |
| accountStatus | `pending` at insert → `active` after OTP |
| createdAt | `2026-08-19T04:18:16.680Z` |

## E2E results

New email, production `next start`, no `accountProof` in the login body.

| Step | Result |
|------|--------|
| Register | PASS — user written to `.data/sooqna-auth-users.json` with hash |
| OTP verify — account opens | PASS — session cookie, `GET /api/auth/me` |
| Logout | PASS — `/api/auth/me` → `UNAUTHORIZED`; user file unchanged |
| Login same email/password | PASS |
| Refresh (`GET /api/auth/me`) | PASS |
| Logout | PASS |
| Wrong password | PASS — `بيانات الدخول غير صحيحة.` |
| Register same email again | PASS — required Arabic already-registered message |
| Login again | PASS |
| **New Node process** (port 3066, empty RAM) + login | PASS — proves the account is not memory-only |

sooqna.site production login after this deploy still requires **`DATABASE_URL`** (Neon / Vercel Postgres). Without it, Vercel cannot keep users across instances. Set the URL, deploy, do **not** reset the database. The first boot imports any leftover JSON without overwriting existing rows.

## Validation

- `npm run lint` — pass
- `npm run build` — pass

## Deploy note

Set on Vercel **before** this reaches production traffic:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST/DB?sslmode=require
PASSWORD_PEPPER=<unchanged existing value>
SESSION_COOKIE_DOMAIN=.sooqna.site
```
