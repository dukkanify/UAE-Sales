# Guest Order Access Security Report

## Threat Model

Guests must view **only their specific order** without account access, wallet, or other orders.

## Token Design

| Property | Value |
|----------|-------|
| Generation | `randomBytes(32)` hex |
| Storage | SHA-256 hash only (`guestAccessTokenHash`) |
| Scope | Single order |
| TTL | 30 days (`GUEST_ORDER_ACCESS_TTL_MS`) |
| Reuse | Allowed until expiry (read-only access) |
| Revocation | Expiry-based; hash rotation on re-issue prevented by idempotency |

## Access Route

```
/order-status?token={secureToken}
```

API: `GET /api/order-status?token=...`

Validation in `verifyGuestOrderAccessToken()`:
1. Token hash matches order record.
2. `guestAccessExpiresAt` not passed.

## Exposed Fields (Safe Subset)

- Order ID, listing title, seller name
- Status, escrow status, payment status
- Fees total, shipping method
- Delivery address snapshot (no full account profile)

## Not Exposed

- Other orders
- Wallet balance
- Account setup tokens
- Raw token hashes
- Buyer internal IDs (unless linked post-payment)

## Account Setup Token (Separate)

| Property | Value |
|----------|-------|
| Route | `/complete-account?token=...` |
| TTL | 24 hours |
| Use | Single-use (`consumedAt` set) |
| Storage | `account-setup-tokens.json` (hash only) |

## Security Rules Enforced

| Rule | Implementation |
|------|----------------|
| Email ≠ authentication | No session from checkout email |
| No account enumeration | `lookup-email` returns boolean only |
| No plaintext tokens in DB | `token.service.ts` hashing |
| No open redirects | `getSafeNextPath` on auth redirects |
| Webhook idempotency | `guestAccessTokenHash` check |
| Client totals untrusted | `calculateOrderFees` server-side |

## Comparison: Order ID Access

`GET /api/orders/[id]` remains available by sequential ID. **Guests should use token URL** from confirmation email. Future hardening: restrict public order GET to authenticated buyer or valid guest token.

## QA Results

| Test | Result |
|------|--------|
| Valid guest token loads order | Pass |
| Invalid token returns 404 | Pass |
| Expired token rejected | Pass (time-based) |
| Token not in admin UI | Pass |
| Order status page RTL | Pass |

## Remaining Risks

- Direct `/api/orders/{id}` access if ID is guessed/leaked — recommend token-only access in future.
- No rate limiting on `/api/order-status` yet.
- Guest token not revocable before expiry except via order deletion.
