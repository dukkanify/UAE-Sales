# Credentials register (template) — AviatorPass

> **NEVER store real passwords, API secrets, or private keys in the repository.**  
> Fill this register in a **password manager** or sealed client vault. Share only over agreed secure channels after contractual payment milestones.

## Inventory

| #   | System                           | Account / project | Owner | Location of secret | Rotated | Notes                       |
| --- | -------------------------------- | ----------------- | ----- | ------------------ | ------- | --------------------------- |
| 1   | GitHub repository                | org/repo          |       | Invite / SSO       | ☐       | Source code access          |
| 2   | Vercel (frontend hosting)        | project           |       | Vercel team        | ☐       | Domain + env                |
| 3   | Production URL / DNS             |                   |       | Registrar          | ☐       | A/CNAME records             |
| 4   | SSL                              |                   |       | Vercel / CDN       | ☐       | Auto on custom domain       |
| 5   | Supabase project                 |                   |       | Supabase dashboard | ☐       | DB + Storage + keys         |
| 6   | `DATABASE_URL` / `DIRECT_URL`    |                   |       | Vercel env         | ☐       | Server only                 |
| 7   | `SUPABASE_SERVICE_ROLE_KEY`      |                   |       | Vercel env         | ☐       | Never `NEXT_PUBLIC_*`       |
| 8   | `AUTH_SECRET`                    |                   |       | Vercel env         | ☐       | ≥24 chars unique            |
| 9   | SMTP / email OTP provider        |                   |       | Provider + Vercel  | ☐       |                             |
| 10  | Zoom Developer (S2S OAuth)       |                   |       | Zoom + Vercel      | ☐       | Incl. webhook secret        |
| 11  | Stripe / payment gateway         |                   |       | Stripe + Vercel    | ☐       | Prefer `rk_live_…`          |
| 12  | Stripe webhook signing secret    |                   |       | Vercel env         | ☐       |                             |
| 13  | Analytics (if any)               |                   |       | Vendor             | ☐       |                             |
| 14  | Uptime / monitoring              |                   |       | Vendor             | ☐       | Probe `/api/health?ready=1` |
| 15  | Platform API keys (`aep_live_…`) |                   |       | Ops Center         | ☐       | Hash stored in app          |
| 16  | Super Admin login                |                   |       | OTP channel        | ☐       | Rotate demos                |
| 17  | Backup storage (offsite)         |                   |       | Vault              | ☐       | Copy of `.backups` / PITR   |

## Environment variable checklist

Copy names only from `.env.production.example`. Values live exclusively in the host secret store.

| Variable                         | Set in prod | Notes                       |
| -------------------------------- | ----------- | --------------------------- |
| `NEXT_PUBLIC_APP_URL`            | ☐           | Canonical HTTPS             |
| `NEXT_PUBLIC_APP_ENV=production` | ☐           |                             |
| `AUTH_SECRET`                    | ☐           |                             |
| `ENABLE_DEMO_OTP=false`          | ☐           | Required                    |
| Supabase trio + DB URLs          | ☐           | When cut over               |
| Zoom quartet                     | ☐           | Incl. `ZOOM_WEBHOOK_SECRET` |
| Stripe trio                      | ☐           |                             |

## Delivery log

| Item                       | Delivered to | Method       | Date | Confirmed |
| -------------------------- | ------------ | ------------ | ---- | --------- |
| Repo access                |              |              |      | ☐         |
| Hosting access             |              |              |      | ☐         |
| Env templates (no secrets) |              | Git          |      | ☐         |
| Live secrets               |              | Secure vault |      | ☐         |
| Admin accounts             |              |              |      | ☐         |

**Vendor contact:** dukkanify@gmail.com
