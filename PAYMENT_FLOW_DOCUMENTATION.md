# Sooqna — Payment Flow Documentation

## Overview

Sooqna uses **Stripe Checkout** (hosted) for payment collection and an **internal escrow ledger** for fund holding and release. Stripe does not provide escrow — the platform collects payment and tracks held/released amounts internally.

## Actors

| Actor | Role |
|-------|------|
| Buyer | Initiates checkout, pays via Stripe, confirms receipt |
| Seller | Receives pending balance on payment; available balance on release |
| Platform | Collects platform fee; holds funds in escrow ledger |
| Admin | Views payments, issues refunds |

## Order Status Lifecycle

```
pending_payment
    ↓ (Stripe payment success)
paid_held_in_escrow
    ↓ (seller marks delivered — future)
delivered
    ↓ (buyer confirms received)
confirmed → released
    ↓ (admin refund or dispute)
refunded / disputed
```

## Fee Calculation (Server-Side)

| Component | Rate |
|-----------|------|
| Product price | Listing price (AED, integer) |
| Gateway fee | 2.9% + 1 AED |
| Platform fee | 2.5% |
| **Total** | Sum of above |

**Never trust client totals.** The checkout UI displays estimates; the server recalculates on session creation.

## Checkout Flow

### 1. Entry

- Route: `/checkout?listing=<slug>` or `/checkout?listingId=<local-id>`
- Cancel return: `/checkout?listingId=...&payment=cancelled`

### 2. Confirm Payment

`POST /api/checkout/session`

```json
{
  "listingId": "mercedes-amg-g63-2024",
  "buyer": {
    "id": "demo-user-001",
    "email": "user@sooqna.demo",
    "fullName": "Ahmed Al Mansoori",
    "role": "user"
  }
}
```

### 3. Stripe Redirect

Response (Stripe mode):

```json
{
  "mode": "checkout",
  "orderId": "ord-...",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### 4. Success Return

`/orders/[id]?payment=success`

## Webhook Processing

`POST /api/webhooks/stripe`

On `checkout.session.completed`:

1. Find order by `metadata.orderId`
2. Set status → `paid_held_in_escrow`
3. Set escrow → `held`
4. Add seller `escrow_hold` wallet transaction
5. Deduct platform fee transaction
6. Notify buyer and seller

## Confirm Received Flow

`POST /api/orders/[id]/confirm`

1. Validate buyer owns order
2. Status → `confirmed` then `released`
3. Escrow → `released`
4. Move seller `pendingBalance` → `availableBalance`
5. Create `escrow_release` transaction
6. Notify seller

## Refund Flow

`POST /api/orders/[id]/refund` (admin only)

1. Validate admin role
2. Call `refundStripePayment()` if PaymentIntent exists
3. Status → `refunded`
4. Reverse seller pending/held balances
5. Notify buyer and seller

## Wallet Integration

| Balance | Source |
|---------|--------|
| Available | Released escrow + deposits |
| Pending | Held escrow awaiting buyer confirmation |
| Held in escrow | Active escrow holds |

Transaction types: `stripe_payment`, `escrow_hold`, `escrow_release`, `platform_fee`, `refund`, `deposit`, `withdrawal`

## Admin Audit

| Page | Data |
|------|------|
| `/admin/orders` | All orders, Stripe IDs, refund action |
| `/admin/escrow` | Active holds, protected totals |
| `/admin/reports` | Volume, platform fees, payment event log |

## Mock Fallback

If `STRIPE_SECRET_KEY` is missing:

- `POST /api/checkout/session` returns `{ mode: "mock", redirectUrl: "/orders/..." }`
- Order immediately set to `paid_held_in_escrow`
- No Stripe redirect

## API Reference

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/checkout/session` | Buyer session in body |
| POST | `/api/webhooks/stripe` | Stripe signature |
| GET | `/api/orders?userId=` | User ID param |
| GET | `/api/orders/[id]` | Public read |
| POST | `/api/orders/[id]/confirm` | Buyer in body |
| POST | `/api/orders/[id]/refund` | Admin in body |
| GET | `/api/wallet?userId=` | User ID param |
| GET | `/api/admin/orders` | `x-admin-role: admin` header |
| GET | `/api/admin/escrow` | `x-admin-role: admin` header |
| GET | `/api/admin/reports` | `x-admin-role: admin` header |
