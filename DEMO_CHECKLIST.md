# Demo Checklist — UAE Sales

Complete this checklist **before every stakeholder presentation**.

**Date:** _______________  
**Presenter:** _______________  
**Environment:** _______________

---

## Environment Setup

- [ ] `npm install` completed
- [ ] `.env` configured (`DATABASE_URL`, `NEXT_PUBLIC_USE_API=true`, `SESSION_SECRET`)
- [ ] `npm run db:push` completed successfully
- [ ] `npm run db:seed` completed successfully
- [ ] `npm run dev` running on port 3000
- [ ] `http://localhost:3000` opens in browser

---

## Demo Accounts

- [ ] User login works — `user@uaesales.demo` / `User@123` / OTP `123456`
- [ ] Business login works — `company@uaesales.demo` / `Company@123` / OTP `123456`
- [ ] Admin login works — `admin@uaesales.demo` / `Admin@123` / OTP `123456`
- [ ] Logout clears session between role switches

---

## Core Flows

- [ ] **Homepage** loads with featured listings and categories
- [ ] **Search** returns Mercedes listing (`/search?q=مرسيدس`)
- [ ] **Listing detail** loads with images (`/listings/mercedes-amg-g63-2024`)
- [ ] **Images** display correctly — no broken or permanently gray placeholders
- [ ] **Chat** opens from listing and message sends successfully
- [ ] **Checkout** completes for Mercedes listing
- [ ] **Order detail** shows after purchase (`/orders`)
- [ ] **Confirm received** works on order detail page
- [ ] **Wallet** shows balance and transactions (`/wallet`)
- [ ] **Add listing** works as business seller (`/listings/new`)
- [ ] **My Listings** shows seller inventory (`/dashboard/listings`)
- [ ] **Admin dashboard** loads (`/admin`)
- [ ] **Admin users** page loads (`/admin/users`)
- [ ] **Admin listings** page loads (`/admin/listings`)
- [ ] **Admin escrow** page loads (`/admin/escrow`)
- [ ] **Admin reports** page loads (`/admin/reports`)

---

## Quality Checks

- [ ] No console errors on homepage (open DevTools → Console)
- [ ] No console errors on listing page
- [ ] No console errors during checkout
- [ ] No console errors on admin dashboard
- [ ] **Mobile quick check** — homepage readable at 375px width (DevTools device mode)
- [ ] **Mobile quick check** — listing page gallery usable on mobile
- [ ] RTL layout renders correctly

---

## Build Validation (run once before demo day)

- [ ] `npm run lint` passes
- [ ] `npm run build` passes

---

## Presentation Readiness

- [ ] `DEMO_SCRIPT.md` reviewed
- [ ] `DEMO_CREDENTIALS.md` accessible (second screen or printed)
- [ ] `INVESTOR_DEMO_NOTES.md` reviewed for Q&A
- [ ] Browser in full-screen or clean window (no unrelated tabs)
- [ ] Terminal / IDE hidden from screen share
- [ ] OTP rate limit clear (no failed login attempts in last 60 seconds)

---

## Sign-Off

| Check | Status |
|-------|--------|
| All critical items checked | ☐ Yes ☐ No |
| Ready to present | ☐ Yes ☐ No |

**Notes:**

_______________________________________________

_______________________________________________

---

## If Something Fails

| Issue | Quick fix |
|-------|-----------|
| Login error | `npm run db:push && npm run db:seed` |
| OTP rejected | Wait 60s, retry |
| Empty homepage | Re-run seed, restart dev server |
| Chat 404 | Use Mercedes listing (seller is linked to business account) |
| Admin blocked | Confirm admin credentials, not user account |

See `DEMO_SETUP.md` for full troubleshooting.
