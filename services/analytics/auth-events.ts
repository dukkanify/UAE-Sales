type AuthEventName =
  | "registration_started"
  | "registration_otp_sent"
  | "registration_verified"
  | "registration_failed"
  | "login_otp_sent"
  | "login_verified"
  | "otp_resend"
  | "password_added";

export function trackAuthEvent(
  event: AuthEventName,
  properties?: Record<string, string | number | boolean>,
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info("[Sooqna AuthEvent]", event, properties ?? {});
}

export function trackAuthEventClient(
  event: AuthEventName,
  properties?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  trackAuthEvent(event, properties);
}
