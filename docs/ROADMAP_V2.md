# Version 2.0 roadmap recommendations — ATPL PASS

Post-GA recommendations for major platform evolution. Prioritized backlog: **`docs/V2_BACKLOG.md`**. Near-term 1.1 items remain in `docs/ROADMAP.md` and Ops Center.

## Strategic themes

1. **Mobile-native experiences** on the existing `/api/v1` contract
2. **Assessment integrity** (proctoring, exam security)
3. **Enterprise sales motion** (CRM, corporate portals, multi-tenant)
4. **Intelligence** (deeper analytics, BI, automation)
5. **Globalization** (multi-language)

## Candidate modules (v2.0)

| Module                             | Business value        | Depends on                  |
| ---------------------------------- | --------------------- | --------------------------- |
| Native iOS / Android apps          | Reach + engagement    | Stable Mobile API, push     |
| AI proctoring                      | Exam trust            | Quiz engine, media pipeline |
| Advanced analytics / BI            | Executive decisions   | Postgres events warehouse   |
| Enterprise CRM integration         | Pipeline → enrollment | Webhooks, identity          |
| Corporate training portal          | B2B cohorts           | Multi-tenant, SSO           |
| Structured learning paths          | Curriculum packaging  | LMS graph                   |
| Multi-tenant support               | White-label academies | Data isolation, branding    |
| Multi-language (i18n)              | Regional expansion    | Content workflow            |
| Advanced automation                | Ops efficiency        | Real job workers            |
| Business intelligence enhancements | Cross-module KPIs     | Warehouse + exports         |

## Suggested sequencing (not calendar estimates)

1. Finish Supabase cutover + Redis workers (unlock scale).
2. Harden live Stripe/Zoom/email.
3. Ship native apps against v1 API.
4. Multi-tenant + corporate portal.
5. Proctoring + advanced exam security.
6. CRM + marketing automation + BI warehouse.

## Governance

- Intake via Ops **Feature requests** (`FEAT-*`).
- Approve against business value / effort / cost.
- Track releases in Ops **Releases** with semver (`2.0.0`).

## Out of warranty scope

Net-new v2 modules are **enhancement projects**, not defect warranty — see `docs/WARRANTY_SUPPORT.md`.
