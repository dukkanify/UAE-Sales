# Mobile Sticky Action Bar Report

## Summary

Implemented `MobileStickyActionBar` in `ListingStickyPanel.tsx` — fixed bottom contact/action bar for mobile listing pages.

## Root Causes Fixed

- No persistent contact CTA while scrolling on mobile.
- Actions were buried below fold after gallery.
- No safe-area support; risk of content overlap.

## Implementation

- Component: `MobileStickyActionBar` (exported from `ListingStickyPanel.tsx`)
- Visible on `lg:hidden` only; desktop uses sticky sidebar
- Page padding: `pb-28` on listing sections to prevent overlap
- Bar: `fixed inset-x-0 bottom-0 z-40` + `padding-bottom: env(safe-area-inset-bottom)`

## Actions by Category

| Type | Bar Actions |
|------|-------------|
| Products | Call, WhatsApp, Chat, Buy Now |
| Cars | Call, WhatsApp, Chat, Reserve |
| Real Estate | Call, WhatsApp, Chat, Book Viewing |
| Services | Call, WhatsApp, Request Quote |
| Jobs | Contact, Apply Job |

Unavailable contact methods (no phone/WhatsApp) are hidden — never fake numbers.

## Files Changed

- `features/listings/components/ListingStickyPanel.tsx`
- `features/listings/components/ListingPrimaryAction.tsx`
- `features/listings/components/ListingDetailsView.tsx`

## Responsive QA

- Minimum touch targets via Button `min-h-11` / `min-h-12`
- Icons + labels in grid; no clipped labels in bar
- RTL-safe layout

## Remaining Risks

- Tablet uses same mobile bar below `lg` breakpoint; could add `md` two-column bar variant later.
