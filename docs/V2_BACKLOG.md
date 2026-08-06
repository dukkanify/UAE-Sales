# Version 2.0 prioritized backlog — Phase 2 aligned

**Product:** AviatorPass  
**Program:** `docs/PHASE2_ENTERPRISE_ROADMAP.md`  
**Governance:** Ops Center feature requests (`FEAT-*`); out of warranty scope unless separately contracted.

Priority: **P0** unlocks scale · **P1** growth · **P2** differentiation · **P3** explore

## Pre-Phase-2 prerequisites (v1 hardening)

| ID     | Initiative                          | Priority | Impact                    | Recommendation         | Effort | Target    | Status |
| ------ | ----------------------------------- | -------- | ------------------------- | ---------------------- | ------ | --------- | ------ |
| V2-001 | Supabase Postgres + Storage cutover | P0       | HA / multi-instance       | Cut over before SaaS   | XL     | pre-2.0   | open   |
| V2-002 | Redis rate limit + job workers      | P0       | Throughput                | Shared Redis + workers | L      | pre-2.0   | open   |
| V2-003 | Live Stripe + Zoom + SMTP harden    | P0       | Revenue / classes / email | Production secrets     | M      | Immediate | open   |
| V2-016 | CSP enforce + full WCAG AA          | P1       | Security / a11y           | TD-005, TD-023         | M      | v1.9      | open   |

## Phase 2 pillars

| ID     | Pillar                    | Priority | Flag                  | Train | Effort | Spec  |
| ------ | ------------------------- | -------- | --------------------- | ----- | ------ | ----- |
| V2-004 | Native iOS + Android (RN) | P1       | `mobileApps`          | 2.1   | XL     | P2-01 |
| V2-008 | Corporate training portal | P1       | `corporatePortal`     | 2.1   | L      | P2-02 |
| V2-007 | Multi-tenant SaaS         | P1       | `multiTenant`         | 2.0   | XL     | P2-03 |
| V2-010 | AI proctoring             | P2       | `aiProctoring`        | 2.2   | XL     | P2-04 |
| V2-009 | Advanced learning paths   | P2       | `learningPaths`       | 2.1   | L      | P2-05 |
| V2-011 | CRM integration           | P2       | `crmIntegration`      | 2.2   | L      | P2-06 |
| V2-012 | ERP integration           | P2       | `erpIntegration`      | 2.3   | L      | P2-07 |
| V2-015 | Marketing automation      | P3       | `marketingAutomation` | 2.2   | M      | P2-08 |
| V2-006 | Enterprise SSO            | P1       | `enterpriseSso`       | 2.0   | L      | P2-09 |
| V2-013 | Multi-language (i18n)     | P2       | `i18n`                | 2.2   | L      | P2-10 |
| V2-017 | White label               | P1       | `whiteLabel`          | 2.0   | L      | P2-11 |
| V2-014 | BI 2.0 predictive         | P2       | `biPredictive`        | 2.3   | L      | P2-12 |

## Sequencing

1. Stabilize production (V2-003) + scale (V2-001, V2-002)
2. Train **2.0** — SSO, multi-tenant, white label
3. Train **2.1** — mobile, corporate, learning paths
4. Train **2.2** — proctoring, CRM, marketing, i18n
5. Train **2.3** — ERP, predictive BI

## Intake

1. Capture request in Ops Center with business impact.
2. Score value / effort / risk; map to `P2-xx`.
3. Implement on `cursor/<name>-0987` with flag default off.
4. Prove no v1 regressions (CI + UAT smoke).

## Client prioritization workshop

Top 5 for next contracted phase:

1. ***
2. ***
3. ***
4. ***
5. ***

Workshop date: ________ Facilitator: ________
