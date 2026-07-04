import type { UserProfile } from "@/types";

const AUTH_DELAY_MS = 350;

function delay(ms = AUTH_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestLoginOtp(identifier: string) {
  await delay();
  return {
    identifier,
    otpRequested: true,
  };
}

export async function completeLogin(identifier: string): Promise<UserProfile> {
  await delay();

  return {
    id: "mock-session-user",
    accountType: "individual",
    city: "دبي",
    email: identifier.includes("@") ? identifier : "user@uaesales.ae",
    fullName: "مستخدم UAE Sales",
    isVerified: true,
    joinedAt: new Date().toISOString().slice(0, 10),
    phone: identifier.includes("@") ? "0500000000" : identifier,
  };
}

export async function registerUserDraft(user: {
  accountType: string;
  city: string;
  email: string;
  fullName: string;
  phone: string;
}) {
  return {
    ...user,
    verificationRequired: true,
  };
}
