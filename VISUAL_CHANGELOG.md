# Sooqna — Visual Changelog

All visual changes in the visual perfection pass.

---

## Design Tokens (`styles/design-tokens.css`)

- Tightened radius scale: 8px / 12px / 16px / 24px / 32px
- Added `--color-error`, `--color-error-soft`
- Added `--gradient-surface` (replaces hardcoded `#fff7ec` gradients)
- Added `--section-gap` for consistent section rhythm

## Global Styles (`app/globals.css`)

- Added `.surface-gradient` utility
- Added `.page-padding` for consistent page vertical rhythm
- Added `.skeleton` shimmer animation
- Added `.interactive-lift` hover utility
- Removed unused `.premium-card`, `.hover-lift` (replaced by `.interactive-lift`)
- Simplified body background (flat warm white, no multi-gradient)

## New Components

| Component | Purpose |
|-----------|---------|
| `Icon.tsx` | SVG icon system (24 icons) |
| `PageHero.tsx` | Unified page header banner |
| `Breadcrumbs.tsx` | Navigation breadcrumb trail |
| `ChipLink.tsx` | Filter chip links |
| `FormMessage.tsx` | Error/success form feedback |
| `Textarea.tsx` | Styled textarea matching Input |
| `Skeleton.tsx` | Loading skeleton + listing card skeleton |

## UI Primitives

### Button
- Added `fullWidth` prop
- Default variant changed to work with `primary` for main actions
- All radii → `var(--radius-md)`
- Added `interactive-lift` hover

### Card
- Added `interactive` prop for hover lift
- Radii → `var(--radius-lg)`

### Badge
- Added `warning` variant
- Radii → `var(--radius-sm)`
- All colors from design tokens

### Input / Select
- Radii → `var(--radius-md)`
- Font weight: `font-medium` (was `font-bold`)

### SectionHeader
- Smaller, tighter typography
- Uppercase eyebrow with tracking

### Tabs
- Token-based radius and colors

### EmptyState
- Icon prop (no emoji)
- Uses Button for CTA

## Layout

### SiteHeader
- SVG search and menu icons
- Button component for "أضف إعلان" CTA
- Tighter logo (size-9)
- `font-medium` nav links

### SiteFooter
- Removed flag strip decoration
- Icon links for support/escrow
- Uppercase section titles

## Listing Components

### ListingCard
- Photo placeholder uses Icon (not flag strip)
- Cleaner badge layout (max 2 on image)
- Icon metadata (map, eye)
- `interactive` Card hover

### ListingGallery
- Shows real `imageUrl` when available
- Removed "Sooqna" watermark placeholder
- Thumbnails from actual image
- Token shadows

### ListingSummary
- Single h1 (removed page-level duplicate)
- Button CTAs (not rounded-full links)
- Icon metadata rows
- Price in accent color

### ListingStatusBadge
- Uses Badge component with token variants
- Removed Tailwind slate/amber/sky/rose

### SellerPanel
- Icon star rating
- Token-based stat rows
- Verified badge via Badge component

### EscrowProtectionCard
- Shield icon header
- Removed flag strip
- Cleaner step list

## Search & Categories

### SearchFilters
- Wrapped in Card elevated
- Token shadows (removed arbitrary RGB shadow)
- Primary Button for submit

### SearchResultsList
- Skeleton loading state (6 cards)
- EmptyState component (not custom card)
- Button CTA in empty state

### CategoryDirectory
- Removed flag strip and blur orbs
- `interactive` Card hover
- Token radius on subcategory links

## Homepage Sections

### SearchHero
- SVG trust point icons
- Button CTAs
- Tighter hero typography
- Token search panel shadow

### CategoriesGrid
- Arrow icon on cards
- Button "عرض الكل"
- `interactive-lift` cards

### StatsSection
- Uppercase muted labels
- Cleaner number display

### EscrowSection / WhySooqna
- SVG icons (not emoji)
- Smaller, tighter cards
- Consistent `gap-3`

### HowItWorks
- Tighter dark panel
- Token radius on step cards

### PopularCities
- Map icon (not emoji city icons)
- `interactive-lift` cards

### Testimonials
- Star icon row
- Cleaner card layout

### AppDownload
- Simplified phone mockup
- Package icons for store badges

## Dashboard

### DashboardShell
- SVG nav icons (not emoji)
- Flat card sidebar
- Tighter wallet card

### MyListingsDashboard
- Icon stat cards
- FormMessage for actions
- Flat listing rows with Button actions

## Auth

### LoginForm / ForgotPasswordForm / OtpVerification
- FormMessage for errors/success
- Button for all actions
- OTP inputs use token radius
- Removed demo copy from OTP

### ComingSoonPage
- Icon prop per page type
- Elevated card variant

## Pages

| Page | Visual Change |
|------|---------------|
| `/categories` | PageHero replaces cream banner |
| `/categories/[slug]` | Breadcrumbs + PageHero + ChipLink |
| `/search` | PageHero + Badge meta |
| `/featured` | PageHero (was bare SectionHeader) |
| `/listings/[slug]` | Breadcrumbs, no duplicate title, real gallery |
| `/wallet` | icon="wallet" |
| `/escrow` | icon="shield" |
| `/chat` | icon="message" |

---

## Breaking Visual Changes

- All `rounded-full` CTAs → `rounded-[var(--radius-md)]`
- All emoji UI icons → SVG `Icon` component
- All cream gradient heroes → `PageHero` with `surface-gradient`
- All hand-rolled error text → `FormMessage`
- Listing price color unified to `text-accent`
