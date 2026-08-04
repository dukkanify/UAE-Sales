# Security review — Task 022

**Date:** 2026-08-04  
**Related:** `docs/SECURITY.md`, `docs/FINAL_SECURITY_AUDIT.md`

## Summary

Critical dashboard scope IDOR and production demo-OTP/webhook fail-open paths were **remediated** in this task. Residual risks are primarily infrastructure (JSON SoR, in-memory rate limits) and defense-in-depth (CSRF coverage, CSP enforce).

## Findings

| ID         | Severity  | Status    | Finding                                                            | Remediation                                          |
| ---------- | --------- | --------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| SEC-022-01 | Critical  | **Fixed** | `/api/dashboard/metrics` honored client `scope` above caller role  | Role-rank gate + chart scoping                       |
| SEC-022-02 | High      | **Fixed** | Reports `scope=executive/admin` relied only on permission flags    | Explicit role checks; instructorId clamped           |
| SEC-022-03 | High      | **Fixed** | Zoom inbound webhook accepted unsigned bodies when secret unset    | Fail closed in production / when signature required  |
| SEC-022-04 | High      | **Fixed** | `ENABLE_DEMO_OTP` only warned in production                        | Hard throw when `NEXT_PUBLIC_APP_ENV=production`     |
| SEC-022-05 | High      | Open      | CSRF helper not applied to all cookie mutations                    | TD-012 — expand `enforceMutatingApiSecurity`         |
| SEC-022-06 | High      | Open      | Middleware trusts JWT without store revocation check               | TD-013 — validate session in middleware or short TTL |
| SEC-022-07 | Medium    | Accepted  | API keys with `admin:ops` / `mobile:full` bypass fine-grained RBAC | Documented; issue least-privilege keys               |
| SEC-022-08 | Medium    | Open      | CSP report-only + `unsafe-inline`/`unsafe-eval`                    | TD-005                                               |
| SEC-022-09 | Medium    | Open      | Upload AV hook stub                                                | Enable real AV in ops                                |
| SEC-022-10 | Medium    | Open      | Communication directory exposes emails to authenticated users      | Narrow fields / permission                           |
| SEC-022-11 | Critical* | Open*     | JSON filesystem SoR not HA-safe                                    | *Infrastructure — Supabase cutover TD-001            |

\* Treated as architecture/scalability critical rather than application bug.

## Controls verified

- OTP + session cookie HTTP-only; Secure in production
- Session token hash binding in `getCurrentSession`
- Production `AUTH_SECRET` strength enforcement
- RBAC `requirePermission` on domain APIs
- Upload MIME/extension validation
- Signed ops downloads
- Security headers + HSTS (prod)
- Activity / ops audit logging
- Health endpoints without PII inventory

## Pre-prod operator checklist

1. `ENABLE_DEMO_OTP=false`, unset `DEMO_OTP_CODE`
2. Strong unique `AUTH_SECRET`
3. Configure `ZOOM_WEBHOOK_SECRET` / Stripe webhook secrets before enabling live traffic
4. Rotate demo accounts
5. Prefer Supabase Storage over `public/uploads`
