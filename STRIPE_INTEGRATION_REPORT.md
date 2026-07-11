# Sooqna — Stripe Integration Report

**Version:** Post `v0.1.0-beta`  
**Date:** 2026-07-08

## Summary

Stripe Checkout is integrated into Sooqna for the full payment → escrow → release → refund lifecycle. When `STRIPE_SECRET_KEY` is missing, a **mock fallback** completes orders locally without Stripe (developer console warning only).

## What Was Added

| Area | Files |
|------|-------|
| Env config | `.env.example`, `.env.production.example` |
| Stripe SDK | `stripe`, `@stripe/stripe-js`, `zod` |
| Service layer | `services/payments/stripe.service.ts` |
| Order/escrow ledger | `services/payments/order-store.ts`, `wallet-ledger.ts` |
| API routes | `/api/checkout/session`, `/api/webhooks/stripe`, `/api/orders/*`, `/api/wallet`, `/api/admin/*` |
| Checkout UI | `features/checkout/components/CheckoutContent.tsx` |
| Orders UI | `app/orders`, `app/orders/[id]` |
| Admin UI | `/admin/orders`, `/admin/escrow`, `/admin/reports` |
| Wallet | Ledger-backed balances + held-in-escrow column |

## Environment Setup

```bash
cp .env.example .env.local
```

Required variables:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=aed
NEXT_PUBLIC_APP_URL=https://sooqna.site
```

## Stripe Service Functions

| Function | Purpose |
|----------|---------|
| `createCheckoutSession()` | Hosted Stripe Checkout with order metadata |
| `createPaymentIntent()` | Direct PaymentIntent creation (available for future use) |
| `verifyStripeWebhook()` | Signature verification |
| `getStripePaymentStatus()` | Retrieve PaymentIntent status |
| `refundStripePayment()` | Issue refund with idempotency key |

## Payment Flow

1. Buyer clicks **تأكيد الدفع** on `/checkout`
2. Server validates listing + buyer, calculates fees server-side
3. Order created with `pending_payment`
4. Stripe Checkout Session created with metadata (`orderId`, `listingId`, `buyerId`, `sellerId`, `platform=sooqna`, `escrow=true`)
5. Buyer redirected to Stripe hosted checkout
6. Webhook `checkout.session.completed` marks order `paid_held_in_escrow`
7. Seller pending balance updated; notifications created
8. Buyer confirms receipt → escrow released → seller available balance updated

## Mock Fallback

When `STRIPE_SECRET_KEY` is unset:

- Console warning (dev only): `[Sooqna Payments] STRIPE_SECRET_KEY is missing`
- Order auto-completes as `paid_held_in_escrow` without Stripe redirect
- All demo flows remain functional for local development

## Security

- Fees calculated server-side only (`fee-calculator.ts`)
- Zod validation on all API inputs
- Webhook signature verification
- Idempotency keys on Stripe calls
- Duplicate pending orders prevented per buyer+listing
- Refund endpoint requires `admin` role

## Data Storage

Orders, wallet ledger, notifications, and payment events persist in `.data/` (JSON files, gitignored). No external database required for beta.

## TESTING_GUIDE

### Successful payment

| Field | Value |
|-------|-------|
| Card | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any valid value |

### Failed payment test cards

| Scenario | Card |
|----------|------|
| Generic decline | `4000 0000 0000 0002` |
| Insufficient funds | `4000 0000 0000 9995` |

### Manual test checklist

1. Login as `user@sooqna.demo`
2. Open listing → Buy Now → Checkout
3. Confirm payment → Stripe redirect (or mock fallback)
4. Return to `/orders/[id]?payment=success`
5. Verify `paid_held_in_escrow`
6. Check seller wallet pending balance
7. Confirm received → seller available balance updates
8. Login as `admin@sooqna.demo` → `/admin/orders`
9. Issue refund → order status `refunded`

## Validation

```bash
npm run lint   # ✅
npm run build  # ✅ (87 routes)
```

## Remaining Production Risks

| Risk | Mitigation needed |
|------|-------------------|
| File-based storage | Replace with PostgreSQL/Supabase for production |
| Client-session auth on APIs | Add JWT/cookie-based server auth |
| No Stripe Connect | Seller payouts are internal ledger only; real payouts need Connect |
| Webhook replay | Add idempotency store for processed event IDs |
| Local listing trust | Client sends snapshot; server validates shape only |
| PCI scope | Using Stripe Checkout keeps card data off-platform ✅ |

## Related Docs

- [PAYMENT_FLOW_DOCUMENTATION.md](./PAYMENT_FLOW_DOCUMENTATION.md)
- [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)
- [ESCROW_PAYMENT_MODEL.md](./ESCROW_PAYMENT_MODEL.md)
