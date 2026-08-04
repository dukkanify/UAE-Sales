# Dependency audit — Task 022

**Date:** 2026-08-04  
**Command:** `npm audit --omit=dev`, `npm outdated`

## Production audit (`npm audit --omit=dev`)

| Advisory                                  | Severity | Package                   | Notes                                                                                             |
| ----------------------------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| PostCSS CSS stringify / source map issues | High     | `next` → nested `postcss` | Fix path suggests Next 16 (`npm audit fix --force`) — **breaking**; defer to planned Next upgrade |
| sharp / libvips CVEs                      | High     | `sharp` via `next`        | Same — bundled with Next image pipeline                                                           |

**Decision:** Do **not** force Next 16 in Task 022 (no major upgrades mid-audit). Track as TD-014. Re-evaluate on next platform upgrade window.

## Extraneous packages

Observed `extraneous` wasm/emnapi packages under `node_modules` (often transitive optional installs). Not declared in `package.json`. Safe to ignore or prune with clean install on CI images.

## Outdated (selected)

| Package         | Current | Latest | Action                               |
| --------------- | ------- | ------ | ------------------------------------ |
| `next`          | 15.5.x  | 16.x   | Schedule major upgrade               |
| `@supabase/ssr` | 0.7     | 0.12   | Upgrade with Supabase cutover        |
| `stripe`        | 18.x    | 22.x   | Upgrade with live payments hardening |
| `recharts`      | 2.x     | 3.x    | Major — test charts                  |
| `lucide-react`  | 0.544   | 1.x    | Major                                |
| `prisma`        | 6.x     | 7.x    | With schema expansion                |

Patch-level updates within current majors are low risk; majors need dedicated PRs.

## Unused / optional

| Package         | Role                     | Keep?                 |
| --------------- | ------------------------ | --------------------- |
| `prisma`        | Dev schema tooling       | Yes (cutover path)    |
| `@supabase/*`   | Target auth/storage      | Yes                   |
| `@types/stripe` | Types (stripe ships own) | Optional remove later |
| `qrcode`        | Certificate verify       | Yes                   |

## License

`UNLICENSED` proprietary app. Dependencies are primarily MIT/Apache — compatible for proprietary distribution. Confirm Stripe/Supabase Terms for production.

## Recommendation

1. Keep Next 15 until Task 022 audit merges.
2. Open TD-014 for Next 16 + nested advisory cleanup.
3. On Supabase cutover PR, bump `@supabase/*`.
4. Run `npm audit` in CI (warn) without `--force`.
