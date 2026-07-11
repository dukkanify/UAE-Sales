# Share Icon Fix Report

## Root Cause

Share buttons used a non-standard icon (send/paper-plane style path) that users did not recognize as "share."

## Solution

Replaced with Lucide-style **`share-2`** icon (connected nodes share symbol) across:

- `ShareButton` (listing detail + gallery)
- `CardShareButton` (listing cards)

Behavior:

- **Web Share API** when `navigator.share` is available
- **Fallback modal** with: نسخ الرابط، واتساب، البريد الإلكتروني، مشاركة عبر النظام
- Canonical URL via `getListingCanonicalUrl` (no localhost in production)
- `aria-label="مشاركة الإعلان"`, 44px min touch target
- Copy success toast: "تم نسخ رابط الإعلان"

## Files Changed

| File | Change |
|------|--------|
| `shared/ui/Icon.tsx` | Added `share-2` path |
| `shared/components/ShareButton.tsx` | `share-2` icon, modal, Web Share |
| `shared/components/CardShareButton.tsx` | `share-2` icon |

## APIs Changed

None.

## Environment Variables

`NEXT_PUBLIC_APP_URL` — used for canonical share URLs in production.

## Tests Performed

- Icon renders as standard share symbol on cards and listing detail
- Desktop fallback modal opens when Web Share unavailable
- Copy link toast
- WhatsApp and mailto links encode title + URL correctly
- `npm run lint` and `npm run build` pass

## Remaining Risks

- Web Share API availability varies by browser; modal fallback covers desktop
- Share payload does not include formatted AED price in `text` field (title + location only); price shown in modal UI
