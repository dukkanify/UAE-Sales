# Performance audit — Task 022

**Date:** 2026-08-04

## Lab measurements (local)

| Metric                  | Result                        | Target                               |
| ----------------------- | ----------------------------- | ------------------------------------ |
| Vitest micro-benchmarks | 4/4 pass                      | `npm run test:bench`                 |
| First Load JS (shared)  | ~102 kB                       | Keep < 150 kB shared                 |
| Ops Center route        | ~15.7 kB page                 | Acceptable for admin                 |
| Middleware              | ~58 kB                        | Monitor growth                       |
| UAT avg check latency   | ~3.5–4.5 s wall (network+CPU) | Dashboard API budget enforced in UAT |
| Production build        | Succeeds                      | —                                    |

## Optimizations already in place

- `compress: true`, `poweredByHeader: false`
- `optimizePackageImports` for lucide / recharts / date-fns / framer-motion
- Image AVIF/WebP + long cache TTL
- Immutable `/_next/static` cache headers
- Ops deep-health short TTL cache
- App Router per-route code splitting

## Gaps

| Item                             | Priority      | Action                       |
| -------------------------------- | ------------- | ---------------------------- |
| Lighthouse 90+ on production URL | High          | Run after domain/CDN settle  |
| Recharts weight on dashboards    | Medium        | Dynamic import / lazy charts |
| JSON full-file reads             | High at scale | Postgres cutover             |
| Client list refetch storms       | Medium        | React Query / SWR            |
| Background jobs in-request       | Medium        | Dedicated worker             |

## Core Web Vitals guidance

Measure on marketing `/` and `/login` with production CDN:

- LCP: hero/brand image via `next/image`
- FCP: minimize render-blocking fonts
- CLS: reserve image/chart space
- INP: keep admin tables virtualized if rows grow

Record samples in Ops monitoring after go-live (`docs/PERFORMANCE_BENCHMARKS.md`).
