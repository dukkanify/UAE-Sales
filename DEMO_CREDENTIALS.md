# Demo Credentials — UAE Sales

Use these accounts for stakeholder presentations. All accounts share the same OTP code.

> **OTP for all accounts:** `123456`

---

## User (Buyer)

| Field | Value |
|-------|-------|
| Email | `user@uaesales.demo` |
| Password | `User@123` |
| OTP | `123456` |
| Display name | Ahmed Al Mansoori |
| Post-login | `/profile` |

**Use for:** browsing, search, chat, checkout, orders, wallet, notifications.

---

## Business (Seller)

| Field | Value |
|-------|-------|
| Email | `company@uaesales.demo` |
| Password | `Company@123` |
| OTP | `123456` |
| Display name | Emirates Motors LLC |
| Post-login | `/dashboard/listings` |
| Linked seller | Al Noor Motors (includes Mercedes G63 listing) |

**Use for:** add listing, edit listing, my listings, mark order delivered, wallet pending balance.

---

## Admin

| Field | Value |
|-------|-------|
| Email | `admin@uaesales.demo` |
| Password | `Admin@123` |
| OTP | `123456` |
| Display name | UAE Sales Admin |
| Post-login | `/admin` |

**Use for:** users, listings moderation, orders, escrow, disputes, reports.

---

## Quick Login Steps

1. Go to `/login`
2. Enter email and password from the table above
3. Click login — OTP screen appears
4. Enter `123456`
5. You are redirected to the role-appropriate dashboard

---

## Tips for Presenters

- Log out between role switches: profile menu → logout, or visit `/login` after clearing session
- If OTP is rejected, wait 60 seconds (rate limit: 10 attempts/minute per IP)
- Demo accounts are reset when you run `npm run db:seed`
- Do not share these credentials publicly outside controlled demo environments
