# P2-03 — Enterprise multi-tenant architecture (SaaS)

## Goal

Run multiple aviation academies on shared infrastructure with isolation.

## Allow

- Multiple academies
- Separate branding
- Separate domains
- Separate databases (enterprise SKU)
- Independent billing
- Independent administrators
- Shared application infrastructure

## Design

See `docs/ARCHITECTURE_V2.md`.

## Flag

`multiTenant`

## Acceptance

- [ ] Tenant resolver (host + JWT)
- [ ] No cross-tenant data leakage (automated tests)
- [ ] Per-tenant Super Admin / Admin roles
- [ ] Optional DB-per-tenant provisioning runbook
