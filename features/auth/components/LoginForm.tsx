"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { DemoAccountsPanel } from "@/features/auth/components/DemoAccountsPanel";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import type { UserProfile } from "@/types";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { setSessionUser } from "@/services/storage";
import { getSafeNextPath } from "@/shared/utils/safe-next";
import { trackAuthEventClient } from "@/services/analytics/auth-events";

type LoginErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [usePassword, setUsePassword] = useState(false);
  const router = useRouter();

  const { error: submitError, isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(
      async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
        const password = String(formData.get("password") ?? "");
        const nextErrors: LoginErrors = {};

        if (!isValidEmail(nextEmail)) {
          nextErrors.email = "اكتب بريدًا إلكترونيًا صحيحًا.";
        }
        if (usePassword && !password) {
          nextErrors.password = "أدخل كلمة المرور.";
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const nextParam = new URLSearchParams(window.location.search).get("next");

        if (usePassword) {
          const response = await fetch("/api/auth/login/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: nextEmail, password, next: nextParam }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message ?? "بيانات الدخول غير صحيحة.");
          }
          setSessionUser(data.user as UserProfile);
          await persistSessionCookie(data.user);
          await syncFavoritesAfterLogin(data.user.id);
          trackAuthEventClient("login_verified");
          router.push(getSafeNextPath(data.redirectTo ?? nextParam, "/profile"));
          return;
        }

        const response = await fetch("/api/auth/login/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: nextEmail }),
        });

        const data = await response.json();
        if (!response.ok && response.status !== 429) {
          throw new Error("تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.");
        }

        trackAuthEventClient("login_otp_sent");
        const params = new URLSearchParams({
          email: data.email ?? nextEmail,
          purpose: "LOGIN",
          masked: data.maskedEmail ?? nextEmail,
        });
        if (nextParam) params.set("next", nextParam);
        router.push(`/verify-email?${params.toString()}`);
      },
      [router, usePassword],
    ),
  );

  return (
    <>
      <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
        <div>
          <p className="text-xs font-bold tracking-wide text-secondary uppercase">
            تسجيل الدخول
          </p>
          <h2 className="mt-1 text-xl font-black text-ink">ادخل إلى حسابك</h2>
          <p className="mt-2 text-sm font-medium text-muted">
            أدخل بريدك الإلكتروني وسنرسل لك رمز دخول آمن
          </p>
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

        {usePassword ? (
          <Input
            autoComplete="current-password"
            error={errors.password}
            label="كلمة المرور"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        ) : null}

        {submitError ? <FormMessage variant="error">{submitError}</FormMessage> : null}

        <div className="flex items-center justify-between text-sm font-medium">
          <button
            className="text-primary"
            onClick={() => setUsePassword((value) => !value)}
            type="button"
          >
            {usePassword ? "الدخول برمز البريد" : "الدخول بكلمة المرور"}
          </button>
          {usePassword ? (
            <Link className="text-primary" href="/forgot-password">
              نسيت كلمة المرور؟
            </Link>
          ) : null}
        </div>

        <Button fullWidth loading={isLoading} type="submit" variant="primary">
          {usePassword ? "تسجيل الدخول" : "إرسال رمز الدخول"}
        </Button>
      </form>

      <DemoAccountsPanel />
    </>
  );
}
