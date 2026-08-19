"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { OtpPurpose } from "@/types/domain/otp";
import type { UserProfile } from "@/types";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { FormMessage } from "@/shared/ui/FormMessage";
import { isEmailOtpEnabled } from "@/shared/constants/feature-flags";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { setSessionUser } from "@/services/storage";
import Link from "next/link";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type VerifyEmailContentProps = {
  initialOtp?: string | null;
};

export function VerifyEmailContent({ initialOtp = null }: VerifyEmailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailOtpEnabled = isEmailOtpEnabled();
  const email = searchParams.get("email") ?? "";
  const purpose = (searchParams.get("purpose") ?? "LOGIN") as OtpPurpose;
  const maskedEmail = searchParams.get("masked") ?? undefined;
  const nextPath = searchParams.get("next") ?? undefined;

  const handleVerified = useCallback(
    async (data?: {
      approved?: boolean;
      redirectTo?: string;
      resetToken?: string;
      user?: UserProfile;
    }) => {
      if (purpose === "PASSWORD_RESET" && data?.resetToken) {
        router.push(
          `/forgot-password?step=password&email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`,
        );
        return;
      }

      const user = data?.user;
      if (user) {
        setSessionUser(user);
        await persistSessionCookie(user);
        await syncFavoritesAfterLogin(user.id);
        router.push(data.redirectTo ?? "/profile");
        return;
      }

      router.push(nextPath ?? "/profile");
    },
    [email, nextPath, purpose, router],
  );

  if (!emailOtpEnabled && purpose !== "REGISTER") {
    return (
      <LocalizedTree>
      <div className="grid gap-3">
        <FormMessage variant="error">التحقق بالرمز غير متاح حاليًا.</FormMessage>
        <p className="text-sm text-muted">
          يمكنك{" "}
          <Link className="text-primary" href="/login">
            تسجيل الدخول بكلمة المرور
          </Link>{" "}
          أو متابعة الشراء كضيف.
        </p>
      </div>
    </LocalizedTree>
    );
  }

  if (!email) {
    return (
      <LocalizedTree>
      <p className="text-sm font-medium text-muted">
        لم يتم العثور على بريد للتحقق.{" "}
        <button className="text-primary" onClick={() => router.push("/login")} type="button">
          العودة لتسجيل الدخول
        </button>
      </p>
    </LocalizedTree>
    );
  }

  return (
    <LocalizedTree>
    <OtpVerification
      email={email}
      initialOtp={initialOtp}
      maskedEmail={maskedEmail}
      nextPath={nextPath}
      onBack={() => router.push(purpose === "REGISTER" ? "/register" : "/login")}
      onVerified={handleVerified}
      purpose={purpose}
    />
  </LocalizedTree>
  );
}
