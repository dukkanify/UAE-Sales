# Performance benchmarks — Task 019

Micro-benchmarks run via `npm run test:bench` (Vitest). CI-safe budgets (not hardware SLAs).

| Benchmark                  | Budget    | Notes          |
| -------------------------- | --------- | -------------- |
| `hashValue` × 2000         | < 2000 ms | SHA-256 helper |
| Permission check × 5000    | < 500 ms  | RBAC hot path  |
| `paginate` 10k items × 200 | < 1000 ms | API pagination |
| Single `hashPassword`      | < 5000 ms | scrypt         |

## Application targets (manual / UAT)

| Path                     | Target       | How measured              |
| ------------------------ | ------------ | ------------------------- |
| Login OTP round-trip     | < 2 s warm   | `npm run uat` timings     |
| Dashboard metrics API    | < 5 s        | UAT latency budget        |
| Public course catalog v1 | < 1 s cached | `/api/v1/public/courses`  |
| Health ready             | < 300 ms     | `/api/health?ready=1`     |
| Report / export job      | async queue  | `/api/v1/platform/export` |

Record production samples in Ops Center monitoring and update this table after go-live load tests.

## Large uploads

Upload validation is enforced in `lib/security/upload.ts`. Benchmark real AV + storage once Supabase Storage is live.
