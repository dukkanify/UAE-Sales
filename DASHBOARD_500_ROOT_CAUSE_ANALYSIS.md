# Dashboard 500 — Root Cause Analysis & Permanent Fix

**Date:** 2026-08-25  
**Branch:** `cursor/student-dashboard-500-0987`  
**Symptom (production):** Authenticated users opening `https://dubai-test.blog/student/dashboard` saw Next.js `app/error.tsx` — **500 / Something went wrong** (Server Components render), e.g. **Ref: 57582655**.

---

## Root cause

On Vercel (and any read-only host), the `.data/` directory is **not writable**. The student learning path called:

1. `getLearningDashboard` → `ensureLearningSeeded` / `ensureClassesSeeded` / `syncGoalHoursFromProgress`
2. Those paths call `writeLearningDb` / `writeClassesDb`
3. Those stores used raw Node `mkdirSync` / `writeFileSync`
4. Disk writes threw **`EACCES`**
5. The exception bubbled through Server Components / route handlers into the production error boundary → **HTTP 500**

This is the same class of failure previously fixed for payments / support-ops (`lib/data/json-file-store` memory fallback). Learning + classes (and other dashboard-adjacent stores) had **not** been migrated, so every authenticated student who triggered seed/write on a cold serverless instance crashed.

**Not** the primary cause: JWT/session validity, missing roles, or empty enrollments. Unauthenticated users correctly 307 to `/login`. Empty enrollments are valid and must render empty UI — they must never throw.

### Primary crash files (before fix)

| File                         | Failure                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `services/learning/store.ts` | `writeFileSync` / `mkdirSync` on `.data/aep-learning.json`                    |
| `services/classes/store.ts`  | Same for `.data/aep-classes.json`                                             |
| Call chain                   | `services/learning/learning-service.ts` → `getLearningDashboard` → seed/write |

### Stack shape (local RO reproduction)

```
Error: EACCES: permission denied, open '.../.data/aep-learning.json'
  at Object.writeFileSync (node:fs)
  at writeLearningDb (services/learning/store.ts)
  at ensureLearningSeeded (services/learning/seed.ts)
  at getLearningDashboard (services/learning/learning-service.ts)
  at GET (app/api/learning/dashboard/route.ts)
```

Production digests omit the message; Ref codes differ per deploy/stack.

### Database / auth audit

| Area                         | Finding                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Auth / session / cookies     | Functional; missing session → redirect/401, not 500                                   |
| Role validation              | Student layout uses `requirePageRole(STUDENT)`; other roles have their own dashboards |
| Profiles / enrollments empty | Safe after fix — empty overview                                                       |
| Supabase                     | Local/demo auth store used when unset; crash was filesystem, not RLS                  |
| Relations / FKs              | No null-join throw identified for this 500                                            |

---

## Fix implemented

### 1. Architecture — durable stores on read-only hosts

Migrated remaining raw-`fs` JSON stores to `lib/data/json-file-store` (`readJsonFile` / `writeJsonFile` with **in-memory fallback** when disk writes fail):

- `services/learning/store.ts` (**critical**)
- `services/classes/store.ts` (**critical**)
- `services/performance/store.ts`, `quizzes`, `licenses`, `communication`, `mock-exams`, `cgi`, `media-library`, `certificates`, `assignment`, `api-platform`, `ai`, `analytics`

Exports and JSON filenames unchanged.

### 2. Dashboard resilience

- `lib/dashboard/safe-load.ts` — `safeDashboardQuery` + correlation IDs; failures → `writeOpsLog` (visible under Super Admin → System Logs / `/api/ops?view=logs`)
- `getLearningDashboard` isolates each optional query; never throws for seed/progress/notifications/calendar gaps
- Role dashboards wrap metrics in safe loaders: student API, instructor, CGI, admin, super-admin
- `GET /api/learning/dashboard` returns empty overview on non-auth data failures (degraded + correlation id) instead of 500

### 3. Tests

`tests/unit/readonly-store-ssr.test.ts` covers learning + classes + `getLearningDashboard` under `chmod 555` `.data`.

---

## Files modified (high level)

- All migrated `services/*/store.ts` listed above
- `services/learning/learning-service.ts`
- `lib/dashboard/safe-load.ts` (new)
- `app/api/learning/dashboard/route.ts`
- `app/(instructor|admin|cgi|super-admin)/*/dashboard/page.tsx`
- `tests/unit/readonly-store-ssr.test.ts`
- Removed temporary `lib/debug/agent-log.ts` instrumentation

---

## Verification results

| Check                                                                | Result                                      |
| -------------------------------------------------------------------- | ------------------------------------------- |
| `npx vitest run tests/unit/readonly-store-ssr.test.ts`               | 6/6 passed                                  |
| `npm run typecheck`                                                  | Pass                                        |
| `npm run lint`                                                       | Pass                                        |
| Student `/student/dashboard` (auth)                                  | **200**, no SC error UI                     |
| `GET /api/learning/dashboard`                                        | **200** with overview JSON                  |
| Same under **read-only `.data`** (files removed to force seed write) | **200** page + API                          |
| Instructor `/instructor/dashboard`                                   | **200**                                     |
| CGI `/cgi/dashboard` (`cgi@eagerpilots.com`)                         | **200**                                     |
| Admin `/admin/dashboard`                                             | **200**                                     |
| Super Admin `/super-admin/dashboard`                                 | **200**                                     |
| Incomplete profile (`student.three@…`)                               | **307** to profile flow (expected, not 500) |

### Test accounts used

| Role                 | Email                            | OTP (demo) |
| -------------------- | -------------------------------- | ---------- |
| Student              | `student.one@eagerpilots.com`    | `123456`   |
| Student (incomplete) | `student.three@eagerpilots.com`  | `123456`   |
| Instructor           | `instructor.one@eagerpilots.com` | `123456`   |
| CGI                  | `cgi@eagerpilots.com`            | `123456`   |
| Admin                | `admin@eagerpilots.com`          | `123456`   |
| Super Admin          | `superadmin@eagerpilots.com`     | `123456`   |

Requires `ENABLE_DEMO_OTP=true` / `DEMO_OTP_CODE=123456` (local).

---

## Final confirmation

Locally, **every role dashboard loads without Server Component 500s**, including the production-like **read-only `.data`** case that previously crashed learning seed writes.

**Production note:** Live `dubai-test.blog` must deploy this branch (or merge into the production deploy ref) before the live site clears the 500. Until then, production may still run a tip without the json-file-store migration for learning/classes.

---

## Ops visibility

Dashboard query failures log via `writeOpsLog` with:

- `userId`, `role`, `failedQuery`, `path`, `stack`, `timestamp`, `correlationId`

Super Admin: **System Logs** / `GET /api/ops?view=logs`.
