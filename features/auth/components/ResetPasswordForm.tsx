"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import {
  PASSWORD_RESET_EXPIRED_MESSAGE,
  PASSWORD_RESET_INVALID_MESSAGE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
} from "@/services/auth/auth-messages";
import { clearSessionUser } from "@/services/storage";
import { removeSessionCookie } from "@/services/auth/session-sync";
import {
  isStrongPassword,
  STRONG_PASSWORD_HINT,
} from "@/shared/utils/password-rules";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : PASSWORD_RESET_INVALID_MESSAGE);
  const [done, setDone] = useState(false);
  const [linkStatus, setLinkStatus] = useState<"checking" | "valid" | "expired" | "invalid">(
    token ? "checking" : "invalid",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    void (async () => {
      const response = await fetch(
        `/api/auth/password/reset/confirm?token=${encodeURIComponent(token)}`,
        { method: "GET", credentials: "include" },
      );
      if (cancelled) return;
      if (response.ok) {
        setLinkStatus("valid");
        return;
      }
      const data = await response.json().catch(() => ({}));
      setLinkStatus(data.error === "TOKEN_EXPIRED" ? "expired" : "invalid");
      setError(
        data.error === "TOKEN_EXPIRED"
          ? PASSWORD_RESET_EXPIRED_MESSAGE
          : PASSWORD_RESET_INVALID_MESSAGE,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const { isLoading: isResetting, run: handleResetPassword } = useAsyncAction(
    useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!isStrongPassword(password)) {
          setError(STRONG_PASSWORD_HINT);
          return;
        }
        if (password !== confirmPassword) {
          setError("كلمة المرور وتأكيدها غير متطابقين.");
          return;
        }

        const response = await fetch("/api/auth/password/reset/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token,
            newPassword: password,
            confirmPassword,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(
            typeof data.message === "string"
              ? data.message
              : PASSWORD_RESET_INVALID_MESSAGE,
          );
          return;
        }

        clearSessionUser();
        void removeSessionCookie();
        setDone(true);
      },
      [confirmPassword, password, token],
    ),
  );

  if (done) {
    return (
      <div className="grid gap-4">
        <FormMessage variant="success">{PASSWORD_RESET_SUCCESS_MESSAGE}</FormMessage>
        <Button fullWidth href="/login" variant="primary">
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  if (linkStatus === "checking") {
    return <p className="text-sm font-medium text-muted">جاري التحقق من الرابط...</p>;
  }

  if (linkStatus !== "valid") {
    return (
      <div className="grid gap-4">
        <FormMessage variant="error">
          {error ||
            (linkStatus === "expired"
              ? PASSWORD_RESET_EXPIRED_MESSAGE
              : PASSWORD_RESET_INVALID_MESSAGE)}
        </FormMessage>
        <Button fullWidth href="/forgot-password" variant="primary">
          طلب رابط جديد
        </Button>
        <Link className="text-center text-sm font-medium text-muted transition hover:text-ink" href="/login">
          العودة لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        void handleResetPassword(event);
      }}
    >
      <div>
        <h2 className="text-xl font-black text-ink">كلمة مرور جديدة</h2>
        <p className="mt-1.5 text-sm font-medium text-muted">أنشئ كلمة مرور جديدة لحسابك.</p>
      </div>
      <Input
        autoComplete="new-password"
        hint={STRONG_PASSWORD_HINT}
        label="كلمة المرور الجديدة"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        value={password}
      />
      <Input
        autoComplete="new-password"
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        onChange={(event) => setConfirmPassword(event.target.value)}
        type="password"
        value={confirmPassword}
      />
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      <Button fullWidth loading={isResetting} type="submit" variant="primary">
        حفظ كلمة المرور
      </Button>
      <button
        className="text-center text-sm font-medium text-muted transition hover:text-ink"
        onClick={() => router.push("/forgot-password")}
        type="button"
      >
        طلب رابط جديد
      </button>
    </form>
  );
}
