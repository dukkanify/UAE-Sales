import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { OTP_EXPIRY_MINUTES } from "@/services/otp/otp-config";

export const OTP_DISPLAY_COOKIE = "sooqna_otp_display";

type Payload = {
  email: string;
  otp: string;
};

function encode(payload: Payload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decode(raw: string): Payload | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Payload;
    if (!parsed.email || !/^\d{6}$/.test(parsed.otp)) return null;
    return {
      email: parsed.email.trim().toLowerCase(),
      otp: parsed.otp,
    };
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OTP_EXPIRY_MINUTES * 60,
  };
}

export function attachOtpDisplayCookie(
  response: NextResponse,
  email: string,
  otp: string,
) {
  if (!/^\d{6}$/.test(otp)) return;
  response.cookies.set(
    OTP_DISPLAY_COOKIE,
    encode({ email: email.trim().toLowerCase(), otp }),
    cookieOptions(),
  );
}

export function clearOtpDisplayCookie(response: NextResponse) {
  response.cookies.set(OTP_DISPLAY_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export async function readOtpDisplayCookie(email: string): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(OTP_DISPLAY_COOKIE)?.value;
  if (!raw) return null;
  const parsed = decode(raw);
  if (!parsed) return null;
  if (parsed.email !== email.trim().toLowerCase()) return null;
  return parsed.otp;
}
