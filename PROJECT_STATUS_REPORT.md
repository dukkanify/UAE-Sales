# Sooqna Web App — Project Status Report

**Last updated:** July 5, 2026  
**Branch:** `cursor/web-foundation-homepage-37ba`  
**Phase:** Production freeze — demo accounts + architecture cleanup complete

---

## Current Ready Features

### Core Marketplace UI
| Area | Routes | Status |
|------|--------|--------|
| Homepage | `/` | ✅ Final marketplace design (single version) |
| Categories | `/categories`, `/categories/[slug]` | ✅ Directory + hero + listings |
| Search | `/search` | ✅ Sticky filters, chips, saved searches |
| Featured | `/featured` | ✅ Premium listing grid |
| Listing detail | `/listings/[slug]` | ✅ Gallery, sticky price, seller, escrow, safety |
| Local listings | `/listings/local/[id]`, `.../edit` | ✅ localStorage CRUD |
| Add listing | `/listings/new` | ✅ 3-step form + preview |

### Auth & Accounts
| Feature | Status |
|---------|--------|
| Demo User login | ✅ `user@sooqna.demo` / `User@123` |
| Demo Business login | ✅ `company@sooqna.demo` / `Company@123` |
| Demo Admin login | ✅ `admin@sooqna.demo` / `Admin@123` |
| OTP verification | ✅ `123456` for all demo accounts |
| Demo credentials panel on login | ✅ |
| Register + OTP | ✅ |
| Session (localStorage) | ✅ |

### Dashboard & Profile
| Route | Status |
|-------|--------|
| `/profile` | ✅ Profile form + activity panel |
| `/dashboard/listings` | ✅ Analytics, tabs, listing management |
| `/wallet` | ✅ Demo wallet UI |
| `/escrow` | ✅ Demo escrow UI |
| `/chat` | ✅ Demo messaging UI |

### Design System
- Single `PremiumListingCard` across all listing grids
- Unified tokens: `styles/design-tokens.css`, `app/globals.css`
- Shared UI primitives in `shared/ui/`
- Image fallback system in `shared/constants/image-fallbacks.ts`

### Data Architecture
- All mock data in `mock/` directory
- Services layer ready for backend swap (`services/*.service.ts`)
- API client scaffold (`services/api/client.ts`)

### Technical Health
| Check | Status |
|-------|--------|
| `npm run lint` | ✅ Pass |
| `npm run build` | ✅ 71 routes |
| TypeScript | ✅ No errors |
| RTL Arabic | ✅ |
| Responsive | ✅ |
| Automated tests | ❌ Not configured |

---

## Missing Features

| Item | Notes |
|------|-------|
| `/admin` route | Admin demo account redirects to `/dashboard/listings` |
| Real backend API | All data is mock/in-memory |
| UAE PASS integration | Button disabled (coming soon) |
| Real payment/checkout | `/checkout` is placeholder |
| Real OTP/SMS | Demo OTP `123456` only |
| Automated test suite | Not configured |
| Production CDN for images | External Unsplash URLs |

---

## Architecture Status

| Item | Status |
|------|--------|
| One homepage | ✅ `features/home/components/marketplace/` |
| One listing card | ✅ `PremiumListingCard` |
| One mock layer | ✅ `mock/` |
| One image registry | ✅ `image-fallbacks.ts` |
| Dead code removed | ✅ Verified |
| Duplicate homepage experiments | ✅ None remain |

**Note:** Homepage uses `MarketHeader` / `MarketSiteFooter` (gold marketplace styling). Other pages use `SiteHeader` / `SiteFooter`. This is intentional to preserve the approved homepage design.

---

## Next Recommended Phase

### Phase 1 — Backend Foundation
1. Wire `services/api/client.ts` to real API
2. Replace `mock/` imports in services with API calls
3. Real JWT/session auth replacing localStorage
4. Real OTP provider

### Phase 2 — Payments & Trust
1. Wallet backend + transactions
2. Escrow workflow API
3. Checkout payment integration

### Phase 3 — Messaging & Admin
1. Real-time chat
2. `/admin` panel for admin role
3. Listing moderation API

### Phase 4 — Quality
1. Add Playwright/Cypress E2E tests using `TESTING_GUIDE.md` demo accounts
2. Performance monitoring
3. Production image CDN

---

## Documentation

| Document | Purpose |
|----------|---------|
| `TESTING_GUIDE.md` | Demo accounts + QA flows |
| `PROJECT_CLEANUP_REPORT.md` | Cleanup audit |
| `ARCHITECTURE_CLEANUP_REPORT.md` | Architecture freeze details |
| `IMAGE_AUDIT_REPORT.md` | Image fix audit |
| `PRODUCTION_POLISH_REPORT.md` | UI polish pass |

---

## Demo Quick Reference

```
User:     user@sooqna.demo     / User@123     / OTP: 123456
Business: company@sooqna.demo  / Company@123  / OTP: 123456
Admin:    admin@sooqna.demo    / Admin@123    / OTP: 123456
```

See `TESTING_GUIDE.md` for full testing instructions.
