# Sooqna — Full Technical Remediation Report

**Branch:** `cursor/full-technical-remediation-37ba`  
**Date:** 2026-08-27  
**Scope:** Production readiness vs attached technical notes (Tasks 1–27)

This report uses:

- **PASS** — implemented + durable path ready for production DB
- **PARTIAL** — core path improved; remaining gaps listed
- **FAIL** — not yet meeting definition of done
- **BLOCKED** — needs production secrets / ops outside code

Lint/build alone is **not** treated as completion.

---

## Executive summary

P0 foundation work landed in this iteration:

1. **Signed sessions** (HMAC) — client can no longer forge admin cookies via `POST /api/auth/session`
2. **OTP / Notifications / Listings / Featured payments** moved off ephemeral Vercel `/tmp` JSON onto **Postgres when `DATABASE_URL` is set**, with durable `.data` JSON fallback locally
3. Listing create forces **moderation (`pending_review`)**; public detail hides non-`active` listings except owner/admin
4. Notification dedupe keys + unified `dispatchPlatformNotification` helper

**Not complete:** Orders/escrow/disputes/activity stores, full dynamic category builder, RBAC depth, E2E suite, and many P1/P2 UX items remain **PARTIAL/FAIL**.

---

## P0 Critical

### Task 1 — Authentication, Accounts & Email

| Requirement | Status | Notes |
|-------------|--------|-------|
| Register → Verify → Activate → Login | **PARTIAL** | Flow exists; users durable in Postgres |
| Same user repository | **PASS** | `user-store` + `user-persistence` |
| Duplicate email (normalize/lowercase) | **PASS** | Unique `normalized_email` |
| Password hashed | **PASS** | scrypt + pepper |
| Logout deletes session only | **PASS** | `DELETE /api/auth/session` clears cookie |
| Survives refresh / redeploy | **PASS** (with DB) | Requires `DATABASE_URL` |
| Forgot / reset password | **PASS** | Link + OTP paths; tokens in Postgres |
| New password works | **PASS** | `sessionVersion` bump invalidates old sessions |
| Appear in Admin Users | **PASS** | |
| My Listings isolation | **PASS** (API) | Seller id forced on create; filter by seller |
| Signed session / middleware | **PASS** (this PR) | `session-token.ts`; forge POST removed |
| OTP email only (no UI/API leak) | **PASS** (prod) | `canRevealOtpToClient` false unless demo |
| Welcome email | **PARTIAL** | Exists; depends on Resend |
| OTP durable store | **PASS** (this PR) | `otp_requests` table / durable JSON |

**Root causes fixed:** unsigned session cookie; forgeable `POST /api/auth/session`; OTP on `/tmp` data-store.

**Files:** `session-token.ts`, `session-cookie.ts`, `session-sync.ts`, `app/api/auth/session/route.ts`, `proxy.ts`, `otp.service.ts`, `require-session.ts`

**Prod env:** `DATABASE_URL`, `PASSWORD_PEPPER`, `SESSION_SECRET` (or `NEXTAUTH_SECRET`), `RESEND_API_KEY`, `OTP_PEPPER`

**E2E proof on production:** **BLOCKED** until keys + live register cycle verified manually.

---

### Task 2 — Unified Notifications + Email

| Requirement | Status | Notes |
|-------------|--------|-------|
| Single in-app source (bell + page) | **PASS** | Shared `/api/notifications` |
| Durable store | **PASS** (this PR) | `app_notifications` Postgres |
| Dedupe | **PARTIAL** | `dedupeKey` supported; not all callers migrated |
| Unified engine | **PARTIAL** | `platform-notify.ts` added; listing notifiers updated |
| Email failure ≠ break action | **PASS** | try/catch around email |
| All business events | **PARTIAL** | Listings/orders/jobs/viewings/quotes covered; chat email-only |

---

### Task 3 — Listing Lifecycle

| Requirement | Status | Notes |
|-------------|--------|-------|
| No publish without review | **PASS** (this PR) | API coerces to `pending_review` (draft only for unpaid featured) |
| Admin pending queue | **PASS** | Existing admin listings |
| Owner always sees own | **PASS** | My Listings by seller id |
| Approval → published (`active`) | **PASS** | Status model uses `active` as published |
| Search/home only active | **PASS** | |
| Detail leak non-active | **PASS** (this PR) | Owner/admin only |
| Rejection reason | **PARTIAL** | Stored on listing; ensure UI surfaces everywhere |
| Status audit trail | **PARTIAL** | `statusHistory` on listing payload |
| Expiry 30d / renew | **PASS** | Existing expiry + renew → pending_review |
| Durable catalog | **PASS** (this PR) | `marketplace_listings` |

Status vocabulary: `draft → pending_review → active` (+ `rejected` / `expired`). No separate `PUBLISHED` enum — `active` is published.

---

### Task 4 — Featured + Stripe

| Requirement | Status | Notes |
|-------------|--------|-------|
| No featured without payment | **PASS** | Draft until webhook/mock complete |
| Payment states | **PARTIAL** | pending/completed/failed (+ cancelled type); UI polish TBD |
| Webhook idempotency | **PARTIAL** | Event claim file-based — still ephemeral |
| Durable featured payments | **PASS** (this PR) | `featured_payments` table |
| Continue payment after cancel | **PARTIAL** | Initiate checkout again; dedicated CTA QA needed |
| Platform Stripe keys | **BLOCKED** | Production still `stripeConfigured: false` without secrets |

---

### Escrow / Permissions (P0 items 8–9)

| Item | Status |
|------|--------|
| مضمون evidence flow | **FAIL** — not fully implemented per notes |
| RBAC View/Add/Edit/Delete/Approve/Export | **PARTIAL** — module permissions exist; not full matrix |

---

## P1 / P2 (high level)

| Task | Status | Comment |
|------|--------|---------|
| 5 Dynamic listing forms | **PARTIAL** | Category forms exist; gaps (keys, food wholesale, furniture Other approval) |
| 6 Admin category/field builder | **PARTIAL** | Categories admin; full form builder incomplete |
| 7 Search / saved searches | **PARTIAL** | Suggest + saved searches exist; ranking/dedupe polish TBD |
| 8–10 Unified activities | **PARTIAL** | Admin activities + APIs; not one fully unified user hub |
| 11 Admin dashboard ranges/export | **PARTIAL** | Analytics present; Excel export incomplete |
| 12 RBAC Super/Sub | **PARTIAL** | |
| 13 Escrow evidence | **FAIL** | |
| 14 Disputes windows/reminders | **PARTIAL** | Disputes exist; 48h/24h reminders TBD |
| 15 Seller ratings | **PARTIAL** | |
| 16 Contact form | **PARTIAL** | Needs field-level error QA |
| 17 Header/Footer | **PARTIAL** | Footer credit Dukkanify TBD verify |
| 18 Legal pages | **PARTIAL** | Terms/privacy exist; escrow/dispute policy pages TBD |
| 19 Abu Dhabi visuals | **FAIL** | Not done this PR |
| 20 Upload security | **FAIL** | Data URLs; no object storage/AV |
| 21 Platform audit log | **PARTIAL** | Admin audit store exists |
| 22 Rate limiting | **PARTIAL** | Some auth/chat limits |
| 23 Monitoring | **FAIL** | |
| 24 Backup/recovery docs | **FAIL** | Neon ops outside repo |
| 25 i18n audit | **PARTIAL** | Prior PRs; ongoing |
| 26 Performance/mobile | **PARTIAL** | |
| 27 Automated E2E | **FAIL** | No suite yet |

---

## Database / API changes (this PR)

**Migrations:** `migrations/003_otp_notifications_listings.sql`  
Tables (auto-created at runtime when Postgres available):

- `otp_requests`
- `app_notifications`
- `marketplace_listings`
- `featured_payments`

**Security APIs:**

- `POST /api/auth/session` — refresh only; **rejects client-supplied user profiles**
- Listing `POST /api/listings` — status coercion + seller binding

---

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | PASS |
| `npm run build` | PASS |
| Full production E2E (register→listing→notify) | **BLOCKED** — needs live DB + Resend + Stripe + manual QA |
| Persist across redeploy | **PASS** design for auth/OTP/listings/notifications/featured when Postgres configured |

---

## Unresolved blockers

1. Production Stripe keys still unset (`stripeConfigured: false`)
2. Orders / escrow / disputes / chat / favorites still largely on ephemeral `data-store`
3. Webhook processed-event store still file-based
4. No automated E2E suite
5. Escrow “مضمون” evidence product incomplete
6. Full spreadsheet P1/P2 UX not finished in this pass

---

## Definition of done (honest)

**Project is NOT COMPLETE.**  

P0 durability + session security foundations are in place. Critical end-to-end proof on production must still be executed after deploy:

```text
Register → Verify → Login → Add Listing → Admin Approve → Search → Notifications → My Listings
```

and payment/escrow/jobs/booking flows — remaining stores must move to Postgres before claiming full DONE.

---

## Next recommended slice

1. Migrate **orders, disputes, favorites, webhook claims** to Postgres  
2. Escrow evidence upload + buyer confirm  
3. Playwright E2E for Auth + Listing + Featured  
4. Continue P1 activity hub + category form builder
