# Project Cleanup Report

**Date:** July 5, 2026  
**Branch:** `cursor/web-foundation-homepage-37ba`

## Summary

Production cleanup verified after prior architecture freeze. Demo accounts added. No design, routes, or UI layout changes were made in this pass.

---

## Files Removed (Prior + Verified Absent)

| Category | Items |
|----------|-------|
| Homepage experiments | `Home3*`, `Final*`, `homepage3/`, `final/` — **0 files remain** |
| Dead components | `SectionBackdrop`, `ErrorBoundary`, `MarketFooter` wrapper |
| Dead hooks | `useMarketplaceSearch` |
| Legacy shims | `listingsService.ts`, `categoriesService.ts`, `userService.ts`, `apiClient.ts`, `ordersService.ts` |
| Old data layer | `services/data/` (migrated to `mock/`) |
| Dead types | `types/marketplace.ts`, legacy `Home*` content types |
| Dead exports | `getMarketHeroPreviews`, `getLatestListings`, `getCategoryById`, `registerUserDraft` |
| Dead CSS | ~200 lines (hero-float, section-backdrop-*, premium-listing-card, etc.) |

---

## Files Added (This Pass)

| File | Purpose |
|------|---------|
| `mock/demo-accounts.mock.ts` | Demo user, business, admin credentials |
| `features/auth/components/DemoAccountsPanel.tsx` | Login page demo credentials box |
| `TESTING_GUIDE.md` | QA testing documentation |

---

## Files Moved

| From | To |
|------|-----|
| `services/data/marketplace-data/*` | `mock/listings.mock.ts`, `sellers.mock.ts`, etc. |
| `services/data/marketplace.mock.ts` | `mock/categories.mock.ts`, `users.mock.ts` |

---

## Components Merged / Consolidated

| Item | Status |
|------|--------|
| **Listing card** | Single implementation: `PremiumListingCard`. `ListingCard` is a re-export alias only. |
| **Homepage** | Single version: `features/home/components/marketplace/*` (12 components) |
| **Header** | `SiteHeader` (all pages except `/`). `MarketHeader` (homepage only) — **kept separate to preserve homepage design** |
| **Footer** | `SiteFooter` (all pages except `/`). `MarketSiteFooter` (homepage only) — **kept separate to preserve homepage design** |
| **Dashboard notifications** | Unified in `mock/dashboard.mock.ts` |

---

## Services Merged

| Before | After |
|--------|-------|
| `services/data/` + scattered mocks | `mock/` single barrel |
| Duplicate image URLs | `shared/constants/image-fallbacks.ts` |
| Generic auth mock | `services/auth/auth.service.ts` + `mock/demo-accounts.mock.ts` |

---

## Content Files Removed

- `homepage.content.ts`, `homepage3.content.ts`, `homepage-final.content.ts` — deleted in prior phases
- `getMarketHeroPreviews()` — removed (unused)
- Single homepage content: `services/content/homepage-marketplace.content.ts`

---

## Types Removed or Merged

| Removed | Kept |
|---------|------|
| `HomeStat`, `HomeTestimonial`, `HomeReason`, `HomeStep`, `HomeEscrowStep`, `HomeTrustPoint` | `HomeCityHighlight` |
| `PaginatedResult`, `ServiceResult` (unused API types) | `ApiErrorCode`, `ApiErrorPayload` |
| `types/marketplace.ts` re-export | `types/domain/*` |

**Added:** `UserRole`, optional profile fields (`walletBalance`, `listingsCount`, etc.)

---

## Images

- Single registry: `shared/constants/image-fallbacks.ts`
- Slug mapping: `mock/listing-images.mock.ts`
- No duplicate image definition files remain
- Fallback system preserved in `AppImage`

---

## Lines Removed (Cumulative)

| Pass | Approx. net lines |
|------|-------------------|
| Architecture cleanup | −247 lines (40 files) |
| Image audit | Rebuilt image URLs |
| This pass | +demo auth (~200 lines added, 0 design changes) |

---

## Final Folder Structure

```
app/                    # Next.js routes
features/               # Domain UI (auth, home, listings, search, etc.)
  home/components/marketplace/   # ONE homepage
mock/                   # ALL demo data + demo accounts
services/               # Auth, listings, categories, content, API scaffold
shared/
  components/           # AppImage, ShareButton, etc.
  constants/            # image-fallbacks, navigation, locations
  hooks/
  layouts/              # SiteHeader, SiteFooter
  ui/                   # Design system primitives
styles/                 # design-tokens.css
types/domain/           # User, Listing, Category, Location
```

---

## Lint Result

```
npm run lint — PASS (0 errors)
```

---

## Build Result

```
npm run build — PASS
71 routes generated
40 listing SSG pages
```

---

## Design Stability

No changes to:
- Homepage layout or marketplace header/footer styling
- Page routes
- UI components visual output
- UX flows (except demo auth validation)

All listed routes verified building successfully.
