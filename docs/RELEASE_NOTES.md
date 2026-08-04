# Release notes — ATPL PASS v1.6 (Task 022)

## Highlights

- Enterprise audit package (architecture, security, performance, dependencies, scalability, documentation)
- **Security fixes:** dashboard metrics scope IDOR, reports role gates, Zoom webhook fail-closed, production demo OTP hard-fail
- Unit tests for dashboard scope helper
- Updated database README (migrations through 017) and technical debt register

## Notes

No new business features. Nesting `npm audit` highs on Next/postcss/sharp tracked as TD-014 (avoid breaking Next 16 force-upgrade in this task).

### Prior releases

- **v1.5 (Task 021)** — Post-launch hypercare, features, KB, feedback, v1.1 roadmap
- **v1.4 (Task 020)** — Final handover package
- **v1.3 (Task 019)** — Vitest, Playwright, Prettier, Husky
- **v1.2 (Task 018)** — Mobile API v1
- **v1.1 (Task 017)** — Ops support center
- **v1.0 (Task 016)** — QA / UAT harness
