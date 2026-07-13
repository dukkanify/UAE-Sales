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

/** Mock checkout button (skip Stripe) — enabled on preview/dev by default. */
export function isMockCheckoutEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_CHECKOUT === "false") {
    return false;
  }
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_CHECKOUT === "true") {
    return true;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith(".vercel.app") ||
      window.location.hostname.includes("-dukkanify-"))
  ) {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}
