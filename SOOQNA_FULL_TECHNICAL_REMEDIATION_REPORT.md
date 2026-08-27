# Sooqna — Full Technical Remediation Report

**Branches:**  
- `#259` `cursor/full-technical-remediation-37ba` (merged) — sessions, OTP, listings, notifications  
- `#260` `cursor/p0-orders-escrow-durable-37ba` — orders, escrow evidence, activities, dispute reminders, RBAC save UX  

**Date:** 2026-08-27  
**Scope:** Production readiness vs technical notes (Tasks 1–27)

Statuses: **PASS** | **PARTIAL** | **FAIL** | **BLOCKED**

Lint/build alone is **not** completion.

---

## Executive summary

### Slice A (merged #259)
1. Signed HMAC sessions (no cookie forge)
2. Postgres OTP / notifications / listings / featured payments
3. Listing moderation coerce + public detail gate
4. Notification dedupe + platform notify helper

### Slice B (PR #260)
1. **Orders, disputes, jobs, viewings, quotes** → Postgres payload tables (durable)
2. **Stripe webhook claims** → atomic Postgres `INSERT ON CONFLICT`
3. **مضمون escrow evidence** entity + seller file upload + buyer confirmation records
4. `GET /api/orders/[id]/evidence` for parties/admin
5. **Dispute window reminders** — 48h / 24h / expired via `POST /api/cron/dispute-reminders` + durable dedupe
6. **RBAC UX** — draft permissions + «حفظ الصلاحيات»; super-only role/permission changes; self-escalation blocked
7. **My Activities** hub at `/activities` (header + profile links)
8. **Contact form** field-level validation errors

**Still not DONE:** cloud object storage for evidence, full View/Add/Edit/Delete/Approve/Export RBAC matrix, Playwright E2E, most P1/P2 spreadsheet items, production manual E2E proof.

---

## P0 Critical

### Task 1 — Auth / Accounts / Email
| Item | Status |
|------|--------|
| Durable users in Postgres | **PASS** |
| Same repository login/register | **PASS** |
| Duplicate email normalize | **PASS** |
| Password hashing | **PASS** |
| Logout session-only | **PASS** |
| Signed session + middleware | **PASS** |
| Forgot/reset password | **PASS** |
| OTP email-only in production | **PASS** |
| Live E2E on production | **BLOCKED** (manual + secrets) |

### Task 2 — Notifications
| Item | Status |
|------|--------|
| Bell + page same API | **PASS** |
| Durable store | **PASS** |
| Dedupe keys | **PARTIAL** (core paths + dispute reminders) |
| All business events | **PARTIAL** |
| Email failure isolation | **PASS** |

### Task 3 — Listing lifecycle
| Item | Status |
|------|--------|
| No publish without review | **PASS** |
| Admin pending + owner visibility | **PASS** |
| `active` = published | **PASS** |
| Rejection reason + statusHistory | **PARTIAL** |
| Expiry/renew | **PASS** |
| Durable catalog | **PASS** |

### Task 4 — Featured + Stripe
| Item | Status |
|------|--------|
| Pay before featured | **PASS** |
| Durable featured payments | **PASS** |
| Webhook idempotency (durable) | **PASS** |
| Production Stripe keys | **BLOCKED** |

### Task 8–10 Activities
| Item | Status |
|------|--------|
| Job applications durable | **PASS** |
| Viewing bookings durable | **PASS** |
| Quote requests durable | **PASS** |
| Unified user hub `/activities` | **PASS** (this iteration) |
| Seller/company activity management | **PARTIAL** (ActivityFeed received scope) |
| Admin activities console filters | **PARTIAL** |

### Task 12 — RBAC
| Item | Status |
|------|--------|
| Module permissions + Save button (no auto-save) | **PASS** (this iteration) |
| Super create/demote sub-admin | **PASS** |
| Block sub-admin modifying super / self-escalation | **PASS** |
| Permission audit on save | **PASS** |
| Full View/Add/Edit/Delete/Approve/Export matrix | **FAIL** (still module flags) |

### Task 13 — مضمون Escrow evidence
| Item | Status |
|------|--------|
| Evidence records linked to order/transaction | **PASS** |
| Seller upload photos/video (validated) | **PASS** (data URL + type/size) |
| Buyer confirmation stored | **PASS** |
| Admin can fetch evidence | **PASS** (`/evidence`) |
| Private object storage / AV scan | **PARTIAL** / **FAIL** |

### Task 14 — Disputes
| Item | Status |
|------|--------|
| Durable dispute store | **PASS** |
| Linked to escrow + window enforcement | **PASS** |
| 48h/24h/expired reminders | **PASS** (cron + durable sent markers; needs `CRON_SECRET` + scheduler in prod) |
| Order UI window countdown | **PASS** |

### Task 16 — Contact Us
| Item | Status |
|------|--------|
| Field-level errors + mapping | **PASS** (this iteration) |

---

## P1 / P2 (high-level)

| Tasks | Status |
|-------|--------|
| 5–7 Dynamic forms / category builder / search | **PARTIAL** |
| 11 Dashboard Excel export | **PARTIAL** / **FAIL** |
| 15 Ratings | **PARTIAL** |
| 17 Header/footer (activities link added) | **PARTIAL** |
| 18–19 Legal / Abu Dhabi visuals | **PARTIAL** / **FAIL** |
| 20–27 Safeguards / monitoring / backup / i18n / perf / E2E | mostly **PARTIAL**/**FAIL** |

---

## DB / API (this PR)

**Migration:** `migrations/004_orders_escrow_activities.sql`

Tables: `marketplace_orders`, `marketplace_disputes`, `escrow_evidence`, `escrow_evidence_confirmations`, `stripe_webhook_claims`, `payment_event_logs`, `job_applications`, `viewing_bookings`, `quote_requests`, `dispute_reminders`

**APIs:**
- `POST /api/orders/[id]/seller-proof` — `items[{storageUrl,kind}]` + validation errors
- `GET /api/orders/[id]/evidence` — party/admin evidence history
- `POST|GET /api/cron/dispute-reminders` — 48h/24h/expired (Bearer `CRON_SECRET` in production)
- `PATCH /api/admin/users/[id]` — super-only role/permissions; `CANNOT_MODIFY_SUPER_ADMIN` / `SELF_ESCALATION`
- Contact `POST /api/support` — `fieldErrors` map

**UI:** `/activities`, Admin «حفظ الصلاحيات», order dispute window label, seller proof file picker

**Helper:** `services/db/durable-json-collection.ts`, `services/payments/dispute-reminders.ts`

---

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | **PASS** |
| `npm run build` | **PASS** |
| Production E2E proof | **BLOCKED** until deploy + Stripe + Resend + cron + manual QA |

---

## Unresolved blockers

1. Stripe Live keys on production  
2. Evidence still stores data URLs / HTTPS links — need object storage for scale  
3. Chat + favorites + some admin JSON stores still ephemeral  
4. No Playwright E2E suite  
5. Production must set `SESSION_SECRET`, `CRON_SECRET`, and schedule dispute-reminder cron  
6. Full spreadsheet P1/P2

---

## Definition of done (honest)

**Project is NOT COMPLETE.**

Critical durability for auth, listings, notifications, orders, escrow evidence, lead activities, and dispute reminders is designed for Postgres. End-to-end production proof must still be run after merge/deploy.
