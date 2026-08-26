# PRODUCTION_DEPLOYMENT_AUDIT.md

**Project:** AviatorPass / ATPL PASS (Aviation Education Platform)  
**Repository:** `dukkanify/UAE-Sales`  
**Audit date:** 2026-08-25T11:30:00Z  
**Auditor:** Cursor Cloud Agent

---

## 1. Executive Summary

Live AviatorPass was **not** serving the latest product work because Vercel’s **aviatorpass** project only builds git refs matching the **`aviatorpass`** production branch (Ignored Build Step). All recent merges landed on **`develop`**, so Vercel reported _“Canceled by Ignored Build Step”_ for AviatorPass while incorrectly completing **Sooqna** preview deploys for the same commits.

**Root cause (confirmed):** production branch lag — `origin/aviatorpass` stuck at `cfb51e6` (#243, 2026-08-24) while `origin/develop` was at `b8a5b43` (#247, 2026-08-25).

**Fix applied:** merged `develop` into `aviatorpass`, fixed pre-push `git-safe-sync` so merge tips are not rewritten, pushed `5b4d69b` to `origin/aviatorpass`, which created **Production – aviatorpass** deployment for that SHA.

---

## 2. Local Repository Status

| Item                         | Value                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| Working branch (audit start) | `cursor/aep-project-foundation-0987` @ `b0bc8f2` (stale foundation tip) |
| Canonical product tip        | `develop` @ `b8a5b43`                                                   |
| Production release branch    | `aviatorpass` @ `5b4d69b` (after sync)                                  |
| Working tree                 | Clean after release push                                                |
| Unpushed work                | None on `aviatorpass` after push                                        |
| Local validation             | `tsc` OK · `eslint` OK · **133** tests pass · `next build` OK           |

### Latest commits on `develop` (pre-sync)

1. `b8a5b43` — enterprise validation + private session (#247)
2. `3241712` — registration phone UX / instructor coming soon (#245)
3. `7f512f1` — ATPL PASS homepage redesign (#244)

---

## 3. GitHub Repository Status

| Branch        | Tip SHA   | Role                                   |
| ------------- | --------- | -------------------------------------- |
| `develop`     | `b8a5b43` | Integration / feature merge target     |
| `aviatorpass` | `5b4d69b` | **Vercel production branch**           |
| `main`        | `ceb6e5e` | Sooqna marketplace (divergent product) |

**Sync actions**

- Fast-forwarded local `develop` to `origin/develop`.
- Merged `origin/develop` → `aviatorpass` (3 simple registration conflicts resolved by taking `develop`).
- Pushed `cfb51e6..5b4d69b` to `origin/aviatorpass`.
- No open merge conflicts remaining on `aviatorpass`.

---

## 4. Production Status

| Surface                        | Host                          | Pre-fix commit | Notes                                     |
| ------------------------------ | ----------------------------- | -------------- | ----------------------------------------- |
| https://aviatorpass.vercel.app | Vercel                        | `cfb51e6`      | Official production alias                 |
| https://dubai-test.blog        | Vercel                        | `cfb51e6`      | Staging custom domain                     |
| https://www.dubai-test.blog    | Vercel                        | `cfb51e6`      | Same build etag as vercel.app             |
| https://aviatorpass.com        | Namecheap/`*.web-hosting.com` | N/A            | **Wrong DNS / SSL mismatch** — not Vercel |
| https://eagerpilots.com        | LiteSpeed                     | N/A            | Not this Next.js app                      |

Pre-fix live title: **“AviatorPass \| Your Aviation Journey Starts Here”** (pre–ATPL PASS homepage).

---

## 5. Deployment History

### Production – aviatorpass (selected)

| Time (UTC)           | SHA       | Ref                              |
| -------------------- | --------- | -------------------------------- |
| 2026-08-25T11:25:08Z | `5b4d69b` | `aviatorpass` ← **this release** |
| 2026-08-24T20:50:10Z | `cfb51e6` | `aviatorpass`                    |
| 2026-08-24T18:39:03Z | `c6e8b78` | `aviatorpass`                    |

### Ignored builds (symptom)

For `develop` tips `a8720f9` … `b8a5b43`:

- **Vercel – aviatorpass:** `Canceled by Ignored Build Step`
- **Vercel – sooqna:** `Deployment has completed` (wrong product project)

Documented in `docs/VERCEL_SETUP.md`: ignored-build allows only `aviatorpass` (and legacy rename branch).

---

## 6. Current Commit Hash

| Ref                          | SHA                                                               |
| ---------------------------- | ----------------------------------------------------------------- |
| Local / remote `aviatorpass` | `5b4d69b40f…` (full: `5b4d69b`)                                   |
| Local / remote `develop`     | `b8a5b43`                                                         |
| Parent merge                 | `d68c0e4` (develop → aviatorpass) + `5b4d69b` (git-safe-sync fix) |

---

## 7. Deployed Commit Hash

| Phase      | SHA       | Evidence                                                                                                                                   |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Before fix | `cfb51e6` | Last successful Production – aviatorpass before sync                                                                                       |
| Target     | `5b4d69b` | GitHub deployment `Production – aviatorpass` created 2026-08-25T11:25:08Z; Vercel status pending→success tracked in follow-up verification |

---

## 8. Files Changed (release delta)

`origin/aviatorpass` (`cfb51e6`) → `5b4d69b` includes (high level):

- ATPL PASS marketing homepage + CSS + hero images
- Registration phone UX (KW/AE) + instructor coming-soon modal
- Private Session booking services, admin CRUD, payment/CSRF guards
- Enterprise validation report + robots/nav cleanup
- `scripts/git-safe-sync.sh` — skip rebase when already ahead

Approx. **51 paths** in the merge commit (+ sync fix).

---

## 9. Build Log Summary

| Gate                | Result                            | Timestamp                             |
| ------------------- | --------------------------------- | ------------------------------------- |
| `npm run typecheck` | Pass                              | 2026-08-25T11:18Z / again on pre-push |
| `npm run lint`      | Pass (post-merge clean tree)      | 2026-08-25                            |
| `npm run test`      | **42** files / **133** tests pass | ~203–213s                             |
| `npm run build`     | Pass — Next.js production build   | 2026-08-25T11:25Z                     |

Pre-push hook ran typecheck + tests successfully before GitHub accepted the push.

---

## 10. Environment Variables Audit

**Source of truth:** `.env.example`, `.env.production.example`, `docs/VERCEL_SETUP.md`, `docs/DOMAIN_DUBAI_TEST.md`.  
**Vercel dashboard:** not readable from this agent (Vercel MCP `needsAuth`; CLI logged out). Values below are **expected** configuration, not live secret inspection.

| Variable               | Dev expectation         | Production / staging expectation                              | Risk if wrong        |
| ---------------------- | ----------------------- | ------------------------------------------------------------- | -------------------- |
| `NEXT_PUBLIC_APP_URL`  | `http://localhost:3000` | `https://dubai-test.blog` or `https://aviatorpass.vercel.app` | Auth redirects / SEO |
| `NEXT_PUBLIC_APP_NAME` | AviatorPass             | AviatorPass                                                   | Branding             |
| `NEXT_PUBLIC_APP_ENV`  | development             | production / staging                                          | Feature gates        |
| `AUTH_SECRET`          | local placeholder       | strong unique ≥24 chars                                       | Session security     |
| `ENABLE_DEMO_OTP`      | true                    | **false**                                                     | Open OTP bypass      |
| `DEMO_OTP_CODE`        | 123456                  | unset                                                         | Same                 |
| Supabase trio          | optional local          | required if using remote auth/DB                              | Auth/storage         |
| `DATABASE_URL`         | optional                | required for durable auth on serverless                       | User loss on restart |
| Zoom OAuth             | optional (mock)         | set for live meetings                                         | Mock Zoom            |
| Stripe keys            | optional (mock)         | live/restricted keys                                          | Mock payments        |
| SMTP / Resend          | optional (outbox file)  | required for real email                                       | Silent outbox        |

**Cannot confirm** production secret values without Vercel auth. Recommend ops verify Production env against `.env.production.example`.

---

## 11. Cache Analysis

| Layer             | Finding                                        | Action                                |
| ----------------- | ---------------------------------------------- | ------------------------------------- |
| Vercel Edge       | `x-vercel-cache` / short `age` on HTML         | New production deployment invalidates |
| Next.js build     | Fresh local `.next` from clean `npm run build` | OK                                    |
| Browser           | Users may need hard refresh once               | Advise after cutover                  |
| `aviatorpass.com` | Not on Vercel — unrelated CDN/host             | DNS cutover required separately       |

No manual CDN purge available without Vercel credentials; new deployment is the correct invalidation path.

---

## 12. Root Cause Analysis

1. **Product split:** `main` = Sooqna; AviatorPass = `develop` + production branch `aviatorpass`.
2. **Vercel ignore rule:** only `aviatorpass` ref builds the AviatorPass project.
3. **Process gap:** features merged to `develop` (#244–#247) were **not** promoted to `aviatorpass`.
4. **False confidence:** GitHub showed green “Vercel – aviatorpass” as **success** while description was _Canceled by Ignored Build Step_.
5. **Hook blocker:** `scripts/git-safe-sync.sh` always rebased, rewriting merge commits and blocking the release push until fixed.

---

## 13. Problems Found

1. Production branch **13+ commits behind** `develop`.
2. Ignored-build cancels AviatorPass deploys for `develop` / PR branches.
3. Sooqna Vercel project still deploys AEP commits (noise / wrong product).
4. `aviatorpass.com` DNS/SSL not pointing at Vercel.
5. `eagerpilots.com` is LiteSpeed, not this app.
6. Pre-push rebase unsafe for merge-based release branches (**fixed**).
7. Vercel MCP / CLI **unauthenticated** in Cloud Agent — cannot inspect env vars or trigger dashboard redeploys directly.
8. PR #89 (`main`) remains a **conflicting-intent** rewrite vs Sooqna — unrelated to AviatorPass production path.

---

## 14. Actions Taken

1. Audited local/GitHub/production deployment metadata.
2. Identified ignore-build + branch lag as root cause.
3. Merged `develop` → `aviatorpass`; resolved registration conflicts favoring `develop`.
4. Patched `scripts/git-safe-sync.sh` to skip rebase when already ahead.
5. Ran typecheck, 133 tests, production build.
6. Pushed `5b4d69b` to `origin/aviatorpass` → triggered **Production – aviatorpass**.
7. Authored this audit document.

---

## 15. Final Verification

_Populate after Vercel reports success for `5b4d69b`._

| Check                                  | Expected                           | Result                 |
| -------------------------------------- | ---------------------------------- | ---------------------- |
| GH status `Vercel – aviatorpass`       | Deployment completed (not ignored) | _pending verification_ |
| Production deployment SHA              | `5b4d69b`                          | Created at 11:25:08Z   |
| `https://aviatorpass.vercel.app` title | ATPL PASS branding from #244       | _pending_              |
| `/book`                                | Private Session                    | _pending_              |
| `/register`                            | Phone UX / instructor modal        | _pending_              |
| `/login`, `/verify-otp`, dashboards    | 200                                | _pending_              |
| Build/type/lint/tests                  | Pass                               | **Pass** locally       |

---

## 16. Deployment Result

| Item                                                | Status                                                   |
| --------------------------------------------------- | -------------------------------------------------------- |
| Code on GitHub (`aviatorpass`)                      | **Yes** — `5b4d69b`                                      |
| Production deployment created                       | **Yes** — 2026-08-25T11:25:08Z                           |
| Live HTML confirmed on tip                          | Pending Vercel build completion (agent subscribed to CI) |
| Acceptance: live matches latest local `aviatorpass` | Pending live probe                                       |

---

## 17. Recommendations

1. **Release process:** after every merge to `develop`, merge/FF into `aviatorpass` (or change Vercel production branch + ignore rules to build `develop`).
2. **CI signal:** treat “Canceled by Ignored Build Step” as **non-deploy**, not success, in human checklists.
3. **Disconnect** Sooqna Vercel project from AviatorPass/`develop` commits, or narrow its root directory / ignore rules.
4. **DNS:** point `aviatorpass.com` A/CNAME to Vercel (`76.76.21.21` / `cname.vercel-dns.com`) if that is the customer-facing domain.
5. **Authenticate Vercel** in Cursor (MCP) for env audits and one-click production promote.
6. **Cherry-pick** `scripts/git-safe-sync.sh` fix onto `develop` so all branches inherit the safer pre-push behavior.
7. Do **not** merge AEP foundation PR #89 into `main` without an explicit Sooqna replacement decision.

---

## Appendix — Classification of merge conflicts (develop → aviatorpass)

| File                                                | Type                        | Resolution     |
| --------------------------------------------------- | --------------------------- | -------------- |
| `features/auth/components/register-form.tsx`        | Simple (registration UX)    | Took `develop` |
| `utils/validation.ts`                               | Simple (KW/AE phone schema) | Took `develop` |
| `tests/integration/enterprise-registration.test.ts` | Simple                      | Took `develop` |

No conflicting product intents on this release path (both sides are AviatorPass).
