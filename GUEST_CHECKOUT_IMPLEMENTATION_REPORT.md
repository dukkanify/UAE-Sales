# Guest Checkout Implementation Report

## Active Auth Strategy (Current Phase)

| Flow | Status |
|------|--------|
| Guest checkout | **Active** (`NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT=true`) |
| Email + password login | **Active** |
| Standard password registration | **Active** |
| Email OTP login/registration | **Disabled** (`NEXT_PUBLIC_ENABLE_EMAIL_OTP=false`) |
| UAE PASS | **Disabled** |
| SMS OTP | **Not implemented** |

## Guest Checkout Flow

1. User opens eligible listing (checkout-enabled category).
2. Clicks **شراء الآن** — no login redirect when guest checkout is enabled.
3. Navigates to `/checkout?listingId={id}`.
4. **Step 1 — Review:** listing, seller, price, escrow badge.
5. **Step 2 — Delivery & contact:** name, email, phone, shipping method, address (skipped for pickup).
6. **Step 3 — Payment:** server-calculated fees, Stripe Checkout.
7. **Webhook / mock payment:** order confirmed, provisional account created if needed.
8. Order confirmation email queued with secure tracking link.
9. Success page shows order number, tracking link, optional account setup CTA.

## Key Files

| Area | Path |
|------|------|
| Feature flags | `shared/constants/feature-flags.ts` |
| Checkout wizard | `features/checkout/components/CheckoutWizard.tsx` |
| Validation | `features/checkout/utils/checkout-validation.ts` |
| Listing CTA | `features/listings/components/ListingPrimaryAction.tsx` |
| Checkout API | `app/api/checkout/session/route.ts` |
| Guest finalization | `services/payments/guest-checkout.service.ts` |
| Order service | `services/payments/order-service.ts` |

## Database / Store Changes

JSON stores extended (no SQL migration):

**User (`users.json`):**
- `passwordHash` nullable
- `registrationSource` (`GUEST_CHECKOUT`, `STANDARD`, etc.)
- `isGuestConverted`
- `normalizedEmail`

**Order (`orders.json`):**
- `guestEmail`, `guestFullName`, `guestPhone`
- `buyerId` nullable until payment
- `guestAccessTokenHash`, `guestAccessExpiresAt`
- `customerType`, `hasExistingAccount`
- `deliveryAddressSnapshot`, `saveAddress`
- `emailDeliveryStatus`, `accountSetupEmailSent`

**New stores:**
- `account-setup-tokens.json`
- `pending-emails.json`

## Stripe Integration

- Checkout session creation unchanged for Stripe path.
- `handleCheckoutSessionCompleted` calls `markOrderPaid` → `finalizeGuestCheckoutAfterPayment`.
- Idempotent: skips if `guestAccessTokenHash` already set.
- Mock mode returns `guestAccessToken` on success redirect.

## Email Behavior

- Order confirmation via `services/email/order-email.service.ts`.
- No passwords emailed.
- Optional account setup link for new provisional accounts.
- If `RESEND_API_KEY` missing: order completes, email queued/logged, user sees Arabic success message.

## Security Controls

- Email alone does not authenticate.
- Existing-account lookup returns only `{ hasAccount: boolean }`.
- Guest order access requires hashed single-use token.
- Account setup tokens: hashed, 24h TTL, single-use.
- Server recalculates all fees.

## QA Results

| Test | Result |
|------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (127 routes) |
| Guest checkout UI (no login) | Implemented |
| OTP hidden when flag off | Implemented |
| Category gating (jobs/RE) | Unchanged — existing `listingActionConfig` |
| Stripe mock flow | Preserved |

## Remaining Risks

- Forgot-password still uses OTP APIs (guarded when disabled; needs non-OTP reset in future).
- `GET /api/orders/[id]` remains public by ID — guests should use token URL only.
- Production requires `RESEND_API_KEY` for live email delivery.
