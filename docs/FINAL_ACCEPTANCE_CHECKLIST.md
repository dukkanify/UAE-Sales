# Final acceptance checklist — Task 020

**Product:** AviatorPass (Aviation Education Platform)  
**Milestone:** Final optimization, production deployment prep & handover  
**Date:** 2026-08-04  
**Branch tip:** `cursor/aep-final-handover-0987`

Use this as the go-live gate. Sign only after client UAT approval and production env configuration.

## Build & quality

| Check                                                | Status (local validation) |
| ---------------------------------------------------- | ------------------------- |
| No TypeScript errors (`npm run typecheck`)           | ✅ Pass                   |
| No ESLint errors (`npm run lint`)                    | ✅ Pass                   |
| Prettier quality paths (`npm run format:check`)      | ✅ Pass                   |
| Vitest (`npm run test`) — 45/45                      | ✅ Pass                   |
| Micro-benchmarks (`npm run test:bench`)              | ✅ Pass                   |
| Production build (`npm run build`)                   | ✅ Pass                   |
| Playwright E2E (`npm run test:e2e`) — 5/5            | ✅ Pass                   |
| HTTP UAT (`npm run uat`) — 31/31                     | ✅ Pass                   |
| Acceptance smoke (`npm run acceptance`) — 5/5        | ✅ Pass                   |
| No critical / high open bugs (`docs/BUG_TRACKER.md`) | ✅ None open              |

## Platform modules (UAT-covered)

| Module                                        | Status |
| --------------------------------------------- | ------ |
| Authentication (OTP + session)                | ✅     |
| User roles / RBAC                             | ✅     |
| Dashboards (all roles)                        | ✅     |
| Course management                             | ✅     |
| Learning journey                              | ✅     |
| Live classes / calendar                       | ✅     |
| Zoom (session flow; live API needs prod keys) | ✅*    |
| Notifications / messaging / communities       | ✅     |
| Blog surfaces                                 | ✅*    |
| Quizzes                                       | ✅     |
| Certificates / reports                        | ✅     |
| Payments / instructor wallet                  | ✅*    |
| Analytics                                     | ✅     |
| AI assistant                                  | ✅     |
| Platform settings / Ops Center                | ✅     |
| Mobile / v1 API                               | ✅     |
| Security (CSRF, escalation blocked)           | ✅     |

\* External live providers (Stripe, Zoom cloud, SMTP, Supabase) require production secrets — see `docs/ENVIRONMENT_SETUP.md` and `docs/KNOWN_LIMITATIONS.md`.

## Security

| Check                                            | Status                            |
| ------------------------------------------------ | --------------------------------- |
| Auth session cookies HTTP-only / Secure-in-prod  | ✅ Code                           |
| CSRF on mutating web APIs                        | ✅ UAT                            |
| Rate limit + IP blocklist settings               | ✅ Code                           |
| Upload MIME / size validation                    | ✅ Code                           |
| Secrets only in server env templates             | ✅                                |
| Demo OTP disabled when `NODE_ENV=production`     | ✅ Verified                       |
| Security headers + HSTS (prod) + CSP report-only | ✅ `next.config.ts`               |
| Final security audit recorded                    | ✅ `docs/FINAL_SECURITY_AUDIT.md` |

## Backups & recovery

| Check                                   | Status                                |
| --------------------------------------- | ------------------------------------- |
| Daily backup created (`npm run backup`) | ✅                                    |
| Restore integrity test (`test_restore`) | ✅ Pass (22 files, 0 failures)        |
| Recovery procedure documented           | ✅ `docs/BACKUP_DISASTER_RECOVERY.md` |
| Ops Center backup reporting             | ✅                                    |

## Production deployment readiness

| Item                                         | Owner fills at go-live |
| -------------------------------------------- | ---------------------- |
| Production URL                               | ☐                      |
| Domain + SSL (Vercel)                        | ☐                      |
| CDN (Vercel Edge)                            | ☐                      |
| Env vars from `.env.production.example`      | ☐                      |
| `ENABLE_DEMO_OTP=false`                      | ☐                      |
| Strong unique `AUTH_SECRET`                  | ☐                      |
| SMTP / email provider                        | ☐                      |
| Zoom credentials                             | ☐                      |
| Stripe live keys + webhook                   | ☐                      |
| Supabase (optional cutover)                  | ☐                      |
| Monitoring / uptime on `/api/health?ready=1` | ☐                      |
| Logging (ops + activity) confirmed           | ☐                      |
| Scheduled backup jobs                        | ☐                      |

## Documentation & training

| Deliverable                         | Location                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Handover package                    | `docs/HANDOVER.md`                                                       |
| Administrator training              | `docs/TRAINING.md`                                                       |
| Student / Instructor / Admin guides | `docs/STUDENT_GUIDE.md`, `INSTRUCTOR_GUIDE.md`, `ADMINISTRATOR_GUIDE.md` |
| API docs                            | `docs/API_OVERVIEW.md`, `docs/MOBILE_API.md`                             |
| Deployment / env / schema           | `docs/DEPLOYMENT.md`, `ENVIRONMENT_SETUP.md`, `DATABASE_SCHEMA.md`       |
| Architecture / maintenance          | `docs/ARCHITECTURE.md`, `MAINTENANCE.md`                                 |
| Warranty & support                  | `docs/WARRANTY_SUPPORT.md`                                               |
| Release notes                       | `docs/RELEASE_NOTES.md`                                                  |

## Client sign-off

| Field                 | Value                                                 |
| --------------------- | ----------------------------------------------------- |
| Product               | AviatorPass                                           |
| Environment           | ________________                                      |
| Client representative | ________________                                      |
| Date                  | ________________                                      |
| Outcome               | ☐ Approved · ☐ Approved with limitations · ☐ Rejected |
| Notes                 | ________________                                      |

**GO** only when Build & quality is green, Security production boxes are checked, backups verified, documentation delivered, and client UAT is approved (`docs/UAT_APPROVAL.md`).
