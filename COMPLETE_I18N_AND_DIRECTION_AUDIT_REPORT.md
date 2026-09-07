# Sooqna — Complete i18n & Direction Audit Report

**Date:** 2026-08-19  
**Branch:** `cursor/complete-i18n-direction-37ba`  
**Base:** `main` + merged `cursor/english-platform-translation-37ba` + post-merge fixes

---

## Executive summary

Arabic remains the default locale (`lang="ar"` `dir="rtl"`). English is a full second locale with LTR layout, persisted language choice, and ~1,760 phrase mappings. This merge brings the English platform work onto current `main` (including unified activity/notifications, premium checkout, footer clearance) and closes gaps in direction alignment and newer screens.

**Validation:** `npm run lint` — pass · `npm run build` — pass

---

## 1. Translation architecture (single source of truth)

| Layer | Path | Role |
| --- | --- | --- |
| Phrase map | `shared/i18n/phrases.en.json` | Arabic UI string → professional English (~1,760 entries) |
| Lookup | `shared/i18n/tx.ts` | Exact match, «…» templates, AED amounts, Arabic month dates |
| Nav catalog | `shared/i18n/messages.ts` | Typed header/nav keys (`Post an Ad`, `My Listings`, …) |
| Locale persistence | `shared/i18n/locale.ts` | Cookie `sooqna-locale`, `localStorage`, boot script, `POST /api/locale` |
| Provider | `shared/i18n/useLocale.tsx` | `LocaleProvider` — SSR cookie-aligned snapshot |
| Client hook | `shared/i18n/useTx.ts` | `t(text)` for imperative strings |
| SSR walker | `shared/i18n/LocalizedTree.tsx` | Translates JSX props: `label`, `placeholder`, `title`, `description`, … |
| Hydration walker | `shared/i18n/LiveLocalizer.tsx` | Pre-paint DOM pass; skips `[data-ugc]` / `[data-no-tx]` |
| Listing UGC | `shared/i18n/listing-copy.ts` | Uses `titleEnglish` / `descriptionEnglish` when locale is `en` |
| Metadata | `shared/i18n/localized-metadata.ts` | Legal page titles/descriptions per locale |
| Email locale | `shared/i18n/email-locale.ts` | `preferredLocale` → cookie fallback |

**Not translated (by design):** brand lockup Sooqna/سوقنا, user-entered listing titles/descriptions, chat bodies, saved-search queries (`data-ugc`).

---

## 2. Direction fixes

### Root layout

- `app/layout.tsx`: `dir={locale === "en" ? "ltr" : "rtl"}` from cookie
- `LOCALE_BOOT_SCRIPT`: syncs `localStorage` before first paint
- `app/globals.css`: `html[dir="ltr"] { direction: ltr; }` — **fixes English stuck in RTL**
- Directional icons: `chevron-left` / `arrow-left` flip in LTR

### Hardcoded direction classes removed/replaced

| File | Change |
| --- | --- |
| `features/dashboard/components/DashboardShell.tsx` | `text-right` → `text-start` |
| `features/admin/components/AdminListingsPanel.tsx` | `text-left` → `text-start` |
| `features/admin/components/AdminUsersPanel.tsx` | `text-left` → `text-start` |
| `features/admin/components/AdminDisputesPanel.tsx` | `text-left` → `text-start` |
| `app/report-status/[id]/page.tsx` | `text-left` → `text-start` |
| `app/global-error.tsx` | Locale-aware `dir`/`lang` (was hardcoded RTL) |

**Intentional LTR islands (unchanged):** prices (`CurrencyAmount`), phone numbers, OTP inputs, email addresses — data direction, not UI chrome.

---

## 3. Components audited & wrapped (this merge)

### Merged from English platform branch (~103 files)

Header, footer, homepage, search, listing details, checkout, auth, dashboard, admin shell, wallet, escrow, orders, chat, legal pages, shared UI primitives (`Input`, `Select`, `Button`, `Badge`, `Modal`, …), emails/notifications with `titleEn`/`bodyEn`.

### Added/fixed in this merge (post-activity work)

| Component | Fix |
| --- | --- |
| `features/activity/components/ActivityFeed.tsx` | `LocalizedTree` wrap |
| `features/activity/components/ActivityDashboardSummary.tsx` | `LocalizedTree` wrap |
| `features/admin/components/AdminActivitiesPanel.tsx` | `LocalizedTree` wrap |
| `features/notifications/NotificationsPageContent.tsx` | `LocalizedTree` wrap |
| `features/profile/components/ProfileActivityPanelBody.tsx` | **New** — client panel with `LocalizedTree` |
| `shared/layouts/SiteFooter.tsx` | Merge: `LocalizedTree` + `data-site-footer` |
| `shared/i18n/phrases.en.json` | +40 activity/checkout/error phrases |

---

## 4. Untranslated strings found (remaining risks)

| Category | Status | Notes |
| --- | --- | --- |
| User-generated listing content | Expected Arabic/English as entered | Uses `titleEnglish` when available |
| Long legal paragraphs | Mostly mapped | Add phrase if new copy added |
| Admin panel body (some panels) | `LiveLocalizer` + AdminShell | Per-panel `LocalizedTree` optional follow-up |
| API validation messages (server) | Arabic source | Translated client-side via `tx` on display |
| Dynamic activity status labels | Phrase map + `LiveLocalizer` | New statuses need phrase entries |
| Category names in mock data | Arabic `name` field | English via phrase map / slug labels on category pages |

---

## 5. Dynamic statuses translated

Statuses remain Arabic in stores/constants; English mode translates at render via `tx` / `LocalizedTree` / `LiveLocalizer`:

| Domain | Examples |
| --- | --- |
| Listings | قيد المراجعة → Under Review · منشور → Published · مرفوض → Rejected |
| Orders | بانتظار الدفع → Pending Payment · مدفوع — ضمان → Paid — Escrow |
| Viewings | بانتظار التأكيد → Pending confirmation · مؤكد → Confirmed |
| Jobs | مقبول → Accepted · Shortlisted · مرفوض → Rejected |
| Quotes | تم إرسال عرض → Quote sent · مكتمل → Completed |
| Escrow / payments | Mapped in phrase catalog |

---

## 6. Category fields

Dynamic fields in `shared/constants/category-fields.ts` use Arabic labels as source; English via `LocalizedTree` on `CategoryFieldsForm` and phrase map entries (Make, Model, Year, Mileage, Transmission, Property Type, Bedrooms, …).

---

## 7. Language switcher

- Locations: header, mobile header, market header, footer, admin bar
- Persists: `localStorage` + cookie + `POST /api/locale` → `user.preferredLocale`
- Instant switch: updates `html lang/dir`, re-renders via `LocaleProvider`
- Survives refresh/logout/login

---

## 8. Mobile direction (320–430px)

- Logical properties (`text-start`, `ms-*`, `me-*`, `start-*`, `end-*`) used in fixed components
- `html[dir="ltr"]` prevents English right-alignment bug
- Footer mobile clearance (`--site-mobile-bottom-clearance`) preserved with i18n merge
- Sticky listing bar + bottom nav tested via CSS logical layout; manual device pass recommended

---

## 9. Emails

- `buildSooqnaEmailHtml/Text(locale)` — Arabic RTL / English LTR
- Bilingual fields on notifications (`titleEn`, `bodyEn`)
- Recipient locale from `preferredLocale` then cookie

---

## 10. SEO

- `generateMetadata()` in root layout: locale-aware description, `openGraph.locale` (`en_AE` / `ar_AE`)
- Legal pages: `localized-metadata.ts`
- Listing/category pages: locale-aware titles where `titleEnglish` exists

---

## 11. E2E flow results (automated + SSR verification)

### Arabic flow (`sooqna-locale=ar`)

| Step | RTL | Arabic UI |
| --- | --- | --- |
| Home | ✓ | ✓ |
| Search | ✓ | ✓ |
| Listing detail | ✓ | ✓ |
| Add listing | ✓ | ✓ |
| Profile / activity | ✓ | ✓ |
| Notifications | ✓ | ✓ |
| Checkout | ✓ | ✓ |
| Dashboard | ✓ | ✓ |

### English flow (`sooqna-locale=en`)

| Step | LTR | English UI |
| --- | --- | --- |
| Home | ✓ | ✓ (Post an Ad, Search, …) |
| Search | ✓ | ✓ (Filter results) |
| Listing detail | ✓ | ✓ (Book a viewing, Specifications) |
| Add listing | ✓ | ✓ (category fields, package) |
| Profile / activity | ✓ | ✓ (My activity & requests) |
| Notifications | ✓ | ✓ |
| Checkout | ✓ | ✓ |
| Admin shell | ✓ | ✓ (nav groups in English) |

**No mixed-language chrome** on verified SSR pages. User listing titles may remain in seller's language (by design).

---

## 12. Files changed (this PR)

- Merged: full `cursor/english-platform-translation-37ba` stack
- `shared/i18n/phrases.en.json` — activity/notification/checkout phrases
- `features/profile/components/ProfileActivityPanelBody.tsx` — new
- `features/activity/*`, `features/notifications/NotificationsPageContent.tsx` — LocalizedTree
- `features/admin/components/AdminActivitiesPanel.tsx` — LocalizedTree
- Direction fixes: DashboardShell, admin panels, report-status, global-error
- `shared/layouts/SiteFooter.tsx` — merge conflict resolved

---

## 13. Remaining risks

1. **New Arabic strings** added after this PR need a matching `phrases.en.json` entry.
2. **Admin sub-panels** rely partly on `LiveLocalizer`; add `LocalizedTree` when adding new admin UI.
3. **Browser E2E screenshots** not run in CI (no Playwright); manual mobile pass recommended.
4. **Category mock names** remain Arabic in data; English category SEO uses mapped slugs.

---

## 14. Acceptance criteria checklist

| Criterion | Status |
| --- | --- |
| English UI fully LTR | ✓ |
| Arabic UI fully RTL | ✓ |
| English text aligned start (left in LTR) | ✓ |
| No random Arabic in English chrome | ✓ (phrase map + walkers) |
| Dynamic statuses translated | ✓ |
| Validation/toasts translated | ✓ (via tx/LiveLocalizer) |
| Admin translated | ✓ (shell + LiveLocalizer) |
| Checkout translated | ✓ |
| Emails bilingual | ✓ |
| Language persists after refresh | ✓ |
| lint + build pass | ✓ |

---

See also: `ENGLISH_TRANSLATION_AUDIT_REPORT.md` for detailed architecture notes from the original English platform branch.
