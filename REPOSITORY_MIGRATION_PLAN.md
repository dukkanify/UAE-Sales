# REPOSITORY_MIGRATION_PLAN

**Goal:** Move AviatorPass from shared `dukkanify/UAE-Sales` into a dedicated repository **`dukkanify/AviatorPass`** with its own history, CI, and deployment pipeline.

**Status:** Migration package prepared locally. GitHub `createRepository` is blocked for this agent (403). Operator must create the empty repo, then re-run the push step.

---

## 1. Objectives

| #     | Requirement                                                     | Approach                                                                    |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1     | Dedicated repo `dukkanify/AviatorPass`                          | Create empty GitHub repo (manual) → push prepared export                    |
| 2     | Preserve AviatorPass Git history                                | Graft AEP foundation `381d5b3` as orphan root → `git filter-repo`           |
| 3     | Remove Sooqna history                                           | Drop marketplace-only ancestry + omit `main` Sooqna tip from export         |
| 4–11  | Actions / deploy / Vercel / remotes / secrets / protection / CI | Rewritten on AviatorPass tip; re-point Vercel Git connection                |
| 12–15 | Verify build / deploy / Actions / production / preview          | Build verified in agent; deploy/Actions/Vercel require new remote + secrets |
| 16    | No Sooqna references                                            | Active docs/workflows scrubbed; archive retained under `docs/archive/`      |
| 17–18 | Migration + verification docs                                   | This file + `POST_MIGRATION_VERIFICATION.md`                                |

---

## 2. History strategy

```
UAE-Sales timeline
├── marketplace commits (Sooqna) ──► origin/main   [NOT exported]
└── … shared ancestors …
        └── 381d5b3 AEP foundation ──► … ► aviatorpass tip   [EXPORTED]
```

1. Clone AviatorPass tip tree.
2. `git replace --graft 381d5b385559e376d8c40d1a52c1dc1347aef085` (no parents).
3. `git filter-repo --force` → permanent AviatorPass-only history.
4. First commit in export becomes: **“feat: initialize Aviation Education Platform (AEP) foundation”**.
5. Branches kept: `main` (= production tip), `aviatorpass` (alias tip), `develop`.

**Proven dry-run:** `/tmp/AviatorPass-export` (see `/opt/cursor/artifacts/aviatorpass-migration-export.log`).

---

## 3. Operator checklist (execute in order)

### A. Create the GitHub repository

```bash
# As dukkanify org owner (agent cannot):
gh repo create dukkanify/AviatorPass \
  --public \
  --description "AviatorPass — professional ATPL aviation training platform" \
  --disable-wiki
# Do NOT add README / .gitignore / license (empty repo).
```

### B. Push prepared history

From this workspace (or any machine with the script):

```bash
# Rebuild export + push
PUSH=1 \
NEW_REMOTE=https://github.com/dukkanify/AviatorPass.git \
bash scripts/migrate-to-dedicated-repo.sh
```

Or from an existing dry-run export:

```bash
cd /tmp/AviatorPass-export
git remote add origin https://github.com/dukkanify/AviatorPass.git
git push -u origin main
git push origin aviatorpass
git push origin develop
```

### C. GitHub settings

1. **Default branch:** `main` (points at AviatorPass production tip).
2. **Branch protection** for `main` / `aviatorpass` / `develop` — see `.github/BRANCH_PROTECTION.md` (updated to `dukkanify/AviatorPass`).
3. **Environments:** create `Production – aviatorpass` (or `Production`) with secrets:
   - `VERCEL_AVIATORPASS_DEPLOY_HOOK` (preferred)
   - or `VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` (AviatorPass project only)
4. **Do not** add Sooqna / `VERCEL_SOOQNA_*` / shared `VERCEL_DEPLOY_HOOK` secrets.

### D. Vercel

1. Open project `dukkanify-technology-llcs-projects/aviatorpass`.
2. **Settings → Git:** disconnect `UAE-Sales`, connect **`dukkanify/AviatorPass`**.
3. **Production Branch:** `main` (or `aviatorpass` if you prefer that name as default).
4. Confirm Ignored Build Step allows only AviatorPass refs (or remove ignore if repo is dedicated).
5. Trigger production deploy (Deploy Hook or push to `main`).
6. Confirm preview deploys on PRs into `main` / `develop`.

### E. Retire dual-product coupling on UAE-Sales

1. Keep `UAE-Sales` / `main` as Sooqna-only.
2. Close or retarget AviatorPass PRs that still target `UAE-Sales`.
3. Optionally archive AviatorPass branches on `UAE-Sales` after cutover.

---

## 4. Files / workflows in the new repo

| Area                                                  | State after migration                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                            | AviatorPass-only branches (`main`, `develop`, `aviatorpass`, `cursor/**`, …) |
| `.github/workflows/deploy-aviatorpass-production.yml` | Triggers on `aviatorpass` **and** `main`; AviatorPass Vercel only            |
| Sooqna `deploy-main-production.yml`                   | **Absent**                                                                   |
| Package / README remote                               | `dukkanify/AviatorPass`                                                      |
| `scripts/migrate-to-dedicated-repo.sh`                | Idempotent export + optional push                                            |
| `scripts/verify-product-isolation.mjs`                | Blocks marketplace contaminants                                              |

---

## 5. Local agent commands already run

```bash
bash scripts/migrate-to-dedicated-repo.sh   # dry-run export OK
npm run verify:isolation                     # pass on migration branch
npm run typecheck && npm run test            # run before PR
npm run build                                # required for cutover confidence
```

---

## 6. Rollback

If the new repo is wrong:

1. Do not delete `UAE-Sales` AviatorPass branches until cutover verified.
2. Re-point Vercel Git back to `UAE-Sales` / `aviatorpass`.
3. Delete or archive `dukkanify/AviatorPass` if abandoned.

---

## 7. Definition of done

AviatorPass is isolated **only when**:

- [ ] `dukkanify/AviatorPass` exists and is the git `origin`
- [ ] History root is AEP foundation (no marketplace commits before it)
- [ ] CI green on the new repo
- [ ] Vercel production serves a SHA from `dukkanify/AviatorPass`
- [ ] Preview deployments work from PRs on the new repo
- [ ] `rg -i sooqna` on active (non-archive) paths is empty or intentional negative tests only
- [ ] `POST_MIGRATION_VERIFICATION.md` signed off

Until the GitHub repository is created and pushed, isolation remains **blocked on operator action**.
