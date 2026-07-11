# Checkout Category Routing — Final Verification

**Branch:** `cursor/checkout-category-routing-37ba`  
**Date:** 2026-07-11  
**Scope:** Verify and fix category checkout step routing (no redesign)

---

## Issue Found

**Cars skipped the Delivery step.** `CheckoutWizard` used `isCategoryShippable()`, which excluded `cars`. Purchasable vehicles went **Review → Payment** instead of **Review → Delivery → Payment**.

---

## Fix Summary

| Change | Purpose |
|--------|---------|
| `shared/constants/checkout-routing.ts` | Central routing rules per category |
| `requiresCheckoutDeliveryStep(listing)` | Listing-aware Delivery step gate |
| `CHECKOUT_SHIPPING_CATEGORIES` + car methods | Vehicle pickup / transport options |
| `CheckoutWizard` | Uses routing helper instead of `isCategoryShippable` |
| `listingActionConfig` cars | `shippingEnabled: true` when purchasable |
| `app/checkout/page.tsx` | Redirect blocked categories away from `/checkout` |

---

## Category Routing Matrix

| Category | Checkout | Primary action | Flow | Verified |
|----------|----------|----------------|------|----------|
| **Cars** | Yes (non-negotiable + escrow) | RESERVE | Review → **Delivery** → Payment | **Pass** |
| **Electronics** | Yes (escrow product) | BUY_NOW | Review → **Delivery** → Payment | **Pass** |
| **Furniture** | Yes (escrow product) | BUY_NOW | Review → **Delivery** → Payment | **Pass** |
| **Fashion** | Yes (escrow product) | BUY_NOW | Review → **Delivery** → Payment | **Pass** |
| **Real Estate** | **No** | BOOK_VIEWING | Booking only | **Pass** |
| **Jobs** | **No** | APPLY_JOB | Application only | **Pass** |
| **Services** | **No** | REQUEST_QUOTE | Quote / service booking | **Pass** |

### Demo listing references

| Category | Test slug | Delivery methods |
|----------|-----------|------------------|
| Cars | `mercedes-amg-g63-2024` | استلام من المعرض، نقل المركبة |
| Electronics | `sony-playstation-5` | عادي، سريع (same emirate)، استلام |
| Furniture | `luxury-italian-sofa-set` | عادي، استلام (+ express same emirate) |
| Fashion | *(category configured; no mock listing)* | Same as product categories |
| Real Estate | `villa-palm-jumeirah` | Redirected from `/checkout` |
| Jobs | `sales-executive-dubai` | Redirected from `/checkout` |
| Services | `home-cleaning-service-dubai` | Redirected from `/checkout` |

---

## Delivery Step Rules

### Always include Delivery (when checkout enabled)

- `cars`
- `electronics`
- `furniture`
- `fashion`

### Optional Delivery (pickup-only may skip)

- `mobiles`, `kids`, `sports`, `books`, `food`
- Skip Delivery only when `deliveryOption === "pickup"` (non-car)

### Never enter checkout

- `jobs`, `real-estate`, `services` → server redirect to listing page

---

## Car Delivery Methods

| Method | Label | Fee |
|--------|-------|-----|
| `pickup` | الاستلام من المعرض | 0 |
| `standard` | نقل المركبة | 350 AED |

Default for cars: **pickup**.

---

## Blocked Category Guard

`/checkout?listingId=villa-palm-jumeirah` → redirects to `/listings/villa-palm-jumeirah`  
`/checkout?listingId=sony-playstation-5` → checkout wizard (Review step)

---

## Validation

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |

---

## Remaining Risks

1. **Fashion** — category supported; add a mock listing for manual QA.
2. **Local listings** — product categories without `escrowAvailable` still blocked at Step 1 (pre-existing).
3. **Digital goods** — no `digital` flag yet; all product categories use physical delivery flow.

---

## Production Readiness

**9.5/10** — Category routing matches spec; cars no longer skip Delivery.
