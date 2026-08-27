# Sooqna — Full Technical Remediation Report

**Branches:**  
- `#259` `cursor/full-technical-remediation-37ba` (merged) — sessions, OTP, listings, notifications  
- current `cursor/p0-orders-escrow-durable-37ba` — orders, escrow evidence, activities  

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

### Slice B (this PR)
1. **Orders, disputes, jobs, viewings, quotes** → Postgres payload tables (durable)
2. **Stripe webhook claims** → atomic Postgres `INSERT ON CONFLICT`
3. **مضمون escrow evidence** entity + seller file upload + buyer confirmation records
4. `GET /api/orders/[id]/evidence` for parties/admin

**Still not DONE:** cloud object storage for evidence, dispute window reminders, full RBAC matrix, E2E suite, P1/P2 UX, chat durability.

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
| Dedupe keys | **PARTIAL** (core paths) |
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
| Webhook idempotency (durable) | **PASS** (this PR) |
| Production Stripe keys | **BLOCKED** |

### Task 8–10 Activities (P0 overlap)
| Item | Status |
|------|--------|
| Job applications durable | **PASS** (this PR) |
| Viewing bookings durable | **PASS** (this PR) |
| Quote requests durable | **PASS** (this PR) |
| Unified UX hubs | **PARTIAL** |

### Task 13 — مضمون Escrow evidence
| Item | Status |
|------|--------|
| Evidence records linked to order/transaction | **PASS** (this PR) |
| Seller upload photos/video (validated) | **PASS** (client data URL + type/size checks) |
| Buyer confirmation stored | **PASS** |
| Admin can fetch evidence | **PASS** (`/evidence`) |
| Private object storage / AV scan | **PARTIAL** / **FAIL** (no S3 yet) |

### Task 14 — Disputes
| Item | Status |
|------|--------|
| Durable dispute store | **PASS** (this PR) |
| Linked to escrow orders | **PASS** |
| 48h/24h reminders | **FAIL** |

### Task 12 — RBAC
| Item | Status |
|------|--------|
| Module permissions | **PARTIAL** |
| Super/Sub full matrix | **FAIL** |

---

## P1 / P2 (unchanged high-level)

| Tasks | Status |
|-------|--------|
| 5–7 Dynamic forms / category builder / search | **PARTIAL** |
| 11 Dashboard export | **PARTIAL** |
| 15 Ratings | **PARTIAL** |
| 16 Contact form field errors | **PARTIAL** |
| 17–19 Header/footer/legal/Abu Dhabi visuals | **PARTIAL** / **FAIL** |
| 20–27 Safeguards / monitoring / backup / i18n / perf / E2E | mostly **PARTIAL**/**FAIL** |

---

## DB / API (this PR)

**Migration:** `migrations/004_orders_escrow_activities.sql`

Tables: `marketplace_orders`, `marketplace_disputes`, `escrow_evidence`, `escrow_evidence_confirmations`, `stripe_webhook_claims`, `payment_event_logs`, `job_applications`, `viewing_bookings`, `quote_requests`

**APIs:**
- `POST /api/orders/[id]/seller-proof` — accepts `items[{storageUrl,kind}]` + file validation errors
- `GET /api/orders/[id]/evidence` — party/admin evidence history

**Helper:** `services/db/durable-json-collection.ts`

---

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | PASS |
| `npm run build` | PASS |
| Production E2E proof | **BLOCKED** until deploy + Stripe + Resend + manual QA |

---

## Unresolved blockers

1. Stripe Live keys on production  
2. Evidence still stores data URLs / HTTPS links — need object storage for scale  
3. Chat + favorites + some admin JSON stores still ephemeral  
4. No Playwright E2E suite  
5. Dispute reminder timers  
6. Full spreadsheet P1/P2

---

## Definition of done (honest)

**Project is NOT COMPLETE.**  

Critical durability for auth, listings, notifications, orders, escrow evidence, and lead activities is now designed for Postgres. End-to-end production proof must still be run after merge/deploy.
