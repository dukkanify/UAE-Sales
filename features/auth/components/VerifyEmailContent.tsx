"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { OtpPurpose } from "@/types/domain/otp";
import type { UserProfile } from "@/types";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { FormMessage } from "@/shared/ui/FormMessage";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { setSessionUser } from "@/services/storage";

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionError, setSessionError] = useState("");
  const email = searchParams.get("email") ?? "";
  const purpose = (searchParams.get("purpose") ?? "LOGIN") as OtpPurpose;
  const maskedEmail = searchParams.get("masked") ?? undefined;
  const nextPath = searchParams.get("next") ?? undefined;

  const handleVerified = useCallback(
    async (data?: { redirectTo?: string; resetToken?: string; user?: UserProfile }) => {
      if (purpose === "PASSWORD_RESET" && data?.resetToken) {
        router.push(
          `/forgot-password?step=password&email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`,
        );
        return;
      }

      const user = data?.user;
      if (user) {
        setSessionUser(user);
        const synced = await persistSessionCookie(user);
        if (!synced) {
          setSessionError("تعذر إنشاء الجلسة. يرجى المحاولة مرة أخرى.");
          return;
        }
        await syncFavoritesAfterLogin(user.id);
        router.push(data.redirectTo ?? "/profile");
        return;
      }

      router.push(nextPath ?? "/profile");
    },
    [email, nextPath, purpose, router],
  );

  if (!email) {
    return (
      <p className="text-sm font-medium text-muted">
        لم يتم العثور على بريد للتحقق.{" "}
        <button className="text-primary" onClick={() => router.push("/login")} type="button">
          العودة لتسجيل الدخول
        </button>
      </p>
    );
  }

  return (
    <>
      {sessionError ? <FormMessage variant="error">{sessionError}</FormMessage> : null}
      <OtpVerification
      email={email}
      maskedEmail={maskedEmail}
      nextPath={nextPath}
      onBack={() => router.push(purpose === "REGISTER" ? "/register" : "/login")}
      onVerified={handleVerified}
      purpose={purpose}
    />
    </>
  );
}
