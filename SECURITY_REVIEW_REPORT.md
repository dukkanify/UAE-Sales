# Security Review Report — UAE Sales

**Date:** July 2026  
**Scope:** Production security hardening for Next.js App Router deployment  
**Status:** Phase 1 complete — ready for staging validation

## Executive Summary

UAE Sales has been hardened for production deployment with route-level middleware protection, signed session metadata for Edge-compatible role checks, CSRF origin validation, secure cookie settings, Zod input validation on critical API routes, standardized error responses, and rate limiting with Redis/Upstash readiness.

## 1. Authentication & Session Management

### Implemented

| Control | Location | Notes |
|---------|----------|-------|
| HTTP-only session cookie | `lib/auth/session.ts` | `uae-sales-session-token`, 7-day TTL |
| Secure cookie flag | `sessionCookieOptions()` | `secure: true` in production |
| SameSite=Lax | `sessionCookieOptions()` | Mitigates CSRF on cookie-based auth |
| Session invalidation | `getUserFromSessionToken()` | Expired and suspended users invalidated |
| Signed session meta | `lib/auth/session-meta.ts` | HMAC-SHA256 cookie for middleware role checks |
| `SESSION_SECRET` enforcement | `getSessionSecret()` | Required ≥ 32 chars in production |

### Session Flow

1. Login → OTP verification sets `uae-sales-session-token` + `uae-sales-session-meta`
2. Middleware verifies meta cookie HMAC and expiry
3. API routes validate full session against database via `requireAuth()` / `requireAdmin()`
4. Logout clears both cookies

### Recommendations (Phase 2)

- Rotate `SESSION_SECRET` with session invalidation procedure
- Add session device binding / refresh token rotation
- Implement account lockout after repeated failed OTP attempts

## 2. Route Protection (Middleware)

**File:** `middleware.ts`

### Protected Routes (auth required)

- `/dashboard/*`, `/profile`, `/listings/new`, `/wallet`, `/orders/*`
- `/chat/*`, `/notifications`, `/checkout`, `/escrow`, `/disputes/new`
- `/listings/[slug]/edit`, `/listings/local/[id]/edit`

### Admin Routes

- `/admin/*` requires `role === ADMIN`
- Non-admin users redirected to `/admin/unauthorized`
- Unauthenticated users redirected to `/login?next=...`

### Enforcement Mode

Active when `NEXT_PUBLIC_USE_API=true` **or** `NODE_ENV=production`.  
Mock/dev mode (`NEXT_PUBLIC_USE_API=false` in development) skips middleware for local UX.

## 3. CSRF Protection

**File:** `lib/auth/csrf.ts`

- Validates `Origin` or `Referer` on `POST`, `PUT`, `PATCH`, `DELETE` to `/api/*`
- Allowed origins: `NEXT_PUBLIC_APP_URL` + localhost in development
- Returns `403 FORBIDDEN` on mismatch

**Note:** SameSite=Lax cookies provide additional CSRF mitigation. For third-party API consumers, implement token-based auth separately.

## 4. Authorization (Server-Side)

**File:** `lib/auth/guards.ts`

| Guard | Behavior |
|-------|----------|
| `requireAuth()` | 401 if no session; 403 if suspended |
| `requireRole(roles)` | 403 if role not in allowed list |
| `requireAdmin()` | Shorthand for `requireRole(["ADMIN"])` |

All admin API routes call `requireAdmin()` before processing.

## 5. Input Validation (Zod)

**File:** `lib/api/validation.ts`

Validated endpoints include:

- Auth: login, register, verify-otp
- Listings: create, update, search
- Orders: create
- Chat: send message
- Favorites: add
- Disputes: create
- Escrow: hold, release, refund
- Admin: user/listing/dispute/escrow/category PATCH, category create
- Users: profile update

Invalid input returns `400 VALIDATION_ERROR` with Arabic message.

## 6. API Error Standardization

**File:** `lib/api/response.ts`

All API routes use `handleApiRoute()` wrapper:

```json
{ "code": "ERROR_CODE", "message": "رسالة بالعربية" }
```

Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`, `SERVER_ERROR`.

## 7. Rate Limiting

**Files:** `lib/auth/rate-limit.ts`, `lib/api/rate-limit.ts`, `lib/api/admin-rate-limit.ts`

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 10 / IP | 60s |
| Register | 10 / IP | 60s |
| OTP verify | 10 / IP | 60s |
| Chat messages | 30 / user | 60s |
| Orders create | 10 / user | 60s |
| Admin actions | 60 / admin | 60s |

**Store:** In-memory by default; `REDIS_URL` or `UPSTASH_REDIS_REST_URL` enables distributed limiting for multi-instance Vercel deployments.

## 8. Security Headers

**File:** `next.config.ts`

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security`
- `poweredByHeader: false`

## 9. SEO / Crawler Exposure

**File:** `app/robots.ts`

Disallows crawling of: `/admin`, `/api/`, `/dashboard/`, `/profile`, `/wallet`, `/orders`, `/chat`, `/notifications`, `/checkout`.

## 10. Known Risks & Mitigations

| Risk | Severity | Mitigation | Status |
|------|----------|------------|--------|
| In-memory rate limit on multi-instance | Medium | Configure Redis/Upstash | Documented |
| Mock payment provider | High (prod) | Set real `PAYMENT_PROVIDER` before launch | Placeholder |
| Demo admin credentials in seed | High (prod) | Remove/rotate before launch | Documented |
| Legal pages are placeholders | Medium | Replace with counsel-approved text | Placeholder |
| No dedicated audit log table | Low | Admin actions rate-limited; extend in Phase 2 | Deferred |
| CSRF relies on Origin header | Low | SameSite cookies + origin check | Acceptable |

## 11. Monitoring Recommendations

| Area | Tool | Action |
|------|------|--------|
| Error tracking | Sentry | Capture unhandled API and SSR errors |
| Logging | Vercel Logs / Axiom | Structured logs with request ID |
| API monitoring | Vercel Analytics / Datadog | Latency and 5xx alerts |
| Uptime | Better Uptime / Pingdom | Monitor `/` and `/api/health` |
| Admin audit | Custom audit table | Log admin PATCH actions with actor + target |

## 12. Pre-Launch Security Checklist

- [ ] `SESSION_SECRET` is unique 64-char random value
- [ ] `NEXT_PUBLIC_USE_API=true` in production
- [ ] Demo accounts removed or disabled
- [ ] Redis rate limiting configured for production
- [ ] Database SSL enforced (`sslmode=require`)
- [ ] Security headers verified in production
- [ ] Protected routes tested without session (expect redirect)
- [ ] Admin routes tested with non-admin user (expect unauthorized)
- [ ] CSRF tested with cross-origin mutation (expect 403)
- [ ] Rate limits tested on login/OTP (expect 429)

## Conclusion

Phase 1 security hardening meets acceptance criteria for protected routes, admin isolation, input validation, rate limiting readiness, and secure cookie configuration. Complete staging penetration testing and replace placeholder legal/payment integrations before public launch.
