# PERFORMANCE_OPTIMIZATION_REPORT.md

**Project:** AviatorPass / ATPL PASS (Aviation Education Platform)  
**Branch:** `cursor/enterprise-performance-0987`  
**Report date:** 2026-08-25  
**Commits:** `e8523c0`, `f335a71`

---

## Executive summary

High-impact performance work focused on marketing LCP, dashboard First Load JS, public API caching, and asset weight — **without changing business logic**. Visual design is preserved; a few brand-adjacent contrast tokens were darkened for WCAG AA.

Local production (`next start`) serves homepage / courses / book correctly with hero imagery and no console errors (manual UI verification).

---

## Performance before

### Production build First Load JS (baseline)

| Route                    | Route JS | First Load JS |
| ------------------------ | -------- | ------------- |
| Shared                   | —        | **102 kB**    |
| `/`                      | 10.4 kB  | **126 kB**    |
| `/admin/dashboard`       | 2.79 kB  | **296 kB**    |
| `/super-admin/dashboard` | 3.34 kB  | **296 kB**    |
| `/student/dashboard`     | 252 B    | **322 kB**    |
| `/admin/analytics`       | 141 B    | **236 kB**    |
| `/admin/courses`         | 345 B    | **352 kB**    |
| `/cgi/dashboard`         | 3.88 kB  | **327 kB**    |

### Marketing assets (before)

| File                 | Size         |
| -------------------- | ------------ |
| `hero-aircraft.jpg`  | 478 KB       |
| `hero-cockpit.jpg`   | 253 KB       |
| `section-runway.jpg` | 340 KB       |
| **Total**            | **~1.07 MB** |

### Structural issues

- Homepage was a full `"use client"` tree; hero used CSS multi-background JPEGs (no `next/image`).
- Marketing CSS (`landing.css` + `atpl-pass-home.css`) loaded globally on every route.
- `StatCard` / `QuickActions` pulled `framer-motion` into all role dashboards.
- Analytics hub imported eager `recharts` via `@/components/dashboard/charts`.
- Student dashboard used client `useEffect` fetch (skeleton waterfall).
- `getPlatformOverview` seeded analytics + heavy class stats on every super-admin SSR.
- Public APIs lacked HTTP `Cache-Control`.
- Unused deps: `react-hook-form`, `@hookform/resolvers`.

---

## Performance after

### Production build First Load JS

| Route                    | Route JS    | First Load JS | Δ First Load          |
| ------------------------ | ----------- | ------------- | --------------------- |
| Shared                   | —           | **103 kB**    | +1 kB                 |
| `/`                      | **3.24 kB** | **124 kB**    | −2 kB (route −7.2 kB) |
| `/admin/dashboard`       | 2.78 kB     | **144 kB**    | **−152 kB (−51%)**    |
| `/super-admin/dashboard` | 3.33 kB     | **145 kB**    | **−151 kB (−51%)**    |
| `/student/dashboard`     | 249 B       | **210 kB**    | **−112 kB (−35%)**    |
| `/admin/analytics`       | 753 B       | **148 kB**    | **−88 kB (−37%)**     |
| `/admin/courses`         | 334 B       | **201 kB**    | **−151 kB (−43%)**    |
| `/cgi/dashboard`         | 3.88 kB     | **175 kB**    | **−152 kB (−46%)**    |

### Marketing assets (after)

| File             | JPEG               | WebP   |
| ---------------- | ------------------ | ------ |
| `hero-aircraft`  | 235 KB (−51%)      | 180 KB |
| `hero-cockpit`   | 60 KB (−76%)       | 37 KB  |
| `section-runway` | 170 KB (−50%)      | 129 KB |
| **JPEG total**   | **~465 KB (−56%)** |        |

### Local API / page timings (`next start` :3005)

| Path                             | HTTP | Time                                                       |
| -------------------------------- | ---- | ---------------------------------------------------------- |
| `/`                              | 200  | ~5 ms                                                      |
| `/api/health`                    | 200  | ~5 ms                                                      |
| `/api/public/brand`              | 200  | ~3 ms + `Cache-Control: public, max-age=60, s-maxage=300…` |
| `/api/countries`                 | 200  | ~5 ms + long-lived public cache                            |
| `/courses`, `/book`, `/register` | 200  | ~4–6 ms                                                    |

---

## Optimizations applied

### Next.js / React

1. **Homepage → Server Component** with client islands (`Button`, `Link` only).
2. **Hero LCP** via prioritized `next/image` (AVIF/WebP pipeline, sized `1200px` max).
3. **Scoped marketing CSS** to `app/(marketing)/layout.tsx`.
4. **Removed `framer-motion`** from `StatCard` / `QuickActions` (CSS `animate-in-up`).
5. **Analytics** imports lazy charts from `@/components/dashboard` barrel.
6. **`CHART_COLORS`** moved to `chart-types.ts` (no recharts pull via barrel).
7. **Student dashboard SSR** with `getLearningDashboard(user)`.
8. **Expanded `optimizePackageImports`** for remaining Radix packages.
9. **Preload Exo 2** display font (hero brand LCP).
10. Removed delayed entrance animations from LCP hero text.

### Images / fonts / assets

- Compressed marketing JPEGs (mozjpeg) + WebP siblings.
- CSS `image-set()` for section backgrounds.
- `.vercelignore` excludes `public/brand/source/**` (~design PDFs/PNGs).

### API / data

- Cache headers: brand, countries, OpenAPI, v1 public courses/blog/announcements.
- Slimmer `getPlatformOverview` (no analytics seed; lightweight class loop).

### Bundle / deps

- Removed unused `react-hook-form` + `@hookform/resolvers` (6 packages).

### Accessibility (performance-adjacent)

- Darker muted grey (`#6f6e74`) for WCAG body text.
- Footer text logo `aria-label="ATPL PASS"` matches visible label.
- Subject code/badge gold darkened for small-text contrast.

---

## Lighthouse results (local `next start`, lab)

| Category       | Mobile  | Desktop | Target |
| -------------- | ------- | ------- | ------ |
| Performance    | **82**  | **76**  | 95+    |
| Accessibility  | **96**  | **96**  | 100    |
| Best Practices | **100** | **100** | 100    |
| SEO            | **100** | **100** | 100    |

### Core Web Vitals (mobile lab)

| Metric | Value                                                            |
| ------ | ---------------------------------------------------------------- |
| FCP    | ~1.2 s                                                           |
| LCP    | ~4.0 s (hero brand text; render delay dominated by display font) |
| TBT    | ~40 ms                                                           |
| CLS    | **0**                                                            |
| TTI    | ~4.1 s                                                           |

**Note:** Lab Lighthouse on localhost underestimates CDN/edge caching and does not match production Vercel edge. Performance ≥95 was **not** reached in this lab run; remaining LCP is dominated by display-font render delay on the hero brand mark (not JS TBT).

---

## Bundle reduction

| Area                    | Impact                                            |
| ----------------------- | ------------------------------------------------- |
| Dashboard First Load JS | **~150 kB** saved on admin/CGI/super-admin shells |
| Student dashboard       | **~112 kB**                                       |
| Analytics               | **~88 kB**                                        |
| Homepage route chunk    | **10.4 → 3.2 kB**                                 |
| Marketing JPEG bytes    | **−56%**                                          |
| Unused npm packages     | Removed form libs                                 |

---

## Query / API improvements

| Change                        | Benefit                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| Slim `getPlatformOverview`    | Faster super-admin SSR; avoids analytics seed                   |
| Student SSR dashboard         | Eliminates client RTT + skeleton                                |
| Public API `Cache-Control`    | CDN/browser reuse; brand/countries under target latency locally |
| Existing `cacheWrap` retained | In-process cache for v1 public catalogs                         |

Supabase SQL indexes were **not** changed in this pass (local JSON store path dominates; migrations already exist under `database/migrations/` for production cutover).

---

## Remaining recommendations

1. **LCP ≥95:** subset/self-host Exo 2 with `size-adjust`, or use body font for the decorative hero brand mark; measure again on Vercel production with Speed Insights.
2. **Accessibility =100:** audit remaining gold-on-cream chips sitewide; consider `text-primary` for ultra-small labels.
3. **JSON store scale (TD-001):** stream/index `.data/*.json` instead of full-file parse (~6.7 MB auth).
4. **Dynamic-import** heavy shells (`platform-settings-shell`, `ops-center-shell`) by tab.
5. **Bundle analyzer** in CI (`@next/bundle-analyzer`) for regression budgets.
6. **Promote** this branch through `aviatorpass` production once Vercel deploy credentials/hooks are configured.

---

## Validation

| Check                             | Result                                                                 |
| --------------------------------- | ---------------------------------------------------------------------- |
| `npm run typecheck`               | Pass                                                                   |
| `npm run lint`                    | Pass                                                                   |
| `npm test`                        | **137/137** pass                                                       |
| `npm run build`                   | Pass                                                                   |
| Manual UI (home / courses / book) | Pass — artifacts under `/opt/cursor/artifacts/01-*.webp` … `06-*.webp` |
| Console errors                    | None observed in DevTools verification                                 |

---

## Final result

Enterprise performance foundations are in place: **dashboard JS roughly halved**, marketing assets **cut >50%**, homepage is an RSC with real LCP imagery, and public APIs advertise cache headers. Lighthouse SEO and Best Practices hit **100**; Performance and Accessibility remain below the stretch targets in local lab and are tracked in remaining recommendations.
