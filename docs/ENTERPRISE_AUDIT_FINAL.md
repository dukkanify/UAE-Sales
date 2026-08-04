# FINAL ENTERPRISE AUDIT — ATPL PASS

**Product:** Aviation Education Platform (ATPL PASS)  
**Auditor stance:** Senior software architect — production gate review  
**Date:** 2026-08-04  
**Tip audited:** `cursor/aep-enterprise-audit-final-0987` (after Phase 2 roadmap)  
**Constraint:** Inspection only. No new features. No redesigns.

**Quality gates on tip**

| Gate               | Result                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| TypeScript         | Pass (`tsc --noEmit`)                                                                |
| ESLint             | Pass                                                                                 |
| Unit tests         | Pass (50)                                                                            |
| Production build   | Pass (Next.js 15.5; intermittent `.next` race noise observed once, clean rebuild OK) |
| `npm audit` (prod) | **3 high** (postcss/sharp via Next — TD-014)                                         |

---

## Overall Score

# **58 / 100**

**Why not higher:** The product _looks_ enterprise-complete (routes, docs, Ops Center, GA paperwork), but the **system of record is still single-node JSON**, **OTP email is not sent**, **Stripe/Zoom/SMTP/AI default to mocks**, and **CSRF covers only a thin slice of mutating APIs**. That is a polished pilot — not HA enterprise production.

**Why not lower:** Clear modular layout, RBAC, session cookie binding, Task 022 security fixes (metrics IDOR, Zoom fail-closed, demo OTP prod hard-fail), CI quality gates, and unusually thorough documentation of limitations.

---

## Category Scores

| Category             | Score | Notes                                                                 |
| -------------------- | ----: | --------------------------------------------------------------------- |
| Architecture         |    62 | Layered App Router + services; no DI; god-shells; JSON↔SQL twin drift |
| UI/UX                |    64 | Consistent Radix shells; incomplete a11y; placeholder pages; dual nav |
| Code Quality         |    61 | SOLID-ish services; DRY gaps (CSRF historically); large shells        |
| Performance          |    55 | Lazy charts mostly; full-file JSON RMW; no Redis; in-request queues   |
| Security             |    52 | Good session basics; CSRF/revocation/OTP-email gaps; CVE highs        |
| Database             |    45 | Runtime JSON; aspirational migrations; late SQL weak on FK/RLS        |
| Scalability          |    42 | Not multi-instance safe; process-local rate limits/queues             |
| Maintainability      |    63 | Good docs + debt register; dual API envelopes; nav drift              |
| Accessibility        |    58 | Radix helps; no WCAG AA campaign; sparse aria beyond spots            |
| Production Readiness |    54 | Builds clean; runtime not enterprise-prod without cutover             |

---

## Phase 1 — Architecture Audit

**Structure (real):** `app/` · `features/` · `services/` · `lib/` · `components/` · `database/` · `docs/` · `apps/mobile/` (README only)

| Finding                                                                                   | Severity |
| ----------------------------------------------------------------------------------------- | -------- |
| Runtime SoR = `.data/*.json` via `services/*/store.ts`; SQL twins unused                  | Critical |
| No dependency injection — hard imports everywhere                                         | Medium   |
| God components: `platform-settings-shell.tsx` (~1.4k LOC), `ops-center-shell.tsx` (~0.9k) | Medium   |
| Dual nav: `constants/dashboard-nav.ts` vs stale `constants/navigation.ts`                 | Medium   |
| Empty `middleware/` folder; logic only in root `middleware.ts`                            | Minor    |
| Marketplace leftovers `.data/categories.json` / `listings.json`                           | Minor    |
| `package.json` version `0.1.0` vs docs “1.0.0 GA”                                         | Minor    |

---

## Phase 2 — UI/UX Audit (page ratings 1–10)

Ratings reflect **visual consistency + states + a11y**, not backend completeness.

| Surface                                     | Score | Comment                                    |
| ------------------------------------------- | ----: | ------------------------------------------ |
| Marketing home                              |     7 | Brand-forward; atmosphere OK               |
| Login / OTP / register                      |     7 | Clear; CSRF bootstrap quirks; toast errors |
| Splash / offline / maintenance              |     7 | System pages present                       |
| Student dashboard                           |     7 | Cohesive shell                             |
| Student courses / lesson player             |     7 | Functional LMS UI                          |
| Student quizzes / certificates              |     7 | Solid flows                                |
| Student payments / checkout                 |     6 | Explicit mock token UX                     |
| Instructor dashboard / courses / classes    |     7 | Consistent                                 |
| Instructor lessons / students / assignments | **3** | `ModulePlaceholder` only                   |
| Student assignments                         | **3** | `ModulePlaceholder`                        |
| Admin / Super Admin dashboards              |     7 | Dense but coherent                         |
| Platform Settings                           |     6 | Powerful; very long form                   |
| Ops Center                                  |     6 | Feature-rich; heavy                        |
| Asset Manager / Media / Licenses            |     7 | New Task 026 — clean                       |
| Analytics hub                               |     6 | Useful; static Recharts import hurts perf  |
| AI FAB / hub                                |     7 | Polished mock assistant                    |
| Design system showcase                      |     8 | Best consistency reference                 |
| Mobile native apps                          |   N/A | Not built (Phase 2)                        |

**Cross-cutting UI issues:** incomplete WCAG (TD-023); loading/empty/error uneven across domains; dark mode present (`next-themes`) but not fully audited; spacing/type follow tokens but large admin forms feel dashboard-dense.

---

## Phase 3 — Code Quality

| Principle            | Assessment                                                      |
| -------------------- | --------------------------------------------------------------- |
| SOLID                | Services mostly SRP; some route handlers thick                  |
| DRY                  | Improved CSRF helpers (024); still duplicated upload/MIME paths |
| KISS                 | Reasonable for LMS scope; Ops/Settings overgrown                |
| Naming               | Generally clear (`listCourses`, role prefixes)                  |
| Hooks / context      | Auth + Brand providers; no React Query (TD-017)                 |
| Performance patterns | Lazy charts barrel good; analytics bypasses it                  |
| Dead code            | Prior pass removed stubs; marketplace JSON residue remains      |

---

## Phase 4 — Security Audit

See **Security Risks** below. Headline: session cookies + RBAC are real; **CSRF is not universal**; **middleware ignores revocation**; **OTP never emailed**.

---

## Phase 5 — Database Audit

| Finding                                                                          | Severity |
| -------------------------------------------------------------------------------- | -------- |
| Runtime ignores Postgres                                                         | Critical |
| Migrations 010–017: TEXT PKs, sparse indexes, little/no RLS vs early UUID+FK+RLS | High     |
| Prisma = auth/LMS subset only                                                    | Medium   |
| Soft-delete inconsistent                                                         | Medium   |
| IDs = 32-char hex, not UUID (`generateId`)                                       | Medium   |
| No soft-delete/audit uniformity on later domains                                 | Medium   |
| Materialized views / query tuning N/A until cutover (TD-024)                     | Medium   |

---

## Phase 6 — Performance Audit

| Area             | Assessment                                          |
| ---------------- | --------------------------------------------------- |
| Initial load     | Acceptable for Next App Router; charts mostly lazy  |
| Dashboard        | OK on JSON seed sizes; will not scale with file RMW |
| Search / lists   | In-memory filter after full load                    |
| Video            | Depends on Zoom/CDN when live — unmeasured here     |
| API latency      | Fine locally; no distributed cache                  |
| Bundle           | Analytics static Recharts import undoes lazy win    |
| Lighthouse / CWV | **Not measured on production URL** this audit       |
| Memory           | Full JSON datasets in process heap                  |

---

## Phase 7 — Functional Audit

| Module                                   | Verdict                                                      |
| ---------------------------------------- | ------------------------------------------------------------ |
| Authentication / sessions / RBAC         | Works on JSON; **email OTP delivery missing**                |
| Dashboards                               | Works (scoped metrics)                                       |
| Courses / lessons / learning             | Works (JSON)                                                 |
| Zoom / live classes                      | UI + mock Zoom fallback; live needs credentials              |
| Calendar / notifications                 | Works                                                        |
| Messaging / communities / blog / support | Works (JSON)                                                 |
| Quizzes / bank / grading                 | Works                                                        |
| Certificates / reports                   | Works                                                        |
| Payments / wallet                        | **Mock default**; Stripe path if keys                        |
| Analytics                                | Works (JSON aggregates)                                      |
| AI                                       | **Deterministic mock**, not LLM                              |
| Settings / assets / licenses / media     | Works                                                        |
| Ops / monitoring / backups               | Works for single node                                        |
| Placeholders                             | Instructor lessons/students/assignments; student assignments |

---

## Phase 8 — API Audit

| Finding                                                         | Severity |
| --------------------------------------------------------------- | -------- |
| Web `{error:string}` vs v1 `{error:{code,message}}` split       | Medium   |
| `parsePagination` not universal on list routes                  | Medium   |
| CSRF `enforceMutatingApiSecurity` on ~7 of ~80+ mutating routes | Critical |
| OTP request CSRF check is empty `if` body (always continues)    | Critical |
| OpenAPI / export workers stubby                                 | Medium   |
| Dual `/api` + `/api/v1` maintenance cost                        | Minor    |
| `/api/v2/capabilities` discovery only (OK)                      | Minor    |

---

## Phase 9 — Documentation Audit

| Doc area                            | Status                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| README                              | Accurate on JSON current / Next 15                             |
| API / Mobile API                    | Present                                                        |
| Database / migrations README        | Present; aspirational                                          |
| Deployment / Production             | Present                                                        |
| Architecture                        | Present + V2 target                                            |
| Admin / Instructor / Student guides | Present                                                        |
| GA / acceptance / warranty          | Present — **optimistic vs runtime**                            |
| Known limitations                   | Honest — must be read with GA claims                           |
| Drift                               | Volume of “enterprise ready” language exceeds runtime maturity |

---

## Phase 10 — Production Readiness Checklist

| Item                                  | Status                                 |
| ------------------------------------- | -------------------------------------- |
| No TypeScript errors                  | ✅                                     |
| No ESLint errors                      | ✅                                     |
| No build errors                       | ✅                                     |
| No automated test failures            | ✅                                     |
| No console/runtime errors in CI sense | ✅ (app not browser-crawled this pass) |
| Missing assets                        | ⚠️ Brand masters optional; OG SVG OK   |
| Broken links                          | ⚠️ Some nav → placeholders             |
| Security warnings                     | ❌ `npm audit` 3 high; CSRF/OTP gaps   |
| Multi-instance ready                  | ❌                                     |
| Live email OTP                        | ❌                                     |
| Live payments/Zoom without mocks      | ⚠️ Conditional on secrets              |

---

## Critical Issues

1. **JSON system of record** — not multi-instance / HA safe (`services/*/store.ts`, TD-001).
2. **OTP email never sent** — `requestOtp` hashes/stores code; no transporter; non-demo login broken without out-of-band code (TD-025).
3. **CSRF largely absent** on cookie-authenticated mutations (~7 guarded vs ~80+ mutating routes) (TD-012).
4. **OTP `/api/auth/otp/request` CSRF validation is a no-op** — empty `if` after failed validate.
5. **Middleware does not check session revocation** — JWT-only gate (TD-013).

---

## Medium Issues

1. Demo OTP env gate (`NEXT_PUBLIC_APP_ENV`) vs runtime (`NODE_ENV`) inconsistency.
2. Communication directory exposes emails to any authenticated user (TD-018).
3. Migrations 010–017 weaker than early UUID/FK/RLS standards (TD-015).
4. Prisma incomplete vs SQL twins (TD-016).
5. In-memory rate limit + in-request `processQueue` (TD-002, TD-009).
6. Analytics hub static Recharts import (TD-026).
7. CSP Report-Only + `unsafe-inline`/`unsafe-eval` (TD-005).
8. Upload AV stub; course SVG allowlisted.
9. API envelope + pagination inconsistency.
10. Placeholder instructor/student assignment/lessons/students pages.
11. Stripe/Zoom/SMTP/AI mock-by-default.
12. `npm audit` high advisories requiring Next 16 force (TD-014).
13. Documentation optimism vs `KNOWN_LIMITATIONS.md`.
14. Dual navigation catalogs (TD-019).
15. Incomplete WCAG program (TD-023).

---

## Minor Improvements

1. Align `package.json` version with GA `1.0.0`.
2. Remove marketplace `.data` leftovers.
3. Delete or populate empty `middleware/` directory.
4. Expand Playwright beyond smoke (TD-003).
5. Prettier widen (TD-011).
6. React Query for list screens (TD-017).
7. Real PDF/XLSX workers (TD-004).
8. Deprecate cookie-only mobile clients (TD-008).
9. Component Testing Library suite (TD-007).
10. Measure Lighthouse/CWV on production URL.
11. Fix analytics to use lazy chart barrel.
12. Harden OpenAPI catalog beyond stubs.

---

## Missing Features

### Missing for honest **v1 production** (not Phase 2)

| Item                                           | Notes                                            |
| ---------------------------------------------- | ------------------------------------------------ |
| Real OTP email delivery                        | Blocker for non-demo auth                        |
| Live Postgres SoR                              | Blocker for HA                                   |
| Universal CSRF on mutations                    | Security blocker for shared-browser threat model |
| Session revocation in middleware               | Security hardening                               |
| Instructor lessons / students / assignments UI | Placeholder pages                                |
| Student assignments UI                         | Placeholder                                      |
| Production Lighthouse evidence                 | Not captured                                     |
| Live Stripe/Zoom/SMTP without mock             | Operational, not code-absent                     |

### **Not** missing from v1 (Phase 2 / out of scope)

Native iOS/Android, corporate portal, multi-tenant SaaS, AI proctoring, learning paths, CRM/ERP, marketing automation, enterprise SSO, i18n, white-label, BI predictive — documented in `PHASE2_ENTERPRISE_ROADMAP.md`.

---

## Technical Debt

Authoritative register: `docs/TECHNICAL_DEBT.md`.

**Open / scheduled high-impact:** TD-001, TD-012, TD-013, TD-014, TD-025, plus TD-002/005/009/015/016/018/023/024/026 and lower items TD-003/004/007/008/011/017/019.

**Done:** TD-006, TD-020 (caveat analytics), TD-021, TD-022.

---

## Performance Bottlenecks

1. **Full-file JSON read-modify-write** on every mutation — O(dataset) I/O and serialization.
2. **In-process rate limits / queues** — useless across multiple Node instances.
3. **In-request `processQueue`** — couples webhook/API latency to job work.
4. **Analytics static Recharts import** — larger client JS for analytics routes.
5. **List endpoints load all rows then slice** — fine for demos, fails at 10k+ rows.
6. **No CDN-backed object storage by default** — local `public/uploads`.
7. **Unmeasured CWV** on real domain — cannot claim enterprise FE performance.

---

## Security Risks

| Risk         | Detail                                                    |
| ------------ | --------------------------------------------------------- |
| CSRF         | Most cookie POSTs/PATCHs/DELETEs unguarded                |
| Auth OTP     | Codes not delivered; demo OTP path in non-prod            |
| Session      | Revoked sessions still valid until JWT expiry at edge     |
| PII          | Directory API email enumeration (authenticated)           |
| XSS          | CSP not enforced; SVG uploads in courses                  |
| Webhooks     | Non-prod Zoom unsigned tolerance; Stripe mock weak sig    |
| Supply chain | Nested postcss/sharp highs via Next                       |
| Secrets      | Dev defaults exist; prod checks help if env set correctly |
| API keys     | Broad `admin:ops` / `mobile:full` scopes bypass fine RBAC |

**Mitigations already present (credit):** httpOnly session cookies + hash binding; RBAC guards; Task 022 IDOR/report/Zoom/demo-OTP fixes; upload MIME/size validation helper; ops security logging hooks.

---

## Final Verdict

# **Needs More Development**

**Not** “Production Ready.”  
**Not** even “Production Ready with Minor Fixes” for **multi-instance enterprise** or **real-user auth without demo OTP**.

**Acceptable only as:** controlled **single-node pilot / UAT** with operators explicitly accepting `KNOWN_LIMITATIONS.md` (JSON SoR, mocks, demo OTP in non-prod).

**Minimum before architect sign-off for real production users**

1. OTP email (or hard-fail when SMTP unset and demo off)
2. Supabase (or equivalent) cutover
3. CSRF on all cookie mutations
4. Middleware revocation checks
5. Redis + background workers
6. Live Stripe/Zoom/SMTP secrets + verified webhooks
7. Clear the instructor/student placeholder pages or remove nav

Until then, treat marketing “enterprise GA” language as **aspirational documentation**, not runtime fact.
