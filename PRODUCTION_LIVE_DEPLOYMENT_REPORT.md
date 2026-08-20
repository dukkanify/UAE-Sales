# Production Live Deployment Report — Sooqna

**Date:** 2026-08-20  
**Target:** https://sooqna.site  
**Production commit (main):** `95d0f08` (this report) / latest `main`  
**PR #230:** merged (`92d770f`) — auth/Postgres/Resend code path live  
**Overall status:** ⚠️ **NOT COMPLETE** — site is LIVE; email/Resend still not active at runtime after MCP retry

---

## Deployment status

| Check | Result |
|-------|--------|
| Latest code on `main` | ✅ PR #230 merged |
| `npm run lint` | ✅ Pass |
| `npm run build` | ✅ Pass |
| Vercel Production deploy | ✅ Site serves latest routes (`/api/auth/status` returns 200) |
| GitHub Deploy workflow | ✅ Runs on push to `main` (hook may warn if `VERCEL_DEPLOY_HOOK` unset) |
| Agent can set Vercel env vars | ❌ Cloud Agent Vercel MCP still `needsAuth`. Interactive MCP auth is **desktop IDE only** — this environment cannot complete `mcp_auth`. No `VERCEL_TOKEN` in the agent VM. |

---

## Live domain status

| URL | Result |
|-----|--------|
| https://sooqna.site | **HTTP 200** ✅ |
| https://www.sooqna.site | ❌ DNS/connect failure from verification host (`curl exit 6`) — apex works; **www subdomain may need DNS record** |
| localhost URLs in homepage HTML | ✅ None detected |

---

## Database status (Neon/Postgres)

Verified via `GET https://sooqna.site/api/auth/status`:

```json
{
  "ok": true,
  "persistence": {
    "driver": "postgres",
    "durable": true,
    "location": "postgres:auth_users"
  }
}
```

- ✅ Production auth uses **Postgres**, not `/tmp`
- ✅ Registration persists users (login returns `ACCOUNT_UNVERIFIED` for new pending users)
- ✅ No duplicate-email creation observed on re-register for pending accounts

---

## Resend status

Verified via `/api/auth/status` (2026-08-20):

```json
{
  "resendConfigured": false,
  "missing": [
    "RESEND_API_KEY",
    "EMAIL_FROM_ADDRESS",
    "NEXT_PUBLIC_APP_URL"
  ],
  "emailFromAddress": null,
  "appUrl": null
}
```

Registration smoke test:

```json
{
  "ok": true,
  "emailDelivered": false,
  "otp": null,
  "message": "تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى."
}
```

- ❌ **Resend is NOT configured on Production runtime** (despite user-reported integration install)
- ✅ OTP **not exposed** in API when email fails (`otp: null`)
- ❌ Cannot verify Resend delivery logs (no Resend API/dashboard access from agent)
- ❌ Cannot verify domain SPF/DKIM from agent (requires Resend/Vercel authenticated access)

**Expected sender (when configured):** `Sooqna <no-reply@sooqna.site>`

---

## Auth E2E status

| Step | Status | Notes |
|------|--------|-------|
| Register (API) | ⚠️ Partial | User saved; `emailDelivered: false` |
| OTP in inbox | ❌ Blocked | Resend env missing |
| Verify OTP | ❌ Not tested | Requires inbox OTP |
| Account active | ❌ Not tested | Requires OTP verify |
| Welcome email | ❌ Not tested | Requires Resend |
| Logout → Login | ❌ Not tested | Requires verified account |
| Session refresh | ❌ Not tested | Requires verified session |
| Forgot/Reset password | ❌ Not tested | Requires Resend delivery |
| Pending account recovery | ✅ Partial | Re-register + resend API work; no OTP delivery |
| OTP leak (API/UI/URL) | ✅ Pass | `otp: null`; redirect uses `emailDelivered=0` only |

---

## Email delivery status

| Email type | Delivered | Verified in inbox |
|------------|-----------|-------------------|
| Registration OTP | ❌ | ❌ |
| Welcome | ❌ | ❌ |
| Password reset | ❌ | ❌ |
| Listing / order / job / booking transactional | ❌ | ❌ Not tested (blocked by Resend) |

**Resend log check:** Not accessible from this agent environment.

---

## Critical smoke-test results (live production)

| Route | HTTP |
|-------|------|
| `/` | 200 ✅ |
| `/login` | 200 ✅ |
| `/register` | 200 ✅ |
| `/search` | 200 ✅ |
| `/categories` | 200 ✅ |
| `/listings/new` | 200 ✅ |
| `/api/auth/status` | 200 ✅ |

Not fully automated in this run (requires browser/session): mobile layout, RTL/EN locale switch, admin listing approval flow, in-app + email notification pairs.

---

## What the agent attempted automatically

1. Synced and verified `main` includes PR #230 auth fixes
2. Ran `npm run lint` and `npm run build` — both pass
3. Queried live `/api/auth/status`, registration, login, pending recovery APIs
4. Attempted GitHub workflow dispatch — **403** (integration lacks permission)
5. Attempted GitHub secrets/variables — **403**
6. Vercel MCP — **needsAuth** (no tools available)
7. No `VERCEL_TOKEN` / `RESEND_API_KEY` in agent environment (cannot call Vercel/Resend APIs)

---

## Remaining blocker — ONE required click

**Cloud Agent cannot write Vercel Production env vars.** Vercel MCP in this run remains `needsAuth`. Calling `mcp_auth` returns: *Interactive MCP authentication is only available in the Cursor desktop IDE.*

Production runtime (`GET /api/auth/status`, 2026-08-20 retry) still reports:

`resendConfigured=false`  
`missing=["RESEND_API_KEY","EMAIL_FROM_ADDRESS","NEXT_PUBLIC_APP_URL"]`

### Single action required

> **Vercel → project `sooqna` → Settings → Environment Variables → Production:** add `RESEND_API_KEY` (from the installed Resend integration), `EMAIL_FROM_ADDRESS=no-reply@sooqna.site`, `NEXT_PUBLIC_APP_URL=https://sooqna.site` (plus `EMAIL_PROVIDER=resend`, `EMAIL_FROM_NAME=Sooqna`, `ENABLE_DEMO_OTP=false`, `NEXT_PUBLIC_ENABLE_DEMO_OTP=false`) **then Redeploy Production.**

Do not add these to Preview-only. After Redeploy, `/api/auth/status` must show `resendConfigured=true` and `missing=[]`. Then reply **retry E2E**.

---

## Completion criteria (not yet met)

- [ ] `resendConfigured = true`
- [ ] `missing = []`
- [ ] Real OTP email delivered
- [ ] Welcome email delivered
- [ ] Reset email delivered
- [ ] Full login/logout/re-login E2E
- [ ] Transactional email smoke tests
- [ ] www.sooqna.site redirect (DNS may need CNAME for `www`)

**Do not mark P0 COMPLETE until the above pass with real inbox confirmation.**
