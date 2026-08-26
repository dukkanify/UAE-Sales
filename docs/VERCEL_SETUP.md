# Vercel — AviatorPass (dedicated GitHub repo)

## Project

| Item                        | Value                                            |
| --------------------------- | ------------------------------------------------ |
| Vercel project              | `dukkanify-technology-llcs-projects/aviatorpass` |
| GitHub repo (after cutover) | `dukkanify/AviatorPass`                          |
| Production URL              | https://aviatorpass.vercel.app                   |
| Production branch           | `main` (or `aviatorpass` during cutover)         |

## Cutover steps

1. Vercel → **aviatorpass** → Settings → Git → **Disconnect** `UAE-Sales`.
2. **Connect** `dukkanify/AviatorPass`.
3. Set Production Branch = `main`.
4. Ensure Deploy Hook secret in GitHub Environment matches this project only.
5. Push to `main` or fire `VERCEL_AVIATORPASS_DEPLOY_HOOK`.
6. Verify `/api/health` → `deployment.gitSha` matches new repo tip.

## Preview

PRs into `main` / `develop` on `dukkanify/AviatorPass` should create Vercel Preview deployments automatically once Git is connected.

## Isolation

This Vercel project must not be linked to marketplace repositories. Marketplace (`sooqna`) stays on its own Vercel project + `UAE-Sales` (or future Sooqna repo).
