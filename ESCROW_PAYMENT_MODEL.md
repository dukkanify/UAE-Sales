# Sooqna — Escrow Payment Model

## Important Disclaimer

**Stripe is not an escrow provider.** In Phase 1, Sooqna:

1. Collects payment via Stripe Checkout into the **platform Stripe account**
2. Tracks held amounts in an **internal escrow ledger** (`.data/wallets.json`)
3. Releases funds to seller **available balance** when buyer confirms receipt
4. Does **not** automatically transfer to seller bank accounts

Real seller payouts require **Stripe Connect** in a future phase.

## Phase 1 Model

```
Buyer pays via Stripe
        ↓
Platform Stripe account receives funds
        ↓
Internal ledger: escrow_status = held
        ↓
Seller wallet: pendingBalance += productPrice
        ↓
Buyer confirms received
        ↓
Internal ledger: escrow_status = released
        ↓
Seller wallet: pendingBalance → availableBalance
```

## Order Statuses

| Status | Meaning |
|--------|---------|
| `pending_payment` | Order created, awaiting Stripe payment |
| `paid_held_in_escrow` | Payment received, funds held internally |
| `delivered` | Seller marked delivery (future workflow) |
| `confirmed` | Buyer confirmed receipt |
| `released` | Funds released to seller available balance |
| `disputed` | Dispute opened (future) |
| `refunded` | Payment refunded via Stripe |

## Escrow Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Order created, no payment yet |
| `held` | Payment received, awaiting buyer confirmation |
| `released` | Buyer confirmed, seller balance updated |
| `refunded` | Funds returned to buyer |

## Wallet Ledger Behavior

### On payment (`paid_held_in_escrow`)

| Field | Change |
|-------|--------|
| Seller `pendingBalance` | + product price |
| Seller `heldInEscrow` | + product price |
| Platform fee | Recorded as negative `platform_fee` transaction |

### On confirm received (`released`)

| Field | Change |
|-------|--------|
| Seller `pendingBalance` | − product price |
| Seller `heldInEscrow` | − product price |
| Seller `availableBalance` | + product price |

### On refund

| Field | Change |
|-------|--------|
| Seller `pendingBalance` | − product price (if held) |
| Seller `heldInEscrow` | − product price |
| Stripe | Refund issued to buyer's card |

## Stripe Metadata

Every Checkout Session includes:

```json
{
  "orderId": "ord-...",
  "listingId": "...",
  "buyerId": "...",
  "sellerId": "...",
  "platform": "sooqna",
  "escrow": "true"
}
```

## Fee Structure

| Fee | Paid by | Destination |
|-----|---------|-------------|
| Product price | Buyer | Held for seller (escrow) |
| Gateway fee (2.9% + 1 AED) | Buyer | Stripe |
| Platform fee (2.5%) | Buyer | Platform revenue |

## What Buyers See

1. Checkout page with itemized fees
2. Stripe hosted payment page
3. Order detail with escrow status
4. "تأكيد الاستلام" button when payment is held

## What Sellers See

1. Wallet pending balance increases on payment
2. Notification: "دفعة جديدة محجوزة"
3. Available balance increases after buyer confirms
4. Notification: "تم تحويل المبلغ"

## What Admins See

- `/admin/orders` — all orders with Stripe PaymentIntent IDs
- `/admin/escrow` — active holds and protected totals
- `/admin/reports` — payment volume and event audit log
- Manual refund action per order

## Production Gaps (Phase 2+)

| Gap | Phase 2 solution |
|-----|------------------|
| No real seller payouts | Stripe Connect Express accounts |
| File-based storage | PostgreSQL with ACID transactions |
| No delivery workflow | Seller "mark delivered" + auto-release timer |
| No dispute resolution | Dispute form linked to orders |
| No KYC for sellers | UAE PASS + Connect onboarding |
| Platform fund segregation | Separate Stripe balance or treasury account |

## Compliance Note

Marketplace escrow regulations vary by jurisdiction. Phase 1 is suitable for **closed beta testing** with mock/real test payments. Production launch requires legal review of fund holding and payout obligations in the UAE.
