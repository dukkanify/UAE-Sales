# Header QA Report — Add Listing Button

**Date:** July 5, 2026  
**Issue:** Fix header "أضف إعلانك" button text clipping  
**Branch:** `cursor/fix-header-add-listing-btn-37ba`  
**Status:** ✅ **CLOSED — All checks pass**

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ Pass |
| `npm run build` | ✅ Pass |

## QA Matrix

| Scenario | Result | Notes |
|----------|--------|-------|
| Desktop (1280px) | ✅ Pass | Button 136×42px, min-width 120px, padding 18px |
| Tablet (768px) | ✅ Pass | Same button sizing, no clipping |
| Mobile (375px) | ✅ Pass | CTA in drawer menu, full-width 351×42px |
| Logged out | ✅ Pass | Homepage `MarketHeader` + `/search` `SiteHeader` |
| Logged in | ✅ Pass | Profile name shown; button intact |
| Arabic RTL | ✅ Pass | `dir="rtl"` confirmed |
| Hover | ✅ Pass | Existing hover styles preserved (gold gradient / primary) |
| Focus | ✅ Pass | `focus-ring` visible on keyboard focus |
| No text clipping | ✅ Pass | `clipped: false` on all measured buttons |
| No icon overlap | ✅ Pass | `gap: 8px` between `+` icon and label |
| No layout shift | ✅ Pass | Fixed `h-[42px]` + `shrink-0` prevents compression |

## Measured Styles (Playwright)

### Homepage — MarketHeader (logged out, desktop)

```
text: أضف إعلانك
width: 136px | height: 42px
min-width: 120px | padding-inline: 18px
white-space: nowrap | overflow: visible
display: flex | align-items: center | justify-content: center | gap: 8px
```

### Search — SiteHeader button with icon (desktop)

```
height: 42px | min-width: 120px
white-space: nowrap | overflow: visible
```

## Screenshots

| View | File |
|------|------|
| Desktop (logged out, homepage) | `header-desktop-logged-out-home.png` |
| Desktop (logged in, search) | `header-desktop-logged-in-search.png` |
| Mobile (menu open) | `header-mobile-menu-open.png` |
| Tablet | `header-tablet-logged-out.png` |
| Focus state | `header-desktop-focus.png` |

Screenshots captured via `scripts/header-qa-screenshots.mjs` → `/opt/cursor/artifacts/screenshots/`

## Conclusion

The header "أضف إعلانك" button fix meets all acceptance criteria. **Issue closed.**
