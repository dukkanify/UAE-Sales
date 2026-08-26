# Staging domain — dubai-test.blog

Point **Hostinger DNS** at the **Vercel** project that serves AviatorPass so we can test on `https://dubai-test.blog`.

## Current state

| Check                  | Result                                                          |
| ---------------------- | --------------------------------------------------------------- |
| Domain registrar / DNS | Hostinger (`aurora.dns-parking.com` / `nebula.dns-parking.com`) |
| Live content today     | Hostinger parked page                                           |
| App hosting            | Vercel (AviatorPass project linked to this repo)                |
| Canonical staging URL  | `https://dubai-test.blog`                                       |

## 1) Add domain in Vercel

1. Open the **AviatorPass** Vercel project → **Settings → Domains**.
2. Add:
   - `dubai-test.blog`
   - `www.dubai-test.blog` (redirect → apex, or reverse)
3. Confirm the project Production branch is the AviatorPass tip you want (`aviatorpass`). Never point this AviatorPass Vercel project at unrelated product branches.

## 2) DNS at Hostinger (hPanel)

**Domains → dubai-test.blog → DNS / DNS Zone Editor**

Delete conflicting apex `A` / `CNAME` and `www` records, then add:

| Type  | Name  | Value                  | TTL |
| ----- | ----- | ---------------------- | --- |
| A     | `@`   | `76.76.21.21`          | 300 |
| CNAME | `www` | `cname.vercel-dns.com` | 300 |

(Use the exact values shown on the Vercel domain card if they differ.)

Keep Hostinger nameservers unless you intentionally switch to Vercel DNS (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`).

## 3) App env (Vercel → Environment Variables)

Set for **Production** (and Preview if you attach the domain there):

```bash
NEXT_PUBLIC_APP_URL=https://dubai-test.blog
NEXT_PUBLIC_APP_NAME=AviatorPass
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://dubai-test.blog/auth/callback
```

`trustedDomains` already includes `dubai-test.blog` in platform defaults.

## 4) Verify

```bash
dig +short dubai-test.blog A          # expect 76.76.21.21
curl -sI https://dubai-test.blog      # expect HTTP/2 200 + server: Vercel
curl -s https://dubai-test.blog/api/health?ready=1
```

SSL is issued automatically by Vercel after DNS validates (often minutes; up to ~48h worst case).
