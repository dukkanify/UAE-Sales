# Version 2.0 roadmap recommendations — ATPL PASS

**Authoritative Phase 2 program:** `docs/PHASE2_ENTERPRISE_ROADMAP.md`  
**Architecture:** `docs/ARCHITECTURE_V2.md`  
**Backlog:** `docs/V2_BACKLOG.md`  
**Initiative briefs:** `docs/phase2/`

Near-term 1.1 items remain in `docs/ROADMAP.md` and Ops Center.

## Strategic themes

1. **Mobile-native experiences** on the existing `/api/v1` contract (P2-01)
2. **SaaS multi-tenant + white label** (P2-03, P2-11)
3. **Enterprise sales motion** — corporate portal, SSO, CRM/ERP (P2-02, P2-06, P2-07, P2-09)
4. **Assessment integrity** — AI proctoring (P2-04)
5. **Curriculum structure** — learning paths (P2-05)
6. **Growth** — marketing automation (P2-08)
7. **Globalization** — i18n (P2-10)
8. **Intelligence** — BI 2.0 predictive (P2-12)

## Release trains

| Train                  | Focus                                                      |
| ---------------------- | ---------------------------------------------------------- |
| 2.0 Foundation         | Multi-tenant, SSO, white label (+ Postgres/Redis pre-reqs) |
| 2.1 Mobility & B2B     | Native apps, corporate portal, learning paths              |
| 2.2 Integrity & Growth | Proctoring, CRM, marketing, i18n                           |
| 2.3 Enterprise Ops     | ERP, predictive BI                                         |

## Governance

- Intake via Ops **Feature requests** (`FEAT-*`).
- Map to pillar IDs `P2-01`…`P2-12`.
- Feature flags default **off** — see Platform Settings.
- Discover flags via `GET /api/v2/capabilities`.
- Semver: `2.0.0` for first multi-tenant GA.

## Out of warranty scope

Net-new Phase 2 modules are **enhancement projects**, not defect warranty — see `docs/WARRANTY_SUPPORT.md`.
