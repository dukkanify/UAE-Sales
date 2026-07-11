"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { DemoAccountsPanel } from "@/features/auth/components/DemoAccountsPanel";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { getPostLoginPath } from "@/services/auth";
import type { UserProfile } from "@/types";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { setSessionUser } from "@/services/storage";
import { getSafeNextPath } from "@/shared/utils/safe-next";
import { isUaePassEnabled } from "@/shared/constants/feature-flags";

type LoginErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  const { error: submitError, isLoading, run: requestOtp } = useAsyncAction(
    useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
      const password = String(formData.get("password") ?? "");
      const nextErrors: LoginErrors = {};

      if (!isValidEmail(nextEmail)) {
        nextErrors.email = "اكتب بريدًا إلكترونيًا صحيحًا.";
      }
      if (!password) {
        nextErrors.password = "أدخل كلمة المرور.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      const response = await fetch("/api/auth/otp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password }),
      });

      const data = await response.json();
      if (!response.ok && response.status !== 429) {
        throw new Error("تعذر إرسال رمز التحقق. حاول مرة أخرى.");
      }

      setEmail(data.email ?? nextEmail);
      setMaskedEmail(data.maskedEmail ?? nextEmail);
      setShowOtp(true);
    }, []),
  );

  const handleVerified = useCallback(
    async (data?: { user?: UserProfile }) => {
      const user = data?.user;
      if (!user) return;

      setSessionUser(user);
      await persistSessionCookie(user);
      await syncFavoritesAfterLogin(user.id);

      const nextPath = getSafeNextPath(
        new URLSearchParams(window.location.search).get("next"),
        getPostLoginPath(email),
      );
      router.push(nextPath);
    },
    [email, router],
  );

  if (showOtp) {
    return (
      <OtpVerification
        email={email}
        maskedEmail={maskedEmail}
        onBack={() => setShowOtp(false)}
        onVerified={handleVerified}
        purpose="LOGIN"
      />
    );
  }

  return (
    <>
      <form className="grid gap-4" noValidate onSubmit={requestOtp}>
        <div>
          <p className="text-xs font-bold tracking-wide text-secondary uppercase">
            تسجيل الدخول
          </p>
          <h2 className="mt-1 text-xl font-black text-ink">ادخل إلى حسابك</h2>
        </div>

        <Input
          autoComplete="email"
          error={errors.email}
          label="البريد الإلكتروني"
          name="email"
          placeholder="user@sooqna.demo"
          required
          type="email"
        />

        <Input
          autoComplete="current-password"
          error={errors.password}
          label="كلمة المرور"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />

        {submitError ? (
          <FormMessage variant="error">{submitError}</FormMessage>
        ) : null}

        <div className="flex items-center justify-between text-sm font-medium">
          <label className="flex items-center gap-2 text-muted">
            <input className="size-4 accent-primary" type="checkbox" />
            تذكرني
          </label>
          <Link className="text-primary" href="/forgot-password">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button fullWidth loading={isLoading} type="submit" variant="primary">
          متابعة بالبريد الإلكتروني
        </Button>

        {isUaePassEnabled() ? (
          <Button fullWidth type="button" variant="secondary">
            UAE PASS
          </Button>
        ) : null}
      </form>

      <DemoAccountsPanel />
    </>
  );
}
