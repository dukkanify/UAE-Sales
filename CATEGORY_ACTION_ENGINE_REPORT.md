# Category Action Engine Report

## Summary

Centralized listing behavior in `shared/constants/listingActionConfig.ts`.

## Category Action Matrix

| Category Group | Primary Actions | Checkout | Shipping |
|----------------|-----------------|----------|----------|
| Marketplace (mobiles, electronics, furniture, fashion, kids, sports, books) | BUY_NOW, CONTACT, CHAT, WHATSAPP | If `escrowAvailable` | Yes |
| Cars | RESERVE, CONTACT, CHAT, WHATSAPP | Only if seller enables + fixed price + escrow | No |
| Real Estate | BOOK_VIEWING, CONTACT, CHAT, WHATSAPP | No (optional deposit later) | No |
| Jobs | APPLY_JOB, CONTACT, SAVE | Never | Never |
| Services | REQUEST_QUOTE, BOOK_SERVICE, CONTACT, CHAT | After quote/fixed price | No |
| Food / delivery | ORDER (when enabled) | Category-gated | When enabled |
| Contact-only | CALL, WHATSAPP, CHAT | Never | Never |

## Action Types

`BUY_NOW`, `RESERVE`, `CONTACT_SELLER`, `BOOK_VIEWING`, `REQUEST_QUOTE`, `APPLY_JOB`, `BOOK_SERVICE`, `SEND_MESSAGE`

## Integration Points

- `ListingPrimaryAction.tsx` — primary CTA handler + buy-now routing
- `ListingStickyPanel.tsx` — desktop sidebar actions
- `MobileStickyActionBar` — category-specific bottom bar
- `CheckoutWizard.tsx` — respects `checkoutEnabled` from config

## Buy Now Routing

1. Auth check → `/login?next=/checkout?listingId=...`
2. Own-listing guard
3. Listing availability
4. Redirect to `/checkout?listingId={id}`

## Remaining Risks

- Job application form, viewing booking, and quote flows are stubbed with Arabic toast messages.
