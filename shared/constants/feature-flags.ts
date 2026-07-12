/** UAE PASS integration — hidden by default until ready. */
export function isUaePassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_UAE_PASS === "true";
}

/** Email OTP login/registration — disabled by default in current phase. */
export function isEmailOtpEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === "true";
}

/** Guest checkout without login — enabled by default. */
export function isGuestCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT !== "false";
}
