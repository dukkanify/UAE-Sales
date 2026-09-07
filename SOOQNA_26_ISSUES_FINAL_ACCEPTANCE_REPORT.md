# SOOQNA_26_ISSUES_FINAL_ACCEPTANCE_REPORT.md

**Date (UTC):** 2026-09-05  
**Production host:** https://sooqna.site  
**Merged remediation:** PR #269 → `main`  
**LIVE Production SHA:** `7a38cf4`  
**LIVE Production deployment:** `6286625408` (state: success)  
**Previous LIVE SHA:** `df48756`  
**Lint/Build on tip:** PASS (verified on remediation branch before merge)

## Final gate (LIVE recheck after #269)

| Metric | Value |
|--------|------:|
| PASS | 12 |
| PARTIAL | 5 |
| FAIL | 0 |
| BLOCKED | 9 |
| **Verdict** | **NOT READY FOR ACCEPTANCE** |

COMPLETE / READY FOR ACCEPTANCE requires PASS = 26. Not claimed.

## Deployment identity

| Field | Value |
|------|--------|
| PR #269 | MERGED into `main` |
| `main` tip | `7a38cf4` |
| Production deployment id | `6286625408` |
| Deployment state | `success` |
| Target | https://sooqna.site |
| SHA match | LIVE Production deployment SHA = `7a38cf4` (no longer `df48756`) |

## LIVE config snapshot (no secrets)

| Flag | Value |
|------|--------|
| stripeConfigured | `false` |
| stripePublishableConfigured | `false` |
| stripeWebhookConfigured | `false` |
| cronSecretConfigured | `false` |
| missing | `CRON_SECRET`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Unauthorized cron | HTTP **503** `CRON_SECRET_REQUIRED` (desired when configured: **401**) |
| Stripe webhook (no sig) | HTTP **503** `STRIPE_NOT_CONFIGURED` |
| Admin APIs without session | HTTP **401** `UNAUTHORIZED` |

## Acceptance matrix (LIVE after #269)

| ID | Issue | Priority | Code on LIVE | Production evidence | E2E | Status | Notes |
|----|-------|----------|--------------|---------------------|-----|--------|-------|
| 01 | Login after re-enter credentials | CRITICAL | Yes | Register API ok; no OTP in JSON; login rejects bad creds | Full register→verify→login→logout→login | **BLOCKED** | Needs readable inbox for verify + password login E2E |
| 02 | Wrong password-reset email | CRITICAL | Yes | `POST /api/auth/password/reset/request-link` returns generic ok + maskedEmail; **no token** | Inbox template proof | **BLOCKED** | Inbox dependency |
| 21 | Reset delay + new password fails | CRITICAL | Yes | Same reset path LIVE | Reset→login new password | **BLOCKED** | Inbox + timed delivery proof |
| 10 | Notification opens 404 | CRITICAL | Yes (hrefs in tip) | `/notifications` → 200; API 401 unauth | Click each type logged-in | **PARTIAL** | Code deployed; authenticated deep-link E2E not run |
| 16 | Notification history | CRITICAL | Yes | `/notifications` → 200 | History after logout/login | **PARTIAL** | Needs logged-in session |
| 11 | Pending listing missing admin | CRITICAL | Yes (upsert row) | Admin APIs 401 without session | User submit→admin queue | **BLOCKED** | Admin credentials required |
| 12 | New users missing admin | CRITICAL | Yes | Admin users API 401 | Register→admin search | **BLOCKED** | Admin credentials required |
| 13 | Admin listing search/filters | HIGH | Yes | Tip includes search/filters | Admin UI exercise | **BLOCKED** | Admin credentials required |
| 03 | Car year list + manual | HIGH | Yes | LIVE `/api/category-fields?categoryId=cars`: `year` type **combobox**, 37 year options + placeholder «اختر أو اكتب السنة» | Form submit | **PASS** | LIVE schema verified |
| 04 | Car condition New/Used only | HIGH | Yes | LIVE cars condition options: `new`/`used` only; **excellent absent** | — | **PASS** | LIVE schema verified |
| 05 | Precise car location | HIGH | Yes | LIVE cars: required `emirate` select + `city` text | Map precision UX | **PARTIAL** | Emirate+area collected; map still approximate |
| 06 | Car color Other | MEDIUM | Yes | LIVE `exteriorColor`/`interiorColor` include «أخرى»; `*ColorOther` with `showWhen` | — | **PASS** | LIVE schema verified |
| 07 | Car cover image | HIGH | Yes | Tip: «تعيين كغلاف» in MediaContactStep | UI click E2E | **PARTIAL** | Deployed; browser cover-set not exercised this run |
| 08 | Keys optional | MEDIUM | Yes | LIVE `numberOfKeys.required = false` | Submit empty | **PASS** | LIVE schema verified |
| 09 | Video in gallery | MEDIUM | Yes | Tip integrates `videoUrl` in ListingGallery | Listing with video | **PARTIAL** | Sample listing probed had no video asset |
| 14 | Developer by name | HIGH | Yes | LIVE real-estate `developer` combobox with named developers (Emaar/Aldar/…) | — | **PASS** | LIVE schema verified |
| 15 | Electronics New/Used only | MEDIUM | Yes | LIVE electronics condition: new/used only | — | **PASS** | LIVE schema verified |
| 17 | Phones easier date | MEDIUM | Yes | LIVE mobiles `purchaseDate` type **date** | — | **PASS** | LIVE schema verified |
| 18 | Furniture Other + admin approval | MEDIUM | Yes | LIVE furnitureType includes `other` + `furnitureTypeOther` showWhen | Admin approve | **BLOCKED** | Field LIVE; admin approval E2E needs credentials |
| 19 | Jobs vacancy vs seeker | HIGH | Yes | LIVE `listingType` vacancy/seeker; images optional in tip | — | **PASS** | LIVE schema verified |
| 20 | Listing submission email all categories | HIGH | Yes | Resend configured LIVE | Multi-category inbox | **BLOCKED** | Readable inbox required |
| 22 | Test payment + hide Stripe in Sooqna UI | HIGH | Mostly | Success copy Sooqna-neutral; Stripe keys **unset**; leftover «عبر Stripe» fixed in follow-up branch | Test Mode charge | **BLOCKED** | Operational: configure Test keys in QA / Live keys in Production separately; do not mix |
| 23 | Valid contact form rejected | HIGH | Yes | Valid `POST /api/support` → `{ok:true,emailed:true}`; invalid → fieldErrors | Mobile/desktop UX | **PASS** | LIVE API verified |
| 24 | Emirate header selector | HIGH | Yes | LIVE homepage: `aria-label="الإمارة"`; «كل الإمارات»; default Abu Dhabi in code | Change→search | **PASS** | LIVE markup + tip behavior verified |
| 25 | Abu Dhabi visuals | MEDIUM | Yes | LIVE hero preload uses `photo-1620148369396` (Abu Dhabi, w=1600) | — | **PASS** | Dubai listing thumbs may remain; hero is Abu Dhabi |
| 26 | Remove homepage escrow promo | MEDIUM | Yes | No `MarketEscrow` mount; no primary `/escrow` nav; policy links remain | AR/EN home | **PASS** | «سياسة الضمان المالي» footer/policy retained by design |

## Remaining ISSUE IDs

### BLOCKED (9)
`01`, `02`, `11`, `12`, `13`, `18`, `20`, `21`, `22`

### PARTIAL (5)
`05`, `07`, `09`, `10`, `16`

### PASS (12)
`03`, `04`, `06`, `08`, `14`, `15`, `17`, `19`, `23`, `24`, `25`, `26`

## Exact manual / operational blockers

| Blocker | Blocks | Owner | Action |
|---------|--------|-------|--------|
| Readable test inbox | 01, 02, 20, 21 | Email/Resend + ops | Provide inbox (or Resend dashboard access) for verify/reset/listing emails |
| Admin session credentials | 11, 12, 13, 18 | Sooqna ops | Provide authorized admin login for Production |
| Stripe env (test vs live separation) | 22 | Vercel + Stripe | Set Live keys only on Production; use Test keys + test webhook in Preview/QA |
| CRON_SECRET | cron hardening (related ops) | Vercel | Set `CRON_SECRET`; confirm unauthorized cron → 401 |

## High-visibility LIVE checks (post-deploy)

| Check | Result |
|-------|--------|
| Cars year combobox + manual placeholder | PASS |
| Cars condition new/used only (no excellent) | PASS |
| Cars color Other fields | PASS |
| Keys optional | PASS |
| RE developer name combobox | PASS |
| Header emirate selector | PASS |
| Abu Dhabi hero (`photo-1620148369396`) | PASS |
| Homepage escrow promo section removed | PASS |
| Stripe configured | FAIL/ops (`false`) |
| Admin queue without credentials | Cannot verify (401) |

## Final response fields

1. **Live production SHA:** `7a38cf4`  
2. **Production deployment:** `6286625408` → https://sooqna.site (also Vercel target URL from deployment statuses)  
3. **PASS:** 12  
4. **PARTIAL:** 5  
5. **FAIL:** 0  
6. **BLOCKED:** 9  
7. **Remaining IDs:** BLOCKED `01,02,11,12,13,18,20,21,22`; PARTIAL `05,07,09,10,16`  
8. **Manual blockers:** inbox, admin credentials, Stripe/CRON secrets on Vercel Production  
9. **PR containing remediation:** https://github.com/dukkanify/UAE-Sales/pull/269 (merged)  
10. **Verdict: NOT READY FOR ACCEPTANCE**
