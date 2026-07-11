# Checkout Continue Button Fix Report

**Branch:** `cursor/checkout-continue-button-fix-37ba`  
**Date:** 2026-07-11  
**Scope:** Fix checkout review Continue button + unify AED currency display (no redesign)

---

## Root Cause

The Continue button (`متابعة`) on the checkout review step appeared unresponsive due to **silent failures in the async step transition handler**:

1. **Uncaught promise errors** — `handleContinueFromReview` awaited `loadAddresses()` without `try/catch`. If the addresses API failed or returned a non-JSON response, `setStep("delivery")` never ran and no error was shown.
2. **Stale session closure** — `loadAddresses()` used a render-time `user` variable (`typeof window` guard) instead of the authenticated buyer ID at click time, causing inconsistent address pre-fetch behavior after login/hydration.
3. **No transition feedback** — No loading state, double-click guard, or scroll-on-advance made successful and failed transitions hard to perceive.
4. **Generic blocking messages** — Step 1 used a single `listingUnavailable` string instead of specific Arabic reasons when validation failed.

Currency: `CurrencyAmount` rendered an unofficial Dirham SVG with inconsistent fallback text. Notifications used `درهم` instead of the unified `AED` code.

---

## Files Changed

| File | Change |
|------|--------|
| `features/checkout/utils/checkout-validation.ts` | **New** — Step 1 validation with Arabic error messages |
| `features/checkout/components/CheckoutWizard.tsx` | Fixed continue handler, loading, guards, scroll, session sync |
| `shared/components/CurrencyAmount.tsx` | Removed SVG; unified `12,500 AED` display |
| `shared/utils/currency.ts` | Added `formatCurrencyDisplay()`; notifications use `AED` |

---

## Validation Logic (Step 1 — Review)

| Check | Blocks? | Arabic message |
|-------|---------|----------------|
| Buyer authenticated | Yes (redirect to login) | انتهت الجلسة. سجّل الدخول للمتابعة. |
| Listing exists | Yes | تعذر متابعة الطلب لأن بيانات الإعلان غير مكتملة. |
| Seller + price valid | Yes | تعذر متابعة الطلب لأن بيانات الإعلان غير مكتملة. |
| Listing `active` | Yes | هذا الإعلان غير متاح للشراء حاليًا. |
| `checkoutEnabled` | Yes | هذا الإعلان غير متاح للشراء حاليًا. |
| Not own listing | Yes | لا يمكنك شراء إعلانك الخاص. |
| Shipping address | **No** | — (Step 2) |
| Payment method | **No** | — (Step 3) |

**Step transition after valid review:**

- Shippable category → `delivery` (addresses pre-loaded)
- Non-shippable checkout (e.g. cars) → `payment`

---

## Button Behavior Fixes

- `type="button"` on wizard actions (prevents accidental form submit)
- `isContinuing` loading state on Continue buttons
- `transitionLockRef` prevents double-click / duplicate transition
- `try/catch/finally` ensures loading always clears
- `advanceStep()` clears errors and scrolls panel to top
- Session tracked via `useSyncExternalStore` + `STORAGE_EVENTS.sessionChange`

---

## Currency Standardization

**Before:** Dirham SVG (`/brand/dirham.svg`) with `AED` text fallback; notifications used `درهم`.

**After:** Single formatter across all `CurrencyAmount` consumers:

```
12,500 AED
```

| Surface | Status |
|---------|--------|
| Listing cards / details | Pass — via `CurrencyAmount` |
| Checkout / success | Pass |
| Orders / wallet / escrow | Pass |
| Dashboard / admin | Pass |
| Notifications | Pass — `formatCurrencyLabel()` → `12,500 AED` |
| Search filter chips | Pass |
| Favorites | Pass |

**Not changed (allowed):** Mock job description prose containing `د.إ` in `mock/listings.mock.ts` (content only).

---

## Test Cases

| Case | Result |
|------|--------|
| Demo electronics listing → Buy Now → Continue | **Pass** → Delivery step |
| Logged-out Continue | **Pass** → Redirect `/login?next=...` |
| Own listing | **Pass** → Arabic block message |
| Non-checkout category (jobs) | **Pass** → غير متاح للشراء |
| Car (non-shippable) Continue | **Pass** → Payment step (skips delivery) |
| Address API failure | **Pass** → Arabic error, loading clears |
| Double-click Continue | **Pass** → Single transition |
| Currency on listing card | **Pass** → `1,899 AED` format |
| `npm run lint` | Pass (0 errors) |
| `npm run build` | Pass |

---

## Remaining Risks

1. **Local listings without `escrowAvailable`** — User-created product listings may still fail Step 1 validation until listing creation sets escrow flags for purchasable categories.
2. **API session binding** — Address fetch still uses client `userId` query param (pre-existing).
3. **Mobile sticky Buy Now** — Bypasses login before checkout entry (pre-existing); Continue correctly redirects when logged out.

---

## Production Readiness

**9/10** — Continue button advances reliably; currency is unified; checkout layout unchanged.
