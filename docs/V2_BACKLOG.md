# Version 2.0 prioritized backlog — Task 025

**Product:** ATPL PASS  
**Companion:** `docs/ROADMAP_V2.md` (strategic themes)  
**Governance:** Ops Center feature requests (`FEAT-*`); out of warranty scope unless separately contracted.

Priority: **P0** unlocks scale · **P1** growth · **P2** differentiation · **P3** explore

| ID     | Initiative                          | Priority | Value                         | Dependencies                | Rough effort | Target window |
| ------ | ----------------------------------- | -------- | ----------------------------- | --------------------------- | ------------ | ------------- |
| V2-001 | Supabase Postgres + Storage cutover | P0       | HA, integrity, multi-instance | Migrations 001–017          | XL           | v1.8 / pre-v2 |
| V2-002 | Redis rate limit + job workers      | P0       | Throughput / reliability      | Hosting Redis               | L            | v1.8          |
| V2-003 | Live Stripe + Zoom + SMTP harden    | P0       | Revenue / classes / email     | Production secrets          | M            | Immediate     |
| V2-004 | Native iOS application              | P1       | Mobile reach                  | Stable `/api/v1`, push      | XL           | v2.0          |
| V2-005 | Native Android application          | P1       | Mobile reach                  | Same as iOS                 | XL           | v2.0          |
| V2-006 | Enterprise SSO (SAML/OIDC)          | P1       | B2B / corporate               | Identity IdP                | L            | v2.0          |
| V2-007 | Multi-tenant architecture           | P1       | White-label academies         | Data isolation, branding    | XL           | v2.0          |
| V2-008 | Corporate training portal           | P1       | B2B cohorts                   | Multi-tenant, SSO           | L            | v2.1          |
| V2-009 | Advanced learning paths             | P2       | Curriculum packaging          | LMS graph                   | L            | v2.1          |
| V2-010 | AI proctoring                       | P2       | Exam integrity                | Quiz engine, media pipeline | XL           | v2.1          |
| V2-011 | CRM integration                     | P2       | Pipeline → enrollment         | Webhooks, identity          | L            | v2.1          |
| V2-012 | ERP integration                     | P2       | Finance / HR sync             | Stable finance APIs         | L            | v2.2          |
| V2-013 | Multi-language platform (i18n)      | P2       | Regional expansion            | Content workflow            | L            | v2.1          |
| V2-014 | Advanced BI / data warehouse        | P2       | Executive decisions           | Postgres events             | L            | v2.1          |
| V2-015 | Marketing automation                | P3       | Retention / campaigns         | CRM, email ESP              | M            | v2.2          |
| V2-016 | CSP enforce + full WCAG AA          | P1       | Security / a11y               | TD-005, TD-023              | M            | v1.9          |

## Sequencing recommendation

1. **Stabilize production** — V2-003 secrets, monitoring, backups.
2. **Unlock scale** — V2-001, V2-002.
3. **Mobile** — V2-004 / V2-005 on v1 API.
4. **Enterprise** — V2-006 → V2-007 → V2-008.
5. **Differentiation** — learning paths, proctoring, BI, CRM/ERP, i18n, marketing.

## Intake

1. Capture request in Ops Center (business impact, sponsor).
2. Score value / effort / risk.
3. Approve → roadmap release train → feature branch `cursor/<name>-0987`.
4. Ship with CI green; record in `RELEASE_NOTES.md`.

## Client prioritization workshop

Top 5 selected for next contracted phase:

1. ***
2. ***
3. ***
4. ***
5. ***

Workshop date: ________ Facilitator: ________
