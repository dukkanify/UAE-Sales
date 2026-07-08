# Sooqna — Critical Bug Fix Report

**Date:** 2026-07-08  
**Branch:** `cursor/critical-bug-fix-37ba`  
**Scope:** Bug/glitch fixes only — no redesign, no new features

---

## 1. Bugs Found & Root Causes

### P0 — Post-publish image glitch (add listing)

| Item | Detail |
|------|--------|
| **Symptom** | After publishing, listing detail and dashboard cards showed fallback images or flickered |
| **Root cause** | Uploaded images were saved as ephemeral `blob:` URLs in `localStorage`. URLs invalidated after navigation/reload; `next/image` rejected them |
| **Fix** | Compress uploads to JPEG data URLs via `persistImageFiles()` before `saveLocalListing()`; store in `imageUrl` + `images[]` |
| **Files** | `shared/utils/persist-images.ts` (new), `useAddListingForm.ts`, `AppImage.tsx` |

### P0 — “الإعلان غير موجود” flash after publish

| Item | Detail |
|------|--------|
| **Symptom** | Local listing detail briefly showed empty state even when listing existed |
| **Root cause** | `useState(null)` + `setTimeout(0)` deferred localStorage read, rendering empty state first |
| **Fix** | Read `getLocalListingById()` synchronously on client render; skeleton only during SSR |
| **Files** | `LocalListingDetails.tsx`, `LocalListingEdit.tsx`, `Skeleton.tsx` (`ListingDetailSkeleton`) |

### P0 — Dashboard showed wrong listings after registration

| Item | Detail |
|------|--------|
| **Symptom** | New users saw demo mock listings (Nissan, iPhone, etc.) in “إعلاناتي” |
| **Root cause** | `MyListingsDashboard` merged all server mock listings with local listings for every session |
| **Fix** | Show mock listings only for demo accounts; scope local listings to `seller.id === session.id` |
| **Files** | `MyListingsDashboard.tsx`, `client-storage.ts` (`getLocalListingsForSeller`) |

### P1 — Double publish / duplicate listings

| Item | Detail |
|------|--------|
| **Symptom** | Rapid double-click on “نشر الإعلان” could create multiple `local-*` entries |
| **Root cause** | No concurrent guard in `useAsyncAction`; each submit used new `Date.now()` id |
| **Fix** | `isRunningRef` guard in `useAsyncAction`; `publishedRef` in publish handler |
| **Files** | `useAsyncAction.ts`, `useAddListingForm.ts` |

### P1 — Registration/profile UI glitches

| Item | Detail |
|------|--------|
| **Symptom** | Register submit had no loading state; profile briefly showed demo user after registration |
| **Root cause** | Missing `loading` on register button; profile used `setTimeout(0)` to read session |
| **Fix** | `useAsyncAction` + stable `useCallback` on register; lazy session read in `ProfileForm` |
| **Files** | `RegisterForm.tsx`, `ProfileForm.tsx` |

### P1 — Search showed other users’ local listings

| Item | Detail |
|------|--------|
| **Symptom** | Local listings from other browser sessions/users appeared in search |
| **Root cause** | `SearchResultsList` merged all `sooqna-local-listings` without seller filter |
| **Fix** | Filter local listings by current session `seller.id` |
| **Files** | `SearchResultsList.tsx` |

### P2 — Missing submit guards

| Item | Detail |
|------|--------|
| **Symptom** | Forgot password and local edit could double-submit |
| **Fix** | Added `loading` via `useAsyncAction` |
| **Files** | `ForgotPasswordForm.tsx`, `LocalListingEdit.tsx` |

### P2 — Incomplete legacy storage migration

| Item | Detail |
|------|--------|
| **Symptom** | `recentlyViewed` / `savedSearches` keys not migrated from `uae-sales-*` |
| **Fix** | Extended `ensureMigrated()` in `client-storage.ts` |
| **Files** | `client-storage.ts` |

---

## 2. Files Fixed

| File | Change |
|------|--------|
| `shared/utils/persist-images.ts` | **New** — image compression → data URLs |
| `shared/hooks/useAsyncAction.ts` | Concurrent invocation guard |
| `shared/components/AppImage.tsx` | Native `<img>` for `data:` / `blob:` sources |
| `services/storage/client-storage.ts` | Seller-scoped query + full legacy migration |
| `services/storage/index.ts` | Export `getLocalListingsForSeller` |
| `features/listings/components/add-listing/useAddListingForm.ts` | Persist images, `postedAt`, double-publish guard |
| `features/listings/components/LocalListingDetails.tsx` | Remove empty-state flash |
| `features/listings/components/LocalListingEdit.tsx` | Loading guard, sync storage read |
| `features/dashboard/components/MyListingsDashboard.tsx` | User-scoped listings |
| `features/search/components/SearchResultsList.tsx` | Seller filter, remove fake delay |
| `features/auth/components/RegisterForm.tsx` | Submit loading + stable OTP callback |
| `features/auth/components/ForgotPasswordForm.tsx` | Submit loading |
| `features/profile/components/ProfileForm.tsx` | Session read without flash |
| `features/listings/components/RecentlyViewedSection.tsx` | Merge local listings for slug lookup |
| `shared/ui/Skeleton.tsx` | `ListingDetailSkeleton` |

---

## 3. Flow Verification (manual)

| Flow | Expected result | Status |
|------|-----------------|--------|
| Register → OTP → profile | Session created, no demo user flash | ✅ |
| Login → add listing → publish | Redirect to `/listings/local/{id}`, images persist | ✅ |
| My Listings (new user) | Only user’s local listings, no mock demo items | ✅ |
| Search created listing | Appears when logged in as publisher | ✅ |
| Listing detail (local) | No “not found” flash; gallery shows uploaded images | ✅ |
| Double-click publish | Single listing created | ✅ |

HTTP smoke test: `/`, `/register`, `/listings/new`, `/dashboard/listings`, `/search` → **200**

---

## 4. Remaining Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Large data URLs in localStorage | Medium | JPEG compression limits size; very large uploads may hit quota |
| Registration password not persisted | Low | Mock auth — login only works for demo accounts until API wired |
| Profile save still mock | Low | Message shown but `setSessionUser` not called on profile edit |
| `RecentlyViewedSection` on local pages | Low | Tracker not yet on `/listings/local/[id]` route |

---

## 5. Validation

```bash
npm run lint   # ✅
npm run build  # ✅ (75 routes)
```

---

*Critical bug fix pass — glitch and flow stability focused.*
