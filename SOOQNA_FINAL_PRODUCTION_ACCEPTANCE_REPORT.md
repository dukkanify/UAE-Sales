# Sooqna — Final Production Acceptance Report

**Date (UTC):** 2026-08-29 17:37
**Production host:** https://sooqna.site
**Spreadsheet:** تقرير_ملاحظات_سوقنا_الفنية_محدث_4.xlsx
**Sheets audited:** الملاحظات · الملاحظات الجديدة · لوحة التحكم · التصنيفات · الصلاحيات · مضمون

## Overall Status

# NOT READY FOR PRODUCTION

Critical blockers remain: Stripe Live unset, CRON_SECRET unset on sooqna Production, full authenticated E2E (inbox/admin accounts) unavailable to this auditor, and multiple spreadsheet category/dashboard/i18n/legal requirements incomplete.

## 1) Live deployment identity

| Field | Value |
|------|--------|
| Host tested | `https://sooqna.site` |
| Vercel project | **sooqna** |
| Environment | **Production** |
| Production commit | `4afbe8d3ae34be39e542a80d4585d4372e3e5859` |
| `main` SHA | `4afbe8d3ae34be39e542a80d4585d4372e3e5859` |
| Match | **PASS** — sooqna.site Production deploy matches `main` tip |
| Deployment ID | `6128709223` |
| Deployment URL | `https://sooqna-olpby1sze-dukkanify-technology-llcs-projects.vercel.app` |
| Deployment date | 2026-08-27T18:30:54Z |
| State | success |

Deployment assignment is correct; QA continued.

## 2) Production config snapshot (no secrets)

| Flag | Value |
|------|--------|
| sessionSecretConfigured | `True` |
| cronSecretConfigured | `False` |
| stripeConfigured | `False` |
| featuredCheckoutAvailable | `False` |
| databaseConfigured | `True` |
| resendConfigured | `True` |
| demoOtpServerEnabled | `False` |
| missing | `['CRON_SECRET', 'STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET']` |
| persistence | postgres / durable |
| unauthorized cron | HTTP **503** `CRON_SECRET_REQUIRED` (required 401) |
| Stripe webhook | HTTP **503** `STRIPE_NOT_CONFIGURED` |

## 3) Live smoke evidence (selected)

- Register API: **PASS** (`ok`, `needsVerification`, `emailDelivered`, **no otp field**)
- Support invalid: **PASS** fieldErrors; valid: **PASS** `emailed:true`
- Search suggest AR/EN: **PASS** HTTP 200 with items
- listingActiveDays: **30** via `/api/site-settings`
- disputeWindowDays: **7**
- English locale: `dir=ltr` but **366 Arabic visible tokens** remain → i18n **FAIL/PARTIAL**
- Arabic locale: `dir=rtl` `lang=ar`
- Footer Dukkanify credit+URL: **PASS**
- Homepage escrow financial mentions still present; MarketEscrow component still shipped
- Admin/notifications/activity APIs without session: **401** (expected)

## 4) Requirement matrix

| Sheet | ID | Requirement | Code | Production | E2E | Evidence | Result |
|------|----|-------------|------|------------|-----|----------|--------|
| الملاحظات | 1 | القائمة الرئيسية | EXISTS | menu pages load | no multi-browser flake repro | Header/menu live 200; intermittent flake not reproduced | **PARTIAL** |
| الملاحظات | 2 | دعوة التسجيل لغير المسجلين | EXISTS | login CTA present; register not in foote | no logged-out CTA full UX E2E | /login present on home; Join CTA incomplete evidence | **PARTIAL** |
| الملاحظات | 3 | الشروط والأحكام | EXISTS | /terms /privacy /escrow 200 | escrow/dispute POLICY pages missing | Legal pages partial: terms+privacy PASS; dedicated escrow/dispute policies FAIL | **PARTIAL** |
| الملاحظات | 4 | بيانات في صفحة إعلاناتي لحساب جديد | EXISTS | auth isolation not E2E without accounts | needs multi-user sessions | Code forces owner scope; live cross-account not proven | **BLOCKED** |
| الملاحظات | 5 | نسيت كلمة المرور | EXISTS | /forgot-password 200; reset-link API ok | reset complete flow BLOCKED without inbo | Forgot page+API smoke PASS; full reset E2E BLOCKED | **PARTIAL** |
| الملاحظات | 6 | إيميل ترحيبي | EXISTS | register emailDelivered true | welcome after verify not observed | Resend configured; welcome after verify not live-proven | **BLOCKED** |
| الملاحظات | 7 | إيميل عند الحجز | EXISTS | stripeConfigured false | booking/order emails need paid flows | Stripe missing blocks transaction emails | **BLOCKED** |
| الملاحظات | 8 | مكان حفظ البحث | EXISTS | saved searches UI in code (localStorage) | account-durable storage FAIL | localStorage max 8; not Postgres | **PARTIAL** |
| الملاحظات | 9 | التقديم على وظيفة | EXISTS | job apply APIs exist | optional message E2E BLOCKED | Auth required for apply | **PARTIAL** |
| الملاحظات | 10 | إيميل تأكيد التقديم على وظيفة | EXISTS | cannot verify delivery | needs apply+inbox | Email delivery not observed | **BLOCKED** |
| الملاحظات | 11 | اتجاه رقم الاتصال | EXISTS | RTL pages dir=rtl | phone mask direction not specifically ve | Prior RTL phone work in history; not re-verified this audit | **PARTIAL** |
| الملاحظات | 12 | منطق الفلاتر أسفل البحث | EXISTS | search filters present | ranking logic not proven live | Suggest API works | **PARTIAL** |
| الملاحظات | 13 | ترتيب التصنيفات | EXISTS | categories page 200 | dynamic engagement ranking not proven | Admin can reorder; auto ranking unclear | **PARTIAL** |
| الملاحظات | 14 | قائمة النوع والموديل في السيارات | EXISTS | brand/model fields in forms | live form interaction BLOCKED without au | Code has searchable brand/model constants | **PARTIAL** |
| الملاحظات | 15 | حالة السيارة جديدة أو مستعملة | EXISTS | condition fields for cars | live form BLOCKED | Code supports new/used | **PARTIAL** |
| الملاحظات | 16 | اختيار الألوان | EXISTS | color selects exist | visual swatch missing | Text colors PARTIAL vs swatch requirement | **PARTIAL** |
| الملاحظات | 17 | عدد الصور والفيديو وصورة الغلاف | EXISTS | media upload in add listing code | live upload E2E BLOCKED | Cover/reorder/video claimed in code; not live-proven | **PARTIAL** |
| الملاحظات | 18 | موقع السيارة أو الإعلان | EXISTS | location fields in forms | map precision E2E BLOCKED | Emirate/city fields exist | **PARTIAL** |
| الملاحظات | 19 | الدفع للإعلان المميز | EXISTS | featuredCheckoutAvailable false | Stripe Live missing | Cannot activate featured without payment config | **FAIL** |
| الملاحظات | 20 | تصنيف الطعام | MISSING | food fields not wholesale/retail | condition still new/used pattern | category-fields food lacks wholesale/retail | **FAIL** |
| الملاحظات | 21 | رقم التواصل من الملف التعريفي | EXISTS | profile phone autofill likely | live form BLOCKED | Not verified live | **PARTIAL** |
| الملاحظات | 22 | إلزام صورة المنتج | EXISTS | image required rules in forms | live create BLOCKED | Not E2E | **PARTIAL** |
| الملاحظات | 23 | تطوير الهيدر | EXISTS | header live | emirate selector mainly mobile | Desktop header emirate incomplete | **PARTIAL** |
| الملاحظات | 24 | تبسيط الفوتر | EXISTS | footer links present | ok | About/Support/Policies/Safety/Escrow/Contact links found | **PARTIAL** |
| الملاحظات | 25 | فتح النزاع من المعاملة | EXISTS | dispute from order in code | Stripe/order E2E BLOCKED | Dispute tied to escrow orders in code | **PARTIAL** |
| الملاحظات | 26 | الفترة الزمنية للنزاع والتنبيهات | EXISTS | cronSecretConfigured false; cron 503 | reminders cannot run | Dispute window settings exist (7 days) but cron secret missing | **FAIL** |
| الملاحظات | 27 | حقوق التطوير في الفوتر | EXISTS | Dukkanify credit+URL on home | footer credit verified | dukkanify.com link present | **PASS** |
| الملاحظات | 28 | مراجعة الإعلان قبل النشر | EXISTS | listingActiveDays=30; pending_review coe | full create→approve E2E BLOCKED | Moderation code on main; live admin approve not run | **PARTIAL** |
| الملاحظات | 29 | اعتماد الحساب الجديد عند الدخول | EXISTS | sessionSecretConfigured true; register w | verify→login cycle needs inbox | Register smoke PASS; activation cycle BLOCKED | **BLOCKED** |
| الملاحظات | 30 | تطوير آلية «مضمون» وتوثيق حالة المنتج | EXISTS | escrow evidence APIs in code | needs paid order | مضمون code exists; live payment BLOCKED by Stripe | **BLOCKED** |
| الملاحظات | 31 | تقييم المعلن بعد التفاعل أو الشراء | EXISTS | order rating exists | interaction review missing | Verified purchase path only | **PARTIAL** |
| الملاحظات | 32 | الأدمن الرئيسي والأدمن الفرعي والصلاحيات | EXISTS | module RBAC+save button in code | full View/Add/Edit/Delete/Approve/Export | Admin users page 401 without session | **PARTIAL** |
| الملاحظات | 33 | إدارة الأقسام والمدن من لوحة التحكم | EXISTS | admin categories CRUD partial | dynamic field builder MISSING | Categories admin page exists; field builder not admin-driven | **PARTIAL** |
| الملاحظات | 34 | مدة الإعلان العادي والأرشفة التلقائية | EXISTS | listingActiveDays=30 in site-settings | expiry/renew E2E BLOCKED | Config PASS; automation not live-proven | **PARTIAL** |
| الملاحظات | 35 | تغيير الخلفية إلى أبراج الاتحاد – أبوظبي | EXISTS | Abu Dhabi mentions present; Dubai still  | Etihad Towers specific asset not confirm | dubai_count high on home HTML; Abu Dhabi imagery PARTIAL | **PARTIAL** |
| الملاحظات الجديدة | 1 | تسجيل الدخول بعد إعادة إدخال البيانات | EXISTS | login API responds | re-login cycle needs verified account | Related to auth activation | **BLOCKED** |
| الملاحظات الجديدة | 2 | استعادة كلمة المرور ترسل بريداً غير صحيح | EXISTS | reset-link API ok | email template content not inbox-verifie | Cannot confirm wrong template without email | **BLOCKED** |
| الملاحظات الجديدة | 3 | موديل سنة السيارة – قائمة وكتابة | EXISTS | year fields in cars | live form BLOCKED | year fields in cars | **PARTIAL** |
| الملاحظات الجديدة | 4 | حالة السيارة نوعان فقط | EXISTS | new/used for cars | live form BLOCKED | new/used for cars | **PARTIAL** |
| الملاحظات الجديدة | 5 | إضافة الموقع الدقيق للسيارة | EXISTS | location fields | precise map E2E BLOCKED | location fields | **PARTIAL** |
| الملاحظات الجديدة | 6 | خيار لون آخر مع حقل كتابة | EXISTS | other color option in constants likely | live BLOCKED | other color option in constants likely | **PARTIAL** |
| الملاحظات الجديدة | 7 | تغيير صورة الغلاف الرئيسية | EXISTS | cover selection in code | live BLOCKED | cover selection in code | **PARTIAL** |
| الملاحظات الجديدة | 8 | عدد مفاتيح السيارة غير إلزامي | EXISTS | keys optional in fields | live BLOCKED | keys optional in fields | **PARTIAL** |
| الملاحظات الجديدة | 9 | الفيديو ضمن معرض الصور | EXISTS | gallery code | live product page media not fully audite | gallery code | **PARTIAL** |
| الملاحظات الجديدة | 10 | الإشعار يوجه إلى صفحة غير موجودة | EXISTS | notifications require auth | deep link 404 not reproduced without ses | notifications require auth | **BLOCKED** |
| الملاحظات الجديدة | 11 | الإعلان قيد المراجعة لا يظهر في لوحة التحكم | EXISTS | moderation sync in code | admin queue live E2E BLOCKED | moderation sync in code | **BLOCKED** |
| الملاحظات الجديدة | 12 | الحسابات الجديدة لا تظهر في المستخدمين | EXISTS | admin users 401 | cannot confirm new users appear without  | Register creates durable user; admin visibility unproven live | **BLOCKED** |
| الملاحظات الجديدة | 13 | البحث وفلترة الإعلانات في لوحة التحكم | EXISTS | admin listings page exists | filters E2E BLOCKED (401) | admin listings page exists | **PARTIAL** |
| الملاحظات الجديدة | 14 | اسم المطور في العقارات نصي | EXISTS | developer fields | live form BLOCKED | developer fields | **PARTIAL** |
| الملاحظات الجديدة | 15 | حالة الإلكترونيات جديد أو مستعمل فقط | EXISTS | electronics condition | live BLOCKED | electronics condition | **PARTIAL** |
| الملاحظات الجديدة | 16 | سجل الإشعارات والروابط | EXISTS | notifications page 200 shell | history/deeplink E2E needs auth | notifications page 200 shell | **BLOCKED** |
| الملاحظات الجديدة | 17 | اختيار تاريخ الهواتف بطريقة أسهل | EXISTS | mobile date fields | live BLOCKED | mobile date fields | **PARTIAL** |
| الملاحظات الجديدة | 18 | خيار أخرى في الأثاث المنزلي | MISSING | furniture other→admin approval not found |  | furniture other→admin approval not found | **FAIL** |
| الملاحظات الجديدة | 19 | تمييز إعلان وظيفة عن باحث عن عمل | MISSING | job vacancy vs seeker type missing |  | Jobs fields employer-shaped only | **FAIL** |
| الملاحظات الجديدة | 20 | غياب بريد تأكيد إضافة الإعلان | EXISTS | listing submitted email in notify paths | delivery not observed except jobs histor | listing submitted email in notify paths | **BLOCKED** |
| الملاحظات الجديدة | 21 | تأخر بريد الاستعادة وكلمة المرور الجديدة لا تعمل | EXISTS | reset flow code | full reset+login E2E BLOCKED | reset flow code | **BLOCKED** |
| الملاحظات الجديدة | 22 | تفعيل الدفع التجريبي وإخفاء اسم Stripe | EXISTS | stripeConfigured false; featuredCheckout | test payments blocked in production | Stripe not configured | **FAIL** |
| الملاحظات الجديدة | 23 | نموذج تواصل معنا يرفض بيانات مكتملة | EXISTS | invalid→fieldErrors; valid→200 emailed | contact form live verified | support API fieldErrors + success | **PASS** |
| الملاحظات الجديدة | 24 | اختيار الإمارة من الهيدر | EXISTS | emirate on mobile home | not full header desktop persistence prov | emirate on mobile home | **PARTIAL** |
| الملاحظات الجديدة | 25 | استبدال صور دبي بصور أبوظبي | EXISTS | Abu Dhabi present; Dubai still many ment |  | dubai_count=183 on home HTML | **PARTIAL** |
| الملاحظات الجديدة | 26 | إزالة الضمان المالي من الصفحة الرئيسية | EXISTS | homepage still mentions ضمان مالي / escr |  | MarketEscrow still on homepage | **FAIL** |
| لوحة التحكم | DASH-1 | الشريط العلوي — حالة المنصة / Stripe / رسوم / آخر تحديث / أزرار سريعة | EXISTS | admin pages exist; stripe status incompl | 401 without admin | admin pages exist; stripe status incomplete | **PARTIAL** |
| لوحة التحكم | DASH-2 | Date Range Selector افتراضي آخر 24 ساعة + 7/30/هذا الشهر/مخصص | EXISTS | analytics date ranges in code | live admin E2E BLOCKED | analytics date ranges in code | **PARTIAL** |
| لوحة التحكم | DASH-3 | KPIs: مستخدمون جدد، إعلانات جديدة/منشورة، مشاهدات، محادثات، طلبات، GMV، إيرادات، | EXISTS | KPI API exists | live BLOCKED | KPI API exists | **PARTIAL** |
| لوحة التحكم | DASH-4 | Charts: Users/Listings/Orders + GMV/Revenue/Refunds + Views/Favorites/Messages | EXISTS | charts in AdminAnalyticsPanel | live BLOCKED | charts in AdminAnalyticsPanel | **PARTIAL** |
| لوحة التحكم | DASH-5 | تصدير Excel بأوراق Summary/Users/Listings/Orders/Payments/Escrow/Disputes | MISSING | no Excel export found |  | No xlsx export implementation | **FAIL** |
| لوحة التحكم | DASH-6 | إجراءات سريعة تشغيلية | EXISTS | quick actions in admin UI | live BLOCKED | quick actions in admin UI | **PARTIAL** |
| لوحة التحكم | DASH-7 | قسم يحتاج تدخل الآن | EXISTS | needs attention section in code | live BLOCKED | needs attention section in code | **PARTIAL** |
| لوحة التحكم | DASH-8 | أداء السوق/التصنيفات | EXISTS | market performance partial | live BLOCKED | market performance partial | **PARTIAL** |
| لوحة التحكم | DASH-9 | آخر 10 نشاطات | EXISTS | latest activities | live BLOCKED | latest activities | **PARTIAL** |
| التصنيفات | CAT-1 | التصنيف الرئيسي: إضافة/تعديل/حذف/إخفاء/إعادة ترتيب | EXISTS | admin categories CRUD | live admin BLOCKED | admin categories CRUD | **PARTIAL** |
| التصنيفات | CAT-2 | التصنيف الفرعي: إضافة/تعديل/حذف/إخفاء/إعادة ترتيب وربط بالرئيسي | EXISTS | subcategories support partial | live BLOCKED | subcategories support partial | **PARTIAL** |
| التصنيفات | CAT-3 | أيقونة/صورة التصنيف مع معاينة | EXISTS | icon fields | upload preview live BLOCKED | icon fields | **PARTIAL** |
| التصنيفات | CAT-4 | تخصيص نموذج الإعلان لكل تصنيف (نوع الحقل، إلزامي/اختياري) | MISSING | dynamic form builder not admin-managed | fields in code constants | dynamic form builder not admin-managed | **FAIL** |
| التصنيفات | CAT-5 | إدارة قيم القوائم: جديد/مستعمل، مطورين، ألوان، أنواع/موديلات | EXISTS | brands/models/colors in code constants | admin list management incomplete | brands/models/colors in code constants | **PARTIAL** |
| التصنيفات | CAT-6 | تعطيل/تفعيل التصنيف دون حذف | EXISTS | enable/disable categories | live BLOCKED | enable/disable categories | **PARTIAL** |
| الصلاحيات | RBAC-1 | إنشاء أدمن فرعي | EXISTS | create sub-admin in AdminUsersPanel | live BLOCKED | create sub-admin in AdminUsersPanel | **PARTIAL** |
| الصلاحيات | RBAC-2 | صلاحيات View/Add/Edit/Delete/Approve/Export حسب الوحدات | PARTIAL | module flags only, not View/Add/Edit/Del |  | module flags only, not View/Add/Edit/Delete/Approve/Export matrix | **FAIL** |
| الصلاحيات | RBAC-3 | زر حفظ الصلاحيات بدون حفظ تلقائي | EXISTS | Save Permissions button in code | live BLOCKED | Save Permissions button in code | **PARTIAL** |
| الصلاحيات | RBAC-4 | رسالة نجاح بعد الحفظ | EXISTS | success message in code | live BLOCKED | success message in code | **PARTIAL** |
| الصلاحيات | RBAC-5 | Audit Log للصلاحيات | EXISTS | admin audit store | live BLOCKED | admin audit store | **PARTIAL** |
| الصلاحيات | RBAC-6 | منع التصعيد الذاتي وتعديل الأدمن الرئيسي | EXISTS | SELF_ESCALATION + CANNOT_MODIFY_SUPER_AD | live BLOCKED | SELF_ESCALATION + CANNOT_MODIFY_SUPER_ADMIN API | **PARTIAL** |
| مضمون | MAD-1 | دفع المشتري ضمن مضمون وظهور المعاملة للطرفين | EXISTS | orders need Stripe |  | stripeConfigured false | **BLOCKED** |
| مضمون | MAD-2 | رفع البائع صور/فيديو حديث للمنتج | EXISTS | seller proof UI/API exist | needs paid order | seller proof UI/API exist | **BLOCKED** |
| مضمون | MAD-3 | إرفاق التوثيق بالمعاملة وربطه بالإعلان | EXISTS | evidence store linked to order | needs paid order | evidence store linked to order | **BLOCKED** |
| مضمون | MAD-4 | تأكيد المشتري للمطابقة مع تاريخ/ملاحظة | EXISTS | buyer confirm match API | needs paid order | buyer confirm match API | **BLOCKED** |
| مضمون | MAD-5 | Audit trail كامل؛ لا استبدال صامت؛ ظهور للإدارة في النزاع | EXISTS | audit/evidence history in code | needs dispute+admin session | audit/evidence history in code | **BLOCKED** |

### Result counts (judged requirements)

- **PASS:** 2
- **PARTIAL:** 56
- **FAIL:** 10
- **BLOCKED:** 19
- **Total judged:** 87

## 5) Critical failures

| Sheet | ID | Problem | Live URL / evidence | Required fix |
|------|----|---------|---------------------|--------------|
| الملاحظات / الجديدة | 19 / 22 | Stripe unset; featured/checkout blocked | `/api/auth/status` stripeConfigured=false | Configure Stripe Live keys + webhook on sooqna Production |
| الملاحظات | 26 | Cron secret missing; unauthorized cron 503 not 401 | `POST /api/cron/dispute-reminders` | Set CRON_SECRET on sooqna Production and redeploy |
| الملاحظات الجديدة | 26 | Homepage escrow section still present | `/` + MarketEscrow | Remove homepage escrow promo per spreadsheet |
| الملاحظات | 20 | Food still not wholesale/retail | category-fields | Replace New/Used with commercial options |
| الملاحظات الجديدة | 19 | Job vacancy vs seeker missing | add listing jobs | Add listing type + dynamic fields |
| الملاحظات الجديدة | 18 | Furniture Other→admin approval missing | categories/fields | Implement suggestion approval flow |
| لوحة التحكم | DASH-5 | Excel export missing | `/admin/analytics` | Implement multi-sheet xlsx export |
| التصنيفات | CAT-4 | Admin dynamic form builder missing | `/admin/categories` | Admin-configurable fields per category |
| الصلاحيات | RBAC-2 | Full action matrix missing | `/admin/users` | View/Add/Edit/Delete/Approve/Export per module |
| الملاحظات / i18n | EN audit | Arabic UI strings remain in English | `/?` with sooqna-locale=en | Complete i18n for categories/home strings |
| الملاحظات | 3 | Escrow/Dispute policy pages incomplete | `/terms` `/privacy` only | Add dedicated Escrow Policy + Dispute Policy |

## 6) High priority / partial

- Listing moderation, notifications, activities, RBAC save UX, escrow evidence: **implemented in code on main**, but **not live E2E proven** without auth/admin/Stripe.
- Cars/electronics forms: **PARTIAL** (fields exist; swatches/full media UX not live-proven).
- Emirate selector: **PARTIAL** (mobile more complete than desktop header).
- Saved searches: **PARTIAL** (localStorage, not account-durable Postgres).
- Ratings: **PARTIAL** (purchase rating only; no interaction review).
- Abu Dhabi identity: **PARTIAL**; Dubai imagery/text still abundant.

## 7) Blocked items (external dependencies)

- Full Register→Verify→Login→Reset E2E (needs readable inbox / test accounts)
- Admin Users/Listings/Dashboard/RBAC live verification (needs Super Admin session)
- Featured / Orders / مضمون / Dispute reminder delivery (needs Stripe + CRON_SECRET)
- Email content verification for welcome/listing/booking templates (needs inbox)
- Cross-user data isolation & seller-only activity proof (needs multi accounts)

## 8) What passed live (narrow)

- Production deploy == `main` tip for sooqna
- Postgres auth persistence configured
- Register smoke without OTP leakage
- Contact form field-level errors + successful submit
- Search suggestions (AR/EN)
- Public legal/basic pages HTTP 200
- Footer Dukkanify credit
- Unauthenticated private APIs reject with 401
- `listingActiveDays=30`, `disputeWindowDays=7` configured

## 9) Strict conclusion

**NOT READY FOR PRODUCTION.**

Do not treat merged PRs, lint/build, or HTTP 200 as acceptance. Critical spreadsheet items remain FAIL/PARTIAL/BLOCKED on the live domain.