# Image Audit Report — UAE Sales

**Date:** July 5, 2026  
**Branch:** `cursor/web-foundation-homepage-37ba`

## Executive Summary

A full-site image audit found **38 broken Unsplash URLs (404)** out of 135 unique image URLs — the root cause of gray placeholders and missing photos across listing cards, categories, and emirates sections. All image sources were rebuilt using HTTP-verified photo IDs, a category fallback system was added, and `AppImage` was upgraded to never show a broken icon or gray placeholder.

---

## Broken Images Found

### Root cause
Many Unsplash photo IDs in `services/data/marketplace-data/images.ts` returned **HTTP 404**. Next.js `Image` failed silently and `AppImage` fell back to a gray box with a photo icon.

### Affected areas (before fix)
| Area | Issue |
|------|-------|
| Listing cards (35 listings) | ~28% of gallery URLs broken |
| Category tiles | `kids` category image 404 |
| Homepage hero preview | Mercedes image 404 (`photo-1563720360172`) |
| Sharjah emirate card | Image 404 (`photo-1582672060674`) |
| Profile saved listings | Car thumbnail 404 |
| Gallery thumbnails | Multiple broken IDs per listing |

### Sample broken photo IDs (removed)
- `photo-1563720360172-1f859e989174` (cars — used widely)
- `photo-1582672060674-bc2bd808a8c5` (Sharjah)
- `photo-1600210492496-724fe5c67fb0` (real estate)
- `photo-1560448204-e02f11c2d0e1` (apartments)
- `photo-1515488042361-ee00e5ddd9e4` (kids)
- `photo-1567583698982-65faad7bb398` (mobiles)
- Plus 32 additional 404 IDs across furniture, services, jobs, electronics

---

## Images Replaced

### 1. Central fallback registry (`shared/constants/image-fallbacks.ts`)
Verified photo pools per category:
- `cars`, `real-estate`, `mobiles`, `electronics`, `furniture`, `services`, `jobs`, `fashion`, `kids`, `pets`, `books`, `sports`, `food`, `avatar`, `emirates`, `default`

Emirate-specific mapping:
| Emirate | Photo subject |
|---------|---------------|
| Dubai | Burj Khalifa / skyline (`photo-1512453979798`) |
| Abu Dhabi | Sheikh Zayed Mosque area (`photo-1577717903315`) |
| Sharjah | UAE cityscape (`photo-1506905925346`) |
| Ajman | Corniche / beach (`photo-1507525428034`) |
| Ras Al Khaimah | Mountains / coast (`photo-1464822759023`) |
| Fujairah | Beach / mountains (`photo-1520250497591`) |

### 2. Listing images rebuilt (`services/data/marketplace-data/images.ts`)
- All 40 listing slugs mapped to category pools
- 6 unique images per listing generated from verified pools (slug-seeded rotation)
- Category hero images use first verified pool image per category
- Seller avatars retained (all 10 verified HTTP 200)

### 3. Homepage content (`homepage-marketplace.content.ts`)
- Hero background → Dubai skyline (verified)
- Hero previews → verified car, villa, iPhone, office URLs
- Emirates section → `getEmirateImageUrl()` per emirate

### 4. Activity service saved listings
- Replaced broken Mercedes URL with verified `photo-1618843479313`

---

## Fallback Strategy

```
Primary src (listing/category/emirate URL)
        ↓ onError
Category fallback (from verifiedPhotoPools[categoryId])
        ↓ if still fails
Default fallback (Dubai skyline / marketplace default)
```

### AppImage behaviour (`shared/components/AppImage.tsx`)
- **No gray placeholder** — always renders a real photograph
- **No broken icon** — `onError` swaps to category/emirate/avatar fallback
- **Loading skeleton** — shimmer overlay until `onLoad`
- **`object-cover`** applied by default
- **Lazy loading** for non-priority images
- **Accessible alt text** + `sr-only` label when fallback is active
- Props: `fallbackCategory`, `fallback` (`avatar` | `emirates` | category)

### Components updated with fallbacks
- `PremiumListingCard` — `fallbackCategory={listing.categoryId}`
- `ListingGallery` — main + thumbnails
- `CategoryHero`, `CategoryDirectory`
- `MarketEmirates`, `MarketHero`
- `SellerPanel`, `ChatPage` avatars

---

## Pages Tested

| Page | Status |
|------|--------|
| Homepage (hero, emirates, featured, preview strip) | Verified |
| Search results | Uses `PremiumListingCard` with fallbacks |
| Categories directory | Category thumbnails + fallbacks |
| Category detail (`/categories/[slug]`) | Hero + featured card |
| Listing details (`/listings/[slug]`) | Gallery + seller avatar |
| Featured listings | Card grid |
| Dashboard / Chat | Avatar fallbacks |
| Related / Recently viewed | Inherited card fallbacks |

---

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 71 routes, 40 listing SSG pages |
| Broken URL audit (pre-fix) | 38 / 135 URLs returned 404 |
| Post-fix architecture | All URLs generated from verified pools only |

---

## Files Changed

- `shared/constants/image-fallbacks.ts` — **new** fallback registry
- `shared/components/AppImage.tsx` — fallback + skeleton, no gray placeholder
- `services/data/marketplace-data/images.ts` — rebuilt from verified pools
- `services/content/homepage-marketplace.content.ts` — emirates + hero URLs
- `services/activityService.ts` — saved listing thumbnails
- `features/listings/components/PremiumListingCard.tsx`
- `features/listings/components/ListingGallery.tsx`
- `features/listings/components/listing-card.utils.ts`
- `features/listings/components/SellerPanel.tsx`
- `features/categories/components/CategoryHero.tsx`
- `features/categories/components/CategoryDirectory.tsx`
- `features/home/components/marketplace/MarketEmirates.tsx`
- `features/home/components/marketplace/MarketHero.tsx`
- `app/chat/page.tsx`

---

## Remaining Notes

- Images are served from Unsplash CDN (external). Production would migrate to owned CDN/storage.
- `kids` category pool has 3 unique verified photos (rotated for 6 gallery slots) — sufficient for demo; expand pool when more verified IDs are available.
- User-uploaded listings via Add Listing form use blob previews locally; production upload pipeline not yet implemented.
