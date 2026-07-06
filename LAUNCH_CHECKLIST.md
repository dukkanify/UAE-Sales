# Launch Checklist — UAE Sales

Use this checklist before going live. Mark each item after verification in staging/production.

## Environment & Infrastructure

- [ ] `DATABASE_URL` configured with SSL
- [ ] `SESSION_SECRET` set (≥ 32 chars, unique)
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain
- [ ] `NEXT_PUBLIC_USE_API=true`
- [ ] `npm run db:migrate:deploy` completed successfully
- [ ] Database backup enabled (daily automated)
- [ ] Optional: `REDIS_URL` / `UPSTASH_REDIS_REST_URL` configured
- [ ] Vercel production deployment green
- [ ] `npm run build` passes locally and in CI

## Auth

- [ ] Register new account works
- [ ] Login → OTP → session cookie set
- [ ] Logout clears session cookies
- [ ] Protected routes redirect to `/login` when unauthenticated
- [ ] `next` query param returns user after login
- [ ] Suspended user cannot access APIs (403)
- [ ] Rate limit triggers on repeated login/OTP (429)
- [ ] Admin login reaches `/admin`
- [ ] Non-admin blocked from `/admin` → `/admin/unauthorized`

## Listings

- [ ] Browse listings on homepage and `/search`
- [ ] Listing detail page loads with images
- [ ] Create listing at `/listings/new` (authenticated)
- [ ] Edit listing at `/listings/[slug]/edit` (owner)
- [ ] Dashboard listings at `/dashboard/listings`
- [ ] Favorites add/remove works

## Search

- [ ] Text search returns results
- [ ] Category filter works
- [ ] Price range filter works
- [ ] City/emirate filter works
- [ ] Sort (newest, price asc/desc) works
- [ ] Category page `/categories/[slug]` filters correctly

## Checkout

- [ ] `/checkout` requires authentication
- [ ] Order creation via API succeeds
- [ ] Order appears in `/orders`
- [ ] Order detail `/orders/[id]` loads

## Escrow

- [ ] `/escrow` page loads for authenticated users
- [ ] Escrow hold/release/refund API endpoints respond
- [ ] Escrow status reflected in order detail
- [ ] Dispute creation at `/disputes/new`

## Wallet

- [ ] `/wallet` requires authentication
- [ ] Balance displays correctly
- [ ] Transaction history loads

## Chat

- [ ] `/chat` requires authentication
- [ ] Conversation list loads
- [ ] Send text message works
- [ ] Send image attachment works (mock)
- [ ] Unread count updates
- [ ] Read status marks conversation read
- [ ] Listing preview in conversation works

## Notifications

- [ ] `/notifications` requires authentication
- [ ] Notification list loads
- [ ] Mark single notification read
- [ ] Mark all read works
- [ ] Unread badge count accurate

## Admin

- [ ] `/admin` dashboard loads for admin role
- [ ] Users management: verify/suspend
- [ ] Listings management: approve/reject/feature
- [ ] Orders overview loads
- [ ] Escrow management actions work
- [ ] Disputes resolution works
- [ ] Categories CRUD works
- [ ] Reports page loads
- [ ] Settings page loads
- [ ] Admin rate limiting active (no abuse)

## Responsive

- [ ] Homepage responsive (mobile, tablet, desktop)
- [ ] Search/filters usable on mobile
- [ ] Listing detail readable on mobile
- [ ] Chat UI usable on mobile
- [ ] Admin panel usable on tablet+
- [ ] RTL layout correct on all breakpoints

## Security

- [ ] Middleware blocks unauthenticated access to protected routes
- [ ] Admin routes enforce ADMIN role
- [ ] CSRF blocks cross-origin API mutations (403)
- [ ] Session cookies: HttpOnly, Secure, SameSite=Lax
- [ ] Security headers present (HSTS, X-Frame-Options, etc.)
- [ ] `robots.txt` disallows private routes
- [ ] Demo credentials removed or disabled in production
- [ ] No secrets in client bundle or git history

## SEO

- [ ] Root metadata (title, description, OG, Twitter) correct
- [ ] Listing pages have unique title/description/OG
- [ ] Category pages have unique title/description/OG
- [ ] `sitemap.xml` generates and includes key routes
- [ ] `robots.txt` accessible
- [ ] Listing JSON-LD structured data present
- [ ] Category JSON-LD structured data present
- [ ] Organization JSON-LD on root layout
- [ ] Canonical URLs use `NEXT_PUBLIC_APP_URL`

## Performance

- [ ] Lighthouse performance score ≥ 70 (mobile)
- [ ] Images use Next.js Image optimization
- [ ] No blocking client bundle regressions
- [ ] API response times acceptable under load
- [ ] Database queries indexed (listing search, sessions)

## Legal & Trust

- [ ] `/terms` loads
- [ ] `/privacy` loads
- [ ] `/escrow-policy` loads
- [ ] `/refund-policy` loads
- [ ] `/contact` loads
- [ ] `/safety` loads
- [ ] Footer links to legal pages work
- [ ] Legal text reviewed by counsel (replace placeholders)

## Monitoring

- [ ] Error tracking configured (Sentry or equivalent)
- [ ] Uptime monitoring on `/` and `/api/health`
- [ ] Log aggregation configured
- [ ] Alerting on 5xx error rate threshold

## Final Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | |
| Product | | | |
| Security | | | |
| Legal | | | |
