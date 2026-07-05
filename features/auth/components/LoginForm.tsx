"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { completeLogin, requestLoginOtp } from "@/services/auth";
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

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
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
      if (!isStrongPassword(password)) {
        nextErrors.password =
          "كلمة المرور يجب أن تكون 8 أحرف على الأقل مع حرف كبير وصغير ورقم.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      await requestLoginOtp(nextIdentifier);
      setIdentifier(nextIdentifier);
      setShowOtp(true);
    }, []),
  );

  const handleVerified = useCallback(async () => {
    const user = await completeLogin(identifier);
    setSessionUser(user);
    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.push(nextPath || "/profile");
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
        placeholder="example@email.com"
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
  );
}
