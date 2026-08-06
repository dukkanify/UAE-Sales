# Vercel — AviatorPass

## Live

| Item               | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| Project            | `dukkanify-technology-llcs-projects/aviatorpass`       |
| Production URL     | https://aviatorpass.vercel.app                         |
| Custom domains     | `dubai-test.blog`, `www.dubai-test.blog` (DNS pending) |
| Git production tip | Branch **`aviatorpass`** (pushed from AviatorPass tip) |

## Why the first deploy showed Sooqna

The Vercel project was linked to GitHub repo `UAE-Sales` with **Production Branch = `main`**.  
`main` is still the marketplace (Sooqna). AviatorPass lives on feature tips / branch `aviatorpass`.

## What we fixed

1. CLI deploy of the AviatorPass working tree → production alias `aviatorpass.vercel.app`
2. Env vars: `NEXT_PUBLIC_APP_NAME=AviatorPass`, demo OTP, `AUTH_SECRET`, app URL
3. Ignored build step: only git refs `aviatorpass` and `cursor/rename-aviatorpass-0987` build; **`main` (Sooqna) is skipped**
4. Domains attached: `dubai-test.blog` + `www`

## Hostinger DNS (required for dubai-test.blog)

| Type  | Name  | Value                  |
| ----- | ----- | ---------------------- |
| A     | `@`   | `76.76.21.21`          |
| CNAME | `www` | `cname.vercel-dns.com` |

Or switch nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

## Dashboard tip

Vercel → Project **aviatorpass** → Settings → Git → set **Production Branch** to `aviatorpass` (API cannot change this field; ignore-build already blocks `main`).
