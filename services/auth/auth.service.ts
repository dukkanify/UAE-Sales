import {
  DEMO_OTP,
  findDemoAccount,
  findDemoAccountByIdentifier,
} from "@/mock/demo-accounts.mock";
import type { UserProfile } from "@/types";

const AUTH_DELAY_MS = 350;

function delay(ms = AUTH_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { DEMO_OTP };

export async function validateLoginCredentials(
  identifier: string,
  password: string,
) {
  await delay();

  const account = findDemoAccount(identifier, password);
  if (!account) {
    throw new Error(
      "بيانات الدخول غير صحيحة. استخدم حسابات العرض التجريبية الموضحة أدناه.",
    );
  }

  return account;
}

export async function requestLoginOtp(identifier: string) {
  await delay();

  const account = findDemoAccountByIdentifier(identifier);
  if (!account) {
    throw new Error("لم يتم العثور على حساب تجريبي لهذا المعرّف.");
  }

  return {
    identifier,
    otpRequested: true,
  };
}

export async function completeLogin(identifier: string): Promise<UserProfile> {
  await delay();

  const account = findDemoAccountByIdentifier(identifier);
  if (!account) {
    throw new Error("تعذر إكمال تسجيل الدخول. حاول مرة أخرى.");
  }

  return account.profile;
}

export function getPostLoginPath(identifier: string, fallback = "/profile"): string {
  const account = findDemoAccountByIdentifier(identifier);
  return account?.postLoginPath ?? fallback;
}

export function isValidDemoOtp(code: string): boolean {
  return code === DEMO_OTP;
}
