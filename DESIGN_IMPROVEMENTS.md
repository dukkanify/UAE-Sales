# Sooqna — Design Improvements

Prioritized list of visual improvements completed and remaining.

---

## Completed in Visual Perfection Pass

### Design System Foundation
- [x] Strict border-radius scale (`--radius-sm` through `--radius-2xl`)
- [x] Token-only shadows (removed arbitrary `rgb(17 24 39 / …)` values)
- [x] Added `--color-error`, `--gradient-surface`, `--section-gap`
- [x] Typography hierarchy: black → headings, bold → labels, medium → body
- [x] `interactive-lift` utility for consistent hover behavior
- [x] Skeleton shimmer animation for loading states

### New Shared Components
- [x] `Icon` — 24 SVG icons replacing emoji UI chrome
- [x] `PageHero` — unified page header (replaces 5 duplicate cream banners)
- [x] `Breadcrumbs` — consistent navigation trail
- [x] `ChipLink` — filter chips with consistent styling
- [x] `FormMessage` — error (red) and success (emerald) states
- [x] `Textarea` — matches Input styling
- [x] `Skeleton` / `ListingCardSkeleton` — loading placeholders

### Component Unification
- [x] All CTAs route through `Button` component
- [x] All badges route through `Badge` component (6 variants)
- [x] `ListingStatusBadge` now uses `Badge` with token colors
- [x] `FavoriteButton` / `ShareButton` — icon + consistent base styles
- [x] `EmptyState` — single pattern with Icon + Button
- [x] `SearchFilters` wrapped in `Card variant="elevated"`
- [x] `ComingSoonPage` — icon-based, elevated card

### Page Improvements
- [x] Homepage — icons, tighter spacing, removed emoji trust points
- [x] Search / Categories / Featured — PageHero + consistent padding
- [x] Listing detail — real image gallery, removed duplicate h1, Breadcrumbs
- [x] Local listing detail — matches slug page layout
- [x] Auth — FormMessage errors, Button OTP, cleaner OTP inputs
- [x] Dashboard — SVG nav, flat stat cards, icon metadata
- [x] Wallet / Escrow / Chat — icon-specific ComingSoon pages

### Removed Visual Debt
- [x] Emoji as UI icons (replaced with SVG)
- [x] `uae-flag-strip` overuse on every card
- [x] `rounded-full` on marketplace CTAs (unified to `rounded-md`)
- [x] Off-palette Tailwind colors in status badges
- [x] Duplicate cream gradient hero blocks
- [x] Developer placeholder copy in gallery ("معرض صور فاخر جاهز للربط")
- [x] Inconsistent page padding (`py-8` through `py-16` → `page-padding`)

---

## Remaining — Priority 1 (Required for 10/10)

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 1 | Build full Wallet UI (balance, transactions, withdraw) | High | Medium |
| 2 | Build full Escrow/Checkout flow UI | High | Medium |
| 3 | Build Chat UI (conversation list + thread) | High | Medium |
| 4 | Simplify Add Listing to step wizard | High | Medium |
| 5 | Integrate `next/image` with remote patterns | Medium | Low |

---

## Remaining — Priority 2 (Polish)

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 6 | Minimal auth chrome (no full header on login) | Medium | Low |
| 7 | Page transition animations (fade between routes) | Medium | Low |
| 8 | Staggered fade-up on homepage sections | Low | Low |
| 9 | Register form full FormMessage migration | Low | Low |
| 10 | Profile form token-based header | Low | Low |
| 11 | Listing edit page for seeded listings | Low | Medium |
| 12 | Support / Disputes full UI | Medium | Medium |

---

## Remaining — Priority 3 (Future)

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 13 | Dark mode tokens | Low | Medium |
| 14 | Real testimonial avatars | Low | Low |
| 15 | Animated stats counter | Low | Low |
| 16 | Custom category SVG icons (replace emoji data) | Low | High |
| 17 | E2E visual regression tests | Medium | Medium |

---

## Design Rules Now Enforced

1. **Radius:** `sm` = badges, `md` = buttons/inputs/chips, `lg` = cards, `xl` = heroes, `2xl` = feature blocks
2. **Shadow:** Only `--shadow-xs` through `--shadow-lg` and `--shadow-glow`
3. **Color:** Only design tokens — no raw Tailwind `slate`, `amber`, `rose`, `sky`
4. **Icons:** Only `Icon` component — no emoji in UI chrome
5. **CTAs:** Only `Button` component — no inline styled links
6. **Spacing:** `section-padding` for sections, `page-padding` for pages, `gap-3/4/5` grid rhythm
7. **Typography:** `font-black` max 2 levels per viewport, `font-medium` for body copy
