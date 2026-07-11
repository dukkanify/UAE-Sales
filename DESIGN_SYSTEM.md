# Sooqna — Design System 2026

## Overview

Sooqna uses a premium 2026 design language built for Arabic RTL marketplaces. The system prioritizes luxury, trust, clarity, and consistency across every surface.

## Design Principles

1. **Premium minimalism** — generous whitespace, intentional typography, restrained color
2. **Trust by design** — escrow badges, verification cues, professional cards
3. **RTL-first** — Arabic typography and layout as the default, not an afterthought
4. **Performance-aware** — CSS variables, minimal animation, no heavy assets
5. **Component consistency** — one design language for buttons, cards, forms, and navigation

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Luxury Charcoal) | `#0F1419` | Headings, primary buttons, navigation active states |
| Secondary (Warm Gold) | `#C9A962` | Accents, CTAs, highlights, badges |
| Background (Warm White) | `#FAF9F7` | Page background |
| Surface (Soft Ivory) | `#FFFFFF` | Cards, inputs, elevated panels |
| Surface Muted | `#F3F0EA` | Secondary backgrounds, input fields |
| Accent (UAE Red) | `#C41E3A` | Prices, alerts, destructive actions |
| Success (Emerald) | `#10B981` | Escrow badges, confirmations |
| Ink | `#0F1419` | Body text |
| Muted | `#6B6560` | Secondary text, placeholders |
| Border | `#E8E4DE` | Dividers, input borders |

## Typography

- **Font family:** Tajawal (Google Fonts) with IBM Plex Sans Arabic fallback
- **Weights:** 400 (body), 500 (labels), 700 (emphasis), 800–900 (headings)
- **Scale:**
  - Hero: 48–64px (`text-5xl` → `text-6xl`)
  - Section title: 36–44px (`text-3xl` → `text-4xl`)
  - Card title: 16–18px (`text-base` → `text-lg`)
  - Body: 14–16px (`text-sm` → `text-base`)
  - Caption: 12px (`text-xs`)

## Spacing

- Section padding: `clamp(3rem, 6vw, 6rem)` via `.section-padding`
- Container max-width: `1280px` via `.app-container`
- Card padding: `20–24px` (`p-5` → `p-6`)
- Component gaps: `12–24px` (`gap-3` → `gap-6`)

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 10px | Badges, small chips |
| `--radius-md` | 14px | Inputs, buttons |
| `--radius-lg` | 20px | Cards |
| `--radius-xl` | 28px | Hero panels, large sections |
| `--radius-2xl` | 36px | Feature blocks |

## Shadows

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Inputs, subtle elevation |
| `--shadow-sm` | Buttons, small cards |
| `--shadow-md` | Hover states |
| `--shadow-lg` | Hero search, modals |
| `--shadow-glow` | Gold accent CTAs |

## Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-premium`)
- Durations: 150ms (fast), 250ms (normal), 400ms (slow)
- Hover: `translateY(-1px)` + shadow elevation
- Image cards: `scale(1.03)` on hover
- No excessive animation — subtle and purposeful only

## Components

### Button
- Variants: `accent` (gold, default), `primary` (charcoal), `secondary` (outlined), `ghost`
- Sizes: `sm`, `md`, `lg`
- Shape: `rounded-xl`
- Always shows visible label text

### Card
- Variants: `default`, `elevated`, `glass`, `flat`
- Border + shadow, hover lift on interactive cards

### Input / Select
- `min-h-12`, `rounded-xl`, subtle shadow
- Label above field, optional hint below

### Badge
- Variants: `gold`, `success`, `accent`, `muted`, `default`
- Used for: escrow, verified seller, category, featured

### Tabs
- Pill-style with count badges
- Active: charcoal background, white text

### ListingCard
- 4:3 image aspect ratio
- Escrow + verified badges on image
- Price in accent red, location muted
- Favorite button top-left

## Layout

- **Header:** Sticky, glass blur, compact logo, inline search (desktop), mobile drawer
- **Footer:** Multi-column links, app store badges, copyright
- **Dashboard:** Sidebar with wallet + notifications (desktop), horizontal pills (mobile)
- **Auth:** Split layout — luxury dark panel + elevated form card

## RTL

- `dir="rtl"` on `<html>`
- Logical properties preferred (`margin-inline`, `padding-inline`)
- Icons and chevrons respect RTL flow

## File Structure

```
styles/design-tokens.css   — CSS custom properties
app/globals.css            — Tailwind theme + utilities
components/ui/             — Design system primitives
components/home/           — Homepage sections
layouts/                   — SiteHeader, SiteFooter
```

## Accessibility

- Minimum contrast ratio 4.5:1 for body text
- `focus-ring` on all interactive elements
- `aria-label` on icon-only controls
- Global contrast guard for dark button backgrounds
- Keyboard-navigable tabs and forms
