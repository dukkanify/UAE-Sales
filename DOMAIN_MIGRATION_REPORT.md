# Sooqna — Domain Migration Report

**Date:** 2026-07-10  
**Production domain:** `https://sooqna.site`  
**Previous domain references:** `sooqna.ae`, `localhost:3000` (production fallbacks), `your-domain.com`

---

## Executive Summary

Production URLs now resolve to `https://sooqna.site`. Localhost is used only in local development. Middleware redirects `www` to apex and enforces HTTPS. Secure session cookies are configured for production auth.

| Check | Status |
|-------|--------|
| No localhost in production code paths | ✅ |
| `NEXT_PUBLIC_APP_URL` defaults to `https://sooqna.site` in production | ✅ |
| SEO URLs (sitemap, robots, metadata, JSON-LD) | ✅ |
| Stripe redirect URLs | ✅ |
| Stripe webhook target documented | ✅ |
| www → apex redirect | ✅ |
| Secure auth cookies | ✅ |
| `npm run lint` | ✅ |
| `npm run build` | ✅ |

---

## URLs Updated

| Surface | Before | After |
|---------|--------|-------|
| `BRAND.domain` | `sooqna.ae` | `sooqna.site` |
| `metadataBase` | `https://sooqna.ae` | `getAppUrl()` → `https://sooqna.site` |
| Open Graph `url` | (missing) | `https://sooqna.site` |
| Canonical | (missing) | `/` (relative to metadataBase) |
| Twitter metadata | Relative to old base | Relative to `sooqna.site` |
| JSON-LD Organization | `https://sooqna.ae` | `https://sooqna.site` |
| JSON-LD WebSite | `https://sooqna.ae` | `https://sooqna.site` |
| `sitemap.xml` | `https://sooqna.ae/*` | `https://sooqna.site/*` |
| `robots.txt` sitemap | `https://sooqna.ae/sitemap.xml` | `https://sooqna.site/sitemap.xml` |
| Stripe success URL | env or localhost | `https://sooqna.site/orders/[id]?payment=success` |
| Stripe cancel URL | env or localhost | `https://sooqna.site/checkout?listingId=...&payment=cancelled` |
| Auth `?next=` redirects | Relative paths | Unchanged (correct — same-origin) |
| Chat login redirect | Relative paths | Unchanged (correct) |

---

## Files Changed

| File | Change |
|------|--------|
| `shared/constants/site.ts` | **New** — `getAppUrl()`, production default `https://sooqna.site` |
| `shared/constants/brand.ts` | `domain: "sooqna.site"` |
| `services/payments/payment-config.ts` | Removed localhost fallback; re-exports `getAppUrl` from site |
| `app/layout.tsx` | `metadataBase`, canonical, Open Graph URL |
| `shared/components/BrandJsonLd.tsx` | Organization + WebSite schema URLs |
| `app/sitemap.ts` | Base URL from `getAppUrl()` |
| `app/robots.ts` | Base URL from `getAppUrl()` |
| `middleware.ts` | **New** — www redirect, HTTPS, HSTS |
| `services/auth/session-cookie.ts` | **New** — Secure/HttpOnly/SameSite cookies |
| `services/auth/session-sync.ts` | **New** — Client cookie sync |
| `app/api/auth/session/route.ts` | **New** — POST/DELETE session cookie |
| Auth forms + logout | Cookie sync on login/register/logout |
| `.env.example` | Localhost for dev only |
| `.env.production.example` | `https://sooqna.site` |
| `PRODUCTION_DEPLOYMENT_GUIDE.md` | **New** |

---

## Environment Variables Required (Production)

```env
NEXT_PUBLIC_APP_URL=https://sooqna.site
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=aed
SESSION_COOKIE_DOMAIN=.sooqna.site
```

**Critical:** Set `NEXT_PUBLIC_APP_URL` before `npm run build` on the hosting platform.

---

## Stripe Webhook Configuration

| Setting | Value |
|---------|-------|
| Endpoint | `https://sooqna.site/api/webhooks/stripe` |
| Mode | Live |
| Events | `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` |

Do **not** register `www.sooqna.site` — use apex only (www redirects).

---

## DNS Checklist

- [ ] Apex `sooqna.site` A/ALIAS record points to hosting provider
- [ ] `www.sooqna.site` CNAME configured (redirect handled by middleware)
- [ ] SSL/TLS certificate issued for `sooqna.site` and `www.sooqna.site`
- [ ] Verify HTTPS: `curl -I https://sooqna.site`
- [ ] Verify www redirect: `curl -I https://www.sooqna.site` → `308` to apex

---

## Cookie Configuration (Production)

| Attribute | Value |
|-----------|-------|
| Name | `sooqna_session` |
| Secure | `true` |
| HttpOnly | `true` |
| SameSite | `Lax` |
| Domain | `.sooqna.site` |
| Path | `/` |
| Max-Age | 30 days |

Local development omits `domain` and `secure` for `localhost` compatibility.

---

## Post-Deployment Test Results

Tests run at build/validation time in this environment:

| Test | Result |
|------|--------|
| `npm run lint` | ✅ Pass |
| `npm run build` | ✅ Pass |
| Production `getAppUrl()` without env | ✅ Returns `https://sooqna.site` when `NODE_ENV=production` |
| No hardcoded `localhost` in `app/`, `shared/`, `services/` | ✅ Verified (localhost only in dev docs + `.env.example`) |
| Middleware www redirect logic | ✅ Implemented |
| Session cookie API route | ✅ `POST/DELETE /api/auth/session` |

### Manual tests required on live deployment

| Test | Expected |
|------|----------|
| HTTPS on `sooqna.site` | Valid certificate, no mixed content |
| `www` redirect | 308 to `https://sooqna.site` |
| Login → cookie | `sooqna_session` set with Secure + HttpOnly |
| Stripe checkout | Success/cancel URLs on `sooqna.site` |
| Webhook delivery | Stripe dashboard shows `200` for test event |
| `/sitemap.xml` | All entries use `https://sooqna.site` |

---

## Local Development (Unchanged)

- Dev server: `http://localhost:3000`
- `.env.local`: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Demo flows and mock Stripe fallback preserved

---

## Acceptance Criteria

| Criterion | Met |
|-----------|-----|
| No production URL uses localhost | ✅ |
| HTTPS enforced in production middleware | ✅ |
| Auth cookies configured (Secure/HttpOnly/SameSite) | ✅ |
| Stripe redirects use `sooqna.site` | ✅ |
| Webhook endpoint documented at apex URL | ✅ |
| SEO URLs use `sooqna.site` | ✅ |
| www redirects to sooqna.site | ✅ |
| Build passes | ✅ |
