# Currency Audit Report

## Summary

Removed hardcoded `د.إ` and `AED` from UI components and user-facing activity/notification text.

## Shared Utility

`shared/utils/currency.ts`:
- `formatCurrencyAmount()` — numeric formatting
- `formatCurrencyLabel()` — text labels with Arabic "درهم" for notifications

## Migrated Surfaces

| Surface | Change |
|---------|--------|
| `DashboardOverviewPanel` | `CurrencyAmount` for wallet/escrow cards and activity amounts |
| `mock/dashboard.mock.ts` | numeric `amount` fields instead of formatted strings |
| `order-service.ts` notifications | `formatCurrencyLabel()` |
| All prior `CurrencyAmount` surfaces | unchanged (already compliant) |

## Intentionally Retained

| Location | Reason |
|----------|--------|
| `types/domain/*.ts` `currency: "AED"` | Type literal, not UI |
| `CurrencyAmount.tsx` SVG fallback | Spec-required fallback when symbol fails |
| `mock/listings.mock.ts` job descriptions | Listing content prose, not price UI |
| Stripe/payment config `AED` | Payment gateway currency code |

## Verification

```bash
rg 'د\.إ' --glob '*.{tsx,ts}' 
# Remaining: mock/listings.mock.ts job salary prose only
```

## Remaining Risks

- Job listing descriptions in mock data still mention salaries in Arabic prose (content data, not formatting layer).
