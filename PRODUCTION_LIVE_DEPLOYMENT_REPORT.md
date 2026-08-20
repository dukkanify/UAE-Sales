# Production Live Deployment Report — Sooqna

**Date:** 2026-08-20  
**Target:** https://sooqna.site  
**Production commit (main):** `aedea1c` — docs(qa): confirm auth live but resend still missing on production runtime  
**PR #230:** merged (`92d770f`) — auth/Postgres/Resend code path live  
**Overall status:** ⚠️ **NOT COMPLETE** — site is LIVE; email/Resend not active at runtime

---

## Deployment status

| Check | Result |
|-------|--------|
| Latest code on `main` | ✅ PR #230 merged |
| `npm run lint` | ✅ Pass |
| `npm run build` | ✅ Pass |
| Vercel Production deploy | ✅ Site serves latest routes (`/api/auth/status` returns 200) |
| GitHub Deploy workflow | ✅ Runs on push to `main` (hook may warn if `VERCEL_DEPLOY_HOOK` unset) |
| Agent can set Vercel env vars | ❌ Vercel MCP **needsAuth**; no `VERCEL_TOKEN` in agent environment |

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

## Remaining blocker — ONE required approval

**The agent cannot write Vercel Production environment variables without authenticated Vercel access.**

### Single action required from you

> **In Cursor: Settings → MCP → Vercel → Connect/Authenticate**, then reply **"retry resend setup"**.

This grants the agent permission to set Production env vars (`RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `NEXT_PUBLIC_APP_URL`) via the connected integration **without you manually editing variables**.

If Vercel MCP auth is unavailable, the fallback single action is:

> **In Vercel Dashboard → sooqna → Settings → Environment Variables → add the three missing Production vars reported by `/api/auth/status` → Redeploy Production.**

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
