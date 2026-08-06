# Deployment guide

## Targets

| Layer                              | Platform                                              |
| ---------------------------------- | ----------------------------------------------------- |
| Web app                            | Vercel                                                |
| Database / Auth / Storage (target) | Supabase                                              |
| Current demo data                  | `.data/*.json` on the Node filesystem (local/preview) |

## Prerequisites

1. GitHub repository access
2. Vercel project linked to the repo
3. Env vars from `.env.production.example`
4. (Optional) Supabase project + `database/migrations` applied

## Branch strategy

1. Create `cursor/<feature>-0987` from previous task tip
2. Open PR → CI must pass (lint, typecheck, build)
3. Merge to `main`
4. Vercel production deploy from `main`; preview deploys per PR

## Vercel setup

1. Import repo → Framework: Next.js
2. Set env vars (Production + Preview separately)
3. Build command: `npm run build`
4. Output: Next default
5. Confirm `vercel.json` headers apply

## Custom domain (staging): dubai-test.blog

Full checklist: `docs/DOMAIN_DUBAI_TEST.md`.

1. Vercel → Settings → Domains → add `dubai-test.blog` (+ `www`)
2. Hostinger DNS Zone: apex `A` → `76.76.21.21`, `www` `CNAME` → `cname.vercel-dns.com`
3. Env: use `.env.staging.example` / set `NEXT_PUBLIC_APP_URL=https://dubai-test.blog`

## Supabase setup (when promoting off mocks)

1. Create project
2. Apply SQL in `database/migrations/` in order
3. Set `NEXT_PUBLIC_SUPABASE_URL`, anon key, service role
4. Configure Storage bucket `aep-uploads`
5. Enable PITR / daily backups in Supabase dashboard

## Rollback

### App rollback (Vercel)

1. Vercel → Deployments → promote previous production deployment
2. Or `git revert` + push to `main`

### Data rollback

1. Integrity-test backup: System logs → Test restore
2. Restore via ops API `action=restore` (destructive to `.data`)
3. For Supabase: point-in-time recovery per Supabase docs

## Post-deploy verification

```bash
curl -s https://<host>/api/health
curl -s https://<host>/api/health?ready=1
```

Walk `docs/PRODUCTION_CHECKLIST.md`.
