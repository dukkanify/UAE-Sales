# Account Completion Rate Limit Report

## Endpoint

`POST /api/complete-account`

## Limits

| Key | Max | Window |
|-----|-----|--------|
| `complete-account:ip:{ip}` | 5 | 15 minutes |
| `complete-account:token:{fingerprint}` | 5 | 15 minutes |

Token fingerprint = first 16 chars of SHA-256 hash (does not store raw token).

## Failure Handling

On password mismatch, weak password, invalid/expired token, or missing user:

- Increment failure counters via `recordCompleteAccountFailure()`
- Return generic message: **تعذر إعداد الحساب حاليًا. حاول مرة أخرى لاحقًا.**

Does not reveal whether token was valid.

## Rate Limit Exceeded

HTTP `429` with:

> تم تجاوز عدد المحاولات. يرجى الانتظار 15 دقيقة ثم المحاولة مرة أخرى.

## Guest Conversion Side Effect

On success, `markGuestOrdersConverted(userId)` updates linked orders to `customerType: guest_converted`.

## Files

- `services/auth/complete-account-rate-limit.ts`
- `services/auth/rate-limit.ts` (configurable limits)
- `app/api/complete-account/route.ts`
- `services/payments/order-store.ts` (`markGuestOrdersConverted`)

## QA Matrix

| Case | Expected |
|------|----------|
| Valid token + strong password | 200, session created |
| Invalid token | Generic 400 |
| Reused token | Generic 400 |
| 6th attempt in 15 min | 429 |
| Orders updated to guest_converted | Yes |
