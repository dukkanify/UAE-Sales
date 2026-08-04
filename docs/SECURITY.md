# Security guidelines

## Principles

1. Least privilege via RBAC (`constants/permissions.ts`)
2. Never trust client input — Zod + sanitize
3. Secrets only in server env — never `NEXT_PUBLIC_*`
4. Prefer deny by default for uploads and downloads
5. Log security-relevant events immutably

## Authentication & sessions

- OTP login with expiry (`AUTH_OTP_EXPIRY_MINUTES`)
- Session cookie: HTTP-only, Secure in production, SameSite=Lax
- JWT + raw token binding (`lib/security/session-token.ts`)
- Session revocation checked in `getCurrentSession`
- Production refuses weak default `AUTH_SECRET`

## CSRF

Mutating routes should call `enforceMutatingApiSecurity(request)` which:

- Applies IP blocklist when enabled
- Applies settings-based rate limit
- Requires `x-csrf-token` matching `aep_csrf` cookie

Browser clients use `authFetch` which attaches the CSRF header.

## XSS / injection

- React escapes by default
- `utils/sanitize.ts` for free-text
- CSP report-only in `next.config.ts` (tighten to enforcing after report review)
- Parameterized SQL when using Postgres migrations (no string-concat queries)

## File security

- `validateUpload` — size, MIME, extension alignment
- SVG blocked by default for branding
- `virusScanHook` stub for future AV
- Temporary signed URLs via `/api/ops/download`

## Audit

- Activity + audit writers in `services/auth/activity-log.ts`
- Ops logs in `services/ops/logging-service.ts`
- Financial / course / quiz / certificate / AI actions already emit activity keys

## Incident response (short)

1. Enable maintenance mode (`NEXT_PUBLIC_MAINTENANCE_MODE=true` or settings)
2. Rotate `AUTH_SECRET` and revoke sessions if compromise suspected
3. Export ops + activity logs
4. Restore last known-good backup after integrity test
