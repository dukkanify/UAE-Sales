# Listing Details Rebuild Report

## Summary

Rebuilt `/listings/[slug]` and `/listings/local/[id]` into a unified premium experience via `ListingDetailsView`.

## Root Causes Fixed

- Fragmented listing layout with inconsistent mobile/desktop hierarchy.
- Missing sticky seller/action panel on desktop.
- Gallery lacked lightbox, counter, keyboard navigation, and mobile swipe controls.
- Related listings and specifications were not unified across catalog and local listings.

## Files Changed

| Area | Files |
|------|-------|
| Unified page | `features/listings/components/ListingDetailsView.tsx` |
| Gallery | `features/listings/components/ListingGallery.tsx` |
| Sticky panel | `features/listings/components/ListingStickyPanel.tsx` |
| Routes | `app/listings/[slug]/page.tsx`, `features/listings/components/LocalListingDetails.tsx` |
| Errors | `shared/constants/listing-errors.ts` |

## Layout

**Desktop:** Two-column grid — main content (breadcrumbs, gallery, description, specs, map, safety) + sticky sidebar (price, seller, actions, favorite, share).

**Mobile:** Full-width gallery → title/price → content stack → fixed bottom action bar with `safe-area-inset-bottom` and `pb-28` page padding.

## API / Database Changes

None for listing details display (mock + local storage unchanged).

## Responsive QA

- Desktop sticky sidebar verified via component structure.
- Mobile bottom bar uses `fixed inset-x-0 bottom-0` with safe-area padding.
- RTL breadcrumbs and gallery chevrons use logical positioning.

## Remaining Risks

- `BOOK_VIEWING`, `APPLY_JOB`, `REQUEST_QUOTE`, `BOOK_SERVICE` show placeholder toast until dedicated flows ship.
- Demo catalog listings mostly lack `contactPhone`; phone/WhatsApp correctly hidden per privacy rules.
