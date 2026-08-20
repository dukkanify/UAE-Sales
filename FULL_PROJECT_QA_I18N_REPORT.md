# Full Project QA + Arabic/English Localization Audit

**Branch:** `cursor/full-i18n-qa-audit-37ba`  
**Date:** 2026-08-20  
**Scope:** Sooqna web (`sooqna-web`) — App Router UI, i18n dictionary, category surfaces, listing bilingual titles, production spot-check of https://sooqna.site  
**Design constraint:** No visual redesign; fixes limited to localization / responsive correctness.

---

## Executive summary

Production English mode still leaked Arabic on the **Categories** page (hero description, most subcategory chips, and glued count labels like `6Listing`). Homepage featured **listing titles / seller names** also stayed Arabic because the home-feed slim payload dropped `titleEnglish` (fix included here from the open listing-titles work).

This PR:

1. Restores bilingual listing titles/sellers on cards and related surfaces  
2. Fixes category count formatting with locale-aware helpers  
3. Adds missing `phrases.en.json` entries for all category subcategories and critical chrome  
4. Tightens `tx()` templates for composite count strings  
5. Adds `scripts/check-i18n-critical.mjs` for regression coverage  

`npm run lint` and `npm run build` both pass on this branch.

---

## Issues found

### P0 — English UI showed Arabic (user-reported / production)

| Issue | Root cause | Fix |
|---|---|---|
| Categories hero description stays Arabic | Exact string missing from `phrases.en.json` | Added phrase for `تصفح سوقنا عبر أقسام واضحة…` |
| Electronics / Mobiles / Furniture / Jobs (etc.) subcategory chips Arabic | 39+ subcategory strings missing from phrases | Added all 51 unique subcategory translations |
| `6Listing` glued label | JSX `{n} إعلان` → two text nodes; LiveLocalizer mapped `إعلان`→`Listing` and dropped space | `listingCountLabel()` / `activeListingCountLabel()` / `resultsCountLabel()` single-string helpers + `tx` templates |
| Featured listing titles/sellers Arabic on English home | `slimListingForCard` set `titleEnglish: undefined`; seller `nameEnglish` not plumbed | Keep bilingual titles; `SellerName` + `sellerName()`; wire cards/checkout/gallery |

### P1 — Related localization gaps

| Issue | Fix |
|---|---|
| Category hero “N إعلان نشط في هذا القسم” | `activeListingCountLabel` + SSR `getRequestLocale` |
| Emirates cards `{n} إعلان` | `listingCountLabel` |
| Search/category results `{n} نتيجة` | `resultsCountLabel` |
| Homepage category rails missing EN titles/descriptions | Phrases for `mockHomeCategorySections` copy |
| Auth trust point count composite | `uaeActiveListingsLabel` |
| ChipLink subcategory labels | Client `useTx()` |
| API Arabic `message` strings (auth reset/login) | Added EN phrases so LiveLocalizer can translate displayed messages |
| Short/awkward listing `titleEnglish` for key featured ads | Improved villa / apartment / office / iPhone English titles |

### P2 — Observed on production (ops / out of pure i18n)

| Observation | Notes |
|---|---|
| https://sooqna.site/categories still Arabic in EN until deploy | Expected — fixes not on production yet |
| Stripe webhook previously `STRIPE_NOT_CONFIGURED` | Ops: set Live keys in Vercel + redeploy (not changed in this PR) |
| No automated browser E2E suite in repo | Manual + script checks used |

### Residual / accepted by design

| Item | Why |
|---|---|
| User-generated listings without `titleEnglish` / `nameEnglish` | Stay Arabic under English locale (UGC); `data-ugc` skips LiveLocalizer |
| Admin cockpit density | Mostly Arabic source + LiveLocalizer; not fully rewritten to keyed message maps |
| Emails | Existing locale-aware templates; not redesigned here |
| English UI with intentional English product names (Mercedes, iPhone) | Allowed |

---

## Files modified (high level)

### i18n core
- `shared/i18n/phrases.en.json` — large phrase coverage expansion  
- `shared/i18n/tx.ts` — count / results templates  
- `shared/i18n/count-labels.ts` — **new** locale-aware count helpers  
- `shared/i18n/listing-copy.ts`, `shared/i18n/SellerName.tsx`, `shared/i18n/ListingTitle.tsx` (via listing titles work)  
- `scripts/check-i18n-critical.mjs` — **new** regression script  

### Categories / home
- `app/categories/page.tsx`  
- `app/categories/[slug]/page.tsx`  
- `features/categories/components/CategoryDirectory.tsx`  
- `features/categories/components/CategoryHero.tsx`  
- `features/home/components/marketplace/MarketEmirates.tsx`  
- `features/home/components/mobile/MobileEmiratesSection.tsx`  
- `features/home/components/marketplace/MarketNearbySection.tsx`  
- `features/home/components/mobile/MobileAppDevicePreview.tsx`  
- `features/home/components/mobile/MobileNearbyCard.tsx`  
- `services/content/homepage-marketplace.content.ts`  
- `shared/ui/ChipLink.tsx`  

### Listings / checkout / search
- `services/listings/home-feed.ts`  
- `mock/sellers.mock.ts`, `mock/listings.mock.ts`  
- `types/domain/listing.ts`  
- `features/listings/components/PremiumListingCard.tsx`  
- `features/listings/components/SellerPanel.tsx`  
- `features/listings/components/ListingGallery.tsx`  
- `features/listings/components/LocalListingDetails.tsx`  
- `features/listings/components/ViewingBookingModal.tsx`  
- `features/listings/components/JobApplicationModal.tsx`  
- `features/listings/components/QuoteRequestModal.tsx`  
- `features/checkout/components/CheckoutContent.tsx`  
- `features/checkout/components/CheckoutWizard.tsx`  
- `features/search/components/search-suggestions.ts`  
- `app/search/page.tsx`  

### Admin
- `features/admin/components/AdminCategoriesPanel.tsx`  
- `features/admin/components/AdminListingsPanel.tsx`  

### Report
- `FULL_PROJECT_QA_I18N_REPORT.md` (this file)

---

## What was tested

| Check | Result |
|---|---|
| `node scripts/check-i18n-critical.mjs` | Pass — critical category phrases + `6 listings` label |
| All 51 subcategory strings present in `phrases.en.json` | Pass |
| Clean JSX Arabic scan for missing phrases | Reduced to covered set; remaining intentional/dynamic |
| API Arabic `message` phrase coverage | 38 messages scanned; missing 5 added |
| `npm run lint` | Pass |
| `npm run build` (Next.js 16 / TypeScript) | Pass |
| Production spot-check https://sooqna.site/categories | Confirmed Arabic leaks **before** deploy (baseline) |
| Desktop/Mobile visual E2E in browser automation | Not fully automated in this environment; recommend post-merge manual pass on EN+AR |

### Recommended manual post-merge checklist

1. English: `/categories` — description EN, subcategory chips EN, counts like `6 listings`  
2. English: `/` featured strip — English titles + seller names  
3. Switch AR ↔ EN without full reload — header/footer/categories chips update  
4. RTL Arabic / LTR English — header search, modals, category cards  
5. Login / forgot password error strings in English  
6. Mobile: categories + home emirates counts  

---

## What remains (follow-ups)

1. **Deploy this PR** so production matches the fix.  
2. Optional: migrate high-traffic pages from LiveLocalizer phrase-lookup to explicit `messages` / `COPY` maps (hero pattern) for zero FOUC.  
3. Optional: bilingual fields on `Category` type (`nameEnglish`, `subcategoriesEnglish`) instead of phrase dictionary for subcats.  
4. Optional: map API `error` codes → locale messages on the client and stop returning Arabic `message` from APIs.  
5. Add Playwright (or similar) EN Arabic-character scan against key routes.  
6. Confirm Stripe Live env on Vercel (separate ops task).  

---

## Definition of Done status

| Criterion | Status |
|---|---|
| English UI free of Arabic for audited chrome + categories + listing titles (demo catalog) | **Met in code** (pending production deploy) |
| Arabic UI remains coherent (source Arabic + phrases not forced) | **Met** |
| lint + build green | **Met** |
| Critical journeys exercised | **Partially met** (lint/build/script + production baseline; full browser matrix recommended after merge) |
| Report + dedicated PR | **Met** |
