# Frontend QA Report — Sooqna

- **Date:** 2026-08-03
- **Repo:** https://github.com/dukkanify/UAE-Sales
- **Targets:** `http://127.0.0.1:3000` (local) · `https://sooqna.site` (production)
- **Method:** Playwright Chromium — full-page screenshots, console/network capture, desktop 1440×900 + iPhone 13
- **Artifacts:** `artifacts/qa/2026-08-03/` (local) · `artifacts/qa/2026-08-03-prod/` (production)
- **Runner:** `scripts/frontend-qa-pass.mjs`

## Executive summary

| Severity | Count | Status |
|----------|------:|--------|
| Critical | 1 | Fixed — PR #86 |
| High | 1 | Fixed — PR #87 |
| Medium | 2 | Open (product stubs) |
| Low | 0 | — |

Automated route matrix: **25+ routes** loaded successfully (HTTP 200) on both local and production. Guest `/admin` correctly redirects to login.

---

## Summary table

| الصفحة | المشكلة | مستوى الخطورة | دليل |
|--------|---------|---------------|------|
| `/login?next=/admin` | إرسال النموذج كـ GET يضع البريد وكلمة المرور في الـ URL | **Critical** | `fixes/admin-login-before.png` + URL evidence · [PR #86](https://github.com/dukkanify/UAE-Sales/pull/86) |
| `/admin` (production) | بوابة الأدمن ترفض أحيانًا `sooqna_session` عند كون القيمة URI-encoded | **High** | curl double-encode → 307 · [PR #87](https://github.com/dukkanify/UAE-Sales/pull/87) |
| `/support` | صفحة دعم غير مكتملة (نص توضيحي فقط) | **Medium** | `desktop/support.png` / prod `support-manual.png` |
| `/disputes/new` | فتح نزاع غير مكتمل (نص توضيحي فقط) | **Medium** | `desktop/disputes__new.png` |

---

## Finding 1 — Critical: password leak in URL

### Steps to Reproduce
1. Open `/login?next=/admin`
2. Fill `admin@sooqna.demo` / `Admin@123`
3. Submit **before** client `onSubmit` attaches (slow JS / automation click)
4. Observe navigation to:
   ` /login?email=admin%40sooqna.demo&password=Admin%40123 `

### Evidence
- Screenshot before: `artifacts/qa/2026-08-03/fixes/admin-login-before.png`
- Form had **no `method`** → browser default **GET**
- Console: N/A (native navigation)

### Root cause
`LoginForm` / other auth forms used `onSubmit={useAsyncAction(...)}` without `method="post"`. Native submit serialized credentials into the query string.

### Component / files
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/RegisterForm.tsx`
- `features/auth/components/ForgotPasswordForm.tsx`
- `features/auth/components/CompleteAccountContent.tsx`
- `shared/hooks/useAsyncAction.ts`

### Proposed / applied fix
- `method="post"` on auth forms
- Synchronous `event.preventDefault()` in submit wrapper
- `useAsyncAction` calls `preventDefault` when used as a form handler

**PR:** https://github.com/dukkanify/UAE-Sales/pull/86

### After
- Screenshot: `artifacts/qa/2026-08-03/fixes/admin-login-after.png`
- Credentials no longer appear in the query string

---

## Finding 2 — High: admin session cookie parse on production

### Steps to Reproduce
1. `POST /api/auth/login/password` with admin demo credentials (returns 200 + `Set-Cookie`)
2. Send Cookie header with **double URI-encoded** JSON value
3. `GET /admin` → **307** to `/login?next=/admin`

### Evidence
```text
no_cookie     → 307 /login?next=/admin
normal cookie → 200 /admin
double-encode → 307 /login?next=/admin
```

Playwright sometimes stores the already-encoded `Set-Cookie` value and re-encodes on send, which matched production QA flakiness for `/admin`.

### Root cause
`proxy.ts` / `getSessionFromCookie()` only `JSON.parse(raw)`. URI-encoded payloads throw → role missing → admin gate redirect.

### Component / files
- `proxy.ts`
- `services/auth/session-cookie.ts`
- `services/auth/session-cookie-parse.ts` (new)

### Proposed / applied fix
Shared `parseSessionCookieValue()` tries raw JSON then `decodeURIComponent`.

**PR:** https://github.com/dukkanify/UAE-Sales/pull/87

---

## Finding 3–4 — Medium: incomplete support surfaces

| Route | Observation |
|-------|-------------|
| `/support` | Explainer only (“مركز الدعم سيضم…”) — not a working help center |
| `/disputes/new` | Explainer only (“واجهة فتح النزاع ستدعم…”) — not a working dispute form |

Screenshots: local `desktop/support.png`, `desktop/disputes__new.png`.

**Suggestion:** Either ship MVP forms or mark nav/CTAs as “قريبًا” consistently and avoid implying full functionality.

---

## Route coverage matrix

### Public / app routes (local + prod)
`/`, `/categories`, `/categories/cars`, `/search`, `/featured`, `/listings/mercedes-amg-g63-2024`, `/login`, `/register`, `/escrow`, `/wallet`, `/support`, `/disputes/new`, `/listings/new`, `/profile`, `/dashboard/listings`, `/chat`, `/checkout`, `/orders`, `/admin` (guest → login)

### Admin routes (local, after session cookie)
`/admin`, `/admin/analytics`, `/admin/listings`, `/admin/users`, `/admin/orders`, `/admin/settings` — all OK on local after API login.

### Responsive
Mobile (iPhone 13): home, search, listing detail, login, categories, admin gate — no horizontal overflow findings in automated pass.

### Performance (informational)
Local homepage ~1.4–2.0s to screenshot settle; production homepage ~2.4–3.4s in this run (includes cold network from the agent VM). No Lighthouse CI in this pass — optional follow-up.

### Console noise
Dev-only Turbopack HMR WebSocket handshake errors on local — ignored for severity. No Hydration overlay in the calibrated pass.

---

## How to re-run

```bash
npm install -D playwright@1.54.2
npx playwright install chromium
npm run dev   # terminal 1
node scripts/frontend-qa-pass.mjs http://127.0.0.1:3000
# or production:
# (use scripts/frontend-qa-pass-prod.mjs or edit OUT path)
node scripts/frontend-qa-pass-prod.mjs https://sooqna.site
```

---

## PRs opened from this QA pass

| Severity | Title | PR |
|----------|-------|----|
| Critical | Auth forms leak password in URL | [#86](https://github.com/dukkanify/UAE-Sales/pull/86) |
| High | Admin gate rejects URI-encoded session cookies | [#87](https://github.com/dukkanify/UAE-Sales/pull/87) |
