"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { isEmailOtpEnabled } from "@/shared/constants/feature-flags";
import type { UserProfile } from "@/types";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { getAccountProof, saveAccountProof, setSessionUser } from "@/services/storage";
import { getSafeNextPath } from "@/shared/utils/safe-next";
import { trackAuthEventClient } from "@/services/analytics/auth-events";

type LoginErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getLoginErrorMessage(data: { message?: string; error?: string }) {
  if (data.error === "INVALID_CREDENTIALS") {
    return data.message ?? "بيانات الدخول غير صحيحة.";
  }

  return data.message ?? "بيانات الدخول غير صحيحة.";
}

type LoginFormProps = {
  /** Admin gate: only the credentials form, no demo account grid. */
  variant?: "default" | "admin";
};

export function LoginForm({ variant = "default" }: LoginFormProps) {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailOtpEnabled = isEmailOtpEnabled();
  const [usePassword, setUsePassword] = useState(!emailOtpEnabled || variant === "admin");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const isAdminNext = variant === "admin" || Boolean(nextPath?.startsWith("/admin"));

  const completePasswordLogin = useCallback(
    async (nextEmail: string, nextPassword: string) => {
      const normalizedEmail = nextEmail.trim().toLowerCase();
      const normalizedPassword = nextPassword.trim();
      const nextParam = new URLSearchParams(window.location.search).get("next");

      const proof = getAccountProof(normalizedEmail);
      const response = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password: normalizedPassword,
          next: nextParam,
          accountProof: proof?.passwordHash,
          fullName: proof?.fullName,
          accountType: proof?.accountType,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getLoginErrorMessage(data));
      }

      setSessionUser(data.user as UserProfile);
      if (typeof data.accountProof === "string") {
        saveAccountProof({
          email: normalizedEmail,
          passwordHash: data.accountProof,
          fullName: (data.user as UserProfile).fullName,
          accountType: (data.user as UserProfile).accountType,
        });
      }
      await persistSessionCookie(data.user);
      await syncFavoritesAfterLogin(data.user.id);
      trackAuthEventClient("login_verified");
      router.push(getSafeNextPath(data.redirectTo ?? nextParam, "/profile"));
    },
    [router],
  );

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

  const isBusy = isLoading;
  const authError = submitError;

  return (
    <form
      className="auth-form"
      method="post"
      noValidate
      onSubmit={(event) => {
        // Prevent native submit (default method was GET → credentials in URL).
        event.preventDefault();
        void handleSubmit(event);
      }}
    >
        <div className="auth-form__header">
          <p className="auth-form__eyebrow">
            {isAdminNext ? "دخول آمن" : "تسجيل الدخول"}
          </p>
          <h2 className="auth-form__title">
            {isAdminNext ? "بيانات المدير" : "ادخل إلى حسابك"}
          </h2>
          <p className="auth-form__subtitle">
            {isAdminNext
              ? "أدخل بريد المدير وكلمة المرور للمتابعة."
              : emailOtpEnabled
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
          placeholder="name@email.com"
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
            placeholder="••••••••"
            required
            type="password"
            value={password}
          />
        ) : null}

        {authError ? <FormMessage variant="error">{authError}</FormMessage> : null}

        <div className="auth-form__links">
          {variant === "admin" ? (
            <p className="text-muted">وصول محمي لغرفة عمليات سوقنا فقط.</p>
          ) : emailOtpEnabled ? (
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
          {variant !== "admin" && emailOtpEnabled ? (
            <Link className="text-primary" href="/forgot-password">
              نسيت كلمة المرور؟
            </Link>
          ) : null}
        </div>

        <Button fullWidth loading={isBusy} type="submit" variant="accent">
          {usePassword || !emailOtpEnabled || variant === "admin"
            ? isAdminNext
              ? "دخول غرفة التحكم"
              : "تسجيل الدخول"
            : "إرسال رمز الدخول"}
        </Button>
      </form>
  );
}
