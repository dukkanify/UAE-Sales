# Frontend QA Report — Sooqna

- **Base URL:** https://sooqna.site
- **Generated:** 2026-08-03T14:20:43.232Z
- **Routes probed:** 25
- **Findings:** 1

## Summary table

| الصفحة | المشكلة | مستوى الخطورة | دليل |
|--------|---------|---------------|------|
| `/admin` (desktop) | تعذر تسجيل دخول الأدمن التجريبي — لوحة التحكم غير قابلة للاختبار | **High** | desktop/admin-login-result.png |

## Detailed findings

### 1. [High] /admin — تعذر تسجيل دخول الأدمن التجريبي — لوحة التحكم غير قابلة للاختبار

- **Viewport:** desktop
- **Evidence:** api=200 body={"ok":true,"user":{"id":"demo-admin-001","accountType":"company","city":"دبي","email":"admin@sooqna.demo","fullName":"Sooqna Admin","isVerified":true,"joinedAt" ended at https://sooqna.site/login?next=%2Fadmin
- **Expected component:** features/auth + proxy.ts admin gate + demo accounts
- **Screenshot:** `desktop/admin-login-result.png`

## Route results

| Route | Viewport | Status | Load ms | OK | Final URL |
|-------|----------|--------|---------|----|-----------|
| `/` | desktop | 200 | 3401 | ✅ | https://sooqna.site/ |
| `/categories` | desktop | 200 | 2410 | ✅ | https://sooqna.site/categories |
| `/categories/cars` | desktop | 200 | 1609 | ✅ | https://sooqna.site/categories/cars |
| `/search` | desktop | 200 | 2090 | ✅ | https://sooqna.site/search |
| `/featured` | desktop | 200 | 1671 | ✅ | https://sooqna.site/featured |
| `/listings/mercedes-amg-g63-2024` | desktop | 200 | 1393 | ✅ | https://sooqna.site/listings/mercedes-amg-g63-2024 |
| `/login` | desktop | 200 | 1416 | ✅ | https://sooqna.site/login |
| `/register` | desktop | 200 | 1314 | ✅ | https://sooqna.site/register |
| `/escrow` | desktop | 200 | 1318 | ✅ | https://sooqna.site/escrow |
| `/wallet` | desktop | 200 | 1295 | ✅ | https://sooqna.site/wallet |
| `/support` | desktop | 200 | 1328 | ✅ | https://sooqna.site/support |
| `/disputes/new` | desktop | 200 | 1311 | ✅ | https://sooqna.site/disputes/new |
| `/listings/new` | desktop | 200 | 1306 | ✅ | https://sooqna.site/listings/new |
| `/profile` | desktop | 200 | 1311 | ✅ | https://sooqna.site/profile |
| `/dashboard/listings` | desktop | 200 | 1426 | ✅ | https://sooqna.site/dashboard/listings |
| `/chat` | desktop | 200 | 1299 | ✅ | https://sooqna.site/chat |
| `/checkout` | desktop | 200 | 1332 | ✅ | https://sooqna.site/checkout |
| `/orders` | desktop | 200 | 1378 | ✅ | https://sooqna.site/orders |
| `/admin` | desktop | 200 | 1328 | ✅ | https://sooqna.site/login?next=%2Fadmin |
| `/` | mobile | 200 | 1558 | ✅ | https://sooqna.site/ |
| `/search` | mobile | 200 | 1393 | ✅ | https://sooqna.site/search |
| `/listings/mercedes-amg-g63-2024` | mobile | 200 | 1262 | ✅ | https://sooqna.site/listings/mercedes-amg-g63-2024 |
| `/login` | mobile | 200 | 1374 | ✅ | https://sooqna.site/login |
| `/categories` | mobile | 200 | 1275 | ✅ | https://sooqna.site/categories |
| `/admin` | mobile | 200 | 1357 | ✅ | https://sooqna.site/login?next=%2Fadmin |

## Admin login

```json
{
  "ok": false,
  "reason": "api=200 body={\"ok\":true,\"user\":{\"id\":\"demo-admin-001\",\"accountType\":\"company\",\"city\":\"دبي\",\"email\":\"admin@sooqna.demo\",\"fullName\":\"Sooqna Admin\",\"isVerified\":true,\"joinedAt\" ended at https://sooqna.site/login?next=%2Fadmin"
}
```
