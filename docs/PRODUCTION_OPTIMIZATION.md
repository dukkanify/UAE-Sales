# Production optimization notes — Task 020

Targets: Lighthouse 90+, strong Core Web Vitals, fast navigation, low server load.

## Already implemented

| Area             | Implementation                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Bundle / imports | `experimental.optimizePackageImports` in `next.config.ts`                                  |
| Compression      | `compress: true`                                                                           |
| Images           | AVIF/WebP, sized device breakpoints, 30-day cache TTL                                      |
| Static caching   | `/_next/static` → `max-age=31536000, immutable`                                            |
| Code splitting   | App Router per-route segments + role layouts                                               |
| Security headers | Shared via `next.config.ts` + `vercel.json`                                                |
| API load         | Ops deep-health short TTL cache; pagination helpers                                        |
| Background jobs  | Platform queue (`/api/v1/platform/*`) for exports / async work                             |
| Search           | In-app communication/course search over indexed JSON (upgrade with DB indexes on Supabase) |

## Operator checklist after go-live

1. Run Lighthouse (mobile + desktop) on marketing `/` and `/login`.
2. Confirm LCP image is optimized via `next/image`.
3. Enable Vercel Analytics / Speed Insights if licensed.
4. Watch Ops Center error rate under load; tune rate limits.
5. After Supabase cutover, add indexes per migration files; enable connection pooling (`DATABASE_URL`).
6. Re-run `npm run test:bench` in CI for crypto/RBAC regressions.

## Out of scope for Task 020

No new product features. Optimization is configuration, docs, and validation only.
