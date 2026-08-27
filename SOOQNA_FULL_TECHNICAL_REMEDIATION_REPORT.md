# Sooqna — Full Technical Remediation Report

**Date:** 2026-08-27  
**Branches / PRs:**  
- `#259` merged — sessions, OTP, listings, notifications  
- `#260` merged as `5903294` on `main` (includes `1a5140e` changes) — orders, escrow evidence, activities, dispute reminders, RBAC save UX  
- Follow-up: `cursor/vercel-dispute-cron-37ba` — `vercel.json` hourly cron for dispute reminders  

**Production:** https://sooqna.site  

Statuses: **PASS** | **PARTIAL** | **FAIL** | **BLOCKED**

Lint/build alone is **not** completion. This report does **not** mark the project COMPLETE.

---

## Production deploy evidence (2026-08-27)

| Check | Result |
|------|--------|
| PR #260 merged to `main` | **PASS** — merge commit `5903294` includes dispute reminders / activities / RBAC / escrow evidence |
| GitHub Deploy Production workflow | **PASS** — run [33069177862](https://github.com/dukkanify/UAE-Sales/actions/runs/33069177862) success |
| GitHub Production deployment | **PASS** — deployment `6122103797` for `5903294`, state `success` |
| sooqna.site serving new routes | **PASS** — `/activities` matched (`x-matched-path: /activities`), title نشاطاتي; `/api/cron/dispute-reminders` exists |
| Postgres auth persistence | **PASS** — `/api/auth/status` → `persistence.driver=postgres`, `databaseConfigured=true` |
| Resend configured | **PASS** — `resendConfigured=true`, `demoOtpServerEnabled=false` |
| Stripe Live keys | **FAIL** — `stripeConfigured=false`, `featuredCheckoutAvailable=false`, webhook `STRIPE_NOT_CONFIGURED` |
| `CRON_SECRET` on Production | **FAIL** — unauthorized POST → `503 CRON_SECRET_REQUIRED` |
| `SESSION_SECRET` on Production | **BLOCKED** — cannot verify presence without Vercel dashboard/MCP (agent has no Vercel token) |
| Vercel Cron schedule | **PARTIAL** — code+`vercel.json` ready; cron not executable until secret + deploy of cron config |
| Agent Vercel MCP / env write | **BLOCKED** — MCP needs desktop auth; `VERCEL_TOKEN` missing |

---

## Production E2E (real)

### Auth
| Step | Status | Evidence |
|------|--------|----------|
| Register (password) | **PASS** | `POST /api/auth/register` → `ok`, `needsVerification`, `emailDelivered:true`, **no `otp` field** |
| OTP not leaked in API | **PASS** | Response keys exclude otp; demo OTP disabled |
| Email verification complete | **BLOCKED** | No agent-readable inbox; cannot finish Verify without OTP from email |
| Login before verify | **PASS** | `403 ACCOUNT_UNVERIFIED` + redirect to verify-email |
| Login / Logout / Login again | **BLOCKED** | Depends on verification |
| Forgot password request | **PASS** (smoke) | `POST .../password/reset/request-link` → `ok` + masked email (enumeration-safe) |
| Reset + login with new password | **BLOCKED** | Needs email link/OTP |
| Duplicate email normalize | **PARTIAL** | Same email hits resend cooldown (`RESEND_COOLDOWN`); full `EMAIL_ALREADY_REGISTERED` after verify not re-proven this run |

### Listing / Featured / Orders / Escrow / Dispute
| Flow | Status | Reason |
|------|--------|--------|
| Listing create → review → approve → publish → search | **BLOCKED** | Needs verified session + admin session |
| Featured → Stripe → approve | **BLOCKED** | Stripe not configured on Production |
| Job apply → activities → admin → notify | **BLOCKED** | Needs auth sessions |
| Property viewing booking | **BLOCKED** | Needs auth sessions |
| Services quote/booking | **BLOCKED** | Needs auth sessions |
| Purchase → payment → escrow | **BLOCKED** | Stripe not configured |
| مضمون evidence upload/confirm | **BLOCKED** | Needs paid escrow order |
| Dispute open + 48h/24h/expired reminders | **BLOCKED** | Needs orders + `CRON_SECRET` + scheduler; cron currently `CRON_SECRET_REQUIRED` |

### Persistence after refresh / redeploy
| Item | Status |
|------|--------|
| Auth users on Postgres | **PASS** (config) |
| Full marketplace E2E persistence proof | **BLOCKED** (flows incomplete) |

### Security smoke (Production)
| Check | Status | Evidence |
|------|--------|----------|
| Notifications unauthenticated | **PASS** | `401 UNAUTHORIZED` |
| Admin users unauthenticated | **PASS** | `401 UNAUTHORIZED` |
| Cron without secret | **PASS** (safe fail-closed) | `503 CRON_SECRET_REQUIRED` until secret set; then must be `401` for bad Bearer |
| Stripe webhook without config | **PASS** (fail-closed) | `503 STRIPE_NOT_CONFIGURED` |
| OTP not in register response | **PASS** | |
| Cross-user leakage / spoofed actions | **BLOCKED** | Needs multi-account authenticated E2E |
| Admin RBAC server-side | **PARTIAL** | Code on `main`; not live-tested with sub-admin session |

### Localization
| Check | Status | Evidence |
|------|--------|----------|
| Arabic default RTL | **PASS** | `dir=rtl` `lang=ar` on `/` |
| English locale cookie LTR | **PARTIAL** | `POST /api/locale` → `sooqna-locale=en`; homepage `dir=ltr` `lang=en`, but **visible Arabic category/UI strings still present** in English shell |
| Full critical E2E AR+EN | **BLOCKED** | Auth/payment flows incomplete |

### Contact form
| Check | Status |
|------|--------|
| Field-level errors | **PASS** | Invalid payload returns `fieldErrors` for name/email/topic/message |

---

## Spreadsheet Tasks 1–27 (honest)

### P0
| Task | Status |
|------|--------|
| 1 Auth / accounts / email | **PARTIAL** — durable register path works; full verify→login→reset E2E **BLOCKED** on inbox + ops |
| 2 Notifications engine | **PARTIAL** — durable + bell/page same API in code; not fully E2E’d live |
| 3 Listing lifecycle | **PARTIAL** — code on main; live approve/publish E2E **BLOCKED** |
| 4 Featured + Stripe | **FAIL** / **BLOCKED** — Production Stripe unset |
| 8–10 Activities | **PARTIAL** — `/activities` live; seller/admin hubs not fully E2E’d |
| 12 RBAC | **PARTIAL** — save UX + guards merged; full matrix **FAIL**; live permission E2E **BLOCKED** |
| 13 مضمون evidence | **PARTIAL** — code merged; live escrow E2E **BLOCKED** (no Stripe) |
| 14 Disputes + reminders | **PARTIAL** — window enforcement + cron route merged; secret/cron/E2E **BLOCKED** |

### P1 / P2
| Tasks | Status |
|-------|--------|
| 5–7 Dynamic forms / categories / search | **PARTIAL** |
| 11 Dashboard export | **PARTIAL** / **FAIL** |
| 15 Ratings | **PARTIAL** |
| 16 Contact field errors | **PASS** (API smoke) |
| 17 Header/footer | **PARTIAL** |
| 18–19 Legal / Abu Dhabi visuals | **PARTIAL** / **FAIL** |
| 20 Upload security / AV / object storage | **PARTIAL** / **FAIL** |
| 21 Audit log | **PARTIAL** |
| 22 Rate limiting | **PARTIAL** (e.g. register cooldown observed) |
| 23 Monitoring/alerts | **FAIL** / **PARTIAL** |
| 24 Backup/recovery docs tested | **BLOCKED** / **FAIL** |
| 25 Complete i18n | **FAIL** / **PARTIAL** — EN page still shows Arabic category labels |
| 26 Performance/mobile QA | **PARTIAL** |
| 27 Automated E2E suite | **FAIL** |

---

## Ops required before COMPLETE

1. Set **Production** `SESSION_SECRET` and `CRON_SECRET` in Vercel (never commit values).  
2. Merge/deploy `vercel.json` cron (`0 * * * *` → `/api/cron/dispute-reminders`).  
3. Confirm cron: no auth → `401`; with Bearer → `{ok:true,...}`; double-run idempotent.  
4. Configure **Stripe Live** keys + webhook secret (Featured + Orders + Escrow).  
5. Provide a real mailbox (or authenticated test accounts) for Register→Verify→Reset and admin approval E2E.  
6. Re-run the full critical flows; only then can status become COMPLETE.

---

## Validation (this agent workspace)

| Check | Result |
|-------|--------|
| `npm run lint` | **PASS** (pre-merge on #260) |
| `npm run build` | **PASS** (pre-merge on #260) |
| Automated tests | **FAIL** / N/A — no suite configured |
| Production E2E complete | **BLOCKED** |

---

## Definition of done (honest)

**Project is NOT COMPLETE.**

`main` includes PR #260 and Production deployment for `5903294` is Ready. Critical durable foundations are live (Postgres auth, activities route, cron endpoint, escrow evidence APIs). Full spreadsheet E2E with payments, verified auth, and dispute reminder delivery remains **BLOCKED** on secrets, Stripe, inbox access, and cron activation.
