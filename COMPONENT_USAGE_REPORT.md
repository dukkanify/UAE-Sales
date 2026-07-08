# Component Usage Report

**Date:** July 4, 2026  
**Purpose:** Inventory of shared component adoption across the application

---

## UI Primitives

### Button (`components/ui/Button.tsx`)

| Variant | Usage |
|---------|-------|
| `accent` | Primary CTAs — buy now, add listing, register |
| `primary` | Header add listing, dashboard add, auth submit |
| `secondary` | Secondary navigation, cancel, view listing |
| `ghost` | Edit actions, tertiary links |

**Features:** `href` prop for navigation, `onClick` forwarding, `fullWidth`, 3 sizes  
**Coverage:** 100% of CTAs — no inline button styling remains

---

### Card (`components/ui/Card.tsx`)

| Variant | Usage |
|---------|-------|
| `default` | Listing summary, seller panel, escrow card |
| `elevated` | Auth form, coming-soon wrapper |
| `flat` | Dashboard stats, listing rows, empty states |
| `glass` | Available — reserved for future overlays |

**Radius:** `--radius-2xl` on all variants

---

### Badge (`components/ui/Badge.tsx`)

| Variant | Used In |
|---------|---------|
| `verified` | Seller panel, listing cards, profile |
| `premium` | Search hero |
| `escrow` | Escrow card, search/categories meta |
| `featured` | Listing cards, gallery |
| `new` | Listing summary condition, status |
| `sold` | Expired listing status |
| `pending` | Pending review, unverified accounts |
| `rejected` | Rejected listings |
| `muted` | Categories, conditions, neutral |

---

### Input / Select / Textarea

| Component | Pages |
|-----------|-------|
| `Input` | Login, Register, Profile, Add Listing, Local Edit, Forgot Password, Search filters |
| `Select` | Register, Profile, Add Listing, Local Edit, Search filters |
| `Textarea` | Add Listing, Local Edit |

**Shared styling:** `--radius-xl`, `font-medium` labels, `--shadow-xs`

---

### FormMessage (`components/ui/FormMessage.tsx`)

| Variant | Usage |
|---------|-------|
| `error` | Login, Register, Add Listing, Local Edit validation |
| `success` | OTP, Forgot Password, Profile save, Dashboard delete |

---

## Layout Components

### PageHero (`components/ui/PageHero.tsx`)

```
/categories
/categories/[slug]
/search
/featured
/listings/new
/listings/[slug]/edit
/listings/local/[id]/edit
/profile (via DashboardShell)
/dashboard/listings (via DashboardShell)
```

### SectionHeader (`components/ui/SectionHeader.tsx`)

```
Homepage: CategoriesGrid, FeaturedListings, LatestListings, EscrowSection, WhySooqna, Testimonials
/listings/[slug]: Related listings
```

### Breadcrumbs (`components/ui/Breadcrumbs.tsx`)

```
/search
/categories/[slug]
/listings/[slug]
```

### EmptyState (`components/ui/EmptyState.tsx`)

```
MyListingsDashboard (no listings)
LocalListingDetails (not found)
LocalListingEdit (not found)
ComingSoonPage (all 6 placeholder routes)
```

---

## Domain Components

### Listing Suite

| Component | File | Used On |
|-----------|------|---------|
| `ListingCard` | `listings/ListingCard.tsx` | Homepage, search, categories, featured, related |
| `ListingSummary` | `listings/ListingSummary.tsx` | Listing detail, local detail |
| `ListingGallery` | `listings/ListingGallery.tsx` | Listing detail, local detail |
| `SellerPanel` | `listings/SellerPanel.tsx` | Listing detail, local detail |
| `EscrowProtectionCard` | `listings/EscrowProtectionCard.tsx` | Listing detail, local detail |
| `ListingStatusBadge` | `listings/ListingStatusBadge.tsx` | Dashboard rows |
| `AddListingForm` | `listings/AddListingForm.tsx` | `/listings/new` |
| `LocalListingEdit` | `listings/LocalListingEdit.tsx` | `/listings/local/[id]/edit` |
| `LocalListingDetails` | `listings/LocalListingDetails.tsx` | `/listings/local/[id]` |

### Auth Suite

| Component | File | Used On |
|-----------|------|---------|
| `AuthShell` | `auth/AuthShell.tsx` | Login, Register, Forgot Password |
| `LoginForm` | `auth/LoginForm.tsx` | `/login` |
| `RegisterForm` | `auth/RegisterForm.tsx` | `/register` |
| `OtpVerification` | `auth/OtpVerification.tsx` | Register flow |
| `ForgotPasswordForm` | `auth/ForgotPasswordForm.tsx` | `/forgot-password` |

### Dashboard Suite

| Component | File | Used On |
|-----------|------|---------|
| `DashboardShell` | `dashboard/DashboardShell.tsx` | Profile, Dashboard listings |
| `MyListingsDashboard` | `dashboard/MyListingsDashboard.tsx` | `/dashboard/listings` |
| `ProfileForm` | `profile/ProfileForm.tsx` | `/profile` |

### Category Suite

| Component | File | Used On |
|-----------|------|---------|
| `CategoriesGrid` | `home/CategoriesGrid.tsx` | Homepage |
| `CategoryDirectory` | `categories/CategoryDirectory.tsx` | `/categories` |
| `CategoryIcon` | `ui/CategoryIcon.tsx` | Grid, directory, add listing |

---

## Icon System (`components/ui/Icon.tsx`)

**37 icons** in single SVG library:

UI chrome: `search`, `shield`, `heart`, `user`, `home`, `grid`, `wallet`, `message`, `plus`, `check`, `star`, `map`, `clock`, `filter`, `menu`, `close`, `eye`, `edit`, `photo`, `send`, `arrow-left`, `package`, `bell`, `chart`

Categories: `car`, `home`, `laptop`, `phone`, `sofa`, `briefcase`, `watch`, `paw`, `wrench`, `baby`, `book`, `sport`, `food`

**Rule:** No emoji anywhere in UI chrome or data.

---

## Action Components

| Component | Usage |
|-----------|-------|
| `FavoriteButton` | Listing cards, listing summary |
| `ShareButton` | Listing summary |
| `ChipLink` | Category subcategory filters |
| `Tabs` | Dashboard listing status filter |
| `Skeleton` | Search loading state |

---

## Layout Shell

| Component | Usage |
|-----------|-------|
| `SiteHeader` | All pages |
| `SiteFooter` | All pages |

---

## Component Adoption Summary

| Category | Components | Adoption |
|----------|-----------|----------|
| UI Primitives | 14 | 100% on implemented pages |
| Layout | 4 | 100% |
| Listing | 9 | 100% |
| Auth | 5 | 100% |
| Dashboard | 3 | 100% |
| Homepage | 11 sections | 100% shared components |

---

## Deleted / Consolidated

| Removed | Replaced By |
|---------|-------------|
| `TrustSafetySection.tsx` | Unused — deleted |
| `ComingSoonPage` card markup | `EmptyState` wrapper |
| Duplicate Add Listing hero | Page-level `PageHero` |
| Inline dashboard header | `PageHero` |
| Emoji category icons | `CategoryIcon` + `Icon` |

---

## Conclusion

Every user-facing surface routes through the shared component library. No orphaned UI patterns remain on implemented pages. The component layer is ready for Wallet/Escrow/Checkout to be built on the same foundation.
