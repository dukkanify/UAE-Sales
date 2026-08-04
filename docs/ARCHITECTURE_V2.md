# Architecture V2 — Multi-tenant SaaS foundations

**Status:** Design target for Phase 2  
**Constraint:** Additive to v1.0; no breaking changes to existing single-tenant JSON stores until cutover complete.

## Target topology

```
                    ┌─────────────────────────────┐
   Web / Mobile ───►│  Edge (CDN) + Next.js BFF   │
                    │  Tenant resolver (host/JWT)  │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        Tenant A DB         Tenant B DB         Shared services
        (Postgres)          (Postgres)          (Auth IdP, Queue,
                                                 Object storage,
                                                 Observability)
```

## Tenant resolution

1. **Host-based:** `academy.example.com` → `tenant_id`
2. **Header / JWT claim:** `x-tenant-id` / `tid` for mobile & API keys
3. **Path (discouraged):** only for legacy migration

Fail closed if tenant cannot be resolved in multi-tenant mode.

## Data isolation models

| Model                   | When                   | Notes                                |
| ----------------------- | ---------------------- | ------------------------------------ |
| **Database-per-tenant** | Enterprise / regulated | Strongest isolation; higher ops cost |
| **Schema-per-tenant**   | Mid-market             | Good isolation; shared instance      |
| **Row-level tenant_id** | Early SaaS             | Lowest cost; requires strict RLS     |

Phase 2 default recommendation: **row-level + RLS** initially, with optional **database-per-tenant** for enterprise SKUs.

## Branding / white label

Per-tenant overrides of:

- Logo, colors, favicon, OG image
- Custom domain + SSL
- Email sender + templates
- Landing page blocks

Stored as tenant branding settings (extends v1 platform branding).

## Billing

- Platform billing (academy → ATPL PASS) separate from student checkout
- Stripe Connect or invoice-based enterprise contracts
- Independent Stripe customer per tenant

## Shared vs dedicated

| Shared                    | Dedicated (enterprise option) |
| ------------------------- | ----------------------------- |
| App runtime, workers, CDN | Postgres instance             |
| Mobile API gateway        | Object storage bucket         |
| Observability stack       | Redis / queue namespace       |

## Migration from v1.0

1. Cut over JSON → Postgres (single tenant)
2. Introduce `tenants` table; assign existing data to `tenant_default`
3. Enable `multiTenant` flag
4. Onboard academy #2 on shared infra
5. Offer DB-per-tenant for premium SKUs

## Security

- Tenant context required on every service call
- Cross-tenant IDOR tests in CI
- SSO assertions mapped to tenant membership
- Audit logs include `tenantId`
