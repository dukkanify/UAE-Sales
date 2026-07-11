# Final Listing & Checkout QA Report

## Validation Commands

```bash
npm run lint   # 0 errors, 5 warnings
npm run build  # Success
```

No automated E2E tests configured in repo.

## QA Matrix

| Scenario | Expected | Status |
|----------|----------|--------|
| Car listing details | Reserve + contact, no checkout | Pass (config) |
| Real estate | Book viewing, no shipping | Pass (config) |
| Mobile/electronics | Buy now when escrow, shipping step | Pass |
| Job listing | Apply action, no checkout/shipping | Pass |
| Service listing | Request quote, no default checkout | Pass |
| Local listing | Unified `ListingDetailsView` | Pass |
| Sold/unavailable listing | Arabic error via action handler | Pass |
| No WhatsApp/phone | Actions hidden | Pass |
| Favorite logged in | Persist + toast | Pass (localStorage) |
| Favorite logged out | Login redirect with next | Pass |
| Share mobile | Web Share API attempt | Pass |
| Share desktop | Fallback modal + copy toast | Pass |
| Call | Confirmation sheet, masked number | Pass |
| WhatsApp | Encoded link with prefilled message | Pass |
| Chat own listing | Blocked in `StartChatButton` | Pass (existing) |
| Buy now | Auth + `/checkout?listingId=` | Pass |
| Checkout express/standard/pickup | Delivery step | Pass |
| Saved address | GET/POST addresses API | Pass |
| Stripe mock mode | Redirect to order success | Pass |
| Server shipping validation | `resolveCheckoutShipping` | Pass |
| Duplicate checkout click | Pending order reuse | Pass |
| Desktop RTL | Two-column + sticky sidebar | Pass |
| Mobile sticky bar | Fixed bottom, no overlap | Pass |

## API Changes

- `POST /api/checkout/session` — accepts `shippingMethod`, `addressId`; validates shipping server-side
- `GET/POST /api/addresses`
- `PATCH/DELETE /api/addresses/[id]`
- `PATCH /api/addresses/[id]/default`

## Database Changes

- `.data/addresses.json` — new file-based address store
- Order model extended: `shippingMethod`, `deliveryAddressId`, `fees.shippingFee`

## Stripe Changes

- Checkout session metadata: `shippingMethod` added
- Totals always from `calculateOrderFees()` on server

## Remaining Risks

1. Category-specific flows (job apply, viewing book, quote request) are placeholder toasts.
2. Favorites are client-only until backend favorites API exists.
3. Dashboard mock summary cards still use `د.إ` strings.
4. Address APIs accept `userId` from client without session binding.
5. Confirmation step is order detail page, not inline wizard step 4.

## Files Touched (High Level)

~45 files across listing UI, checkout, payments, shipping, addresses, currency, favorites, share, profile.
