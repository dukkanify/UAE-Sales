# Add AviatorPass to Vercel

The GitHub repo already receives Vercel preview deployments from linked projects
(`uae-sales` / `sooqna`). To put **AviatorPass** on its own Vercel project:

## Option A — Dashboard (recommended)

1. Open [vercel.com/new](https://vercel.com/new)
2. Import **`dukkanify/UAE-Sales`** (or `AviatorPass` after rename)
3. Project name: **`aviatorpass`**
4. Framework: Next.js (auto)
5. Root directory: `.` (repo root)
6. Environment variables from `.env.staging.example`:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_APP_NAME=AviatorPass`
   - `NEXT_PUBLIC_APP_ENV=staging`
   - `NEXT_PUBLIC_AUTH_REDIRECT_URL`
   - `AUTH_SECRET`
   - `ENABLE_DEMO_OTP` / `DEMO_OTP_CODE` (staging only)
7. Deploy
8. Domains → add `dubai-test.blog` (see `docs/DOMAIN_DUBAI_TEST.md`)

## Option B — CLI (after `vercel login`)

```bash
npx vercel link --yes --project aviatorpass
npx vercel env pull .env.local   # optional
npx vercel --prod
```

## Production branch note

`uae-sales.vercel.app` currently serves marketplace (Sooqna) from `main`.
Point the new **aviatorpass** project Production Branch at the AviatorPass tip
(e.g. `cursor/rename-aviatorpass-0987` or your release branch), not marketplace `main`.
