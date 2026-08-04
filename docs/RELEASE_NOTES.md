# Release notes — ATPL PASS v1.5 (Task 021)

## Highlights

- **Post-launch Ops Center** modules: hypercare, feature requests (`FEAT-*`), knowledge base, customer feedback + monthly summary, continuous optimization notes, maintenance dashboard
- Incident register fields: affected module, root cause, resolution, preventive action
- Version 1.1 roadmap seeded (mobile, Teams/Meet, AI proctoring, multi-tenant, CRM, marketing, enterprise reporting, …)
- SQL twin `database/migrations/017_post_launch_ops.sql`
- Docs: `docs/POST_LAUNCH_SUPPORT.md`

## Notes

No major architecture changes. Extends Task 017 Ops Center. SLA defaults remain Critical 2h / High 8h / Medium 24h / Low 48h (configurable).

### Prior releases

- **v1.4 (Task 020)** — Final handover package & production validation
- **v1.3 (Task 019)** — Vitest, Playwright, Prettier, Husky, CI gates
- **v1.2 (Task 018)** — Mobile API v1, webhooks, jobs
- **v1.1 (Task 017)** — Ops support center, SLA, monitoring
- **v1.0 (Task 016)** — QA / UAT launch harness
