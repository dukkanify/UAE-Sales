# Scalability assessment — Task 022

## Current capacity model

| Dimension      | Today                                  | Breaks when                             |
| -------------- | -------------------------------------- | --------------------------------------- |
| Database       | Single JSON files per domain           | Concurrent writers / multi-instance     |
| File storage   | Local `public/uploads`                 | Ephemeral hosts / multiple nodes        |
| Sessions       | Cookie JWT + JSON session rows         | Large session tables without DB indexes |
| Rate limits    | In-process `Map`                       | Horizontal scale                        |
| Queues         | JSON queue + in-request `processQueue` | Long jobs / burst webhooks              |
| API throughput | Node single runtime                    | CPU-bound JSON parse/write              |

## Concurrent users

- **Demo / pilot academy (< few hundred DAU):** JSON + single Vercel region OK if sticky single instance or accept data loss risk.
- **Production multi-cohort:** Require Postgres + Redis + object storage **before** marketing scale-up.

## Growth recommendations (priority order)

1. **Postgres cutover** (migrations 002→017; expand Prisma or use SQL directly).
2. **Object storage** (Supabase/S3) for media/recordings/exports.
3. **Redis** for rate limits, CSRF buckets, short cache.
4. **Worker process** (BullMQ/SQS) for webhooks, email, report exports.
5. **CDN** (Vercel Edge) already suitable for static; keep long-cache headers.
6. **Read replicas / partitioning** for activity logs & analytics events after volume appears.
7. **API gateway quotas** per API key (platform already stores per-key RPM).

## API throughput tips

- Prefer `/api/v1` pagination helpers already used in platform services.
- Keep exports async (`/api/v1/platform/export`).
- Cache public course catalog aggressively after DB cutover.

## File storage growth

- Lifecycle policies for recordings and temporary exports.
- Antivirus before objects become public.

## Conclusion

Architecture can scale **after** replacing filesystem SoR and in-memory coordination. Application modularity does not block that path.
