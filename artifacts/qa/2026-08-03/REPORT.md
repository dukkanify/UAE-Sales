# Frontend QA — Resolution Report (with screenshots)

> **التقرير العربي الكامل مع الصور:**  
> [`تقرير-حل-الملاحظات.md`](./تقرير-حل-الملاحظات.md)

- **Date:** 2026-08-03  
- **Local shots:** `artifacts/qa/2026-08-03/{desktop,mobile,fixes}/`  
- **Prod shots:** `artifacts/qa/2026-08-03-prod/`  
- **Runner:** `npm run qa:frontend` · `node scripts/frontend-qa-pass.mjs`

---

## Status board

| # | Page | Issue | Severity | Status | Fix |
|---|------|-------|----------|--------|-----|
| 1 | Admin login | Password leaked in URL (GET form) | **Critical** | ✅ Merged | [PR #86](https://github.com/dukkanify/UAE-Sales/pull/86) |
| 2 | `/admin` | Session cookie URI-encoding rejected | **High** | ✅ Merged | [PR #87](https://github.com/dukkanify/UAE-Sales/pull/87) |
| 3 | Home cards | Grey / missing listing images | **High** | 🔶 Open | `AppImage` + image sources |
| 4 | `/support` | Stub explainer only | **Medium** | 🔶 Open | MVP or explicit Coming Soon |
| 5 | `/disputes/new` | Stub explainer only | **Medium** | 🔶 Open | MVP form or Coming Soon |

---

## Visual evidence

### Admin login (before)

![Admin login before](./fixes/admin-login-before.png)

### After submit / gate redirect

![Admin login after](./fixes/admin-login-after.png)

### Home — local (grey card images)

![Home local](./desktop/home.png)

### Home — production

![Home prod](../2026-08-03-prod/desktop/home.png)

### Home — mobile

![Home mobile](./mobile/home.png)

### Support stub

![Support](./desktop/support.png)

### Disputes stub

![Disputes](./desktop/disputes__new.png)

---

## Finding 1 — Critical ✅ password in URL

**Reproduce:** submit admin login before JS handlers attach →  
`/login?email=...&password=Admin%40123`

**Cause:** form defaulted to GET (no `method`).

**Fix applied:** `method="post"` + sync `preventDefault` + `useAsyncAction` hardening.  
**PR #86** merged to `main` and deployed.

---

## Finding 2 — High ✅ admin cookie parse

**Reproduce:** double URI-encoded `sooqna_session` → `/admin` returns 307 to login.

**Fix applied:** `parseSessionCookieValue()` (raw JSON then decode).  
**PR #87** merged to `main` and deployed.

---

## Finding 3 — High 🔶 grey listing images

Visible on local/prod/mobile home screenshots above.

**Next steps**
1. Network tab → `_next/image` / Unsplash failures  
2. Harden `AppImage` fallback  
3. Re-run `npm run qa:frontend` and compare `desktop/home.png`

---

## Finding 4–5 — Medium 🔶 stubs

`/support` and `/disputes/new` are explainers only (see screenshots).  
Ship MVP UI **or** mark CTAs as Coming Soon consistently.

---

## Close-out checklist

- [x] PR #86 merged + deployed  
- [x] PR #87 merged + deployed  
- [x] Screenshots saved under `artifacts/qa/2026-08-03*`  
- [ ] Fix grey listing images + new home screenshot  
- [ ] Product decision for support / disputes  
- [ ] Manual admin login on `https://sooqna.site/admin`
