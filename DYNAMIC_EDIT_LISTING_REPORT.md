# Sooqna — Dynamic Edit Listing Report

**Date:** 2026-07-08  
**Branch:** `cursor/dynamic-listing-system-37ba`

---

## 1. Summary

Local listing edit now **fully mirrors** Add Listing dynamic behavior. The same `CategoryFieldsForm`, `parseCategoryForm`, and data integrity rules apply to both flows.

---

## 2. Architecture

```
CategoryFieldsForm.tsx     → shared dynamic fields (add + edit)
parseCategoryForm()        → shared validation + categorySpecs build
useEditListingForm.ts      → edit-specific save + image merge
LocalListingEdit.tsx       → routes to dynamic or generic form
ListingMediaSection.tsx    → preserve existing images + add new
listing-edit.utils.ts      → defaults builder + image helpers
```

---

## 3. Dynamic Edit Behavior

| Category | Edit form shows |
|----------|-----------------|
| `cars` | All car fields pre-filled from `categorySpecs` |
| `real-estate` | Property fields pre-filled |
| `mobiles` | Device fields pre-filled |
| `electronics` | Device fields pre-filled |
| `jobs` | Job fields pre-filled |
| `services` | Service fields pre-filled |

Non-dynamic categories use `GenericListingFields` (title, description, price, condition, city).

---

## 4. Pre-fill Sources

| Data | Source |
|------|--------|
| `categorySpecs` | `listing.categorySpecs` → `defaultValue` on each field |
| `features[]` | `listing.features` + `negotiable` → checkbox `defaultChecked` |
| Price / description | `listing.price`, `listing.description` |
| Condition | `listing.condition` or `categorySpecs.condition` |
| Contact | `listing.contactPhone` |
| Images | `listing.images` / `listing.imageUrl` shown as «الصور الحالية» |

---

## 5. Save Integrity

| Rule | Implementation |
|------|----------------|
| No demo specs injected | `parseCategoryForm` builds fresh `categorySpecs` from form only |
| Empty optional fields omitted | VIN, etc. not saved when blank |
| No default overwrite | Required fields validated; missing optionals skipped |
| Images preserved | Existing images kept unless new files uploaded |
| Title/slug updated | Auto-regenerated from title parts for dynamic categories |
| Search indexing | Updated `categorySpecs` indexed via existing `listingMatchesQuery` |

---

## 6. Files Created / Updated

| File | Change |
|------|--------|
| `CategoryFieldsForm.tsx` | **New** — shared form with `defaults` prop |
| `CategoryFieldsStep.tsx` | Refactored to use `CategoryFieldsForm` |
| `useEditListingForm.ts` | **New** — edit hook |
| `LocalListingEdit.tsx` | Full dynamic edit flow |
| `ListingMediaSection.tsx` | **New** — existing + new images |
| `GenericListingFields.tsx` | **New** — non-dynamic edit |
| `listing-edit.utils.ts` | **New** — defaults + image helpers |

---

## 7. QA Matrix

| Flow | Pre-fill | Save | Detail | Dashboard | Search |
|------|----------|------|--------|-----------|--------|
| Car | ✅ | ✅ | ✅ | ✅ | ✅ |
| Real Estate | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mobile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Job | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 8. Validation

```bash
npm run lint   # ✅
npm run build  # ✅
```

---

## 9. Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Same dynamic field system as Add Listing | ✅ |
| Pre-fill categorySpecs + features | ✅ |
| Preserve images | ✅ |
| No fake/demo values on save | ✅ |
| Detail shows updated values only | ✅ |
| Dashboard/search reflect edits | ✅ |

---

*Dynamic edit listing — Add and Edit flows now share one field system.*
