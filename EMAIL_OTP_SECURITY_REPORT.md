# Email OTP Security Report

## Security Controls

| Control | Implementation |
|---------|----------------|
| OTP hashing | SHA-256 + pepper before storage (`otpHash`) |
| Password hashing | scrypt + pepper (`passwordHash`) |
| Purpose binding | OTP validated with email + purpose together |
| Expiry | 10 minutes (`OTP_EXPIRY_MINUTES`) |
| Max attempts | 5 per OTP record |
| Resend cooldown | 60 seconds; invalidates previous OTP on resend |
| Single use | `consumedAt` set on successful verify |
| Rate limiting | 10 requests / 15 min per email + IP |
| Email enumeration | Generic response for all OTP requests |
| Demo OTP | `123456` only when `NODE_ENV !== "production"` AND `ENABLE_DEMO_OTP=true` |
| No OTP in logs | Email dev mode logs subject only, not OTP body in production |
| No password email | Password never sent via email |
| Session | HttpOnly `sooqna_session` cookie, Secure in production |
| Open redirect | `getSafeNextPath()` blocks external URLs |

## OTP Purposes

`REGISTER`, `LOGIN`, `PASSWORD_RESET`, `SET_PASSWORD`, `EMAIL_CHANGE`, `SENSITIVE_ACTION`

Cross-purpose reuse is rejected by hash including purpose in pepper input.

## OTP Record Schema

```typescript
{
  id, email, userId?, purpose, otpHash, attempts, maxAttempts,
  expiresAt, createdAt, consumedAt?, resendAvailableAt, metadata?
}
```

## User Record Schema (extended)

```typescript
{
  emailVerifiedAt?, accountStatus, passwordHash?, onboardingStatus,
  hasPassword (client-safe derived field)
}
```

## Cleanup

Expired OTP records purged on new OTP creation (24h retention window).

## Tests Performed

- Production build with `NODE_ENV=production` rejects auto demo OTP
- Purpose mismatch returns INVALID
- Rate limit returns generic response (no enumeration)
- Reset token single-use with expiry

## Remaining Risks

- In-memory rate limits reset on serverless cold starts — use Redis for production
- IP rate limit can affect shared NAT users
- No session invalidation on password reset yet
