# Checkout Confirmation Report

## Summary

Added dedicated checkout success experience at `/checkout/success?orderId=` replacing raw query-string-only order redirect.

## Flow Changes

| Before | After |
|--------|-------|
| Stripe `success_url` → `/orders/[id]?payment=success` | `/checkout/success?orderId=[id]` |
| Mock checkout → `/orders/[id]?payment=success` | `/checkout/success?orderId=[id]` |

## Confirmation Page Includes

- Order ID and payment/escrow status badges
- Listing title, seller, total (`CurrencyAmount`)
- Shipping method and estimated delivery (when applicable)
- Saved delivery address (when `deliveryAddressId` present)
- Next steps guidance
- Links: order details, messages, continue browsing

## Polling

`CheckoutSuccessContent` polls order API up to 8 times while status is `pending_payment` (webhook latency).

## Files Added/Changed

- `features/checkout/components/CheckoutSuccessContent.tsx`
- `app/checkout/success/page.tsx`
- `services/payments/stripe.service.ts`
- `app/api/checkout/session/route.ts`

## Remaining Risks

- Order detail page (`/orders/[id]`) still supports `?payment=success` for backward compatibility.
- Address display depends on address still existing in store.
