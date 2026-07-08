# Sooqna — Closed Beta Plan

**Version:** `v0.1.0-beta`  
**Status:** Closed Beta Ready  
**Freeze date:** 2026-07-08

---

## Beta Scope

Sooqna `v0.1.0-beta` is a **frontend-only** Arabic RTL marketplace preview. Testers evaluate core buyer and seller flows using mock catalog data and browser-local storage for user-created content.

**In scope:**

- Onboarding (register, login, profile)
- Dynamic listing creation and editing (cars, real estate, mobiles, electronics, jobs, services)
- Search, browse, and listing detail
- Seller chat
- Wallet and escrow overview (mock)
- Data integrity on user listings (no fake specs, hidden empty fields)

**Out of scope:**

- Real payments and checkout completion
- Order lifecycle and fulfillment
- Admin moderation actions
- Dispute filing and resolution
- Push/email notifications
- Backend API and cross-device sync

---

## What Users Can Test

### As a buyer (User account)

1. Register a new account or log in with `user@sooqna.demo`
2. Browse homepage, categories, and search
3. Open catalog listing details (`/listings/[slug]`)
4. Start a chat with a seller
5. Click "Buy now" and confirm checkout shows the correct listing (placeholder page)
6. View wallet balance and escrow mock transactions
7. Check notifications panel on profile (mock data)

### As a seller (User or Business account)

1. Log in as `user@sooqna.demo` or `company@sooqna.demo`
2. Add a listing at `/listings/new` — test dynamic fields for your category
3. View your listings at `/dashboard/listings`
4. Edit a local listing — confirm specs and images persist
5. Search for your listing in the same browser
6. Attempt to chat on your own listing — should show a clear block message

### As admin

1. Log in as `admin@sooqna.demo`
2. Confirm redirect to `/admin` (Coming Soon page, not 404)
3. Note: no moderation actions available in this release

---

## What Is Not Ready Yet

| Feature | Status |
|---------|--------|
| Checkout / payment | Placeholder — listing context only |
| Order details | Not implemented |
| Admin approve/reject listings | Coming Soon |
| Admin order review | Not implemented |
| Mark order delivered | Not implemented |
| Disputes form | Placeholder at `/disputes/new` |
| `/notifications` route | Coming Soon — profile panel only |
| Real backend API | Not wired |
| Cross-browser data sync | Not supported |

Full details: [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)

---

## Test Accounts

| Role | Email | Password | OTP | Post-login path |
|------|-------|----------|-----|-----------------|
| User | `user@sooqna.demo` | `User@123` | `123456` | `/profile` |
| Business | `company@sooqna.demo` | `Company@123` | `123456` | `/dashboard/listings` |
| Admin | `admin@sooqna.demo` | `Admin@123` | `123456` | `/admin` |

Testers may also self-register at `/register`. Self-registered data is stored in `localStorage` and is visible only in that browser.

---

## Feedback Form Questions

Use [BETA_FEEDBACK_FORM.md](./BETA_FEEDBACK_FORM.md) when collecting tester input. Core questions:

1. Was registration easy?
2. Was adding a listing easy?
3. Did listing details look correct?
4. Did chat work?
5. Was search useful?
6. Did the app feel trustworthy?
7. What confused you?
8. What feature is most important next?

---

## Bug Reporting Format

When reporting a bug, include:

```markdown
## Bug Report

**Version:** v0.1.0-beta
**Date:**
**Tester:**
**Role:** User / Business / Admin
**Browser / Device:**

### Summary
One-line description of the issue.

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
What should have happened.

### Actual Behavior
What happened instead.

### Screenshots / Console Errors
Attach if available.

### Severity
- [ ] Critical — blocks a core flow
- [ ] High — major friction, workaround exists
- [ ] Medium — noticeable but not blocking
- [ ] Low — cosmetic or edge case
```

**Do not report as bugs:**

- Checkout not completing payment (known placeholder)
- Missing order details page (not implemented)
- Admin cannot approve listings (Coming Soon)
- Disputes form not functional (placeholder)
- No `/notifications` route (Coming Soon)

---

## Success Criteria

The closed beta is successful when:

| Criterion | Target |
|-----------|--------|
| Registration completion rate | ≥ 80% of invited testers complete signup |
| Listing creation | ≥ 70% of seller testers publish at least one listing |
| Listing detail accuracy | No reports of fake specs on user-created listings |
| Chat usability | ≥ 80% of chat attempts open a conversation |
| Search relevance | Majority of testers find expected catalog results |
| Trust perception | Majority rate trust as "Yes" or "Somewhat" |
| Critical bugs | Zero unresolved critical bugs at beta close |
| Build health | `npm run lint` and `npm run build` pass on `v0.1.0-beta` tag |

---

## Validation Checklist (Release)

- [x] `npm run lint` — pass
- [x] `npm run build` — pass (76 routes)
- [x] `FINAL_E2E_QA_REPORT.md` — critical flows documented
- [x] `KNOWN_LIMITATIONS.md` — placeholders listed
- [x] `BETA_FEEDBACK_FORM.md` — questions defined
- [x] Git tag `v0.1.0-beta` — applied to frozen commit

---

## Related Documents

- [README.md](./README.md) — setup and quick reference
- [FINAL_E2E_QA_REPORT.md](./FINAL_E2E_QA_REPORT.md) — full QA matrix
- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) — placeholder and technical limits
- [BETA_FEEDBACK_FORM.md](./BETA_FEEDBACK_FORM.md) — tester questionnaire
