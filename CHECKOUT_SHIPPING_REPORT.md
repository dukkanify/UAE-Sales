# Checkout & Shipping Report

## Summary

Rebuilt `/checkout` as multi-step wizard with server-validated shipping and Stripe integration.

## Steps

1. **Review** — listing image, title, seller, escrow badge
2. **Delivery** — express / standard / pickup + saved/new addresses (shippable categories only)
3. **Payment** — server-calculated fee breakdown → Stripe Checkout
4. **Confirmation** — `/orders/[id]?payment=success` (existing order detail flow)

## Shipping Engine

| File | Role |
|------|------|
| `services/shipping/shipping.config.ts` | Category rules, method fees |
| `services/shipping/shipping.service.ts` | `getAvailableShippingMethods`, `calculateShippingFee`, `resolveCheckoutShipping` |

Methods: express (35), standard (15), pickup (0). Express only when buyer/seller same emirate.

## Saved Addresses API

| Route | Method |
|-------|--------|
| `/api/addresses` | GET, POST |
| `/api/addresses/[id]` | PATCH, DELETE |
| `/api/addresses/[id]/default` | PATCH |

Storage: `.data/addresses.json` via `services/addresses/address-store.ts`

## Server-Side Totals

- `order-service.ts` calls `resolveCheckoutShipping()` — ignores client `shippingFee`
- `calculateOrderFees(productPrice, serverShippingFee)` for platform/gateway/total
- Stripe metadata includes `shippingMethod`, `escrow=true`, `platform=sooqna`

## Stripe Flow

1. Validate listing, buyer, seller, shipping
2. Create pending order (idempotent pending-order guard)
3. Create Stripe Checkout Session with server total
4. Webhook → `paid_held_in_escrow`
5. Mock fallback when `STRIPE_SECRET_KEY` unset

## Files Changed

- `features/checkout/components/CheckoutWizard.tsx`
- `app/checkout/page.tsx`
- `services/payments/order-service.ts`
- `services/payments/payment-schemas.ts`
- `types/domain/order.ts` (shippingMethod, deliveryAddressId, shippingFee in fees)

## Remaining Risks

- Address ownership not tied to HttpOnly session (userId passed in query/body).
- Pickup flow has no meetup scheduling UI yet.
