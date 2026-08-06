# Phase 2 — Enterprise Expansion Roadmap (Version 2.0)

**Product:** AviatorPass — Aviation Education Platform  
**Status:** Planned expansion beyond Version 1.0 GA  
**Constraint:** All Phase 2 work must preserve v1.0 stability (additive, feature-flagged, non-breaking)  
**Companion backlog:** `docs/V2_BACKLOG.md` · Architecture: `docs/ARCHITECTURE_V2.md`  
**Initiative briefs:** `docs/phase2/`

## 1. Purpose

Phase 2 transforms AviatorPass from a single-academy v1.0 platform into an **enterprise SaaS education suite**: native mobile, corporate B2B, multi-tenant white-label, advanced assessment integrity, integrations, i18n, and predictive BI.

This package defines **what** will ship in Version 2.x, **in what order**, and **how** to extend without regressing v1.0.

> Full production delivery of every Phase 2 pillar is a multi-release program. Foundations (flags, contracts, scaffolds) land in this tip so engineering can execute initiative-by-initiative under separate contracts.

## 2. Non-breaking expansion principles

| Principle                  | Practice                                                                    |
| -------------------------- | --------------------------------------------------------------------------- |
| Additive APIs              | Prefer `/api/v2/*` or versioned mobile contracts; keep `/api/v1` stable     |
| Feature flags              | New capabilities default **off** in `PlatformSettings.features`             |
| Tenant isolation           | No cross-tenant reads; tenant id on every new store row                     |
| Shared infra               | One deploy; config/branding/billing per tenant                              |
| Backward compatible schema | Additive columns/tables only; dual-write during migrations                  |
| English-first              | v1 remains English-only until `i18n` flag + locale packs ship               |
| Warranty boundary          | Phase 2 is **out of v1 warranty** unless contracted — `WARRANTY_SUPPORT.md` |

## 3. Program pillars (12)

| #   | Pillar                         | Doc                                 | Flag(s)               | Depends on             |
| --- | ------------------------------ | ----------------------------------- | --------------------- | ---------------------- |
| 1   | Native mobile (RN iOS/Android) | `phase2/01-native-mobile.md`        | `mobileApps`          | Stable `/api/v1`, push |
| 2   | Corporate training portal      | `phase2/02-corporate-portal.md`     | `corporatePortal`     | Multi-tenant, SSO      |
| 3   | Multi-tenant SaaS              | `phase2/03-multi-tenant.md`         | `multiTenant`         | Postgres cutover       |
| 4   | AI proctoring                  | `phase2/04-ai-proctoring.md`        | `aiProctoring`        | Quizzes, media         |
| 5   | Advanced learning paths        | `phase2/05-learning-paths.md`       | `learningPaths`       | Courses LMS            |
| 6   | CRM integration                | `phase2/06-crm-integration.md`      | `crmIntegration`      | Webhooks, identity     |
| 7   | ERP integration                | `phase2/07-erp-integration.md`      | `erpIntegration`      | Finance APIs           |
| 8   | Advanced marketing             | `phase2/08-marketing-automation.md` | `marketingAutomation` | ESP, CRM               |
| 9   | Enterprise SSO                 | `phase2/09-enterprise-sso.md`       | `enterpriseSso`       | IdP contracts          |
| 10  | Multi-language                 | `phase2/10-i18n.md`                 | `i18n`                | Content workflow       |
| 11  | White label                    | `phase2/11-white-label.md`          | `whiteLabel`          | Multi-tenant branding  |
| 12  | Business Intelligence 2.0      | `phase2/12-bi-predictive.md`        | `biPredictive`        | Warehouse, events      |

## 4. Recommended release trains

| Train                      | Theme            | Includes                                                                     |
| -------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| **2.0 Foundation**         | Scale + identity | Postgres/Redis (pre-req), SSO, multi-tenant core, white-label branding hooks |
| **2.1 Mobility & B2B**     | Reach            | Native apps (student/instructor), corporate portal, learning paths           |
| **2.2 Integrity & Growth** | Trust + pipeline | AI proctoring, CRM, marketing automation, i18n packs                         |
| **2.3 Enterprise Ops**     | Back-office      | ERP connectors, BI 2.0 predictive dashboards                                 |

Pre-requisites from v1 debt (must not be skipped): `V2-001` Supabase, `V2-002` Redis/workers, `V2-003` live Stripe/Zoom/SMTP — see `TECHNICAL_DEBT.md`.

## 5. Foundations shipped in this tip (non-breaking)

| Artifact                           | Role                                                           |
| ---------------------------------- | -------------------------------------------------------------- |
| `types/phase2/*`                   | Shared contracts for tenants, paths, proctoring, integrations  |
| `constants/phase2.ts`              | Initiative registry IDs                                        |
| `services/phase2/registry.ts`      | Capability status helper (flags + planned)                     |
| `app/api/v2/capabilities/route.ts` | Read-only capability discovery (auth optional public subset)   |
| Feature flags (default `false`)    | Super Admin can preview toggles without enabling unfinished UX |
| `apps/mobile/README.md`            | React Native monorepo bootstrap plan                           |
| Super Admin → Phase 2 Roadmap page | Operator-visible plan (docs-backed)                            |

## 6. Success criteria (program-level)

- [ ] No v1.0 regressions (CI: lint, typecheck, tests, build, UAT smoke)
- [ ] Each pillar ships behind a flag with rollback path
- [ ] Tenant data isolation verified before multi-tenant GA
- [ ] Mobile apps consume versioned APIs only
- [ ] SSO and CRM/ERP credentials never committed to git
- [ ] i18n does not force Arabic/LTR break of existing English chrome until packs ready

## 7. Governance

1. Intake via Ops Center `FEAT-*` with sponsor + business case
2. Map to pillar ID (`P2-01` … `P2-12`)
3. Branch `cursor/<pillar>-0987` off current mainline tip
4. Contract tests for `/api/v1` compatibility in CI
5. Semver: `2.0.0` for first multi-tenant GA; minor trains thereafter

## 8. Out of scope for this documentation tip

Implementing complete production-grade native apps, live IdP federation, or full predictive ML pipelines. Those are **execution epics** under the trains above.
