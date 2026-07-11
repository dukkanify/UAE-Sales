# Currency Symbol Report

## Summary

Introduced `CurrencyAmount` as the single source for price display with UAE dirham SVG asset.

## Component

**Path:** `shared/components/CurrencyAmount.tsx`  
**Asset:** `public/brand/dirham.svg`  
**Fallback:** `AED` text if SVG fails to load  
**Sizes:** `sm`, `md`, `lg`, `xl`  
**Locales:** `ar-AE` (default), `en-AE`

## Migrated Surfaces

| Surface | Status |
|---------|--------|
| Listing cards (`PremiumListingCard`) | Done |
| Listing details (`ListingDetailsView`, `ListingStickyPanel`) | Done |
| Checkout wizard | Done |
| Orders list + detail | Done |
| Wallet page + balances | Done |
| Escrow page | Done |
| Admin orders/escrow/reports | Done |
| Search filter chips (min/max price) | Done |
| Favorites panel | Done |
| Add listing preview | Done |
| Related listings (via `ListingCard`) | Done |

## Not Migrated (Intentional)

- `mock/listings.mock.ts` — job description prose contains salary ranges in Arabic text
- `mock/dashboard.mock.ts` — static activity strings
- `services/payments/order-service.ts` notification bodies — plain numeric strings
- `types/domain/*.ts` — `currency: "AED"` type literals (not UI)

## Rules Enforced

- No random `د.إ` or `AED` in UI components
- Amount formatting via `Intl.NumberFormat`
- LTR wrapper on price for consistent alignment in RTL layout

## Remaining Risks

- Dashboard overview mock cards still show hardcoded `د.إ` strings in `mock/dashboard.mock.ts` consumed by `DashboardOverviewPanel`.
