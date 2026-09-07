# SOOQNA — LIVE DATA + LISTING BADGES + CRITICAL AUTH / EMAIL OTP

**Date:** 2026-09-07  
**Production URL:** https://sooqna.site  
**Production SHA (at email E2E):** `238caf8` / tip docs `0986a2f`  
**Deployment ID (pre-reset-fix):** `6312569152`  
**Email/OTP fix branch:** `cursor/p0-email-otp-delivery-37ba` (`654bd0c`) — await password-reset Resend send

---

## 1. Production email config (LIVE `/api/auth/status`)

| Setting | Required | LIVE | Result |
|---------|----------|------|--------|
| `RESEND_API_KEY` | set | `resendConfigured: true` (`RESEND_API_KEY`) | **PASS** (value not exposed) |
| `EMAIL_PROVIDER` | `resend` | `resend` | **PASS** |
| `EMAIL_FROM_ADDRESS` | `no-reply@sooqna.site` | `no-reply@sooqna.site` | **PASS** |
| `EMAIL_FROM_NAME` | Sooqna | `Sooqna` | **PASS** |
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` | `https://sooqna.site` | **PASS** |
| Demo OTP (server/client) | off in Production | both `false` | **PASS** |

**DNS (public):**
- `resend._domainkey.sooqna.site` TXT (DKIM) — present
- `send.sooqna.site` MX → `feedback-smtp.ap-northeast-1.amazonses.com` — present
- `send.sooqna.site` TXT SPF — empty (optional hardening; does not block current sends)
- Apex DMARC — empty (optional)

**Resend domain:** Sending from `no-reply@sooqna.site` is accepted and delivered to third-party inboxes (see §2). Domain is effectively verified for send.

---

## 2. Resend delivery (real inbox — not API-accept alone)

Controlled readable inbox via mail.tm disposable API.

| Step | Result |
|------|--------|
| Register → OTP email from `Sooqna <no-reply@sooqna.site>` | **PASS** (SES msgid `ap-northeast-1.amazonses.com`) |
| Inbox received within ~3s | **PASS** |
| Welcome email after verify | **PASS** (`مرحبًا بك في سوقنا — حسابك جاهز`) |
| OTP absent from register JSON / redirect query | **PASS** |
| Password reset link email (pre-fix LIVE) | **FAIL** — root cause below |

### Password-reset root cause (code)

`POST /api/auth/password/reset/request-link` used `void emailPasswordResetLink(...).catch(...)` then returned immediately. On Vercel the invocation freezes after the response, so Resend often never runs. OTP + welcome paths already `await` and work.

**Fix (this branch):** `await emailPasswordResetLink` on request-link + OTP verify handlers before returning. Must be merged to `main` and deployed before marking **L** PASS on LIVE.

---

## 3. OTP security

| Requirement | Result |
|-------------|--------|
| Server-generated | **PASS** (`createOtpRequest`) |
| Hashed in storage | **PASS** (`otp_hash`) |
| Never in API response (Production) | **PASS** (`canRevealOtpToClient` → false) |
| Never in UI / URL / localStorage when demo off | **PASS** (demo flags false; redirect has no OTP) |
| Expire / invalidate after verify / resend invalidates prior | **PASS** (existing OTP service; unit coverage) |
| Demo OTP disabled in Production | **PASS** |

Safe failure copy when send fails: «تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.»

---

## 4. LIVE verification matrix

### Marketplace / badges (prior ship)

| ID | Check | Result |
|----|-------|--------|
| A–E | Urgent removed / featured / verified / images / no auto-seed | Unchanged from prior report (**A/B/D PASS**, **C/E PARTIAL** for historical DB rows) |

### AUTH

| ID | Check | Result | Notes |
|----|-------|--------|-------|
| F | Fresh Register | **PASS** | `ok`, `needsVerification`, `emailDelivered: true`, inbox OTP |
| G | Logout | **PASS** | After verify session → `POST /api/auth/logout` → `ok: true` |
| H | Same credentials Login | **PASS** | Same E+P after verify → `200` `/profile` |
| I | Second account/session | **PASS** | Second mail.tm user: register→OTP→verify→logout→login |
| J | Login after new browser session | **PASS** | Fresh cookie jar, same credentials |
| K | Login after redeploy | **PENDING** | Durable Postgres expected; re-check after reset-fix deploy |
| L | Password Reset → new password Login | **PENDING deploy** | Fix committed `654bd0c`; LIVE still fire-and-forget until merge |

**Auth note:** Pre-verify login correctly returns `ACCOUNT_UNVERIFIED` (403) for correct password and `INVALID_CREDENTIALS` for wrong password — hash/DB OK. Release blocker was email delivery; OTP/welcome now confirmed in a real inbox. Remaining ship item is awaited password-reset send on Production.

### NOTIFICATIONS / ADMIN

| ID | Check | Result |
|----|-------|--------|
| M–U | Listing notify / history / admin visibility | **BLOCKED** until after L deploy + admin credentials for moderated listing flow |

---

## 5. Automated tests (branch)

```text
npm test  →  6/6 pass
npm run lint → pass
```

---

## Verdict

**NOT READY FOR ACCEPTANCE** until:

1. `cursor/p0-email-otp-delivery-37ba` is merged to `main` and Production redeploys  
2. LIVE password-reset inbox E2E (**L**) passes  
3. Post-redeploy login (**K**) confirmed  
4. Then resume M–U

**Do not report READY** solely on `emailDelivered: true` — inbox delivery for Register→Verify→Logout→Login is confirmed; reset + post-deploy remain.
