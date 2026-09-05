# SOOQNA_26_ISSUES_FINAL_ACCEPTANCE_REPORT.md

**Date (UTC):** 2026-09-05  
**Production host tested:** https://sooqna.site  
**Remediation branch:** `cursor/full-26-issue-remediation-37ba`  
**Production deployment SHA (LIVE at test time):** `df48756`  
**Remediation tip SHA (this branch, not yet on Production):** `106b2af`
**Lint:** PASS (`npm run lint`)  
**Build:** PASS (`npm run build`)

## Final gate

| Metric | Value |
|--------|------:|
| PASS | 0 |
| PARTIAL | 18 |
| FAIL | 0 |
| BLOCKED | 8 |
| **Verdict** | **NOT READY FOR ACCEPTANCE** |

COMPLETE is **not** claimed. `PASS = 26` is required for COMPLETE; LIVE Production still runs `df48756` (pre-remediation) and Stripe/CRON secrets remain unset.

## LIVE Production config snapshot (no secrets)

| Flag | Value |
|------|--------|
| stripeConfigured | `false` |
| missing | `CRON_SECRET`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| databaseConfigured | `true` |
| resendConfigured | `true` |
| Latest Production deploy | `6285995167` @ `df48756` (2026-09-05T21:25:10Z) |

## Acceptance matrix

| ID | Issue | Priority | Code | Production | E2E | Status | Evidence |
|----|-------|----------|------|------------|-----|--------|----------|
| 01 | Login after re-enter credentials | CRITICAL | Yes — durable user store + password hash/sessionVersion | Deployed base auth durable; this branch not Production tip | Not re-run with fresh inbox account on tip | PARTIAL | Code: `user-store` / login password routes. LIVE E2E with register→logout→login on tip **not proven**. |
| 02 | Wrong password reset email | CRITICAL | Yes — dedicated `password_reset` via `emailPasswordResetLink` | Reset pages 200 on LIVE | Inbox template not verified on tip | PARTIAL | Code path `/api/auth/password/reset/request-link` → `emailPasswordResetLink`. LIVE inbox proof missing. |
| 21 | Reset delay + new password fails | CRITICAL | Yes — token consume + `setUserPassword` + session bump | Same as 02 | Inbox + immediate re-login not proven | PARTIAL | Same blockers as 02; delivery latency not measured LIVE. |
| 10 | Notification opens non-existent page | CRITICAL | Yes — order/dispute hrefs + safer listing pending href + mark-read-on-click | Tip not deployed | Not click-tested on LIVE tip | PARTIAL | Code: `order-service`, `dispute-service`, `listing-notifications`, `NotificationBell`. |
| 16 | Notification history + links | CRITICAL | Yes — history page + bell without mark-all-on-open + mark-all CTA | `/notifications` → 200 LIVE | Persistence/pagination E2E incomplete | PARTIAL | Code present; LIVE history after logout/login on tip not proven. |
| 11 | Pending listing missing from admin | CRITICAL | Yes — `upsertListingRow` (no full-table wipe) + fail-closed sync | Tip not deployed | User→admin queue E2E blocked (no admin session) | BLOCKED | Needs Production deploy of tip + admin credentials. Root cause addressed in `listing-persistence`/`listing-store`. |
| 12 | New users missing from admin list | CRITICAL | Yes — stop auto-pending filter; newest-first sort | Tip not deployed | Fresh register→admin search blocked | BLOCKED | Needs admin session + tip deploy. |
| 13 | Admin listing search + filters | HIGH | Yes — text search + category/city + clear + default pending_review | Tip not deployed | Admin UI E2E blocked | BLOCKED | `AdminListingsPanel` updated; LIVE admin session required. |
| 03 | Car model year list + manual | HIGH | Yes — year combobox options | LIVE API still `year: number` + excellent still present | — | PARTIAL | LIVE `/api/category-fields?categoryId=cars` shows old schema (`year` number, condition includes excellent). Tip has combobox years. |
| 04 | Car condition New/Used only | HIGH | Yes — excellent removed from cars + search filters | LIVE still returns excellent for cars | — | PARTIAL | Tip code clean; Production schema stale until redeploy. |
| 05 | Precise car location | HIGH | Yes — emirate + city/area fields | Fields exist LIVE (emirate/city) | Map-precision E2E not re-proven | PARTIAL | Create form collects emirate+area text; map picker still approximate/demo-level. |
| 06 | Car color Other | MEDIUM | Yes — exterior/interior Other + showWhen text | LIVE lacks `*ColorOther` fields | — | PARTIAL | Tip has Other fields; Production API lacks them. |
| 07 | Car cover image | HIGH | Yes — set-as-cover reorder | Tip not deployed | — | PARTIAL | `MediaContactStep` + `useAddListingForm` cover reorder. |
| 08 | Number of keys optional | MEDIUM | Yes — `required: false` | LIVE still `numberOfKeys` required true | — | PARTIAL | Tip fixed; Production stale. |
| 09 | Video inside media gallery | MEDIUM | Yes — gallery media items include video | Tip not deployed | — | PARTIAL | `ListingGallery` integrates video; duplicate section removed. |
| 14 | Developer name (not ID) | HIGH | Yes — developer combobox by name | Tip not deployed | — | PARTIAL | Developer options are human-readable names. |
| 15 | Electronics New/Used only | MEDIUM | Yes | LIVE electronics not re-probed this run | — | PARTIAL | Code has new/used only; LIVE tip redeploy needed for certainty. |
| 17 | Phones easier date | MEDIUM | Yes — `type: "date"` | LIVE still text for purchase date | — | PARTIAL | Tip uses date input; Production stale. |
| 18 | Furniture Other + admin approval | MEDIUM | Yes — Other + option-suggestions admin | Tip/base present | Admin approve E2E blocked | BLOCKED | Needs admin session on Production tip. |
| 19 | Jobs vacancy vs seeker | HIGH | Yes — listingType vacancy/seeker + optional image | Tip has jobs image optional | — | PARTIAL | Code present; LIVE form E2E not run on tip. |
| 20 | Listing submission email all categories | HIGH | Yes — `emailListingReceived` on submit notify | Resend configured LIVE | Multi-category inbox not proven | BLOCKED | Needs authenticated submit + readable inbox. |
| 22 | Test payment + hide Stripe in Sooqna UI | HIGH | Yes — Sooqna success copy; Stripe keys still env-separated | `stripeConfigured=false` LIVE | Test Mode charge E2E impossible | BLOCKED | Manual: set Stripe **test** keys in non-prod or approved test env; keep live keys separate. Code no longer emphasizes Stripe on success CTA. |
| 23 | Valid contact form rejected | HIGH | Audited — field names match API | `/support` → 200 | Valid submit E2E not inbox-proven | PARTIAL | `SupportContactForm` ↔ `/api/support` aligned; delivery proof optional. |
| 24 | Emirate selector in header | HIGH | Yes — All Emirates + Abu Dhabi default + localStorage + search nav | Tip not deployed; LIVE header still Dubai-first | — | PARTIAL | `EmirateLocationSelect` + Site/Market headers updated in tip. |
| 25 | Replace Dubai visuals with Abu Dhabi | MEDIUM | Yes — `heroBackgroundUrl` → abu-dhabi photo | LIVE HTML still heavily `photo-1512453979798` (Dubai) | — | PARTIAL | Tip points hero to Abu Dhabi asset; Production still Dubai-dominant. |
| 26 | Remove homepage escrow promo | MEDIUM | Yes — not mounted on `app/page` / mobile home; nav promo removed | LIVE homepage still shows «الضمان المالي» (17 matches) | — | PARTIAL | Tip removes primary-nav escrow promo; escrow policy/footer + checkout escrow kept. Production still shows promo until redeploy. |

## Failed / blocked acceptance criteria — next actions

### BLOCKED (manual / external)

| ID | Failed criterion | Root cause | Next action | Owner |
|----|------------------|------------|-------------|-------|
| 11 | Admin sees pending listing | Tip not on Production + no admin session | Merge PR → Production redeploy → admin E2E | Sooqna + Vercel |
| 12 | New user in Admin Users | Same | Deploy tip + admin login | Sooqna + Vercel |
| 13 | Admin search/filters LIVE | Same | Deploy tip + admin login | Sooqna + Vercel |
| 18 | Furniture Other admin approve | Admin session | Deploy + approve suggestion E2E | Sooqna |
| 20 | Inbox listing email multi-cat | No readable test inbox in agent | Provide inbox access; submit Cars/RE/Electronics/Furniture/Jobs | Email/Resend |
| 21/02 | Reset email timing + login | Inbox + tip deploy | Deploy tip; measure delivery; login with new password | Email + Sooqna |
| 22 | Stripe Test Mode E2E | LIVE Stripe keys unset; must not mix test/live | Configure test keys in Preview/QA only; verify webhook separately | Stripe + Vercel |

### PARTIAL (code on tip, LIVE not tip)

All PARTIAL rows share: **Production SHA `df48756` ≠ remediation tip**. After Production redeploy of this branch tip, re-run LIVE matrix; many PARTIAL → PASS if E2E succeeds.

## Security checks (code review / static)

| Check | Result |
|-------|--------|
| OTP not in API success JSON (password reset request-link) | PASS (code) |
| Reset token not returned in API body | PASS (code) |
| Stripe secrets not in browser bundles (env server-side) | PASS (architecture) |
| Admin routes require auth | PASS (existing pattern; LIVE `/admin/listings` → 307) |

## What must happen before READY FOR ACCEPTANCE

1. Merge this PR to `main` and deploy **Production** (Vercel project sooqna) so `sooqna.site` SHA = tip.  
2. Re-probe `/api/category-fields?categoryId=cars` — expect year combobox, condition new/used only, keys optional, color Other fields.  
3. Re-probe homepage — Abu Dhabi hero dominant; no homepage escrow promo section/nav.  
4. Admin E2E: pending listing + new user + listing search filters + furniture Other approval.  
5. Auth E2E with real inbox: register/login/logout/login + forgot/reset/new password.  
6. Listing submission emails for multiple categories (inbox).  
7. Stripe: configure keys correctly (test in QA; live only in Production live); confirm success UI without Stripe brand emphasis; webhook 400 on bad signature when configured.  
8. Only then retarget PASS=26.

## Final response fields

1. **Production commit SHA (LIVE now):** `df48756`  
2. **Production deployment:** id `6285995167` (Vercel Production) — host https://sooqna.site  
3. **PASS:** 0  
4. **PARTIAL:** 18  
5. **FAIL:** 0  
6. **BLOCKED:** 8  
7. **Remaining ISSUE-IDs:** all 26 pending LIVE re-verify; hard blockers 11,12,13,18,20,02/21,22  
8. **Manual blockers:** Production redeploy of tip; admin credentials; readable inbox; Stripe test/live key configuration (Vercel MCP unauthenticated for this agent)  
9. **PR:** (created from `cursor/full-26-issue-remediation-37ba`)  
10. **Verdict: NOT READY FOR ACCEPTANCE**
