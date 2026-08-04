# Payments, Billing, Invoices & Instructor Wallets (Task 012)

Enterprise financial infrastructure for ATPL PASS.

## Scope

- Gateway adapters: **mock** (default) + **Stripe Checkout**-ready
- Pricing models: one-time, monthly/annual subscriptions, premium, packages, free, coupons
- Secure checkout (tokenized methods only — never stores PAN)
- Orders, invoices (HTML/PDF print), subscriptions
- Instructor wallets, earnings ledger, payout workflow
- Refunds (full/partial) with clawback
- Finance dashboard + CSV exports
- Webhook endpoint with signature validation

**Not included:** AI assistant, mobile apps.

## Architecture notes (Connect-ready)

Platform collects payments centrally; instructor share is credited to internal wallets after platform fee. Stripe mode uses Checkout Sessions with dynamic payment methods (Apple Pay / Google Pay / cards configured in Dashboard). Move to Stripe Connect destination charges when live connected accounts are provisioned.

## Runtime

- JSON: `.data/aep-payments.json`
- SQL: `database/migrations/011_payments_billing.sql`
- Flags: `features.payments`, `features.wallet` enabled
- Env (optional): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Services

| Service | Path |
|---------|------|
| Gateway | `services/payments/gateway.ts` |
| Catalog / coupons | `services/payments/catalog-service.ts` |
| Checkout / orders | `services/payments/checkout-service.ts` |
| Invoices | `services/payments/invoice-service.ts` |
| Wallet | `services/payments/wallet-service.ts` |
| Payouts | `services/payments/payout-service.ts` |
| Refunds | `services/payments/refund-service.ts` |
| Reports | `services/payments/report-service.ts` |

## API

| Path | Purpose |
|------|---------|
| `/api/payments/catalog` | Products, coupons, settings |
| `/api/payments/orders` | Checkout, pay, retry, cancel, ledger |
| `/api/payments/invoices` | List / printable HTML |
| `/api/payments/wallet` | Wallet, transactions, payouts |
| `/api/payments/refunds` | Request / review |
| `/api/payments/reports` | Dashboard + CSV |
| `/api/payments/webhooks` | Provider webhooks |

## Permissions

- `billing.own` — students
- `wallet.own` / `earnings.own` — instructors
- `system.payments`, `finance.reports`, `finance.wallets` — admin / super-admin

## Security

- No raw card storage (PCI-aware)
- Idempotent checkout keys
- Duplicate one-time purchase guard
- Webhook signature validation
- Activity logging for financial actions
