# Vercel — AviatorPass (isolated)

## Live

| Item               | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| Project            | `dukkanify-technology-llcs-projects/aviatorpass`       |
| Production URL     | https://aviatorpass.vercel.app                         |
| Custom domains     | `dubai-test.blog`, `www.dubai-test.blog` (DNS pending) |
| Git production tip | Branch **`aviatorpass`** only                          |

## Isolation rules (mandatory)

1. **Production Branch** = `aviatorpass` (never marketplace `main`).
2. **Ignored Build Step** (or Git filter): build only `aviatorpass`, `develop`, and `cursor/*` / `feature/*` AviatorPass tips — skip unrelated product refs.
3. Deploy secrets must be AviatorPass-only: `VERCEL_AVIATORPASS_DEPLOY_HOOK` (preferred). Do **not** fall back to a shared marketplace deploy hook.
4. Marketplace Vercel project (`sooqna`) must not deploy AviatorPass branches; disconnect or ignore those refs there.

## Hostinger DNS (required for dubai-test.blog)

| Type  | Name  | Value                  |
| ----- | ----- | ---------------------- |
| A     | `@`   | `76.76.21.21`          |
| CNAME | `www` | `cname.vercel-dns.com` |

Or switch nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

## Dashboard tip

Vercel → Project **aviatorpass** → Settings → Git → set **Production Branch** to `aviatorpass` (API cannot change this field).

## Env

Use `.env.production.example` / `.env.staging.example` for AviatorPass. Data stores are `.data/aep-*.json` (never marketplace auth stores).
