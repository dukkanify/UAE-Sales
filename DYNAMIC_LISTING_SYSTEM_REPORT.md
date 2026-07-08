# Sooqna — Dynamic Listing System Report

**Date:** 2026-07-08  
**Branch:** `cursor/dynamic-listing-system-37ba`

---

## 1. Summary

Add Listing is now **category-driven** for six production categories. Selecting a category immediately swaps step 2 fields. User-entered values are stored in `listing.categorySpecs` and rendered only when present.

---

## 2. Dynamic Categories Implemented

| Category ID | Fields | Auto title from |
|-------------|--------|-----------------|
| `cars` | Brand, model, year, emirate, city, mileage, transmission, fuel, engine, colors, warranty, accident/service history, VIN (optional), keys, features | brand + model + year |
| `real-estate` | Property type, purpose, bedrooms, bathrooms, area, floor, parking, furnished, completion, developer, community, title deed | propertyType + community + purpose |
| `mobiles` | Brand, model, storage, RAM, color, battery, warranty, purchase date, accessories, condition | brand + model + storage |
| `electronics` | Brand, model, condition, warranty, accessories | brand + model |
| `jobs` | Company, position, salary, experience, employment type, location, nationality, gender | company + position |
| `services` | Business name, service category, coverage, availability, experience | businessName + serviceCategory |

Non-dynamic categories (furniture, fashion, etc.) keep the generic title/price/description form.

---

## 3. Architecture

```
shared/constants/category-fields.ts   → field definitions per category
features/.../CategoryFieldsStep.tsx   → dynamic form renderer
features/.../category-form-utils.ts   → parse + validate FormData
types/domain/category-fields.ts       → CategorySpecs type
listing.categorySpecs on Listing      → persisted user data
```

Form re-mounts on `categoryId` change via `key={categoryId}` on `CategoryFieldsStep`.

---

## 4. Files Created / Updated

| File | Role |
|------|------|
| `types/domain/category-fields.ts` | Field + specs types |
| `shared/constants/category-fields.ts` | Category field config |
| `features/listings/components/add-listing/CategoryFieldsStep.tsx` | Dynamic form UI |
| `features/listings/components/add-listing/category-form-utils.ts` | Parse/validate/save |
| `features/listings/components/add-listing/useAddListingForm.ts` | Persist specs |
| `features/listings/components/AddListingForm.tsx` | Switch dynamic vs generic |

---

## 5. Validation

- Required fields enforced per category definition
- Price + description always required
- Title auto-generated for dynamic categories (min 8 chars from title parts)
- VIN optional — omitted from save when empty

---

## 6. Remaining Gaps

| Item | Notes |
|------|-------|
| Local edit form | Still basic — full category field edit not yet mirrored |
| Subcategory persistence | Saved but not shown in specs renderer |
| Fashion/furniture dynamic fields | Use generic form until schemas added |

---

*Dynamic listing system — production-critical category forms complete.*
