# Automatic Account Creation Report

## Timing

Provisional accounts are created **only after confirmed payment**:

| Trigger | Creates Account? |
|---------|------------------|
| Email entered at checkout | **No** |
| Checkout session created | **No** |
| Stripe `checkout.session.completed` | **Yes** |
| Mock payment completion (dev) | **Yes** |
| Zero-value order (server confirm) | **Yes** (same `markOrderPaid` path) |

## Account Fields (Guest Checkout)

```typescript
{
  id: string,
  fullName: string,
  email: string,
  normalizedEmail: string,
  phone: string,
  passwordHash: null,
  emailVerifiedAt: null,
  accountStatus: "active",
  accountType: "individual",
  registrationSource: "GUEST_CHECKOUT",
  isGuestConverted: false,
  role: "user"
}
```

## Case Handling

### Case A — No existing account
- Continue checkout.
- After payment: create provisional user, link order, send setup link.

### Case B — Existing account email
- Continue checkout without revealing account details.
- Link order server-side to existing `buyerId`.
- No auto-login.
- Success message: existing account hint.

### Case C — Authenticated user
- Pre-fill profile/address.
- Link order to session user ID immediately at checkout.

## Duplicate Prevention

- `findUserByEmail` uses normalized lowercase email.
- `finalizeGuestCheckoutAfterPayment` checks `guestAccessTokenHash` for idempotency.
- Webhook retries do not create duplicate accounts or tokens.

## Optional Address Save

- When authenticated user checks **حفظ العنوان**, address saved after payment finalization.
- Guest inline address stored as `deliveryAddressSnapshot` on order.

## Account Conversion

Route: `/complete-account?token=...`

After password set:
- `passwordHash` stored (scrypt)
- `isGuestConverted = true`
- `emailVerifiedAt` set (secure link delivered to email)
- Session created, redirect to `/orders`

## Services

| Service | Role |
|---------|------|
| `services/auth/guest-account.service.ts` | Create provisional user, conversion |
| `services/auth/token.service.ts` | Setup token CRUD |
| `services/payments/guest-checkout.service.ts` | Post-payment orchestration |
| `app/api/complete-account/route.ts` | Password setup API |

## QA Results

| Test | Result |
|------|--------|
| No account on email blur | Pass — lookup only returns boolean |
| Account after mock payment | Pass |
| No password generated/emailed | Pass |
| Setup link in confirmation email | Pass (template ready) |
| Reused setup token rejected | Pass — `consumeAccountSetupToken` |

## Remaining Risks

- Guest with existing account who never logs in sees orders only via guest token until login.
- Business account type not offered during guest checkout (individual only).
