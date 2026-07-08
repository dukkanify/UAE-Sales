# Sooqna — Testing Guide

**Last updated:** July 5, 2026

## Demo Accounts

All demo accounts use the same OTP code.

| OTP Code | `123456` |
|----------|----------|

---

### Demo User (Individual)

| Field | Value |
|-------|-------|
| Email | `user@sooqna.demo` |
| Password | `User@123` |
| Phone | `0501234567` |
| OTP | `123456` |
| Role | User / Individual |
| Name | Ahmed Al Mansoori |
| Emirate | Dubai |
| Verified | Yes |
| Wallet | 18,750 AED |
| Listings | 8 |
| Favorites | 32 |
| After login | `/profile` |

---

### Demo Business Account

| Field | Value |
|-------|-------|
| Email | `company@sooqna.demo` |
| Password | `Company@123` |
| Phone | `0551234567` |
| OTP | `123456` |
| Role | Business |
| Name | Emirates Motors LLC |
| Emirate | Abu Dhabi |
| Verified | Yes |
| Subscription | Premium |
| Listings | 186 |
| Employees | 12 |
| After login | `/dashboard/listings` |

---

### Demo Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@sooqna.demo` |
| Password | `Admin@123` |
| Phone | `0521234567` |
| OTP | `123456` |
| Role | Admin |
| Name | Sooqna Admin |
| Verified | Yes |
| After login | `/dashboard/listings` (no `/admin` route yet) |

---

## How to Test Login

1. Open `/login`
2. Use credentials from the **Demo Accounts** panel on the page (or table above)
3. Click **تسجيل الدخول**
4. Enter OTP: `123456` in the six-digit fields
5. Click **تأكيد الرمز**
6. You should land on:
   - User → `/profile`
   - Business → `/dashboard/listings`
   - Admin → `/dashboard/listings`

### Login by phone

You can use the phone number instead of email (e.g. `0501234567` + `User@123`).

### Invalid credentials

Wrong email/password shows an Arabic error directing you to the demo accounts panel.

### Invalid OTP

Any OTP other than `123456` shows an error. Use `123456` for all demo accounts.

---

## How to Test Register

1. Open `/register`
2. Fill the form and submit
3. On OTP step, enter `123456`
4. Account is saved to localStorage and redirects to `/profile`

---

## How to Test Search

1. Open `/search` or use homepage search
2. Try filters: emirate, category, price, condition
3. Use filter chips to remove active filters
4. Save a search from the sidebar panel
5. Empty state appears when no results match

---

## How to Test Add Listing

1. Log in as demo user
2. Go to `/listings/new`
3. Complete the 3-step form (category → details → media/contact)
4. Publish — listing appears in dashboard and search (localStorage merge)

---

## How to Test Dashboard

1. Log in as **Business** or **Admin** → `/dashboard/listings`
2. Log in as **User** → `/profile` or `/dashboard/listings`
3. Dashboard shows: analytics panel, listing tabs, stat cards
4. Local listings can be edited/deleted

---

## How to Test Listing Detail

1. Open any listing from homepage, search, or categories
2. Verify: gallery thumbnails, sticky price card, seller panel, escrow card
3. Related listings and recently viewed sections load

---

## How to Test Wallet / Escrow / Chat

| Route | What to check |
|-------|---------------|
| `/wallet` | Balance summary, transaction list |
| `/escrow` | Active escrow deals, status cards |
| `/chat` | Message threads with seller avatars |

---

## Validation Commands

```bash
npm run lint
npm run build
```

Both must pass before release.

---

## Demo Data Location

| Data | File |
|------|------|
| Demo accounts | `mock/demo-accounts.mock.ts` |
| Listings | `mock/listings.mock.ts` |
| Categories | `mock/categories.mock.ts` |
| Auth logic | `services/auth/auth.service.ts` |
