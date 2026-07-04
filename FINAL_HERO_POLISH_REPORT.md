# Final Hero Balance Polish — Report

## Summary

Targeted balance pass on the hero zone — no structural redesign, no new sections. Focus: height, readability, card clarity, search prominence, header spacing, mobile stability.

---

## What Changed

### 1. Hero height & search position

| Before | After |
|--------|-------|
| `pt-10 md:pt-14`, `pb-28 md:pb-36` | `pt-7 md:pt-10`, `pb-[7.5rem] md:pb-[8.5rem]` |
| Search `translate-y-[42%]` | Search `translate-y-[30%]` / `sm:translate-y-[28%]` |
| Categories `pt-28 md:pt-32` | `pt-[6.5rem] md:pt-28` |

Search appears higher on first screen with less dead space below the hero content.

### 2. Hero background & text readability

- Stronger white gradient on text side: `from-white from-[32%] via-white/[0.97]`
- Sand wash opacity reduced to 80%
- Geometric texture lowered to 2.5% opacity
- Mobile text panel: `bg-white/75` + light blur for cleaner reading
- Desktop text: transparent (gradient handles readability)

UAE identity preserved; background softened only behind copy.

### 3. Listing cards

- Removed overlapping negative margins — clean `grid gap-3.5/4`
- Equal 2-column row for car + iPhone (no 5-column asymmetry)
- **One badge per card** only:
  - Villa → ضمان مالي
  - Mercedes → موثق
  - iPhone → ضمان مالي
- Removed category chips (عقار مميز / سيارة مميزة)
- Softer shadows, `max-h` caps on mobile to prevent tall hero
- Villa `aspect-[16/9]`, bottom cards `aspect-[4/5]` — balanced, not chaotic

### 4. Search bar

- Raised with hero (see above)
- Refined shadow: `0 20px 56px`
- Tighter internal padding on mobile, full `min-h-14` on `sm+`
- Clear labels, responsive input text sizes
- Popular tags spacing tightened

### 5. Header

- Height: `4.25rem` / `4.5rem` (was `4.75` / `5rem`)
- Logo slightly smaller (`size-11/12`)
- Nav gap and padding balanced
- CTA: `min-h-10 px-5` — prominent but not oversized

### 6. Mobile

- Cards stack with gap only — no overlap
- `max-h-52` / `max-h-56` on card images limits hero length
- Search visible sooner via reduced translate + bottom padding
- Text panel ensures readability on small screens

---

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| Structure unchanged | Yes |
| 3 cards only | Yes |

---

## Desktop QA

| Area | Status |
|------|--------|
| Hero height | Shorter, less empty space |
| Text readability | Clean white zone on copy side |
| Cards | Aligned grid, single badge each |
| Search | Higher, clear primary element |
| Header | Balanced spacing, right-sized CTA |

## Mobile QA

| Area | Status |
|------|--------|
| Card overlap | None |
| Hero length | Capped card heights |
| Search visibility | Appears within first scroll |
| Text | White panel readable |

---

## What Still Feels Weak

1. Floating search still uses absolute positioning — fine for desktop; very small phones may need one more `pt` tweak on categories.
2. Stock images remain placeholders until real listing photography is wired.

---

## Files Touched

```
features/home/components/final/FinalHero.tsx
features/home/components/final/FinalHeroCollage.tsx
features/home/components/final/FinalHeroSearch.tsx
features/home/components/final/FinalHeader.tsx
features/home/components/final/FinalCategories.tsx
services/content/homepage-final.content.ts
```
