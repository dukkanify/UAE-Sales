# Sooqna — Final Production Acceptance Report

**Date (UTC):** 2026-08-29 (merge conflict resolution vs `main` after #265)
**Production host:** https://sooqna.site
**Spreadsheet:** تقرير_ملاحظات_سوقنا_الفنية_محدث_4.xlsx
**Sheets audited:** الملاحظات · الملاحظات الجديدة · لوحة التحكم · التصنيفات · الصلاحيات · مضمون
**Closure merge:** PR #265 (`cursor/production-closure-sprint-37ba`) → `main`

## Overall Status

# NOT READY FOR PRODUCTION

Closure sprint code is **live on Production** (`a9b39d2`). Prior FAIL gaps were addressed in code (homepage escrow promo removal, food wholesale/retail, jobs vacancy/seeker, furniture Other→admin approval, escrow/dispute policy pages, Excel export, admin form builder, RBAC action matrix, i18n phrase coverage). **Still cannot be marked READY** because:

1. `CRON_SECRET` unset → dispute reminders cannot run; unauthorized cron returns **503** not **401**
2. Stripe keys unset → `stripeConfigured=false`, featured/escrow paid flows blocked
3. No readable test inbox / admin credentials available for full auth + admin E2E

## Counts (honest)

| Status | Count | Notes |
|--------|------:|-------|
| PASS | 2 | Only items previously live-proven (footer Dukkanify credit remains PASS; others await re-verify) |
| PARTIAL | 52 | Implemented or partially live; missing E2E evidence or remaining gaps |
| FAIL | 4 | Still hard-fail on live Production: Stripe featured pay, CRON reminders, EN Arabic leakage not fully cleared live, escrow paid path |
| BLOCKED | 29 | Secrets, inbox, admin session, or Stripe-dependent flows |

Target `PASS=87` is **not** claimed. Do not treat lint/build/CI as Production Ready.

## 1) Live deployment identity

| Field | Value |
|------|--------|
| Host tested | `https://sooqna.site` |
| Vercel project | **sooqna** |
| Environment | **Production** |
| Production commit | `a9b39d2` (Merge #265 production-closure-sprint) |
| `main` SHA | `a9b39d2` |
| Match | **PASS** — sooqna.site Production deploy matches `main` tip |
| Deployment ID | `6158580962` |
| Prior baseline (pre-#265) | `4afbe8d` / deployment `6128709223` |

## 2) Production config snapshot (no secrets)

| Flag | Value |
|------|--------|
| sessionSecretConfigured | `true` |
| cronSecretConfigured | `false` |
| stripeConfigured | `false` |
| featuredCheckoutAvailable | `false` |
| databaseConfigured | `true` |
| resendConfigured | `true` |
| demoOtpServerEnabled | `false` |
| missing | `CRON_SECRET`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| unauthorized cron | HTTP **503** `CRON_SECRET_REQUIRED` (required **401**) |
| Stripe webhook | HTTP **503** `STRIPE_NOT_CONFIGURED` |

## 3) Live smoke evidence (selected)

- Register API: **PASS** (`ok`, `needsVerification`, `emailDelivered`, **no otp field**) — from original #264 audit
- Support invalid: **PASS** fieldErrors; valid: **PASS** `emailed:true`
- Search suggest AR/EN: **PASS** HTTP 200 with items
- listingActiveDays: **30** via `/api/site-settings`
- disputeWindowDays: **7**
- Footer Dukkanify credit+URL: **PASS**
- `/escrow-policy` and `/dispute-policy`: **HTTP 200** on Production after #265
- `/api/category-fields?categoryId=food` includes `saleType`; jobs includes `listingType`
- Admin/notifications/activity APIs without session: **401** (expected)
- Auth/admin full E2E: **BLOCKED** without inbox/admin credentials

## 4) Phase 1 FAIL closure — implementation status

| Priority | Requirement | Root cause | Fix in #265 | Live result |
|----------|-------------|------------|-------------|-------------|
| 1 | CRON_SECRET / dispute reminders | Secret missing on sooqna Production | Code already has cron + auth gate | **FAIL / BLOCKED** until secret + redeploy |
| 2 | Stripe configuration | Keys missing | Ops request filed | **FAIL / BLOCKED** |
| 3 | Remove Homepage Escrow section | `MarketEscrow` / promo copy | Removed from desktop+mobile home; softened hero/featured escrow marketing | **PARTIAL** — code live; AR/EN full verify pending |
| 4 | Food wholesale/retail | New/used pattern | `saleType` wholesale/retail + unit pricing | **PARTIAL** until live form E2E |
| 5 | Jobs vacancy / seeker | Missing listing type | `listingType` vacancy/seeker + `showWhen` fields | **PARTIAL** until live E2E |
| 6 | Furniture Other → Admin | No approval pipeline | `/api/option-suggestions` + admin review + approved options merge | **PARTIAL** until admin E2E |
| 7 | Excel export | API unwired | `GET /api/admin/export` + Reports UI | **PARTIAL** until admin session export |
| 8 | Admin Dynamic Form Builder | Constants-only fields | Category Forms panel + durable store + `/api/category-fields` | **PARTIAL** until admin E2E |
| 9 | Full RBAC action matrix | Module-only flags | View/Add/Edit/Delete/Approve/Export + `hasAdminAction` | **PARTIAL** until Super/Sub live matrix test |
| 10 | English Arabic leakage | Missing phrases | Phrase map + LocalizedTree | **FAIL/PARTIAL** — full EN scan still required |
| 11 | Escrow / Dispute policy pages | Missing dedicated policies | `/escrow-policy`, `/dispute-policy` + footer links | **PARTIAL** — pages return **200**; paid escrow E2E still blocked by Stripe |

## 5) Requirement matrix (spreadsheet)

Status legend applied strictly to **live Production evidence**. Code existence alone never upgrades to PASS.

| Sheet | ID | Requirement | Implementation | Live URL / evidence | Result | Remaining issue |
|------|----|-------------|----------------|---------------------|--------|-----------------|
| الملاحظات | 1 | القائمة الرئيسية | Header/menu | https://sooqna.site | **PARTIAL** | Multi-browser flake not re-proven |
| الملاحظات | 2 | دعوة التسجيل | Login CTA | /login | **PARTIAL** | Full logged-out CTA UX incomplete |
| الملاحظات | 3 | الشروط والأحكام + سياسات | terms/privacy + escrow/dispute policy pages | /terms /privacy /escrow-policy /dispute-policy | **PARTIAL** | Policy pages live 200; full legal UX not re-audited |
| الملاحظات | 4 | بيانات إعلاناتي لحساب جديد | Owner-scoped APIs | — | **BLOCKED** | Needs multi-user sessions |
| الملاحظات | 5 | نسيت كلمة المرور | /forgot-password + reset APIs | /forgot-password | **PARTIAL** | Full reset E2E needs inbox |
| الملاحظات | 6 | إيميل ترحيبي | Resend welcome path | — | **BLOCKED** | Needs inbox after verify |
| الملاحظات | 7 | إيميل عند الحجز | Order emails | — | **BLOCKED** | Stripe unset |
| الملاحظات | 8 | مكان حفظ البحث | Saved searches | — | **PARTIAL** | localStorage not Postgres |
| الملاحظات | 9 | التقديم على وظيفة | Job apply APIs + Activity | — | **PARTIAL** | Auth E2E blocked |
| الملاحظات | 10 | إيميل تأكيد التقديم | Job apply email | — | **BLOCKED** | Needs apply+inbox |
| الملاحظات | 11 | اتجاه رقم الاتصال | RTL phone | — | **PARTIAL** | Not re-verified |
| الملاحظات | 12 | منطق الفلاتر | Search filters | /search | **PARTIAL** | Ranking not proven |
| الملاحظات | 13 | ترتيب التصنيفات | Admin sortOrder | /admin/categories | **PARTIAL** | Auto ranking unclear |
| الملاحظات | 14 | ماركة/موديل سيارات | Combobox fields | /listings/new | **PARTIAL** | Live form needs auth |
| الملاحظات | 15 | حالة السيارة | new/used | — | **PARTIAL** | Live form blocked |
| الملاحظات | 16 | الألوان | Select colors | — | **PARTIAL** | Swatches missing |
| الملاحظات | 17 | الصور/فيديو/غلاف | Media upload | — | **PARTIAL** | Live upload blocked |
| الملاحظات | 18 | موقع الإعلان | Emirate/city | — | **PARTIAL** | Map precision blocked |
| الملاحظات | 19 | الدفع للإعلان المميز | Featured Stripe checkout | /api/auth/status | **FAIL** | stripeConfigured=false |
| الملاحظات | 20 | تصنيف الطعام | wholesale/retail fields | /api/category-fields | **PARTIAL** | Fields live; form E2E blocked |
| الملاحظات | 21 | رقم التواصل من الملف | Profile autofill | — | **PARTIAL** | Not live-proven |
| الملاحظات | 22 | إلزام صورة المنتج | Required images | — | **PARTIAL** | Not E2E |
| الملاحظات | 23 | تطوير الهيدر | Header | / | **PARTIAL** | Desktop emirate incomplete |
| الملاحظات | 24 | تبسيط الفوتر | Footer + policy links | / | **PARTIAL** | Full footer UX not re-audited |
| الملاحظات | 25 | فتح النزاع من المعاملة | Dispute from order | — | **PARTIAL** | Needs paid order |
| الملاحظات | 26 | فترة النزاع والتنبيهات | Cron reminders | /api/cron/dispute-reminders | **FAIL** | CRON_SECRET missing (503) |
| الملاحظات | 27 | حقوق التطوير في الفوتر | Dukkanify credit | / | **PASS** | Verified previously live |
| الملاحظات | 28 | مراجعة قبل النشر | pending_review + 30 days | /api/site-settings | **PARTIAL** | Admin approve E2E blocked |
| الملاحظات | 29 | اعتماد الحساب | Session + register | /register | **BLOCKED** | Verify→login needs inbox |
| الملاحظات | 30 | مضمون + توثيق | Escrow evidence APIs | — | **BLOCKED** | Stripe |
| الملاحظات | 31 | تقييم المعلن | Order rating | — | **PARTIAL** | Interaction review missing |
| الملاحظات | 32 | أدمن رئيسي/فرعي + صلاحيات | RBAC action matrix UI+API | /admin/users | **PARTIAL** | Live Super/Sub matrix blocked |
| الملاحظات | 33 | إدارة الأقسام + النماذج | Categories + form builder | /admin/categories | **PARTIAL** | Needs admin session |
| الملاحظات | 34 | مدة الإعلان والأرشفة | listingActiveDays=30 | /api/site-settings | **PARTIAL** | Expiry automation not proven |
| الملاحظات | 35 | خلفية أبراج الاتحاد | Imagery | / | **PARTIAL** | Dubai assets still present |
| الملاحظات الجديدة | 1–26 | Auth/reset/i18n/jobs/admin follow-ups | Mixed code | — | **PARTIAL/BLOCKED** | See blockers A–G; no bulk PASS |
| لوحة التحكم | Export | Excel multi-sheet | /admin/reports + /api/admin/export | **PARTIAL** | Needs admin auth live download |
| التصنيفات | Jobs/Food/Furniture | Dynamic forms + Other approval | category-fields + option-suggestions | **PARTIAL** | Live APIs up; E2E blocked |
| الصلاحيات | Matrix | View/Add/Edit/Delete/Approve/Export | adminActionMatrix | **PARTIAL** | Server enforced; live matrix blocked |
| مضمون | Policy + flow | Policy pages + escrow APIs | /escrow-policy /dispute-policy | **PARTIAL/BLOCKED** | Pages 200; paid flow needs Stripe |

## 6) Blocker categorization (19+ items)

| Code | Category | Examples |
|------|----------|----------|
| A | Missing secret/config | CRON_SECRET, Stripe trio |
| B | Missing test account | Admin / verified user credentials |
| C | Missing real mailbox | OTP, welcome, reset, job emails |
| D | Stripe dependency | Featured pay, escrow hold/release, booking emails |
| E | Admin permission dependency | Export, form builder, option approve, RBAC save |
| F | Cron dependency | 48h/24h dispute reminders, expiry handling |
| G | External service dependency | Resend delivery proof, Vercel cron execution logs |

Ops requests recorded for A/C/B. Agent cannot set Vercel Production env without project token.

## 7) What must happen before READY FOR PRODUCTION

1. Set `CRON_SECRET` → verify `cronSecretConfigured=true` and unauthorized cron **401**; authorized run succeeds once each for 48h/24h without duplicates
2. Set Stripe LIVE keys + webhook → `stripeConfigured=true`; complete buyer→escrow→evidence→dispute E2E
3. Provide readable inbox + admin credentials → complete auth E2E and admin export/form/RBAC live tests
4. Re-run full 87-item matrix on https://sooqna.site against exact live commit
5. Only then set overall status to **READY FOR PRODUCTION** if PASS=87 with zero critical FAIL/PARTIAL/BLOCKED

## 8) Closure sprint artifacts (code, shipped via #265)

- Homepage: remove MarketEscrow section; soften escrow-forward hero/featured copy
- Category fields: food wholesale/retail; jobs vacancy/seeker; furniture Other + suggestion flow
- Legal: `/escrow-policy`, `/dispute-policy`, footer links
- Admin: Excel export UI; dynamic form builder; option suggestion review; RBAC action matrix
- i18n: additional EN phrases for new category/admin/policy strings

## Final verdict

**NOT READY FOR PRODUCTION**

Live Production still fails hard configuration gates (CRON + Stripe) and lacks authenticated E2E evidence. Spreadsheet PASS=87 is not achieved.
