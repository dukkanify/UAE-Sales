# UAE Sales — Design Decisions

## 1. Color Strategy

**Decision:** Luxury Charcoal (`#0F1419`) as primary, Warm Gold (`#C9A962`) as secondary, UAE Red (`#C41E3A`) as accent only.

**Rationale:** Dubizzle and OpenSooq rely heavily on orange/blue generic palettes. UAE Sales differentiates with a charcoal + gold luxury pairing that signals premium trust without feeling corporate. Red is reserved for prices and alerts — not overused.

**Rejected:** Green primary (previous iteration), bright blue (too generic), full dark mode default (adds complexity).

---

## 2. Typography

**Decision:** Tajawal as primary Arabic font via `next/font/google`.

**Rationale:** Tajawal offers excellent Arabic readability at all weights, modern geometric feel compatible with 2026 premium aesthetics, and pairs well with Latin characters for brand name "UAE Sales".

**Rejected:** System fonts only (inconsistent across devices), decorative Arabic fonts (poor readability at small sizes).

---

## 3. Border Radius

**Decision:** `rounded-xl` (14px) for buttons/inputs, `rounded-2xl`/`rounded-3xl` for cards and sections.

**Rationale:** Apple and Linear use moderate rounding — not fully pill-shaped (which feels playful/casual) nor sharp corners (which feels dated). `rounded-xl` strikes the premium balance.

**Rejected:** `rounded-full` on all buttons (too casual for marketplace), `rounded-sm` everywhere (too corporate).

---

## 4. Card Elevation

**Decision:** Subtle border + soft shadow, with hover lift (`-translate-y-1`).

**Rationale:** Airbnb and Property Finder use elevation to create depth without heavy shadows. Border ensures cards are visible on warm white backgrounds.

**Rejected:** Heavy `box-shadow: 0 24px 70px` on every card (overwhelming), flat cards with border only (insufficient hierarchy).

---

## 5. Homepage Structure

**Decision:** 11 sections in narrative order: Hero → Stats → Categories → Featured → Latest → Escrow → Why → How → Cities → Testimonials → App.

**Rationale:** Guides user from discovery (search/categories) to trust (escrow/why) to action (register/app). Stats strip early builds credibility. Removed developer-facing API banner.

**Rejected:** Single long scroll with only listings (no trust building), dashboard-style homepage (wrong audience).

---

## 6. Listing Card Design

**Decision:** 4:3 image, escrow badge on image, verified seller badge, accent price color, favorite top-left.

**Rationale:** Property Finder uses large images with metadata below — proven pattern for UAE market. Escrow badge on image is immediately visible trust signal. Price in red draws attention without cluttering.

**Rejected:** Small square thumbnails (poor visual impact), text-only cards (low engagement).

---

## 7. Dashboard Layout

**Decision:** Sidebar with profile, nav, wallet balance, notifications on desktop; horizontal pills on mobile.

**Rationale:** Linear and Stripe dashboards use persistent sidebar for context. Wallet + notifications in sidebar reduce clicks to key actions. Mobile gets compact horizontal nav to preserve content space.

**Rejected:** Top-only navigation (insufficient for multi-section dashboard), full-width tables (too enterprise).

---

## 8. Authentication Layout

**Decision:** Split screen — dark luxury panel (trust) + elevated white form card.

**Rationale:** Stripe and Airbnb auth pages use split layouts to build trust while keeping forms clean. Dark panel carries brand story; form stays minimal for conversion.

**Rejected:** Centered card only (no trust building), full-page dark form (poor readability).

---

## 9. Animation Philosophy

**Decision:** Subtle hover lift, image scale on card hover, no page transitions or loading animations.

**Rationale:** Premium products feel fast. Micro-interactions on hover provide feedback without slowing perceived performance. Arc Browser and Linear use minimal animation — we follow same principle.

**Rejected:** Framer Motion page transitions (bundle size), skeleton loaders everywhere (unnecessary for SSG pages).

---

## 10. Component API

**Decision:** Variant-based props (`variant`, `size`) on primitives; composition over configuration.

**Rationale:** Consistent with React best practices. `Button variant="accent"` is clearer than className overrides. Card variants (`default`, `elevated`, `glass`, `flat`) cover all use cases.

**Rejected:** CSS class string props (error-prone), one-size-fits-all components (insufficient flexibility).

---

## 11. Mock Data Strategy

**Decision:** Keep mock data in `services/` with localStorage for user-generated listings; no fake Lorem ipsum.

**Rationale:** Investor demos need realistic Arabic content. Professional copy in mock listings builds credibility. localStorage enables E2E demo without backend.

**Rejected:** Random placeholder text, English-only mock data.

---

## 12. Documentation Deliverables

**Decision:** Five markdown files at repo root for design system, style guide, audit, decisions, and status.

**Rationale:** Investor-ready documentation alongside code. Separate concerns: tokens (DESIGN_SYSTEM), usage rules (UI_STYLE_GUIDE), audit trail (UI_AUDIT_REPORT), rationale (DESIGN_DECISIONS), progress (PROJECT_STATUS_REPORT).
