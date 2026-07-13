# Sooqna — Production Deployment Guide

**Production domain:** [https://sooqna.site](https://sooqna.site)  
**WWW policy:** `www.sooqna.site` → `sooqna.site` (308 redirect via middleware)

---

## Prerequisites

- Node.js 20+
- Hosting with HTTPS (Vercel, Railway, etc.)
- DNS access for `sooqna.site`
- Stripe live-mode account

---

## Environment Variables

Copy production template:

```bash
cp .env.production.example .env.production
```

| Variable | Production value | Required |
|----------|------------------|----------|
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` | Yes — set at **build time** |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Yes |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Yes |
| `STRIPE_CURRENCY` | `aed` | Yes |
| `SESSION_COOKIE_DOMAIN` | `.sooqna.site` | Recommended |

`NEXT_PUBLIC_APP_URL` must be set before `npm run build` so metadata, sitemap, Stripe redirects, and JSON-LD use the correct domain.

---

## Build & Deploy

```bash
npm install
npm run lint
npm run build
npm run start
```

On Vercel / similar: set env vars in the dashboard, then deploy from `main`.

---

## Deploy Hook (Production)

Use a Vercel Deploy Hook when Git auto-deploy is blocked (e.g. rate limit) or you want an explicit production trigger from GitHub Actions.

### 1. Create the hook in Vercel

1. Open [Vercel Dashboard](https://vercel.com) → project **sooqna** (production domain: `sooqna.site`)
2. **Settings** → **Git** → **Deploy Hooks**
3. **Create Hook**
   - Name: `production-main`
   - Branch: `main`
4. Copy the generated URL (format: `https://api.vercel.com/v1/integrations/deploy/...`)

### 2. Add GitHub secret

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
   - Name: `VERCEL_DEPLOY_HOOK`
   - Value: paste the Deploy Hook URL from step 1

### 3. Automatic trigger

Workflow `.github/workflows/deploy-production.yml` runs on every push to `main` and calls the hook.

Manual trigger: **Actions** → **Deploy Production** → **Run workflow**.

### 4. Manual curl (optional)

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy"
```

Expected success response:

```json
{"job":{"id":"...","state":"PENDING","createdAt":...}}
```

> **Note:** Deploy Hooks still count toward your Vercel plan's daily deployment limit. If you see `Deployment rate limited — retry in 24 hours`, wait for the quota to reset or upgrade the plan before the hook can succeed.

---

## DNS Checklist

| Record | Type | Value | Notes |
|--------|------|-------|-------|
| Apex `@` | `A` or `ALIAS` | Hosting provider IP/CNAME | Primary site |
| `www` | `CNAME` | Hosting provider / apex | Middleware redirects to apex |

Verify:

```bash
dig sooqna.site
dig www.sooqna.site
```

---

## HTTPS

- Middleware enforces HTTPS in production when `x-forwarded-proto` is `http`
- HSTS header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## Stripe Webhook (Production)

**Endpoint URL:**

```
https://sooqna.site/api/webhooks/stripe
```

### Setup steps

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://sooqna.site/api/webhooks/stripe`
3. Events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`
5. Send test event and confirm `200` response

### Stripe Checkout redirect URLs (automatic)

| Flow | URL |
|------|-----|
| Success | `https://sooqna.site/checkout/success?orderId=[id]` |
| Cancel | `https://sooqna.site/checkout?listingId=...&payment=cancelled` |

---

## Session Cookies (Production)

Auth sets an HttpOnly cookie alongside `localStorage`:

| Attribute | Value |
|-----------|-------|
| Name | `sooqna_session` |
| Secure | `true` (production) |
| HttpOnly | `true` |
| SameSite | `Lax` |
| Domain | `.sooqna.site` |
| Path | `/` |

Cookie is set via `POST /api/auth/session` on login/register and cleared on logout.

---

## Middleware

`middleware.ts` handles:

- `www.sooqna.site` → `https://sooqna.site` (308)
- HTTP → HTTPS redirect in production
- HSTS response header

---

## Post-Deployment Tests

| # | Test | Expected |
|---|------|----------|
| 1 | Open `https://sooqna.site` | Site loads over HTTPS |
| 2 | Open `https://www.sooqna.site` | Redirects to apex |
| 3 | View `/sitemap.xml` | URLs use `https://sooqna.site` |
| 4 | View page source JSON-LD | Organization URL is `https://sooqna.site` |
| 5 | Login as demo user | Session cookie set (`sooqna_session`) |
| 6 | Logout | Cookie cleared |
| 7 | Buy Now → Checkout → Stripe | Redirect URLs use `sooqna.site` |
| 8 | Stripe webhook test event | `POST /api/webhooks/stripe` returns 200 |
| 9 | `npm run build` with prod env | No localhost in output metadata |

---

## Local Development

Local dev still uses `http://localhost:3000`:

```bash
cp .env.example .env.local
npm run dev
```

Stripe local webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Related Docs

- [DOMAIN_MIGRATION_REPORT.md](./DOMAIN_MIGRATION_REPORT.md)
- [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)
- [PAYMENT_FLOW_DOCUMENTATION.md](./PAYMENT_FLOW_DOCUMENTATION.md)
