# Sooqna — Brand Identity Guide

**سوقنا · Sooqna · Our Marketplace**

---

## 1. Brand Overview

| Field | Value |
|-------|-------|
| Arabic name | سوقنا |
| English name | Sooqna |
| Meaning | Our Marketplace |
| Tagline (AR) | كل ما تحتاجه... في مكان واحد |
| Tagline (EN) | Our Marketplace |
| Domain | sooqna.ae |

### Brand personality
Professional · Premium · Modern · Minimal · Friendly · Trusted · Luxury without excess · Emirati without traditional overload

### Brand promise
A technology-first marketplace that communicates **trust**, **security**, and **premium quality** — comparable to Stripe, Airbnb, Property Finder, and Careem — not a generic classifieds template.

---

## 2. Logo Concepts

Three concepts were explored. **Concept 2 (Letter S Monogram)** was selected as the primary mark.

### Concept 1 — Minimal geometric mark
Pure geometry: hexagonal frame with inner negative-space diamond. Ultra-minimal, works at favicon scale. Best for app icon isolation.

### Concept 2 — Letter S monogram ✅ PRIMARY
Geometric **S** curve integrated with a subtle marketplace arc (handle line + wheel dots). Communicates movement and commerce without a shopping cart. Used across the platform.

### Concept 3 — Marketplace symbol
Abstract arch + platform base suggesting a meeting point. More literal marketplace metaphor; reserved for campaign materials.

### What we avoid
Shopping carts · Store fronts · Cheap bag icons · Dollar signs · Clip-art marketplace symbols

---

## 3. Logo Rationale

The Sooqna mark combines:
- **Deep Navy** foundation → trust, technology, permanence
- **Premium Gold** accent curve → Emirati luxury, warmth
- **Subtle handle arc** → marketplace metaphor without cliché
- **Wheel dots** → mobility, delivery, modern commerce

The mark remains recognizable at **24px** (favicon) and scales to signage.

---

## 4. Logo Variations

| Variation | File | Use |
|-----------|------|-----|
| Icon only | `public/brand/logo-icon.svg` | Favicon, app icon, avatars |
| Horizontal | `public/brand/logo-horizontal.svg` | Website header, email |
| Vertical | `public/brand/logo-vertical.svg` | Splash, print, posters |
| Dark background | `public/brand/logo-dark.svg` | Footer, hero panels |
| App icon | `public/brand/app-icon.svg` | iOS / Android |
| OpenGraph | `public/brand/og-image.svg` | Social sharing |
| Pattern | `public/brand/pattern.svg` | Background texture |

### React components
- `shared/components/BrandMark.tsx` — icon only
- `shared/components/BrandLogo.tsx` — icon + wordmark (horizontal / vertical / bilingual)

### Themes
- **Light** — navy text on warm white
- **Dark** — white/gold on navy

---

## 5. Color System

### Primary palette

| Token | Hex | Role |
|-------|-----|------|
| Deep Navy | `#0B1628` | Primary brand, headers, text |
| Navy Soft | `#152238` | Dark surfaces, admin sidebar |
| Premium Gold | `#C9A962` | Secondary, accents, Arabic wordmark |
| Gold Light | `#D4B87A` | Gradients, hover |
| Gold Dark | `#9A7D4A` | Gradient depth |
| Warm White | `#FAF9F7` | Page background |
| Surface | `#FFFFFF` | Cards, inputs |

### Accent — Subtle UAE Green
| Token | Hex | Role |
|-------|-----|------|
| UAE Green | `#2D6A4F` | Accent (trust, verified, subtle identity) |
| Green Soft | `#E8F3ED` | Accent backgrounds |

### Semantic colors

| Token | Hex | Role |
|-------|-----|------|
| Success | `#10B981` | Confirm, verified, escrow complete |
| Warning | `#F59E0B` | Pending, attention |
| Danger | `#DC2626` | Delete, reject, error |
| Info | `#3B82F6` | Informational states |

### CSS implementation
All tokens live in `styles/design-tokens.css` and are mapped in `app/globals.css` via Tailwind `@theme`.

---

## 6. Typography

| Language | Family | Weights |
|----------|--------|---------|
| Arabic | IBM Plex Sans Arabic | 400, 500, 600, 700 |
| English | Inter | 400, 500, 600, 700 |

### Usage
- Body text: IBM Plex Sans Arabic (RTL default)
- English wordmark / Latin UI: `font-latin` (Inter)
- Headings: 800–900 weight, tight tracking
- Body: 500 weight, 1.6–1.75 line-height

### Scale (from design system)
- Display: clamp 1.875rem–2.5rem
- H1: clamp 1.5rem–2.25rem
- H2: clamp 1.125rem–1.5rem
- Body: 0.875rem
- Caption: 0.75rem

---

## 7. Spacing & Clear Space

### Clear space
Minimum clear space around the logo mark = **height of the mark** on all sides.

### Minimum size
| Context | Minimum |
|---------|---------|
| Digital icon | 24×24px |
| Horizontal logo | 120px width |
| Print | 30mm width |

### Layout
- Container: 1280px max (`--container-width`)
- Section gap: `clamp(3.5rem, 7vw, 6rem)`
- Card radius: `--radius-2xl` (32px)
- Button radius: `--radius-xl` (24px)

---

## 8. Brand Elements

### Pattern
Hexagonal geometric pattern (`sooqna-geometric-texture`) — gold at 20–35% opacity. Used in heroes and auth panels.

### Gradients
- `sooqna-gold-gradient` — CTA buttons, premium badges
- `sooqna-header-accent` — 0.5px header accent line
- `sooqna-hero-wash` — subtle gold + green radial wash

### Trust badges
| Badge | Variant | Label |
|-------|---------|-------|
| Verified | `verified` | موثق |
| Premium | `premium` | بريميوم |
| Escrow | `escrow` | ضمان مالي |
| Featured | `featured` | مميز |

### Icon style
- Stroke icons, 16–20px in buttons
- Gold line-art for trust icons in marketing
- `shrink-0` in flex layouts (RTL-safe)

---

## 9. UI Brand Application

| Surface | Brand element |
|---------|---------------|
| Header | `BrandLogo` + gold accent line |
| Footer | `BrandLogo` dark + copyright |
| Homepage header | `BrandLogo` (layout unchanged) |
| Auth | `BrandLogo` on luxury gradient panel |
| Buttons | `gold` variant = brand CTA |
| Cards | `marketplace-panel` / `marketplace-stat-card` |
| Loading | `BrandMark` in skeleton contexts |
| Empty states | Gold eyebrow, navy title |
| Favicon | `app/icon.svg` |
| Meta / OG | `layout.tsx` metadata |

---

## 10. App Icon & Favicon

| Asset | Path | Sizes |
|-------|------|-------|
| Favicon SVG | `/brand/logo-icon.svg` | Scalable |
| App icon | `/brand/app-icon.svg` | 1024→export |
| Next.js icon | `app/icon.svg` | Auto |
| Apple touch | `/brand/app-icon.svg` | 180px |

Recommended exports for stores:
- iOS: 1024×1024 PNG from `app-icon.svg`
- Android: 512×512 adaptive icon
- Favicon: 16, 32, 64 PNG + SVG

---

## 11. Brand Voice

### Tone
Confident, warm, clear, never salesy. Arabic-first. Short sentences.

### Do
- Use «سوقنا» for Arabic audiences
- Use «Sooqna» for English/international
- Emphasize trust, escrow, verification
- Keep CTAs action-oriented: «أضف إعلانك», «شراء الآن»

### Don't
- Say «موقع إعلانات رخيص»
- Overuse flag imagery
- Mix old «Sooqna» naming
- Use aggressive discount language

---

## 12. Do & Don't

### ✅ Do
- Use `BrandLogo` / `BrandMark` components
- Maintain clear space around the mark
- Use gold sparingly for emphasis
- Keep navy as dominant brand color
- Use semantic badge variants consistently

### ❌ Don't
- Stretch or rotate the logo
- Place gold text on gold backgrounds
- Replace the mark with generic cart icons
- Use Tajawal (deprecated — replaced by IBM Plex)
- Use red as primary brand color

---

## 13. Mockup Applications

| Application | Implementation |
|-------------|----------------|
| Website header | `SiteHeader` + `MarketHeader` |
| iPhone / Android app | `public/brand/app-icon.svg` |
| Business card | Horizontal logo + navy + gold foil accent |
| Office sign | Embossed mark on navy facade (see brand board) |
| Social media | `og-image.svg` 1200×630 |
| Email signature | `logo-horizontal.svg` + tagline |
| Loading screen | `BrandMark` centered + shimmer skeleton |
| Shopping bag | Icon-only mark, gold on navy |

---

## 14. Files Updated (Rebrand)

### New files
- `shared/constants/brand.ts`
- `shared/components/BrandMark.tsx`
- `shared/components/BrandLogo.tsx`
- `public/brand/*` (7 SVG assets)
- `app/icon.svg`
- `BRAND_IDENTITY_GUIDE.md`

### Updated
- `styles/design-tokens.css` — Sooqna palette
- `app/globals.css` — brand gradients, pattern, fonts
- `app/layout.tsx` — IBM Plex + Inter, metadata
- `shared/layouts/SiteHeader.tsx` / `SiteFooter.tsx`
- `features/home/.../MarketHeader.tsx` / `MarketSiteFooter.tsx`
- `features/auth/.../AuthShell.tsx`
- `services/storage/client-storage.ts` — `sooqna-*` keys + migration
- `mock/demo-accounts.mock.ts` — `@sooqna.demo`
- Page metadata, login/register, categories, listings
- `shared/ui/Button.tsx` — `sooqna-gold-gradient`

---

## 15. Migration Notes

Local storage keys migrated automatically:
- `uae-sales-session` → `sooqna-session`
- `uae-sales-local-listings` → `sooqna-local-listings`

Demo emails: `*@sooqna.demo` (legacy `@uaesales.demo` still accepted)

---

*Sooqna Brand Identity System — v1.0*
