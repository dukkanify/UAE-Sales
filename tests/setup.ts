/**
 * Vitest global setup — env for crypto/session helpers.
 */

process.env.AUTH_SECRET ||= "test-auth-secret-at-least-24-chars";
process.env.NEXT_PUBLIC_APP_ENV ||= "development";
process.env.ENABLE_DEMO_OTP ||= "true";
process.env.DEMO_OTP_CODE ||= "123456";
