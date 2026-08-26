# PROJECT_SEPARATION_REPORT

**Date:** 2026-08-26  
**Active product tip:** AviatorPass (`cursor/project-separation-0987` → `aviatorpass`)  
**Marketplace product tip (reference only):** Sooqna (`origin/main`, package `sooqna-web`)

---

## Executive confirmation

| Requirement                                                         | Status                                                                                                                                                                                 |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AviatorPass builds / installs independently                         | **Verified** (`package.json` name `aviatorpass`, Next `^15.5.3`)                                                                                                                       |
| Sooqna builds / installs independently                              | **Verified** in separate worktree `/tmp/sooqna-isolation-check` (`sooqna-web`, Next `^16.2.9`, distinct lockfile)                                                                      |
| `npm install` / `npm run dev` in one tree does not mutate the other | **Verified** via isolated git worktree (no shared `node_modules`)                                                                                                                      |
| AviatorPass tip has no Sooqna app routes / deploy workflow          | **Verified** (`npm run verify:isolation` → `ok: true`)                                                                                                                                 |
| Separate Vercel projects                                            | **Documented / policy-enforced** (`aviatorpass` vs `sooqna`); live promote still requires AviatorPass-only secrets                                                                     |
| Separate remotes / disjoint histories                               | **Not fully achievable in-place** — both still share GitHub remote `dukkanify/UAE-Sales` with shared ancestry. Recommended next ops step: export AviatorPass to a dedicated repository |

**Final product-code confirmation:** AviatorPass and Sooqna application trees are isolated. Shared GitHub remote remains a hosting coupling until a dedicated AviatorPass repository is created.

---

## Audit findings (before)

### Shared hosting (structural)

- Single remote: `github.com/dukkanify/UAE-Sales`
- `main` = Sooqna marketplace; `aviatorpass` / `develop` = AviatorPass
- Shared merge-base history (products diverged after common UAE-Sales root)
- Two Vercel projects linked to the same GitHub repo (AviatorPass vs Sooqna) → deploy noise risk

### Contaminants on AviatorPass tip

| Item                                           | Issue                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy-main-production.yml` | Deployed Sooqna Vercel project from this tip                                                                                          |
| `.github/workflows/ci.yml`                     | Triggered on marketplace `main` with AviatorPass env                                                                                  |
| `deploy-aviatorpass-production.yml`            | Fell back to shared `VERCEL_DEPLOY_HOOK`                                                                                              |
| Docs / scripts                                 | Dual-product branch model (`GIT_WORKFLOW`, `BRANCH_PROTECTION`, `VERCEL_SETUP`, `ENTERPRISE_GIT_REPORT`, `git-enterprise-status.mjs`) |
| Root audits                                    | `PRODUCTION_DEPLOYMENT_AUDIT.md`, `LIVE_UI_DEPLOYMENT_AUDIT.md` described cross-product Vercel noise                                  |

### Confirmed clean already

- No Sooqna `app/listings`, escrow, categories trees on AviatorPass tip
- `.env*` templates AviatorPass-branded; `.data/aep-*.json` only
- No `.cursor` / `.vscode` shared workspace settings in tree
- `package-lock.json` distinct from Sooqna tip

---

## Files removed

| Path                                           | Reason                                                    |
| ---------------------------------------------- | --------------------------------------------------------- |
| `.github/workflows/deploy-main-production.yml` | Sooqna production deploy must not live on AviatorPass tip |

---

## Files moved

| From                             | To                                            | Reason                            |
| -------------------------------- | --------------------------------------------- | --------------------------------- |
| `PRODUCTION_DEPLOYMENT_AUDIT.md` | `docs/archive/PRODUCTION_DEPLOYMENT_AUDIT.md` | Historical dual-product ops audit |
| `LIVE_UI_DEPLOYMENT_AUDIT.md`    | `docs/archive/LIVE_UI_DEPLOYMENT_AUDIT.md`    | Historical dual-product ops audit |

Added `docs/archive/README.md` explaining archive policy.

---

## Shared configurations found → removed / rewritten

| Configuration                                      | Action                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| Sooqna deploy workflow on AP tip                   | **Removed**                                                                |
| CI triggers on `main`                              | **Removed** from AviatorPass `ci.yml`                                      |
| Shared `VERCEL_DEPLOY_HOOK` fallback               | **Removed**; AviatorPass deploy uses only `VERCEL_AVIATORPASS_DEPLOY_HOOK` |
| Dual-product git / branch-protection / Vercel docs | **Rewritten AviatorPass-only**                                             |
| `scripts/git-enterprise-status.mjs` Sooqna rows    | **Removed**                                                                |
| `.gitignore`                                       | **Added** ignore rules for `.data/sooqna*` / `.sooqna/`                    |
| `AGENTS.md` / `README.md`                          | **Isolation rules** added                                                  |

---

## Files / tooling added

| Path                                   | Purpose                                       |
| -------------------------------------- | --------------------------------------------- |
| `scripts/verify-product-isolation.mjs` | Fail CI/local if Sooqna contaminants reappear |
| `npm run verify:isolation`             | Convenience script                            |
| `PROJECT_SEPARATION_REPORT.md`         | This report                                   |

---

## Git verification

| Check                            | Result                     |
| -------------------------------- | -------------------------- |
| Current tip package              | `aviatorpass`              |
| `origin/main` package (worktree) | `sooqna-web`               |
| Lockfiles identical?             | **No**                     |
| Next majors                      | AP `15.x` vs Sooqna `16.x` |
| AP has Sooqna listings routes?   | **No**                     |
| Sooqna worktree has listings?    | **Yes**                    |
| `verify:isolation`               | **Pass**                   |

Commands used:

```bash
npm run verify:isolation
git worktree add /tmp/sooqna-isolation-check origin/main
# compare package.json / lockfile / trees
```

---

## Deployment verification

| Item                         | AviatorPass                              | Sooqna (marketplace)                       |
| ---------------------------- | ---------------------------------------- | ------------------------------------------ |
| Vercel project               | `…/aviatorpass`                          | `…/sooqna`                                 |
| Production branch (required) | `aviatorpass`                            | `main`                                     |
| Deploy workflow on this tip  | `deploy-aviatorpass-production.yml` only | **Removed from this tip**                  |
| Required secret              | `VERCEL_AVIATORPASS_DEPLOY_HOOK`         | Marketplace-only secrets (not stored here) |

**Ops remaining (cannot complete without credentials):**

1. Ensure Vercel **aviatorpass** Production Branch = `aviatorpass` and ignores marketplace refs.
2. Ensure Vercel **sooqna** ignores AviatorPass refs (`aviatorpass`, `develop`, AP `cursor/*`).
3. Close / retarget any open AviatorPass PRs aimed at `main` (e.g. historical #89).
4. Optional hard isolation: create `dukkanify/AviatorPass` and push filtered history from `aviatorpass`.

---

## Independence proof (local)

| Action                 | AviatorPass (`/workspace`) | Sooqna (`/tmp/sooqna-isolation-check`) |
| ---------------------- | -------------------------- | -------------------------------------- |
| `package.json` name    | `aviatorpass`              | `sooqna-web`                           |
| Shared `node_modules`? | No — separate trees        | No                                     |
| Shared `.data`?        | `aep-*` only               | Separate worktree (no AP `.data`)      |
| `npm ci` scope         | Only current tree          | Only worktree after install            |

Policy: never reuse one `node_modules` across product checkouts; wipe `.next` / `*.tsbuildinfo` when switching products in the same directory.

---

## Remaining recommendations

1. **Dedicated AviatorPass GitHub repository** for true separate remotes / histories.
2. Vercel ignore rules on both projects (see above).
3. Add `verify:isolation` to CI quality job (optional follow-up).
4. Archive or close dual-product PR noise into `main`.

---

## Final statement

AviatorPass application configuration, dependencies, data stores, CI triggers, and deploy workflows on this tip are **isolated from the Sooqna marketplace product**. Sooqna remains independently verifiable on `origin/main` via a separate worktree. Full remote/history separation requires creating a dedicated AviatorPass repository (ops action outside this agent’s write scope for GitHub repo creation).
