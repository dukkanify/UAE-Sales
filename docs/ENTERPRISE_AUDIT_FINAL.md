# Senior architect audit — ATPL PASS (final)

**Product:** ATPL PASS — Aviation Education Platform  
**Date:** 2026-08-04  
**Branch tip audited:** `cursor/aep-enterprise-audit-final-0987` (based on Phase 2 roadmap tip)  
**Constraint:** Evidence-only. No invented features. Phase 2 pillars are planned, not v1 gaps.

## Overall score: **58 / 100**

**Rationale:** Feature surface area and documentation volume look enterprise-complete, but the **system of record is still local JSON under `.data/`**, SMTP OTP delivery is **not implemented**, Stripe/Zoom/SMTP default to **mock**, CSRF covers only a handful of cookie mutations, and migrations 010–017 diverge sharply from early UUID/FK/RLS standards. This is a strong **single-node demo / controlled pilot** codebase — not multi-instance HA enterprise production.

| Area                    | Score | One-line                                                                |
| ----------------------- | ----- | ----------------------------------------------------------------------- |
| Architecture            | 62    | Clear layers; no DI; god-shells; JSON↔SQL twin drift                    |
| Security                | 52    | Good session binding; CSRF/middleware revocation gaps; OTP email absent |
| Database                | 45    | Aspirational SQL; runtime JSON; Prisma subset; late migrations weak     |
| API                     | 68    | Dual web/v1; envelope split; pagination partial; stubs present          |
| Performance             | 55    | Lazy charts mostly; analytics bypass; full-file JSON RMW; no Redis      |
| Functional completeness | 60    | Broad modules; integrations mock; some nav placeholders                 |
| Documentation           | 70    | Very complete; optimism drift vs runtime reality                        |
| UI/UX                   | 65    | Solid Radix shells; a11y incomplete; dual nav sources                   |

---

## 1. Architecture

### Layout (real)

```
app/           App Router (role groups + ~154 API route.ts)
features/      Domain UI (19 modules including phase2)
services/      Domain logic + JSON stores (21 modules)
lib/           security, api envelope, supabase clients
components/    ui + dashboard + layout
database/      migrations 001–017 + Prisma (auth/LMS subset)
apps/mobile/   README-only RN bootstrap (Phase 2)
middleware.ts  Session JWT gate (empty middleware/ folder)
```

### Findings

| Sev      | Finding                                                       | Evidence                                                                                                            |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Critical | Runtime SoR is JSON files, not Postgres                       | `services/*/store.ts` → `.data/aep-*.json`; `docs/KNOWN_LIMITATIONS.md`                                             |
| Critical | SQL migrations are aspirational twins, not applied at runtime | `database/README.md`, `docs/TECHNICAL_DEBT.md` TD-001                                                               |
| Medium   | No DI / service container — direct imports everywhere         | No inject/container in `lib/` or `services/`                                                                        |
| Medium   | Feature↔service separation uneven; pages call services        | e.g. `app/(super-admin)/super-admin/dashboard/page.tsx`                                                             |
| Medium   | God components                                                | `features/settings/.../platform-settings-shell.tsx` (~1464 LOC), `features/ops/.../ops-center-shell.tsx` (~938 LOC) |
| Medium   | Dual nav sources drift                                        | `constants/navigation.ts` (minimal) vs `constants/dashboard-nav.ts` (full) — TD-019                                 |
| Minor    | Empty `middleware/` directory                                 | `/workspace/middleware/` has no files; logic lives in root `middleware.ts`                                          |
| Minor    | Marketplace residue in `.data/`                               | `.data/categories.json`, `.data/listings.json` (Arabic vehicle listings — unrelated)                                |
| Minor    | Package version vs GA docs                                    | `package.json` `"version": "0.1.0"` vs docs claiming **1.0.0** GA                                                   |

---

## 2. Security

| Sev      | Finding                                                                                                  | Evidence                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Critical | OTP codes are **never emailed** — only stored; demo returns code in API                                  | `services/auth/auth-service.ts` `requestOtp` (stores hash, returns `demoOtp`; no SMTP/send)                                                      |
| Critical | CSRF guard applied to **7** routes; **~80** cookie-mutating web routes lack `enforceMutatingApiSecurity` | Present: settings/ops/licenses/media/otp-verify. Absent: courses, payments, quizzes, learning, communication, classes, AI, …                     |
| Critical | OTP request CSRF intentionally no-ops                                                                    | `app/api/auth/otp/request/route.ts` lines 11–14 empty `if` body                                                                                  |
| High     | Middleware accepts JWT claims without session-store revocation check                                     | `middleware.ts` `readClaims` → `verifySessionJwt` only; revocation only in `getCurrentSession()` (`services/auth/auth-service.ts` ~149) — TD-013 |
| High     | Demo OTP hard-fail uses `NEXT_PUBLIC_APP_ENV`; runtime gate uses `NODE_ENV`                              | `config/env.ts` 113–116 vs `auth-service.ts` `demoOtpEnabled()`                                                                                  |
| High     | Communication directory exposes emails to any authenticated user                                         | `app/api/communication/directory/route.ts` — TD-018                                                                                              |
| Medium   | Zoom webhook fail-closed in prod (good); unsigned accepted in non-prod without secret                    | `app/api/v1/webhooks/inbound/zoom/route.ts`                                                                                                      |
| Medium   | Stripe webhook requires secret when Stripe gateway used; mock accepts weak signature                     | `services/payments/gateway.ts` MockGateway `mock_whsec`; Stripe path OK                                                                          |
| Medium   | Upload AV is noop stub                                                                                   | `lib/security/upload.ts` `virusScanHook`                                                                                                         |
| Medium   | Course media allows SVG (scriptable)                                                                     | `services/courses/media-service.ts` `COURSE_MIME_ALLOW` includes `image/svg+xml`                                                                 |
| Medium   | Communication/course uploads bypass shared `validateUpload`                                              | Own MIME lists; write to `public/uploads/`                                                                                                       |
| Medium   | CSP is Report-Only with `unsafe-inline`/`unsafe-eval`                                                    | `next.config.ts` — TD-005                                                                                                                        |
| Medium   | Elevated API keys (`admin:ops`, `mobile:full`) bypass fine-grained RBAC                                  | `lib/api/auth.ts` `requireApiPermission`                                                                                                         |
| Medium   | Dependency highs (postcss/sharp via Next)                                                                | `npm audit` — TD-014                                                                                                                             |
| Minor    | `.env.local` present locally with demo Supabase JWTs; gitignored (OK)                                    | `.gitignore` `.env*.local`                                                                                                                       |
| Minor    | Default `AUTH_SECRET` in schema                                                                          | `config/env.ts` default `aep-dev-auth-secret-change-me` (prod throws if weak)                                                                    |

**Positive:** Session cookie httpOnly + token-hash binding (`lib/security/cookies.ts`, `getCurrentSession`); dashboard scope IDOR fix (`lib/security/dashboard-scope.ts`); production demo-OTP refuse-to-start.

---

## 3. Database

| Sev      | Finding                                                      | Evidence                                                                                                       |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Critical | Migrations not driving runtime                               | JSON stores exclusively                                                                                        |
| High     | Migrations 010–017 use TEXT PKs, sparse/zero indexes, no RLS | `010_communication_center.sql`, `011_payments_billing.sql` (FK sparse; IDX≈0–1; RLS=0) vs `002`/`005` UUID+RLS |
| High     | Prisma covers auth + LMS only — not payments/comms/AI/ops    | `database/prisma/schema.prisma` models through `LessonProgress`                                                |
| Medium   | Soft deletes inconsistent across domains                     | Strong in courses/classes/quizzes JSON+SQL; weaker/absent in later modules                                     |
| Medium   | Runtime IDs are 32-char hex, not UUID                        | `lib/security/crypto.ts` `generateId()` → `randomBytes(16).toString("hex")`                                    |
| Medium   | 007 learning RLS is commented placeholder                    | `007_student_learning.sql` lines 153–155                                                                       |
| Minor    | 001 and 002 both enable overlapping profiles RLS             | Potential apply-order friction                                                                                 |

---

## 4. API

| Sev    | Finding                                                                                      | Evidence                                                                      |
| ------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Medium | Envelope split: web `error: string`; v1 `error: { code, message, details }` + `meta.version` | Compare `app/api/courses/route.ts` vs `lib/api/envelope.ts`                   |
| Medium | Pagination helpers exist but many list GETs skip them                                        | payments orders/invoices/catalog, learning lists, quizzes bank, users, ops, … |
| Medium | In-memory pagination after full JSON load                                                    | `paginate()` slices arrays already fully read                                 |
| Medium | PDF/XLSX export placeholders                                                                 | `services/api-platform/import-export-service.ts` — TD-004                     |
| Medium | OpenAPI is stub catalog                                                                      | `services/api-platform/openapi.ts`, `/api/v1/openapi`                         |
| Minor  | `/api/v2/capabilities` is Phase 2 discovery only                                             | `app/api/v2/capabilities/route.ts`                                            |
| Minor  | Dual `/api` + `/api/v1` intentional duplication                                              | Documented; increases maintenance cost                                        |

**Positive:** `withApiHandler` + `ApiError` on v1 (~34 routes); Zod on many auth/domain inputs.

---

## 5. Performance

| Sev    | Finding                                                               | Evidence                                                                                |
| ------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| High   | No Redis — rate limits / queues process-local                         | `lib/security/rate-limit.ts`; TD-002, TD-009                                            |
| High   | Queue drained **in-request**                                          | `processQueue` called from zoom webhook / platform routes                               |
| Medium | Analytics hub **bypasses** lazy chart barrel — static Recharts import | `features/analytics/.../analytics-hub-view.tsx` imports `@/components/dashboard/charts` |
| Medium | Every store mutation = full-file read-modify-write                    | Pattern in all `services/*/store.ts`                                                    |
| Minor  | Recharts mostly lazy elsewhere                                        | `components/dashboard/lazy-charts.tsx` + barrel — TD-020 done with caveat above         |
| Minor  | `optimizePackageImports` for recharts/lucide                          | `next.config.ts`                                                                        |

---

## 6. Functional — mock vs live

| Module                                                      | Status                                               | Evidence                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| Auth sessions / RBAC                                        | **Live (JSON)**                                      | `services/auth/*`                                            |
| Email OTP delivery                                          | **Not implemented**                                  | `requestOtp` has no transporter                              |
| Demo OTP                                                    | **Live in non-prod**                                 | `ENABLE_DEMO_OTP`, code `123456`                             |
| Courses / LMS                                               | **Live (JSON)**                                      | `services/courses`                                           |
| Live classes                                                | **Live (JSON)** + Zoom **mock fallback**             | `services/classes/zoom-service.ts`                           |
| Payments                                                    | **Mock default**; Stripe path if `STRIPE_SECRET_KEY` | `services/payments/gateway.ts`, seed `provider: "mock"`      |
| SMTP                                                        | **Mock / settings UI only**                          | `services/api-platform/seed.ts` status `"mock"`              |
| Supabase                                                    | **Client scaffolding only**                          | `lib/supabase/*`, `isSupabaseConfigured()`; storage optional |
| AI assistant                                                | **Deterministic mock provider** (no LLM API)         | `services/ai/provider.ts`                                    |
| Certificates / quizzes / learning / comms / analytics / ops | **Live against JSON**                                | respective `services/*`                                      |
| Mobile app                                                  | **Docs only**                                        | `apps/mobile/README.md`                                      |
| Phase 2 pillars                                             | **Flags + docs + capability API**                    | `docs/PHASE2_*`, `services/phase2`                           |

### Placeholder UI routes (real)

- `app/(instructor)/instructor/{lessons,students,assignments}/page.tsx`
- `app/(student)/student/assignments/page.tsx`  
  → `ModulePlaceholder` (“Business logic … later milestone”)
- System: `app/(system)/coming-soon/page.tsx`

Wallet/billing routes **do exist** (not placeholders): student billing/checkout, instructor/admin/super-admin wallets.

---

## 7. Documentation

| Sev    | Finding                                                                                       | Evidence                                                 |
| ------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| High   | Volume implies production-enterprise readiness; runtime is JSON demo SoR                      | 79 `docs/*.md` + GA acceptance vs `KNOWN_LIMITATIONS.md` |
| Medium | Checklist optimism (`ENTERPRISE_CHECKLIST_022`) marks security/perf ✅ with asterisks         | Residual CSRF/CSP/revocation still open                  |
| Medium | `DOCUMENTATION_AUDIT_022` “complete for enterprise handover” overstates operational readiness | JSON + mock integrations still required reading          |
| Minor  | Root `ENTERPRISE_AUDIT_REPORT.md` correctly superseded                                        | Pointer file                                             |
| Minor  | README accurately says Next 15 + JSON current                                                 | `README.md` (good)                                       |

---

## 8. UI/UX (sampled)

| Sev    | Finding                                                       | Evidence                                                                                                          |
| ------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Medium | Full WCAG 2.2 AA not done                                     | TD-023; sparse `aria-*` outside design-system showcase                                                            |
| Medium | Login checkbox lacks `htmlFor`/accessible name pairing polish | `features/auth/components/login-form.tsx` (label wraps checkbox — OK-ish; errors via toast only, not `aria-live`) |
| Medium | Dual navigation catalogs                                      | Role shells use `dashboard-nav`; `navigation.ts` DASHBOARD_NAV_BY_ROLE is stale subset                            |
| Minor  | Dark mode supported (`next-themes`, default light)            | `components/theme/theme-provider.tsx`                                                                             |
| Minor  | Large settings/ops shells harm consistency & reviewability    | LOC cited above                                                                                                   |

**Positive:** Radix primitives, role layouts, design tokens, system pages (401/403/maintenance).

---

## 9. TECHNICAL_DEBT.md vs ENTERPRISE_READINESS_022 — still open

### Still open / scheduled (verified)

| ID                               | Priority | Status                             |
| -------------------------------- | -------- | ---------------------------------- |
| TD-001 JSON→Supabase             | high     | **open**                           |
| TD-002 Redis rate limit          | medium   | **open**                           |
| TD-003 Playwright role journeys  | medium   | **open**                           |
| TD-004 PDF/XLSX workers          | low      | **open**                           |
| TD-005 CSP enforce               | medium   | **open**                           |
| TD-007 RTL component tests       | low      | **open**                           |
| TD-008 Deprecate cookie mobile   | low      | **open**                           |
| TD-009 Queue worker process      | medium   | **open**                           |
| TD-011 Prettier legacy           | low      | **open**                           |
| TD-012 CSRF universal            | high     | **open** (still ~7 guarded routes) |
| TD-013 Middleware revocation     | high     | **open**                           |
| TD-014 Next/postcss/sharp CVEs   | high     | **scheduled**                      |
| TD-015 Harden migrations 010–017 | medium   | **open**                           |
| TD-016 Expand/drop Prisma        | medium   | **open**                           |
| TD-017 React Query               | low      | **open**                           |
| TD-018 Directory PII             | medium   | **open**                           |
| TD-019 Nav consolidate           | low      | **open**                           |
| TD-023 WCAG audit                | medium   | **open**                           |
| TD-024 Materialized views        | medium   | **open**                           |

### Done (verified)

| ID                             | Notes                                                  |
| ------------------------------ | ------------------------------------------------------ |
| TD-006 Demo OTP prod hard-fail | `config/env.ts` throw                                  |
| TD-020 Lazy Recharts           | Done for barrel; **analytics hub still static import** |
| TD-021 CSRF client helpers     | `features/auth/services/auth-api.ts`                   |
| TD-022 OpsStatusBadge          | Task 024                                               |

### ENTERPRISE_READINESS_022 residual honesty

Task 022 correctly fixed metrics IDOR, reports scope, Zoom fail-closed, demo OTP throw. Its verdict “Go for controlled launch” is **only** valid if operators accept JSON single-node + mock integrations. Multi-instance HA remains **Conditional / No-Go** until TD-001/002/009.

### Additional gaps not fully captured in TD register

1. **OTP email never sent** (functional auth blocker for non-demo)
2. Analytics Recharts lazy bypass
3. `package.json` version `0.1.0` vs GA `1.0.0`
4. Marketplace JSON leftovers
5. Course SVG allowlist XSS surface

---

## 10. Phase 2 — planned, not missing from v1

Do **not** score these as v1 defects:

Native mobile, corporate portal, multi-tenant, AI proctoring, learning paths, CRM/ERP, marketing automation, enterprise SSO, i18n, white-label, BI predictive — see `docs/PHASE2_ENTERPRISE_ROADMAP.md` and `docs/phase2/*`. Foundations present: flags, `types/phase2`, `/api/v2/capabilities`, `apps/mobile/README.md`.

Phase 2 itself correctly lists pre-reqs: Supabase, Redis/workers, live Stripe/Zoom/SMTP.

---

## Priority remediation order (architect recommendation)

1. Implement real OTP email (or hard-fail OTP request when demo off and SMTP unset)
2. Supabase cutover (TD-001) before any multi-instance deploy
3. Expand CSRF to all cookie mutations (TD-012)
4. Middleware session revocation (TD-013)
5. Redis + out-of-process queue (TD-002/009)
6. Align migrations 010–017 + Prisma story (TD-015/016)
7. Fix analytics chart import; CSP enforce path; directory PII

---

## Verdict

ATPL PASS is an impressively broad **modular training platform prototype** with enterprise _documentation theater_ ahead of enterprise _runtime_. Treat GA claims as **controlled single-node acceptance with known limitations**, not as evidence of HA/enterprise production maturity.
