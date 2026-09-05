# Sooqna — ISSUE-01..26 Traceability Matrix

**Branch:** `cursor/full-26-issue-remediation-37ba`  
**Production host:** https://sooqna.site  
**Source of truth:** الملاحظات الفنية الجديدة – منصة سوقنا (26 issues)

| ID | Issue | FE | API | DB | Email | Admin | Notify | Payment | i18n | Prod E2E |
|----|-------|----|-----|----|-------|-------|--------|---------|------|----------|
| 01 | Login after re-enter credentials | Auth forms | `/api/auth/login/password`, logout/session | `auth_users` durable | — | — | — | — | AR/EN | Required |
| 02 | Wrong password-reset email | Forgot/reset UI | `/api/auth/password/reset/*` | reset tokens | `password_reset` template | — | — | — | AR/EN | Inbox |
| 21 | Reset delay + new password fails | Reset confirm | confirm + `setUserPassword` | hash + sessionVersion | reset delivery timing | — | — | — | — | Inbox+login |
| 10 | Notification opens 404 | Bell/list links | createNotification hrefs | notifications store | — | — | Deep links | orders | — | Click each type |
| 16 | Notification history | `/notifications`, bell | GET/mark-read | durable history | — | — | history UX | — | — | Logout/login |
| 11 | Pending listing missing admin | Add listing sync | `/api/listings`, admin listings | listing upsert (no wipe) | listing_received | Admin queue | — | — | — | User→admin |
| 12 | New users missing admin | — | `/api/admin/users` | user store | — | Users panel filter | — | — | — | Register→admin |
| 13 | Admin listing search/filters | AdminListingsPanel | admin listings GET | — | — | search+filters | — | — | — | Combined filters |
| 03 | Car year list+manual | Category fields | category-fields API | specs.year | — | — | — | — | — | Create/edit |
| 04 | Car condition New/Used only | Cars + search filters | — | normalize | — | admin filters | — | — | AR/EN | Create/filter |
| 05 | Precise car location | emirate+city/area | listing payload | emirate/city | — | — | — | — | — | Details/map |
| 06 | Car color Other | showWhen other text | — | specs | — | — | — | — | AR | Create/edit |
| 07 | Car cover image | MediaContactStep | image order | images[0] | — | — | — | — | — | Card/details |
| 08 | Keys optional | numberOfKeys required:false | validation | specs | — | — | — | — | — | Submit empty |
| 09 | Video in gallery | ListingGallery | videoUrl | listing.videoUrl | — | — | — | — | — | Mobile/desktop |
| 14 | Developer by name | developer combobox | — | string name | — | — | — | — | — | Create/details |
| 15 | Electronics New/Used | electronics fields | — | — | — | — | — | — | AR/EN | Create/filter |
| 17 | Phones date UX | type:date | — | purchaseDate | — | — | — | — | — | Mobile picker |
| 18 | Furniture Other + approval | furnitureType other | option-suggestions | suggestions | — | Category forms | — | — | AR/EN | Admin approve |
| 19 | Jobs vacancy/seeker | listingType fields | — | specs | — | — | — | — | AR/EN | Create/search |
| 20 | Listing submission email | — | submit hook | — | listing_received | — | in-app | — | — | Inbox multi-cat |
| 22 | Test payment + hide Stripe brand | Checkout success/wizard | Stripe test/live sep. | orders | — | — | — | Test mode | AR/EN | Webhook+UI |
| 23 | Contact form rejected | SupportContactForm | `/api/support` | — | support inbox | — | — | — | AR/EN | Mobile/desktop |
| 24 | Emirate header selector | EmirateLocationSelect | search?city= | localStorage | — | — | — | — | AR/EN RTL | Header+results |
| 25 | Abu Dhabi visuals | heroBackgroundUrl | — | — | — | — | — | — | alt text | Homepage |
| 26 | Remove homepage escrow promo | page/nav/hero | — | — | — | — | — | keep escrow flows | AR/EN | Homepage |

## Primary code touchpoints (this remediation)

- Auth: `services/auth/user-store.ts`, `password-reset-token.ts`, `app/api/auth/password/reset/*`, `services/email/notification-emails.ts`
- Notifications: `features/notifications/NotificationBell.tsx`, `services/payments/order-service.ts`, `dispute-service.ts`, `services/listings/listing-notifications.ts`
- Listings admin/store: `services/listings/listing-store.ts`, `listing-persistence.ts`, `features/admin/components/AdminListingsPanel.tsx`, `AdminUsersPanel.tsx`
- Category forms: `shared/constants/category-fields.ts`, `CategoryFieldsForm.tsx`, `MediaContactStep.tsx`, `ListingGallery.tsx`
- Home/header/pay: `EmirateLocationSelect.tsx`, `image-fallbacks.ts`, `navigation.ts`, `CheckoutSuccessContent.tsx`, `CheckoutWizard.tsx`
