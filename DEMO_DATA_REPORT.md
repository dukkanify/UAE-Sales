# Demo Data Report

## Overview

Replaced weak placeholder marketplace data with **35 curated listings** across 8 primary categories, backed by **10 seller profiles** (5 businesses, 5 individuals), realistic UAE locations, and reliable Unsplash product imagery.

**No UI or homepage layout changes were made** — only data, content, and minimal component wiring for richer fields.

---

## Listings Created

| Category | Count | Examples |
|----------|------:|----------|
| Cars | 5 | Mercedes-AMG G63 2024, Toyota Land Cruiser 2023, Nissan Patrol Platinum 2022, BMW X7 2023, Tesla Model Y 2024 |
| Real Estate | 5 | Villa Palm Jumeirah, Downtown Dubai Apartment, Arabian Ranches Townhouse, Business Bay Office, JVC Studio |
| Mobiles | 5 | iPhone 16 Pro Max, Galaxy S25 Ultra, iPhone 15 Pro, iPad Pro M4, MacBook Pro M3 |
| Electronics | 5 | PlayStation 5, LG OLED 65", Canon EOS R6, Bose Soundbar, Apple Watch Ultra 2 |
| Furniture | 5 | Italian Sofa Set, Dining Table, Bedroom Set, Office Desk, Outdoor Garden Set |
| Services | 5 | Home Cleaning, Villa Maintenance, Car Detailing, Moving, AC Repair |
| Jobs | 5 | Sales Executive, Real Estate Agent, Delivery Driver, Accountant, Graphic Designer |
| **Total** | **35** | |

### Dashboard user listings

5 additional listings for the current demo user (`أحمد المنصوري`):

- **Active (1):** Nissan Patrol Platinum 2022
- **Pending review (1):** iPhone 15 Pro
- **Draft (1):** Dining table
- **Expired (1):** JVC studio rental
- **Rejected (1):** Apple Watch Ultra

---

## Categories Covered

Primary categories with updated marketplace counts:

| Category | Listing count |
|----------|-------------:|
| Cars | 8,420 |
| Real Estate | 6,950 |
| Mobiles | 4,820 |
| Electronics | 3,760 |
| Services | 3,180 |
| Jobs | 2,340 |
| Furniture | 1,950 |
| Fashion | 1,420 |

Additional secondary categories (pets, kids, books, sports, food) retain proportional demo counts.

---

## Image Strategy

- **Source:** Curated [Unsplash](https://unsplash.com) URLs via `services/data/demo/images.ts`
- **Format:** `auto=format&fit=crop&w=1200&q=85` for consistent quality
- **Per listing:** Minimum 2 images (most have 3)
- **Featured/premium listings:** Higher-quality hero-suitable photos (cars, villas, flagship phones)
- **No placeholders:** Removed gray blocks, duplicate thumbnails, and broken image IDs
- **Seller avatars:** Separate curated portrait set in `sellerAvatars`

---

## Sellers Created

### Business sellers

| Name | Type | Rating | Verified |
|------|------|--------|----------|
| Al Noor Motors (معرض النور للسيارات) | Car showroom | 4.9 | Yes |
| Dubai Elite Properties (دبي إيليت للعقارات) | Real estate agency | 4.8 | Yes |
| Gulf Electronics (إلكترونيات الخليج) | Electronics store | 4.7 | Yes |
| Emirates Home Services (خدمات الإمارات المنزلية) | Service company | 4.9 | Yes |
| Golden Key Real Estate (المفتاح الذهبي للعقارات) | Real estate agency | 4.8 | Yes |

### Individual sellers

| Name | Rating | Verified |
|------|--------|----------|
| Khalid Al Mansoori (خالد المنصوري) | 4.8 | Yes |
| Fatima Al Zaabi (فاطمة الزعابي) | 4.9 | Yes |
| Omar Hassan (عمر حسن) | 4.6 | No |
| Priya Sharma (بريا شارما) | 4.7 | Yes |
| Ahmed Al Mansoori (أحمد المنصوري) | 4.8 | Yes |

---

## UAE Locations Used

**Dubai:** Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, JVC, Al Barsha, Arabian Ranches

**Abu Dhabi:** Al Reem Island, Yas Island, Khalifa City, Al Raha Beach

**Sharjah:** Al Majaz, Al Nahda, Muwaileh

**Ajman:** Al Nuaimiya

**Ras Al Khaimah:** Al Hamra Village

**Fujairah:** Fujairah City

---

## Homepage & Trust Content

Updated in `services/content/homepage-marketplace.content.ts`:

- **24,800** active listings
- **18,500** verified users
- **12,400** protected transactions
- **4.8/5** platform rating

Hero preview cards link to real listing detail pages (G63, Palm Villa, iPhone 16 Pro Max, Business Bay Office).

---

## Search & Filters

`searchListings()` now supports:

- Keyword (Arabic + English titles/descriptions, area, subcategory, seller)
- Category, emirate/city, area
- Price range, condition
- Featured (`isFeatured`) and premium (`isPremium`) filters
- Newest sort via `postedAt`

---

## Wallet Demo Data

`services/walletService.ts`:

- Available balance: **2,450 AED**
- Pending balance: **850 AED**
- 4 recent activity entries (deposit, escrow hold, sale release, withdrawal)

---

## Files Changed

| Path | Purpose |
|------|---------|
| `types/domain/listing.ts` | Extended listing & seller types |
| `services/data/demo/` | Sellers, images, 35 listings |
| `services/data/marketplace.mock.ts` | Category counts, demo imports |
| `services/listings/listings.service.ts` | Enhanced search & sort |
| `services/content/homepage-marketplace.content.ts` | Trust stats & preview links |
| `services/walletService.ts` | Realistic balances & activity |
| `features/listings/components/ListingGallery.tsx` | Multi-image gallery |
| `features/listings/components/SellerPanel.tsx` | Avatar, type, join date |
| `features/listings/components/ListingSummary.tsx` | Area + escrow badge |
| `features/dashboard/components/MyListingsDashboard.tsx` | Computed view totals |

---

## Known Limitations

1. **External images** — Unsplash URLs require network access; offline builds still succeed but images load at runtime only.
2. **No real backend** — All data is in-memory; changes do not persist across sessions except local-storage listings.
3. **Search UI** — Featured/premium filters are supported in the service layer but not yet exposed as form controls in `SearchFilters`.
4. **Bilingual detail page** — English descriptions are stored (`descriptionEnglish`) but only Arabic is shown on the listing page to match existing RTL layout.
5. **Wallet page** — Still a “Coming Soon” route; balance data is shown in the dashboard sidebar only.
6. **Secondary categories** — Pets, kids, books, etc. have category counts but no dedicated demo listings in this pass.

---

## Validation

```bash
npm run lint
npm run build
```

Both commands should pass with 40+ static listing routes generated from demo slugs.
