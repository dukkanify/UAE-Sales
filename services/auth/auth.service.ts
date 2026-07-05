import {
  DEMO_OTP,
  findDemoAccount,
  findDemoAccountByIdentifier,
} from "@/mock/demo-accounts.mock";
import type { UserProfile } from "@/types";
import { apiClient, isApiConfigured } from "@/services/api";
import { setAuthToken } from "@/services/storage";

const AUTH_DELAY_MS = 350;

function delay(ms = AUTH_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { DEMO_OTP };

type VerifyOtpResponse = {
  token: string;
  user: UserProfile;
  postLoginPath: string;
};

export async function validateLoginCredentials(
  identifier: string,
  password: string,
) {
  if (isApiConfigured()) {
    try {
      await apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      const account = findDemoAccountByIdentifier(identifier);
      if (account) {
        return account;
      }
      return { identifier, password } as never;
    } catch {
      // Fall through to mock validation.
    }
  }

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
  if (isApiConfigured()) {
    return { identifier, otpRequested: true };
  }

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

export async function completeLogin(
  identifier: string,
  code = DEMO_OTP,
): Promise<UserProfile> {
  if (isApiConfigured()) {
    try {
      const result = await apiClient<VerifyOtpResponse>("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ identifier, code }),
      });
      setAuthToken(result.token);
      return result.user;
    } catch {
      // Fall through to mock login.
    }
  }

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
