# API Documentation

**Base URL:** Same-origin `/api` (or `NEXT_PUBLIC_API_BASE_URL` if set)  
**Auth:** httpOnly session cookie + optional `Authorization: Bearer <token>`

## Response Format

### Success

```json
{ ...data }
```

### Error

```json
{
  "code": "UNAUTHORIZED",
  "message": "بيانات الدخول غير صحيحة."
}
```

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Invalid request body |
| UNAUTHORIZED | 401 | Not logged in / bad credentials |
| FORBIDDEN | 403 | Insufficient role |
| NOT_FOUND | 404 | Resource missing |
| SERVER_ERROR | 500/503 | Server or DB error |

---

## Auth

### POST /api/auth/login

Validate credentials and request OTP.

**Body:**
```json
{
  "identifier": "user@uaesales.demo",
  "password": "User@123"
}
```

**Response:**
```json
{
  "identifier": "user@uaesales.demo",
  "otpRequested": true
}
```

### POST /api/auth/verify-otp

Verify OTP and create session.

**Body:**
```json
{
  "identifier": "user@uaesales.demo",
  "code": "123456"
}
```

**Response:**
```json
{
  "token": "...",
  "user": { "id": "...", "fullName": "...", ... },
  "postLoginPath": "/profile"
}
```

Sets `uae-sales-session-token` httpOnly cookie.

### POST /api/auth/register

Register new user (creates wallet).

**Body:**
```json
{
  "fullName": "Ahmed",
  "email": "ahmed@example.com",
  "phone": "0501234567",
  "password": "Pass@123",
  "accountType": "individual",
  "city": "دبي"
}
```

### POST /api/auth/logout

Clears session cookie and deletes DB session.

### GET /api/auth/me

Returns current authenticated user profile. Requires session.

---

## Users

### GET /api/users/me

Same as `/api/auth/me`.

### PATCH /api/users/me

Update profile fields.

**Body:**
```json
{
  "fullName": "Ahmed Al Mansoori",
  "city": "دبي"
}
```

---

## Categories

### GET /api/categories

Returns all categories (matches frontend `Category[]`).

### GET /api/categories/[slug]

Returns single category by slug.

---

## Listings

### GET /api/listings

List or search listings.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| slug | string | Get single listing by slug |
| q / query | string | Text search |
| category / categoryId | string | Filter by category |
| city / emirate | string | Location filter |
| area | string | Area filter |
| condition | new/used/excellent | Condition filter |
| minPrice | number | Min price |
| maxPrice | number | Max price |
| featured | boolean | Featured only |
| premium | boolean | Premium only |
| sort | newest/price_asc/price_desc | Sort order |

**Examples:**
- `GET /api/listings` — all listings
- `GET /api/listings?slug=mercedes-amg-g63-2024` — single listing
- `GET /api/listings?category=cars&sort=price_desc` — search

> **Note:** Listing by slug uses query param `?slug=` because Next.js App Router cannot have both `[slug]` and `[id]` at the same path level.

### POST /api/listings

Create listing. Requires auth + seller profile.

### PATCH /api/listings/[id]

Update listing. Requires auth + ownership.

### DELETE /api/listings/[id]

Delete listing. Requires auth + ownership.

---

## Favorites

### GET /api/favorites

List user's favorites. Requires auth.

### POST /api/favorites

**Body:** `{ "listingId": "..." }`

### DELETE /api/favorites/[id]

Remove favorite by favorite ID.

---

## Dashboard

### GET /api/dashboard/summary

Dashboard overview data. Requires auth.

### GET /api/dashboard/listings

Current user's listings. Requires auth.

---

## Wallet

### GET /api/wallet

Wallet balance. Requires auth.

### GET /api/wallet/transactions

Transaction history (last 50). Requires auth.

---

## Orders

### GET /api/orders

User's orders (buyer or seller). Requires auth.

### POST /api/orders

Create order.

**Body:**
```json
{
  "listingId": "...",
  "amount": 5000,
  "paymentFee": 50
}
```

### GET /api/orders/[id]

Single order with escrow and disputes.

---

## Escrow

### POST /api/escrow/hold

Hold escrow for order. Requires auth.

**Body:** `{ "orderId": "..." }`

### POST /api/escrow/release

Release escrow to seller. Requires auth (seller).

### POST /api/escrow/refund

Refund escrow to buyer. Requires auth (buyer).

---

## Health

### GET /api/health

Returns `{ status: "ok", database: true }` when DB is configured.

---

## Demo Accounts

| Role | Email | Password | OTP |
|------|-------|----------|-----|
| User | user@uaesales.demo | User@123 | 123456 |
| Business | company@uaesales.demo | Company@123 | 123456 |
| Admin | admin@uaesales.demo | Admin@123 | 123456 |

## Rate Limits (in-memory)

| Endpoint | Limit |
|----------|-------|
| /api/auth/login | 10/min per IP |
| /api/auth/verify-otp | 10/min per IP |
| /api/auth/register | 5/min per IP |
