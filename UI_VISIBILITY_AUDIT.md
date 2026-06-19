# UI Visibility Audit

## Scope

This audit reviewed visible labels, button contrast, navigation links, CTA buttons, mobile navigation, badges, and interactive controls across the UAE Sales Web App.

## Broken Components Found

### Listing Card Favorite Button

- **Issue:** Listing cards used an icon-only favorite button with `label=""`.
- **Risk:** The visible button could look like an empty circular button in some states and had insufficient explicit accessible labeling.
- **Fix:** Added a required fallback `aria-label` and `title` to `FavoriteButton`, and passed listing-specific text from `ListingCard`.

### Generic Button Component

- **Issue:** If a future caller accidentally passes empty children, the button can render without meaningful text.
- **Risk:** Dark or gold pill button could appear empty.
- **Fix:** Added fallback content: `إجراء`.

### CTA Hierarchy

- **Issue:** Some primary CTAs previously used charcoal backgrounds. While text existed, the UI feedback made them look visually heavy and potentially like unlabeled pills in screenshots.
- **Fix:** Primary CTA styling now uses gold buttons with charcoal text and a high-contrast hover state.

## Missing Labels

No missing labels were found in navigation links or primary CTA buttons after fixes.

Validated visible labels include:

- `أضف إعلان`
- `دخول`
- `خروج`
- `حسابي`
- `بحث`
- `تسجيل الدخول`
- `إنشاء الحساب`
- `نشر الإعلان`
- `شراء الآن`
- `محادثة البائع`
- `عرض`
- `تعديل`
- `حذف`
- `إعادة نشر`
- `تأكيد الرمز`
- `إعادة إرسال الرمز`
- `تعديل البيانات`

## Fixed Elements

- `components/common/FavoriteButton.tsx`
  - Added `ariaLabel`, `title`, and explicit fallback behavior.
- `components/listings/ListingCard.tsx`
  - Added listing-specific accessible favorite labels.
- `components/ui/Button.tsx`
  - Added fallback button text.

## Remaining Issues

- Some icon-only controls intentionally remain icon-only visually, but now include accessible labels.
- Full automated accessibility testing is not yet configured.
- Visual regression testing is not yet configured.

## Recommendations

1. Add automated accessibility checks with Playwright + axe.
2. Add visual regression screenshots for desktop, tablet, and mobile.
3. Create a shared `IconButton` component for all future icon-only controls.
4. Add a lint rule or component test to prevent empty button children.
5. Run manual QA for hover/focus states before production release.

## Verification

- Runtime audit reviewed buttons, links, badges, and CTAs.
- `npm run lint` and `npm run build` should pass after these changes.
