# Sooqna — Listing Data Integrity Report

**Date:** 2026-07-08  
**Branch:** `cursor/dynamic-listing-system-37ba`

---

## 1. Integrity Rules Enforced

| Rule | Implementation |
|------|----------------|
| No fake specs on user listings | `local-*` IDs use `categorySpecs` only — never mock `carSpecs` blobs |
| Hide empty fields | `hasValue()` in `listing-specs.ts` skips null/empty/`—` |
| No hardcoded seller data | `buildSellerFromSession()` — no fake rating, response time, or joined date |
| No placeholder specs | Spec renderer skips rows without values |
| No empty rows | `ListingSpecifications` renders `<dl>` entries only when value exists |

---

## 2. User vs Catalog Listings

```ts
listing.id.startsWith("local-")  →  getUserSpecEntries() only
catalog mock listings            →  getMockSpecEntries() (demo data OK)
```

---

## 3. Seller Panel Integrity

For **user-created listings** (`local-*`):

| Field | Shown when |
|-------|------------|
| Verified badge | `seller.isVerified` or `verifiedSeller` only |
| Company label | `sellerType === "business"` only |
| Rating / reviews | Hidden (not fabricated) |
| Response time | Only if `seller.responseTime` exists |
| Member since | Only if `seller.joinedAt` exists |
| Completed transactions | Only if numeric value exists |

Removed: `rating >= 4.8` verified fallback, `"خلال ساعة"` response default, `"—"` joined date.

---

## 4. Listing Summary Integrity

- Posted date row: only if `postedAt` set
- Views row: only if `views > 0`
- Location: uses user `city` / `emirate` / `area` only

---

## 5. Key Files

| File | Change |
|------|--------|
| `shared/listings/listing-specs.ts` | Central spec extraction + search haystack |
| `features/listings/components/ListingSpecifications.tsx` | Dynamic renderer |
| `features/listings/components/SellerPanel.tsx` | Conditional seller fields |
| `types/domain/listing.ts` | `categorySpecs`, optional `seller.rating` |
| `useAddListingForm.ts` | No `rating: 4.8` default |

---

## 6. Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| No fake specifications on user listings | ✅ |
| Only entered fields appear | ✅ |
| Every user listing is unique | ✅ |
| Mock catalog listings unchanged | ✅ |

---

*Listing data integrity — user-created listings show only entered data.*
