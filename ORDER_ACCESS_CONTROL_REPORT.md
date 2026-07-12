# Order Access Control Report

## Before

`GET /api/orders/[id]` returned full order JSON to any caller with the order ID.

## After

### Authorization Model

```typescript
canUserAccessOrder(user, order):
  - admin role → allow
  - user.id === order.buyerId → allow
  - user.id === order.sellerId → allow
  - else → deny
```

### Response Codes

| Code | When |
|------|------|
| 401 | No `sooqna_session` cookie |
| 403 | Authenticated but not buyer/seller/admin |
| 404 | Order not found |
| 200 | Authorized access |

### Field Scoping

`toAuthorizedOrderView()` redacts guest-only metadata for seller-only views where appropriate.

### Guest Flow

| Path | Access |
|------|--------|
| `/order-status?token=...` | Single order, token-validated |
| `/api/order-status?token=...` | Safe order subset |
| `/orders/{id}` | Requires login + authorization |
| `/api/orders/{id}` | Requires session cookie + authorization |

## QA Results

| Test | Expected | Status |
|------|----------|--------|
| Unauthenticated GET `/api/orders/{id}` | 401 | Implemented |
| Wrong user GET | 403 | Implemented |
| Buyer GET own order | 200 | Implemented |
| Seller GET related order | 200 | Implemented |
| Admin GET | 200 | Implemented |
| Guest with token | 200 via order-status | Unchanged |

## Files

- `services/payments/order-access.ts`
- `app/api/orders/[id]/route.ts`
- `features/orders/components/OrderDetailContent.tsx`
- `features/checkout/components/CheckoutSuccessContent.tsx`
