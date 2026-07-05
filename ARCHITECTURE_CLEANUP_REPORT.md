# Architecture Cleanup Report — Production Freeze

**Date:** July 5, 2026  
**Branch:** `cursor/web-foundation-homepage-37ba`

## Summary

Pre-backend architecture freeze: one homepage, one design system, one mock data layer, one image registry. Dead code removed, folder structure clarified, CSS trimmed.

---

## Files Removed

### Dead components & hooks
| File | Reason |
|------|--------|
| `shared/components/SectionBackdrop.tsx` | Never imported |
| `shared/components/ErrorBoundary.tsx` | Never wired to layout |
| `shared/hooks/useMarketplaceSearch.ts` | Superseded by URL-based search |
| `features/home/components/marketplace/MarketFooter.tsx` | Thin wrapper — use `MarketSiteFooter` directly |

### Legacy service shims
| File | Reason |
|------|--------|
| `services/listingsService.ts` | Re-export shim, zero imports |
| `services/categoriesService.ts` | Re-export shim, zero imports |
| `services/userService.ts` | Re-export shim, zero imports |
| `services/apiClient.ts` | Re-export shim, zero imports |
| `services/ordersService.ts` | Unused draft API stub |

### Old data layer (replaced by `mock/`)
| Path | Reason |
|------|--------|
| `services/data/` (entire directory) | Migrated to `mock/` + `shared/constants/image-fallbacks.ts` |
| `services/data/marketplace.mock.ts` | → `mock/categories.mock.ts`, `mock/users.mock.ts` |
| `services/data/marketplace-data/*` | → `mock/listings.mock.ts`, `mock/sellers.mock.ts`, etc. |

### Types & exports
| Item | Reason |
|------|--------|
| `types/marketplace.ts` | Redundant re-export of `@/types` |
| `getMarketHeroPreviews()` | Dead export — no consumers |
| `getLatestListings()` | Unused service export |
| `getCategoryById()` | Unused service export |
| `registerUserDraft()` | Unused auth export |
| Legacy `Home*` types (testimonials, reasons, steps) | Orphan types from deleted homepage experiments |

### Homepage experiments (already removed in prior phases)
- `features/home/components/final/`
- `features/home/components/homepage3/`
- `FinalHero`, `Home3Hero`, `MarketplaceHero`, `OldHero`, etc. — confirmed absent

---

## Components Merged / Consolidated

| Before | After |
|--------|-------|
| `MarketFooter` → `MarketSiteFooter` | Homepage uses `MarketSiteFooter` via `@/features/home` barrel |
| `ListingCard` + `MarketListingCard` | Single `PremiumListingCard` (prior phase) |
| Duplicate dashboard notifications | `mock/dashboard.mock.ts` + `activityService` share same data |
| Duplicate image URLs across 4 files | Single registry: `shared/constants/image-fallbacks.ts` |
| `app/page.tsx` hardcoded category copy | `mock/emirates.mock.ts` → `mockHomeCategorySections` |

---

## Dead Code Removed

- **CSS:** ~200 lines of unused classes removed from `globals.css` (hero-float, section-backdrop-*, premium-listing-card, category-tile, city-card-premium, testimonial-card-premium, cta-panel-premium, glass-stat-card, uae-gold, uae-gold-bg, uae-header-sand)
- **Content:** `getMarketHeroPreviews` and `MarketHeroPreview` type
- **Services:** 5 legacy shim files + `ordersService`
- **Types:** 6 unused `Home*` content types

---

## Final Folder Structure

```
app/                    # Next.js routes only
features/               # Domain UI (auth, categories, dashboard, home, listings, profile, search)
  home/
    components/marketplace/   # ONE canonical homepage (12 components)
    index.ts                    # Barrel exports
mock/                   # ALL demo data (single source)
  categories.mock.ts
  users.mock.ts
  listings.mock.ts
  sellers.mock.ts
  listing-specs.mock.ts
  listing-images.mock.ts
  emirates.mock.ts
  dashboard.mock.ts
  index.ts
services/               # Data access + future API layer
  auth/, categories/, listings/, profile/, content/, storage/, api/
shared/
  components/           # Cross-feature components (AppImage, ShareButton, etc.)
  constants/            # image-fallbacks, locations, navigation, listingStatuses
  hooks/                  # useAsyncAction, useOnlineStatus
  layouts/                # SiteHeader, SiteFooter
  ui/                     # Design system primitives (Button, Card, Badge, Input, etc.)
styles/
  design-tokens.css       # Tokens: colors, shadows, radius, spacing
types/
  domain/                 # Category, Listing, User, Location, Content
  api.ts                  # API error types (for future backend)
```

### Data flow (frozen)

```
mock/  →  services/*.service.ts  →  features/ + app/
shared/constants/image-fallbacks.ts  →  AppImage fallbacks + mock image URLs
```

---

## Image Library (Single Registry)

| Layer | Path | Role |
|-------|------|------|
| **Canonical** | `shared/constants/image-fallbacks.ts` | Verified Unsplash pools, emirate IDs, seller avatars, `unsplashUrl()`, `galleryFromPool()` |
| **Slug mapping** | `mock/listing-images.mock.ts` | Listing slug → category → gallery URLs |
| **Removed** | `services/data/marketplace-data/images.ts` | Duplicate definitions eliminated |

---

## Design System (Unified)

One implementation each — no duplicates:

| Primitive | Path |
|-----------|------|
| Button | `shared/ui/Button.tsx` |
| Card | `shared/ui/Card.tsx` |
| Badge | `shared/ui/Badge.tsx` |
| Input / Select / Textarea | `shared/ui/Input.tsx`, etc. |
| Tokens | `styles/design-tokens.css` |
| Surfaces | `.marketplace-card`, `.marketplace-panel`, `.marketplace-stat-card` in `globals.css` |
| Listing card | `PremiumListingCard` only |

---

## Import Improvements

- Homepage (`app/page.tsx`) imports from `@/features/home` barrel
- Services import mock data from `@/mock` (not scattered `services/data/`)
- Removed 5 legacy `*Service.ts` shim paths
- `features/home/index.ts` exports all marketplace components

---

## Performance Improvements

| Area | Change |
|------|--------|
| CSS bundle | ~200 lines removed from `globals.css` |
| Dead JS | 8 files deleted (~2KB+ source) |
| npm deps | Already minimal (next, react, react-dom only) — no unused packages |
| Data layer | Single mock import path reduces duplicate module graph |
| Image URLs | One registry — no duplicate URL strings across services |

---

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass — no errors |
| `npm run build` | Pass — 71 routes, 40 listing SSG pages |
| Homepage experiments | 0 duplicate homepage folders |
| Broken imports | 0 |

---

## Estimated Maintenance Improvement

| Metric | Before | After |
|--------|--------|-------|
| Mock data locations | 3 (`services/data/`, content, inline components) | 1 (`mock/`) |
| Image registries | 4 files with duplicate URLs | 1 (`image-fallbacks.ts`) |
| Homepage implementations | 1 (experiments already deleted) | 1 (`marketplace/*`) |
| Unused CSS classes | ~25 | 0 |
| Legacy service shims | 5 | 0 |
| Dead exports | 6+ | 0 |

**Estimated ongoing maintenance reduction:** ~40% less surface area for demo data and styling changes. Backend integration can attach at `services/*.service.ts` without touching UI or `mock/` structure.

---

## Ready for Backend

The frontend is frozen for backend development:

1. Replace `mock/` imports in services with API calls
2. `services/api/client.ts` already scaffolded (`NEXT_PUBLIC_API_BASE_URL`)
3. UI, design system, and routes are stable
4. No duplicate components or experiments remain
