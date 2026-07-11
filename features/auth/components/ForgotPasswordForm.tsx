"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { OtpPurpose } from "@/types/domain/otp";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";

type Step = "email" | "otp" | "password" | "done";

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");
      setMessage("");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("أدخل بريداً إلكترونياً صحيحاً.");
        return;
      }

      const response = await fetch("/api/auth/otp/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (!response.ok && response.status !== 429) {
        throw new Error("تعذر إرسال رمز التحقق. حاول مرة أخرى.");
      }

      setMaskedEmail(data.maskedEmail ?? email);
      setStep("otp");
    }, [email]),
  );

  const handleOtpVerified = useCallback(
    async (data?: { resetToken?: string }) => {
      if (!data?.resetToken) {
        setError("تعذر التحقق من الرمز. حاول مرة أخرى.");
        return;
      }
      setResetToken(data.resetToken);
      setStep("password");
      setError("");
    },
    [],
  );

  const { isLoading: isResetting, run: handleResetPassword } = useAsyncAction(
    useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");

      if (!isStrongPassword(password)) {
        setError(
          "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم.",
        );
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمة المرور وتأكيدها غير متطابقين.");
        return;
      }

      const response = await fetch("/api/auth/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword: password,
          resetToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "تعذر تحديث كلمة المرور.");
        return;
      }

      setMessage(data.message ?? "تم تحديث كلمة المرور بنجاح.");
      setStep("done");
    }, [confirmPassword, email, password, resetToken]),
  );

  if (step === "otp") {
    return (
      <OtpVerification
        email={email}
        maskedEmail={maskedEmail}
        onBack={() => setStep("email")}
        onVerified={handleOtpVerified}
        purpose={"PASSWORD_RESET" as OtpPurpose}
      />
    );
  }

  if (step === "password") {
    return (
      <form className="grid gap-4" onSubmit={handleResetPassword}>
        <div>
          <h2 className="text-xl font-black text-ink">كلمة مرور جديدة</h2>
          <p className="mt-1.5 text-sm font-medium text-muted">
            أدخل كلمة المرور الجديدة لحسابك.
          </p>
        </div>

        <Input
          autoComplete="new-password"
          label="كلمة المرور الجديدة"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          type="password"
          value={password}
        />
        <Input
          autoComplete="new-password"
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          type="password"
          value={confirmPassword}
        />

        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <Button fullWidth loading={isResetting} type="submit" variant="primary">
          حفظ كلمة المرور
        </Button>
      </form>
    );
  }

  if (step === "done") {
    return (
      <div className="grid gap-4">
        <FormMessage variant="success">{message}</FormMessage>
        <Button fullWidth href="/login" variant="primary">
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-black text-ink">نسيت كلمة المرور؟</h2>
        <p className="mt-1.5 text-sm font-medium text-muted">
          أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.
        </p>
      </div>

      <Input
        label="البريد الإلكتروني"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
        type="email"
        value={email}
      />

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      {message ? <FormMessage variant="success">{message}</FormMessage> : null}

      <Button fullWidth loading={isLoading} type="submit" variant="primary">
        إرسال رمز التحقق
      </Button>

      <Link
        className="text-center text-sm font-medium text-muted transition hover:text-ink"
        href="/login"
      >
        العودة لتسجيل الدخول
      </Link>
    </form>
  );
}
