# UI Visibility Audit

## Scope

This audit reviewed visible labels, button contrast, navigation links, CTA buttons, mobile navigation, badges, and interactive controls across the UAE Sales Web App.

## Broken Components Found

### Listing Card Favorite Button

- **Issue:** Listing cards used an icon-only favorite button with `label=""`.
- **Risk:** The visible button could look like an empty circular button in some states and did not satisfy the requirement that every button show visible text.
- **Fix:** Added a required fallback `aria-label` and `title` to `FavoriteButton`, passed listing-specific accessible text from `ListingCard`, and changed the card button to render the visible label `مفضلة`.

### Generic Button Component

- **Issue:** If a future caller accidentally passes empty children, the button can render without meaningful text.
- **Risk:** Dark or gold pill button could appear empty.
- **Fix:** Added fallback content: `إجراء`.

### CTA Hierarchy

- **Issue:** Some primary CTAs previously used charcoal backgrounds. While text existed, the UI feedback made them look visually heavy and potentially like unlabeled pills in screenshots.
- **Fix:** Primary CTA styling now uses gold buttons with charcoal text and a high-contrast hover state.

### Dark Button Contrast Guard

- **Issue:** Some dark navy pills could still inherit an unsuitable text color from competing utility classes or browser/cascade order.
- **Risk:** Text exists in the DOM but appears invisible because foreground/background contrast is invalid.
- **Fix:** Added a global CSS guard for interactive elements using `bg-primary`, `bg-night`, or `bg-uae-black` so buttons/links and nested content always render white text on dark backgrounds.

### Dashboard Sidebar Logout

- **Issue:** The dashboard sidebar included profile/listings/add listing/wallet links but did not include the requested visible `تسجيل الخروج` action.
- **Risk:** Users could rely only on the header logout action, and the sidebar did not fully match the requested navigation labels.
- **Fix:** Added a visible `تسجيل الخروج` button to the dashboard sidebar with outlined styling and clear Arabic text.

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
  - Added fallback button text, including empty-string children.
- `app/globals.css`
  - Added dark interactive contrast guard for dark buttons/links.
- `components/dashboard/DashboardShell.tsx`
  - Added visible `تسجيل الخروج` sidebar action.

## Demo Listing Data Audit

- Searched for obvious random/demo strings such as `jgy`, `asdf`, `lorem`, `dummy`, `random`, `xxxx`, and similar placeholder text.
- No random listing titles or descriptions were found in runtime listing data.
- Current demo listings include realistic Arabic titles, descriptions, prices, categories, cities, statuses, and image URLs.

## Remaining Issues

- No known button, tab, badge, navigation item, or CTA remains without visible text in the audited UI.
- No random demo listing text was found in current runtime listing data.
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
