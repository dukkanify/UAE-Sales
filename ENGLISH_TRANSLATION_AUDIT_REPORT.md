# Sooqna English Translation Audit Report

This report documents the bilingual (Arabic + English) platform work. Arabic remains the default. English is a full second locale with LTR layout, persisted language choice, and professional marketplace copy.

## Translation architecture

Shared i18n lives under `shared/i18n/`:

| Piece | Role |
| --- | --- |
| `phrases.en.json` | Gettext-style Arabic UI phrase → professional English map (~1,720 entries) |
| `tx.ts` | Lookup helper: exact phrases, «…» listing titles, AED amounts, date months, unit suffixes (`كم` → `km`) |
| `messages.ts` | Small header/nav message catalog (`Post an Ad`, `My Listings`, language names) |
| `locale.ts` | Cookie `sooqna-locale`, `localStorage`, `dir`/`lang` boot script, `intlLocale()` for `en-AE` / `ar-AE` dates |
| `useLocale.tsx` | `LocaleProvider` + `useLocale()` (cookie-aligned SSR snapshot) |
| `useTx.ts` | Client hook: `t(text)` → `tx(locale, text)` |
| `LocalizedTree.tsx` | Walks **this component’s** JSX strings/props when locale is `en` (`label`, `placeholder`, `error`, `hint`, `title`, `alt`, `aria-label`, `description`, `eyebrow`, `actionLabel`) |
| `LiveLocalizer.tsx` | Pre-paint DOM pass for leftover client islands; skips `[data-ugc]` / `[data-no-tx]` |
| `localized-metadata.ts` | Locale-aware titles/descriptions for legal pages |
| `email-locale.ts` | Resolves `preferredLocale` (user) then request cookie |

Future languages can add `phrases.<locale>.json` and a branch in `tx()` without rewriting screens.

**Shared UI primitives translate automatically** (so forms, badges, empty states, and buttons do not each need a private English catalog):

`Input`, `Select`, `Textarea`, `Button`, `Badge`, `EmptyState`, `FormMessage`, `PageHero`, `SectionHeader`, `Modal`, `Tabs`, `Breadcrumbs`, `BrandCombobox`, `ListingStatusBadge`.

**Not translated (by design):**

- Brand: **Sooqna** / سوقنا lockup
- **Dukkanify Technology LLC**
- User-entered listing titles, descriptions, chat bodies, saved-search queries, and favorite/order listing titles (`data-ugc`)

Currency stays the existing LTR format (`12,500 AED`). No `د.إ` and no unofficial currency icons.

## Language switcher

Header, market header, mobile header, footer, and admin top bar expose **Arabic | English** (`العربية` in Arabic mode, `Arabic` in English mode).

- Arabic → `dir="rtl"` `lang="ar"`
- English → `dir="ltr"` `lang="en"`
- Persistence: `localStorage` + cookie `sooqna-locale` (1 year) + `POST /api/locale` which stores `preferredLocale` on the signed-in user
- `html { direction: rtl }` in CSS is overridden by `html[dir="ltr"] { direction: ltr }`
- Directional `chevron-left` / `arrow-left` icons flip in LTR

## Pages translated

SSR + phrase map / `LocalizedTree` / locale-aware primitives cover:

- Homepage (desktop market header + mobile home header / bottom nav + hero search)
- About, Help, Terms, Privacy, Safety (English SEO titles/descriptions)
- Categories directory and category landing (`Cars & Vehicles`, etc.)
- Search (filters, suggestions kinds; listing suggestion labels stay UGC)
- Listing details, sticky actions, gallery chrome, related rail, listing cards
- Add listing / edit listing chrome and **dynamic category fields** (Make, Model, Year, Mileage, Transmission, Fuel Type, Warranty, Accident History, Service History, Property Type, Purpose, Bedrooms, Bathrooms, Area, Furnishing, Developer, Community, Job Title, Salary, Employment Type, Service Type, Coverage Area, Availability, Request a Quote)
- Login / register / forgot password / OTP
- Checkout (wizard + confirm-payment content, shipping method labels)
- Dashboard / My Listings / profile / favorites
- Chat chrome and inbox (message bodies marked UGC)
- Favorites button labels
- Wallet / escrow
- Orders list/detail
- Admin shell (nav groups, language switch, search matches English labels)
- Legal/footer groups and store-badge coming-soon copy
- Notifications (in-app `titleEn`/`bodyEn`, web push follows `preferredLocale`)
- Emails: listing received/approved/rejected/featured, orders, chat, password reset, OTP, welcome, viewing, jobs, quotes — RTL Arabic / LTR English templates

Listing and category `generateMetadata` follow the selected locale. Canonical URLs are unchanged. Open Graph locale is `en_AE` vs `ar_AE`. JSON-LD `inLanguage` follows locale.

## Components wrapped for SSR English

`LocalizedTree` is applied on chrome that creates Arabic JSX, including:

`SiteHeader`, `SiteFooter`, `MarketHeader`, `MobileHomeHeader`, `MobileBottomNav`, `MaintenanceGate`, `ListingDetailsView`, `ListingStickyPanel`, `ListingPrimaryAction`, `ListingSpecifications`, `ListingPlatformNotice`, `ListingGallery`, `ListingDetailToolbar`, `ListingSummary`, `ListingLocationMap`, `SellerPanel`, `ShareButton`, `ListingSafetyTips`, `StartChatButton`, `CheckoutWizard`, `CheckoutContent`, `AddListingForm`, `CategoryFieldsForm`, `SearchFilters`, `SearchTypeahead`, `MarketHeroSearch`, `PremiumListingCard`, `DashboardShell`, `MyListingsDashboard`, `AdminShell`, `ChatConversationView`, `ChatInboxList`, `FavoriteButton`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `OtpVerification`, `ProfileForm`, `FavoritesPanel`, `OrdersListContent`, `WalletBalances`, legal page mains.

`LiveLocalizer` covers remaining client islands (other admin panels, extra listing modals) after hydration, before paint.

## RTL / LTR

Verified via production SSR (`next start`, cookie `sooqna-locale`):

| Page | English | Arabic |
| --- | --- | --- |
| `/` | `dir=ltr` `lang=en`, **Post an Ad** | `dir=rtl` `lang=ar`, **أضف إعلانك** |
| `/about` | title **About us \| Sooqna** | **من نحن \| Sooqna** |
| `/help` | **Help center** | **مركز المساعدة** |
| `/terms` | **Terms and conditions** | **الشروط والأحكام** |
| `/privacy` | **Privacy policy** | **سياسة الخصوصية** |
| `/safety` | **Safety** | **الأمان** |
| `/categories/cars` | **Cars & Vehicles \| Sooqna** | Arabic category name |
| `/listings/villa-palm-jumeirah` | **Book a viewing**, **Listing description** | Arabic actions |
| `/search` | **Filter results** | **تصفية النتائج** |
| `/login` | Sign-in chrome in English | Arabic |
| `/checkout` | **Checkout** + LTR | Arabic checkout |

Arabic homepage does not show **Post an Ad**. English homepage does not show **أضف إعلانك** in the header CTA.

## Dynamic statuses and errors

Arabic status/error constants remain the source of truth (`listingStatusLabels`, `LISTING_ERRORS`, `CHECKOUT_ERRORS`, `ACTION_LABELS`, `SHIPPING_METHOD_CONFIG`, auth OTP messages, order `statusLabels`). English mode translates them through `tx` / `LocalizedTree` / locale-aware primitives / `LiveLocalizer` / toast `tx()`. Interpolated notifications also get `titleEn`/`bodyEn` (auto-filled from `tx("en", …)` in `createNotification`).

Example mapping:

| Arabic | English |
| --- | --- |
| إضافة إعلان | Post an Ad |
| إعلاناتي | My Listings |
| إعلان مميز | Featured Listing |
| قيد المراجعة | Under Review |
| تمت الموافقة | Approved |
| مرفوض | Rejected |
| شراء الآن | Buy Now |
| إتمام الشراء | Checkout |
| إضافة للمفضلة | Add to Favorites |
| تواصل مع البائع | Contact Seller |
| إكمال الدفع | Complete Payment |
| الدفع عند الاستلام | Cash on Delivery |
| التوصيل السريع | Express Delivery |
| التوصيل العادي | Standard Delivery |
| المدينة / المنطقة | City / Area |
| الإمارة | Emirate |
| قابل للتفاوض | Negotiable |

## Emails

`buildSooqnaEmailHtml` / `buildSooqnaEmailText` take `locale`. English mail is LTR (Inter). Arabic mail is RTL (Tahoma). Recipient language comes from `user.preferredLocale`, else the request cookie.

Listing approval body (English): **Your listing has been approved and is now live.**

## Remaining untranslated / expected Arabic in English mode

These are **intentional** or **hydrate-time**:

1. **User-generated / catalog listing content** — listing titles/descriptions, chat bodies, seller names, area names the seller typed, custom field values.
2. **Catalog listing titles** that have no `titleEnglish` stay in the seller’s language. Metadata uses `titleEnglish` when present (example: **Villa Palm Jumeirah | Sooqna**).
3. **SSR of some nested client islands** may still contain Arabic in the HTML payload until `LiveLocalizer` runs (before paint).
4. A few long legal/help paragraphs that were not extracted into `phrases.en.json` will show Arabic until the phrase is added; `LiveLocalizer` only translates keys present in the map.
5. **Some admin panel body copy** still relies primarily on `LiveLocalizer` + AdminShell wrap, not a per-panel `LocalizedTree`.

No Arabic UI chrome was removed from the Arabic locale.

## Mobile

CSS logical properties (`start`/`end`) already follow `dir`. LTR override was added so `html { direction: rtl }` cannot pin English to RTL. Shared buttons, inputs, and cards use wrapping/`min-w-0` rather than fixed Arabic-only widths.

Headless Chrome screenshots at 320–430px were previously blocked in this environment by an existing Chrome profile lock (`ProcessSingleton`). Layout CSS uses logical properties; English labels that are longer than Arabic (`Post an Ad`, `Book a viewing`, `Filter results`) wrap inside existing flex/grid chrome.

Manual pass to repeat locally:

- 320 / 360 / 375 / 390 / 430 widths
- Arabic then English: Home → Search → Listing → Post an Ad → My Listings → Favorites → Notifications → Checkout → Orders
- Admin with English selected

Confirm: no horizontal overflow, no clipped CTAs, sticky bars still wrap.

## English E2E (production `next start`)

Cookie `sooqna-locale=en` / `ar` against a local production server:

- Language cookie is read in `getRequestLocale()`; HTML `dir`/`lang` match.
- `POST /api/locale` returns `{"locale":"en"}`.
- Listing detail English SSR: **Book a viewing**, **Bedrooms**, **Specifications and Features**, **Safety tips**; **احجز معاينة** / **غرف النوم** absent.
- Category SEO: **Cars & Vehicles | Sooqna**.
- Login/register: **Sign in**, **Create a new account**, **Full name**, **Email**.
- Search: **Filter results**.
- Checkout chrome: **Checkout** without **إتمام الشراء**.

`npm run lint` — pass  
`npm run build` — pass  

## Acceptance

- Arabic remains fully functional (default).
- English is available across chrome, listing actions, search, checkout, dashboard, admin shell, notifications, and emails.
- Switcher persists via cookie + localStorage (+ account `preferredLocale`).
- English uses LTR; Arabic uses RTL.
- User listing copy is not machine-translated.
- Currency format unchanged.
- Canonical URLs unchanged.
