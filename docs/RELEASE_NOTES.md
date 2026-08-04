# Release notes — ATPL PASS v1.4 (Task 020)

## Highlights

- Final production handover package: validation report, security audit, acceptance checklist, training, warranty/support, maintenance, environment setup, database schema overview, optimization notes
- Env templates: brand `ATPL PASS`; `ZOOM_WEBHOOK_SECRET` documented
- AGENTS / README validation commands include Vitest, UAT, and Playwright
- Confirmed full suite green locally: lint, typecheck, format, 45 Vitest, build, **31/31 UAT**, **5/5 acceptance**, **5/5 E2E**, backup restore test

## Notes

No new business features. Production DNS/SSL/CDN/SMTP/Zoom/Stripe live cutover are operator steps on the client account using `docs/DEPLOYMENT.md` and `docs/ENVIRONMENT_SETUP.md`.

### Prior releases

- **v1.3 (Task 019)** — Vitest, Playwright, Prettier, Husky, CI gates
- **v1.2 (Task 018)** — Mobile API v1, webhooks, jobs
- **v1.1 (Task 017)** — Ops support center, SLA, monitoring
- **v1.0 (Task 016)** — QA / UAT launch harness
