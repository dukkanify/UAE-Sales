# SOOQNA — LIVE DATA + LISTING BADGES + CRITICAL AUTH FIX

**Date:** 2026-09-07  
**Production URL:** https://sooqna.site  
**Production SHA:** `238caf8`  
**Deployment ID:** `6312569152`  
**Branch / PR tip:** `cursor/live-data-auth-urgent-37ba` → merged to `main`

---

## Code changes shipped

| Area | Change |
|------|--------|
| Urgent | Removed from card badges + admin create checkbox. Optional `isUrgent` retained so old JSON rows do not crash. |
| Featured | Badge/feed filters use `isFeatured` + `featuredUntil` expiry (`isListingFeaturedActive`). |
| Verified | Badge only from `verifiedSeller` / `seller.isVerified` (no rating ≥ 4.8 invent). |
| Images | Cards/gallery use uploaded `images`/`imageUrl` only; empty → «لا توجد صورة» (no Unsplash-as-seller). |
| Catalog seed | Production no longer auto-seeds or merges mock catalog (`ALLOW_MOCK_CATALOG=true` override). |
| Auth | Guest complete-account now trims password before hash; login returns `PASSWORD_NOT_SET` distinctly; clearer state messages. |
| Tests | `npm test` → `scripts/auth-regression.test.mjs` (register→login, reset, trim bug, PASSWORD_NOT_SET). |

---

## LIVE verification matrix

### Marketplace / badges

| ID | Check | Result | Notes |
|----|-------|--------|-------|
| A | Urgent badge removed | **PASS** | Homepage HTML after deploy: **0** `عاجل` matches (was 16 pre-deploy). |
| B | Featured badge uses real DB state | **PASS** | Code + feed use `isListingFeaturedActive`; LIVE still shows `مميز` only where `isFeatured` persisted. |
| C | Public listings use LIVE DB | **PARTIAL** | Reads Postgres; historical mock/seed rows may still exist in `marketplace_listings` (not mass-deleted). New auto-seed/merge disabled. |
| D | Listing images = uploaded media | **PASS** (code+empty-state) | `getListingImages` no longer substitutes Unsplash. Full upload→publish E2E not run this session (needs seller session + moderation). |
| E | Mock/demo business data absent from UI | **PARTIAL** | Seed injection stopped; existing DB seed inventory may still render until ops identifies/removes non-prod rows. |

### AUTH

| ID | Check | Result | Notes |
|----|-------|--------|-------|
| F | Fresh Register | **PASS** | `POST /api/auth/register` → `ok: true`, `needsVerification: true`. Persistence `postgres:auth_users`. |
| G | Logout | **BLOCKED** | Requires completing email OTP to obtain a session first. |
| H | Same credentials Login | **PARTIAL** | Same E+P after register → **`ACCOUNT_UNVERIFIED` (403)** — proves hash+row OK, not wrong-password. Full login after verify blocked (email not delivered: `emailDelivered: false`). |
| I | Second fresh account Login | **PARTIAL** | Same as H for a second account. |
| J | Login after new browser session | **BLOCKED** | Needs verified account + inbox. |
| K | Login after redeploy | **BLOCKED** | Needs verified account that survives redeploy (DB durable — expected PASS once verified). |
| L | Password Reset → new password Login | **BLOCKED** | Needs inbox for reset email. |

**Auth root-cause note:** Classic “wrong password after logout” was ephemeral auth storage — Production now uses durable Postgres. Live probe shows correct credentials are recognized (`ACCOUNT_UNVERIFIED` vs `INVALID_CREDENTIALS` for wrong password). Remaining release blocker for full login E2E is **OTP/email delivery**, not hash mismatch.

### NOTIFICATIONS

| ID | Check | Result | Notes |
|----|-------|--------|-------|
| M–R | DB persistence / bell / history / deep links | **BLOCKED** | Requires authenticated QA session + inbox; not exercised this run. |

### ADMIN

| ID | Check | Result | Notes |
|----|-------|--------|-------|
| S–U | New user / pending listing / approve | **BLOCKED** | No admin session credentials in this agent run. |

---

## Automated tests

```text
npm test  →  6/6 pass
npm run lint → pass
npm run build → pass
```

---

## SOOQNA_26_ISSUES_FINAL_ACCEPTANCE_REPORT.md

**Not updated to 26 PASS.** Prior blockers (inbox, admin credentials, Stripe/CRON secrets) remain. This ship does **not** claim READY FOR ACCEPTANCE.

---

## FINAL RELEASE GATE

| Gate | Status |
|------|--------|
| Urgent removed on LIVE | PASS |
| Fresh register works | PASS |
| Same password recognized by server | PASS (`ACCOUNT_UNVERIFIED`, not wrong password) |
| Full register → verify → logout → login | **FAIL / BLOCKED** (email OTP not delivered on LIVE) |
| Reset password E2E | **BLOCKED** (inbox) |
| Notifications / Admin E2E | **BLOCKED** |
| Zero mock business rows in Production DB | **PARTIAL** (injection stopped; cleanup not performed) |

### Verdict

**NOT READY FOR ACCEPTANCE**

Most important remaining proof still required:

Fresh User → Register → **Email verification delivered** → Account Opens → Logout → Login with SAME email/password → Account Opens

Until OTP/email delivery works on LIVE, auth cannot be marked COMPLETE.
