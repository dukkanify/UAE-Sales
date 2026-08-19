import type { NextResponse } from "next/server";
import { OTP_EXPIRY_MINUTES } from "@/services/otp/otp-config";

export const OTP_DISPLAY_COOKIE = "sooqna_otp_display";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OTP_EXPIRY_MINUTES * 60,
  };
}

/** OTP must never be written to cookies, UI, or API responses. */
export function attachOtpDisplayCookie(
  response: NextResponse,
  email: string,
  otp: string,
) {
  void response;
  void email;
  void otp;
}

export function clearOtpDisplayCookie(response: NextResponse) {
  response.cookies.set(OTP_DISPLAY_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export async function readOtpDisplayCookie(email: string): Promise<string | null> {
  void email;
  return null;
}
