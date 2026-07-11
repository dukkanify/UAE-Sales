# PR #22 Regression QA Report

**Branch:** `cursor/listing-checkout-completion-37ba`  
**PR:** [#22](https://github.com/dukkanify/UAE-Sales/pull/22)  
**Date:** 2026-07-12  
**Scope:** Test, fix regressions, verify production behavior (no redesign, no new features)

---

## Validation Commands

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (0 errors, 1 pre-existing warning in `ShareButton.tsx`) |
| `npm run build` | Pass |
| Live API smoke tests | Pass (dev server `localhost:3000`) |

---

## Bugs Found & Fixes Applied

| # | Bug | Severity | Fix |
|---|-----|----------|-----|
| 1 | Users could apply/book/request on own listings (UI allowed modal open; API accepted spoofed seller) | High | `isOwnListing` guard in `openModal()` + `assertNotOwnListing()` in all POST APIs (403) |
| 2 | APIs trusted client `employerId`/`sellerId`/`providerId` and titles | High | `listing-action-resolver.ts` resolves catalog listing server-side and overwrites seller fields |
| 3 | Invalid CV extensions accepted server-side | Medium | `validateCvFileName()` — `.pdf`, `.doc`, `.docx` only |
| 4 | Past dates accepted for viewing/quote | Medium | `validateFutureDate()` + allowed-date list for viewings |
| 5 | Unsafe attachment extensions possible on quote requests | Medium | `validateAttachmentName()` whitelist |
| 6 | Checkout success polling had no cleanup or timeout UX | Medium | `useRef` + `clearTimeout` on unmount; graceful message after 8 attempts |
| 7 | Incomplete Arabic errors for 403/400/409 in modals | Low | Specific messages in job/viewing/quote modals |
| 8 | `QuoteRequestModal` referenced undefined `dates` for `min` attribute | Medium | Computed `minDate` from tomorrow |

---

## Test Matrix

### 1. Job Application QA

| Case | Method | Result |
|------|--------|--------|
| Logged-in apply succeeds | API POST `listing-job-001` | **Pass** — 200, server-resolved title |
| Logged-out redirect | Code review `requireAuth()` + login `next` | **Pass** |
| Duplicate application (409) | API repeat POST | **Pass** — 409 |
| Arabic duplicate message | `JobApplicationModal` | **Pass** |
| CV upload validation | API `.exe` → 400; client extension check | **Pass** |
| Employer notification | `notification-store` on POST | **Pass** |
| Applicant confirmation | `notification-store` on POST | **Pass** |
| Admin page shows application | `GET /api/admin/job-applications` + header | **Pass** |
| Own job listing blocked | API `seller-dubai-elite` → 403; UI `openModal` toast | **Pass** |

### 2. Viewing Booking QA

| Case | Method | Result |
|------|--------|--------|
| Available slots load | `GET /api/viewing-bookings/slots` | **Pass** |
| Booking succeeds | API POST with valid date/time | **Pass** |
| Conflicting slot rejected | Second booking same slot → 409 | **Pass** |
| Duplicate booking prevented | Same user/date/time → 409 | **Pass** |
| Buyer notification | POST handler | **Pass** |
| Seller notification | POST handler | **Pass** |
| Admin page | `GET /api/admin/viewing-bookings` | **Pass** |
| Past dates rejected | Server `validateFutureDate` + date whitelist | **Pass** |
| Invalid email rejected | Zod `email()` on POST | **Pass** |

### 3. Quote Request QA

| Case | Method | Result |
|------|--------|--------|
| Service quote submission | API POST `listing-svc-001` | **Pass** |
| Book service action | `QuoteRequestModal` `kind=service_booking` | **Pass** (code path) |
| Seven-day duplicate guard | `findRecentQuoteRequest` | **Pass** (code + store logic) |
| Provider notification | POST handler | **Pass** |
| User confirmation | POST handler | **Pass** |
| Admin page | `GET /api/admin/quote-requests` | **Pass** |
| Missing fields errors | Zod 400 + Arabic modal message | **Pass** |
| Own listing blocked | `assertNotOwnListing` | **Pass** |

### 4. Favorites QA

| Case | Method | Result |
|------|--------|--------|
| Add favorite logged in | API POST | **Pass** |
| Duplicate add idempotent | API POST repeat | **Pass** — returns existing |
| Remove favorite | `DELETE /api/favorites/[id]` | **Pass** (code path) |
| Login sync | `syncFavoritesAfterLogin` on login/register | **Pass** (code path) |
| Optimistic rollback | `toggleFavoriteWithApi` reverts on API fail | **Pass** (code path) |
| Favorites panel local URLs | `getFavoriteHref()` | **Pass** |
| Logged-out redirect | `FavoriteButton` → `/login?next=` | **Pass** |

### 5. Checkout Success QA

| Case | Method | Result |
|------|--------|--------|
| Mock payment success | `POST /api/checkout/session` | **Pass** → `/checkout/success?orderId=` |
| Success page loads | `GET /checkout/success?orderId=` | **Pass** — 200 |
| Order status after mock pay | `GET /api/orders/[id]` | **Pass** — `paid_held_in_escrow` / `held` |
| Polling stops on final status | `CheckoutSuccessContent` effect | **Pass** |
| Polling timeout message | After 8 attempts while pending | **Pass** |
| No duplicate order on refresh | Read-only success page | **Pass** |
| Currency on summary | `CurrencyAmount` | **Pass** |
| Links (order/chat/search) | Button `href`s | **Pass** |

### 6. Currency QA

| Surface | `د.إ` / `AED` in UI? | Result |
|---------|----------------------|--------|
| Dashboard values | No — `CurrencyAmount` | **Pass** |
| Wallet / Orders / Admin / Checkout | No — `CurrencyAmount` | **Pass** |
| Notifications (order service) | No — `formatCurrencyLabel()` | **Pass** |
| `CurrencyAmount` SVG fallback | `AED` text only on SVG failure | **Allowed** |
| Mock job descriptions | Prose only | **Allowed** |
| Type literals (`currency: "AED"`) | Non-UI | **Allowed** |

### 7. Security & Ownership QA

| Case | Result |
|------|--------|
| Own listing POST blocked | **Pass** — 403 |
| Admin routes require header | **Pass** — 403 without `x-admin-role: admin` |
| API input validation (Zod) | **Pass** |
| Duplicate submissions idempotent | **Pass** — 409 |
| CV/attachment type whitelist | **Pass** |
| Server listing resolution for catalog | **Pass** |
| GET user data by arbitrary `userId` | **Risk** — no session binding (see below) |
| Local listing server validation | **Risk** — client-only listings not on server |

### 8. Responsive / RTL QA

| Case | Method | Result |
|------|--------|--------|
| Modal scroll (`max-h-[90vh] overflow-y-auto`) | Code review | **Pass** |
| Modal z-index above sticky bar (z-50 > z-40) | Code review | **Pass** |
| RTL layout (existing app RTL) | Code review | **Pass** |
| Keyboard Escape closes modal | `Modal` component | **Pass** |

### 9. Console & Network QA

| Case | Method | Result |
|------|--------|--------|
| No infinite polling loop | Fixed cleanup in success page | **Pass** |
| No duplicate POST on success refresh | Read-only page | **Pass** |
| API 404s on new routes | Smoke tests | **Pass** |
| Polling limited to 8 attempts | `MAX_POLL_ATTEMPTS` | **Pass** |

---

## Remaining Risks

1. **Session binding:** APIs accept `userId` from client query/body; GET endpoints can expose another user's data if `userId` is known. Mitigation requires cookie/session verification (out of PR #22 scope).
2. **Local listings:** `local-*` listings are not validated server-side; ownership relies on client `seller.id` comparison for non-catalog items.
3. **File uploads:** CV and attachments store filenames only; no virus scanning or blob storage.
4. **Admin auth:** `x-admin-role: admin` header is client-controlled; production needs server session role check.
5. **Viewing slots:** Static config, not seller-managed availability.

---

## Production Readiness Score

**8.7 / 10**

| Area | Score | Notes |
|------|-------|-------|
| Category actions | 9/10 | Full flows; local listing gap |
| Favorites | 8.5/10 | API-first works; session binding pending |
| Checkout success | 9/10 | Stable with polling timeout |
| Currency | 9.5/10 | UI clean; mock prose exempt |
| Security | 7.5/10 | Ownership on POST fixed; GET/session gaps remain |
| Responsive/RTL | 9/10 | Modal patterns sound |

**Recommendation:** Merge PR #22 after review. Schedule follow-up for API session authentication before public beta scale.

---

## Files Changed in QA Fix Pass

- `services/listings/listing-action-resolver.ts` (new)
- `app/api/job-applications/route.ts`
- `app/api/viewing-bookings/route.ts`
- `app/api/quote-requests/route.ts`
- `features/listings/components/ListingPrimaryAction.tsx`
- `features/listings/components/JobApplicationModal.tsx`
- `features/listings/components/ViewingBookingModal.tsx`
- `features/listings/components/QuoteRequestModal.tsx`
- `features/checkout/components/CheckoutSuccessContent.tsx`
- `features/listings/components/ListingStickyPanel.tsx` (lint)
