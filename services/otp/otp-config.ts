export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
export const OTP_RESEND_COOLDOWN_SECONDS = Number(
  process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60,
);
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_PEPPER = process.env.OTP_PEPPER ?? "sooqna-dev-pepper";

/** Demo OTP only when explicitly enabled outside production. */
export function isDemoOtpEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEMO_OTP === "true"
  );
}

export const DEMO_OTP_CODE = "123456";
