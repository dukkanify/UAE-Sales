export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
export const OTP_RESEND_COOLDOWN_SECONDS = Number(
  process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60,
);
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_PEPPER = process.env.OTP_PEPPER ?? "sooqna-dev-pepper";

export function isDemoOtpEnabled(): boolean {
  if (process.env.ENABLE_DEMO_OTP === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export const DEMO_OTP_CODE = "123456";
