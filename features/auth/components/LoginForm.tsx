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
import {
  completeLogin,
  getPostLoginPath,
  requestLoginOtp,
  validateLoginCredentials,
} from "@/services/auth";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { setSessionUser } from "@/services/storage";

type LoginErrors = {
  identifier?: string;
  password?: string;
};

function isValidIdentifier(value: string) {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    /^(\+971|971|0)?5\d{8}$/.test(value)
  );
}

export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [identifier, setIdentifier] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  const { error: submitError, isLoading, run: requestOtp } = useAsyncAction(
    useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const nextIdentifier = String(formData.get("identifier") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const nextErrors: LoginErrors = {};

      if (!isValidIdentifier(nextIdentifier)) {
        nextErrors.identifier = "اكتب بريد إلكتروني أو رقم هاتف إماراتي صحيح.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      await validateLoginCredentials(nextIdentifier, password);
      await requestLoginOtp(nextIdentifier);
      setIdentifier(nextIdentifier);
      setShowOtp(true);
    }, []),
  );

  const handleVerified = useCallback(async () => {
    const user = await completeLogin(identifier);
    setSessionUser(user);
    await persistSessionCookie(user);
    await syncFavoritesAfterLogin(user.id);
    const nextPath =
      new URLSearchParams(window.location.search).get("next") ??
      getPostLoginPath(identifier);
    router.push(nextPath);
  }, [identifier, router]);

  if (showOtp) {
    return (
      <OtpVerification
        identifier={identifier}
        onBack={() => setShowOtp(false)}
        onVerified={handleVerified}
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
          autoComplete="username"
          error={errors.identifier}
          label="رقم الهاتف أو البريد"
          name="identifier"
          placeholder="user@sooqna.demo"
          required
          type="text"
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
          تسجيل الدخول
        </Button>

        <Button disabled fullWidth type="button" variant="secondary">
          UAE PASS — قريباً
        </Button>
      </form>

      <DemoAccountsPanel />
    </>
  );
}
