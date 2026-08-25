# LIVE_UI_DEPLOYMENT_AUDIT.md

**Project:** AviatorPass / ATPL PASS  
**Repo:** `dukkanify/UAE-Sales`  
**Audit time:** 2026-08-25T12:08:00Z  
**Tip under investigation:** `1749e3e` on branch `aviatorpass`  
**Production aliases:** `https://aviatorpass.vercel.app`, `https://dubai-test.blog`

---

## Executive summary

The live site is **not** serving tip `1749e3e` (or its UI parent `d68c0e4`).  
Production HTML still matches **`cfb51e6`** (2026-08-24), including the homepage absolute title:

| Surface                                    | Homepage `<title>`                                 |
| ------------------------------------------ | -------------------------------------------------- |
| Local tip (`next start` @ :3001)           | `ATPL PASS \| Premium Live ATPL Training Academy`  |
| Live `aviatorpass.vercel.app`              | `AviatorPass \| Your Aviation Journey Starts Here` |
| Git @ `cfb51e6` `app/(marketing)/page.tsx` | **Identical** to live                              |

GitHub status **“Vercel – aviatorpass · Deployment has completed”** is a **Git-integration / preview build success**, not a production-alias promote.  
The workflow that actually promotes production, **Deploy AviatorPass Production**, **failed** on `1749e3e` and `5b4d69b` with:

```text
Missing VERCEL_AVIATORPASS_DEPLOY_HOOK (preferred) or VERCEL_TOKEN.
```

**This is not** a duplicate-page, feature-flag, root-directory, wrong-app, or ISR-cache bug in the application code.

---

## 1. Does production use commit `1749e3e`?

**No.**

Evidence:

- Live title = metadata from `cfb51e6`, not tip.
- Live `/book` title = `Book live Zoom ATPL coaching | AviatorPass` (pre–Private Session rename). Tip local `/book` = `Private Session — Book one-to-one coaching | ATPL PASS`.
- GitHub Environment deployment `Production – aviatorpass` for `1749e3e` ended in **failure** (Actions run [32842879718](https://github.com/dukkanify/UAE-Sales/actions/runs/32842879718)).
- Last known good Production – aviatorpass SHA before the failed promotes: **`cfb51e6`**.

---

## 2. Is production built from branch `aviatorpass`?

**Intended yes; aliases not updated from latest tip.**

| Signal                           | Value                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Branch tip                       | `origin/aviatorpass` = `1749e3e`                                              |
| Workflow trigger                 | `on.push.branches: [aviatorpass]`                                             |
| Vercel ignore-build              | Only `aviatorpass` (+ legacy rename) builds AviatorPass project               |
| Production promote               | CLI/`--prod` or Deploy Hook via Actions — **failed (no secrets)**             |
| Likely Production Branch setting | Historically was `main` (Sooqna); docs require dashboard set to `aviatorpass` |

Git pushes to `aviatorpass` create Vercel builds marked “completed,” but **production domains keep serving the last successful `--prod` / Production-branch deployment (`cfb51e6`)**.

---

## 3. Root directory

| Check               | Result                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| `vercel.json`       | Headers only — **no** `rootDirectory` / monorepo rewrite                    |
| App location        | Repo root (`package.json` name `aviatorpass`, Next App Router under `app/`) |
| Wrong-subdir build? | **No evidence**                                                             |

---

## 4. Correct Next.js application?

| Check                    | Result                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Live `/api/health`       | `service: "aviatorpass"`, `env: "staging"`                                                                                     |
| Live `/api/public/brand` | AviatorPass platform settings                                                                                                  |
| Sooqna project           | Separate Vercel project (`Vercel – sooqna`) also builds the same commits — **noise**, not what serves `aviatorpass.vercel.app` |

Correct **product** project; **stale commit** on the production alias.

---

## 5–7. Duplicate pages / old components / router

| Check                    | Result                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Homepage route           | Single: `app/(marketing)/page.tsx` → `AtplPassHomepage`                                    |
| Competing `app/page.tsx` | **None**                                                                                   |
| Tip homepage             | Imports `@/features/marketing/components/atpl-pass-homepage` + `styles/atpl-pass-home.css` |
| Old homepage (`cfb51e6`) | `HomeCoursesByInstructor` + title “Your Aviation Journey…”                                 |
| Live                     | Matches **old** component set, not tip                                                     |

No router override of the new design — production simply never received the new build.

---

## 8. Feature flags

| Flag                           | Effect on homepage UI                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | Middleware gate only                                                               |
| Platform settings / brand API  | Can change logos/name in chrome; **do not** rewrite Next `metadata.title.absolute` |

Live absolute title matches **source metadata from `cfb51e6`**, not a flag-hidden ATPL PASS page.

---

## 9–10. Build cache / static generation

| Layer                          | Observation                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `export const revalidate = 60` | ISR only applies **within** a deployment; cannot resurrect a deleted title from a newer deploy |
| `x-vercel-cache: HIT`          | Edge cache of **current** production deployment                                                |
| Conclusion                     | Not a stale-chunk problem — **wrong deployment is aliased to Production**                      |

---

## 11. Local vs deployed homepage

|                     | Local tip (`next start` :3001)                            | Live production                                    |
| ------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `/` title           | `ATPL PASS \| Premium Live ATPL Training Academy`         | `AviatorPass \| Your Aviation Journey Starts Here` |
| `/book` title       | `Private Session — Book one-to-one coaching \| ATPL PASS` | `Book live Zoom ATPL coaching \| AviatorPass`      |
| Marketing component | `AtplPassHomepage`                                        | Pre-#244 home (`HomeCoursesByInstructor` era)      |

---

## 12–13. Files in commit `1749e3e` vs production build

`1749e3e` **only** contains:

```text
PRODUCTION_DEPLOYMENT_AUDIT.md
```

| File                             | In Next.js production bundle? | Why                                                                                                    |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `PRODUCTION_DEPLOYMENT_AUDIT.md` | **No**                        | Markdown doc at repo root — not imported by `app/`, not a route, not copied into `.next` static assets |

**UI changes were introduced earlier on the same branch** in merge `d68c0e4` (`release: sync develop into aviatorpass`), including:

- `app/(marketing)/page.tsx`
- `features/marketing/components/atpl-pass-homepage.tsx`
- `features/marketing/content/atpl-pass-home.ts`
- `styles/atpl-pass-home.css`
- `config/site-static.ts`
- booking Private Session files
- registration UX files

Those files **exist on `origin/aviatorpass` tip** but are **absent from the live production alias** because that alias still runs `cfb51e6`.

---

## Root cause (precise)

1. **Production promote path is broken:** GitHub Actions secrets `VERCEL_AVIATORPASS_DEPLOY_HOOK` / `VERCEL_TOKEN` are empty → `deploy-aviatorpass-production.yml` exits 1.
2. **Misleading green check:** Vercel Git status “Deployment has completed” ≠ production alias update.
3. **Aliases frozen** on `cfb51e6` until a successful `--prod` / Deploy Hook / dashboard Promote.
4. **Not** an application-level UI regression, duplicate route, or feature flag.

---

## Actions taken

1. Full branch/deploy/health/HTML comparison (local tip vs live vs `cfb51e6`).
2. Confirmed single homepage route and ATPL PASS components on tip.
3. Confirmed Actions promote failure (missing secrets).
4. Attempted anonymous `vercel deploy --temporary` → failed (Edge middleware not allowed for anonymous deploys); no production impact.
5. Added `deployment` identity fields to `GET /api/health` so future live audits can read `VERCEL_GIT_COMMIT_SHA` / `VERCEL_ENV` without dashboard access.
6. Authored this report.

---

## Fix required to make live match local (blocked here)

Agent **cannot** complete items 14–16 without Vercel credentials (MCP `needsAuth`, CLI logged out, Actions secrets empty).

**Ops — do one of:**

1. Add GitHub Environment / repo secret **`VERCEL_AVIATORPASS_DEPLOY_HOOK`** (preferred) **or** `VERCEL_TOKEN` (+ `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`), then re-run **Deploy AviatorPass Production** (`workflow_dispatch` or push).
2. Vercel Dashboard → project **aviatorpass** → Deployments → open the `aviatorpass` / `1749e3e` (or `d68c0e4`) build → **Promote to Production**.
3. Confirm **Settings → Git → Production Branch = `aviatorpass`**.

### Acceptance probe after promote

```bash
curl -sL https://aviatorpass.vercel.app/ | rg -o '<title>[^<]+'
# expect: ATPL PASS | Premium Live ATPL Training Academy

curl -sL https://aviatorpass.vercel.app/book | rg -o '<title>[^<]+'
# expect: Private Session …

curl -sL https://aviatorpass.vercel.app/api/health
# expect: deployment.gitSha starting with 1749e3e (or later tip) after this health patch ships
```

---

## Final verification (this audit)

| Criterion                                  | Status                    |
| ------------------------------------------ | ------------------------- |
| Tip on GitHub `aviatorpass`                | `1749e3e` ✅              |
| Local tip UI = ATPL PASS / Private Session | ✅                        |
| Live = tip                                 | ❌ still `cfb51e6`        |
| Production promote                         | ❌ missing Vercel secrets |
| App-side duplicate/flag/root bugs          | ❌ none found             |

**Verdict:** Live UI lag is a **failed production promote**, not a missing UI commit on the branch.
