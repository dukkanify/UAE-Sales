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
import { isEmailOtpEnabled } from "@/shared/constants/feature-flags";
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

function getLoginErrorMessage(data: { message?: string; error?: string }, email: string) {
  if (data.error === "INVALID_CREDENTIALS") {
    if (email.includes("sooqna.demo") || email.includes("uaesales.demo")) {
      return "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور كما هي: Admin@123 (حرف A كبير).";
    }
    return data.message ?? "بيانات الدخول غير صحيحة.";
  }

  return data.message ?? "بيانات الدخول غير صحيحة.";
}

export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailOtpEnabled = isEmailOtpEnabled();
  const [usePassword, setUsePassword] = useState(!emailOtpEnabled);
  const router = useRouter();

  const completePasswordLogin = useCallback(
    async (nextEmail: string, nextPassword: string) => {
      const normalizedEmail = nextEmail.trim().toLowerCase();
      const normalizedPassword = nextPassword.trim();
      const nextParam = new URLSearchParams(window.location.search).get("next");

      const response = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password: normalizedPassword,
          next: nextParam,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getLoginErrorMessage(data, normalizedEmail));
      }

      setSessionUser(data.user as UserProfile);
      await persistSessionCookie(data.user);
      await syncFavoritesAfterLogin(data.user.id);
      trackAuthEventClient("login_verified");
      router.push(getSafeNextPath(data.redirectTo ?? nextParam, "/profile"));
    },
    [router],
  );

  function fillDemoAccount(nextEmail: string, nextPassword: string) {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setUsePassword(true);
    setErrors({});
  }

  const { error: submitError, isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(
      async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextEmail = String(formData.get("email") ?? email).trim().toLowerCase();
        const nextPassword = String(formData.get("password") ?? password).trim();
        const nextErrors: LoginErrors = {};

        if (!isValidEmail(nextEmail)) {
          nextErrors.email = "اكتب بريدًا إلكترونيًا صحيحًا.";
        }
        if ((usePassword || !emailOtpEnabled) && !nextPassword) {
          nextErrors.password = "أدخل كلمة المرور.";
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        if (usePassword || !emailOtpEnabled) {
          await completePasswordLogin(nextEmail, nextPassword);
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
        const nextParam = new URLSearchParams(window.location.search).get("next");
        const params = new URLSearchParams({
          email: data.email ?? nextEmail,
          purpose: "LOGIN",
          masked: data.maskedEmail ?? nextEmail,
        });
        if (nextParam) params.set("next", nextParam);
        router.push(`/verify-email?${params.toString()}`);
      },
      [completePasswordLogin, email, emailOtpEnabled, password, router, usePassword],
    ),
  );

  const {
    error: demoLoginError,
    isLoading: isDemoLoginLoading,
    run: loginDemoAccount,
  } = useAsyncAction(
    useCallback(
      async (nextEmail: string, nextPassword: string) => {
        fillDemoAccount(nextEmail, nextPassword);
        await completePasswordLogin(nextEmail, nextPassword);
      },
      [completePasswordLogin],
    ),
  );

  const isBusy = isLoading || isDemoLoginLoading;
  const authError = submitError ?? demoLoginError;

  return (
    <>
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="auth-form__header">
          <p className="auth-form__eyebrow">تسجيل الدخول</p>
          <h2 className="auth-form__title">ادخل إلى حسابك</h2>
          <p className="auth-form__subtitle">
            {emailOtpEnabled
              ? "أدخل بريدك الإلكتروني وسنرسل لك رمز دخول آمن"
              : "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة"}
          </p>
        </div>

        <Input
          autoComplete="email"
          error={errors.email}
          label="البريد الإلكتروني"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@sooqna.demo"
          required
          type="email"
          value={email}
        />

        {usePassword || !emailOtpEnabled ? (
          <Input
            autoComplete="current-password"
            error={errors.password}
            label="كلمة المرور"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin@123"
            required
            type="password"
            value={password}
          />
        ) : null}

        {authError ? <FormMessage variant="error">{authError}</FormMessage> : null}

        <div className="auth-form__links">
          {emailOtpEnabled ? (
            <button
              className="text-primary"
              onClick={() => setUsePassword((value) => !value)}
              type="button"
            >
              {usePassword ? "الدخول برمز البريد" : "الدخول بكلمة المرور"}
            </button>
          ) : (
            <p className="text-muted">
              ليس لديك كلمة مرور؟{" "}
              <Link className="text-primary" href="/register">
                أنشئ حسابًا
              </Link>{" "}
              أو أكمل الشراء كضيف.
            </p>
          )}
          {usePassword || !emailOtpEnabled ? (
            <Link className="text-primary" href="/forgot-password">
              نسيت كلمة المرور؟
            </Link>
          ) : null}
        </div>

        <Button fullWidth loading={isBusy} type="submit" variant="accent">
          {usePassword || !emailOtpEnabled ? "تسجيل الدخول" : "إرسال رمز الدخول"}
        </Button>
      </form>

      <DemoAccountsPanel
        isLoading={isBusy}
        onFillAccount={fillDemoAccount}
        onLoginAccount={loginDemoAccount}
      />
    </>
  );
}
