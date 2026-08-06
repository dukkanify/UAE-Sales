# Infrastructure handover — AviatorPass

Fill operator-specific IDs/URLs at go-live. Architecture detail: `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`.

## Service map

| Layer                   | Platform (recommended)         | Status                     | Notes                           |
| ----------------------- | ------------------------------ | -------------------------- | ------------------------------- |
| Frontend hosting        | Vercel                         | Configure                  | Next.js App Router              |
| Backend / BFF           | Same Next.js deployment        | Included                   | Route handlers                  |
| Database (target)       | Supabase Postgres              | Optional cutover           | Migrations `001`–`017`          |
| Database (current demo) | `.data/*.json`                 | Local/single-node          | Not multi-instance safe         |
| Object storage          | Supabase Storage `aep-uploads` | Optional                   | Else `public/uploads`           |
| SMTP / email            | ESP via settings + secrets     | Configure                  | OTP + notifications             |
| Zoom                    | Zoom Server-to-Server OAuth    | Configure                  | Live classes                    |
| Payment gateway         | Stripe                         | Configure                  | Mock until keys set             |
| Domain                  | Client DNS → Vercel            | Staging: `dubai-test.blog` | See `docs/DOMAIN_DUBAI_TEST.md` |
| SSL                     | Vercel automatic               | Configure                  | HTTPS only                      |
| CDN                     | Vercel Edge                    | Included                   | Static cache headers            |
| Scheduled backups       | Cron / Ops UI                  | Configure                  | `npm run backup*`               |
| Queue / jobs            | In-app platform queue          | Limited                    | Upgrade worker later            |
| Monitoring              | Uptime + Ops Center            | Configure                  | `/api/health?ready=1`           |
| Logging                 | Ops + activity logs            | Included                   | Super Admin UIs                 |

## DNS / SSL checklist

Staging host: **`dubai-test.blog`** — step-by-step in `docs/DOMAIN_DUBAI_TEST.md`.

1. Add custom domain in Vercel (`dubai-test.blog`, `www.dubai-test.blog`).
2. Create DNS records as Vercel instructs (A/CNAME) in Hostinger.
3. Wait for SSL issuance.
4. Set `NEXT_PUBLIC_APP_URL` to canonical HTTPS URL (`https://dubai-test.blog`).
5. Verify `curl https://dubai-test.blog/api/health?ready=1`.

## Scheduled jobs

| Job             | Cadence             | How                              |
| --------------- | ------------------- | -------------------------------- |
| Daily backup    | Nightly             | `npm run backup` or Ops → backup |
| Weekly backup   | Weekly              | `npm run backup:weekly`          |
| Monthly backup  | Monthly             | `npm run backup:monthly`         |
| Health snapshot | On-demand / monitor | Ops Center → Snapshot health     |
| Queue drain     | On webhook / export | `/api/v1/platform/queue`         |

## Integrations wiring

| Integration | Env keys                                                                         | Verify                        |
| ----------- | -------------------------------------------------------------------------------- | ----------------------------- |
| Zoom        | `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_WEBHOOK_SECRET` | Create test meeting / webhook |
| Stripe      | `STRIPE_*`, publishable key                                                      | Test checkout + webhook       |
| Supabase    | URL, anon, service role, DB URLs                                                 | Apply migrations + bucket     |
| SMTP        | Provider settings in Platform Settings + secrets                                 | Send OTP                      |

## Ownership transfer

| Asset          | From             | To     | Date |
| -------------- | ---------------- | ------ | ---- |
| Vercel project | Vendor           | Client | ____ |
| GitHub repo    | Vendor           | Client | ____ |
| Supabase       | Vendor           | Client | ____ |
| Domain         | Client           | —      | ____ |
| Zoom / Stripe  | Client or Vendor | Client | ____ |

Secrets: use `docs/CREDENTIALS_REGISTER.md` (external vault only).
