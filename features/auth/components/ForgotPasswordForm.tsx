"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";

type Step = "email" | "sent" | "password" | "done";

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") === "password" ? "password" : "email";
  const initialEmail = searchParams.get("email") ?? "";
  const initialToken = searchParams.get("token") ?? "";

  const [step, setStep] = useState<Step>(initialStep as Step);
  const [email, setEmail] = useState(initialEmail);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resetToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("أدخل بريداً إلكترونياً صحيحاً.");
        return;
      }

      const response = await fetch("/api/auth/password/reset/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error("تعذر إرسال رابط إعادة التعيين. حاول مرة أخرى.");
      }

      const data = await response.json();
      setMaskedEmail(data.maskedEmail ?? email);
      setMessage(
        data.message ??
          "إذا كان البريد مسجلاً، ستصلك رسالة برابط آمن لإعادة تعيين كلمة المرور.",
      );
      setStep("sent");
    }, [email]),
  );

  const { isLoading: isResetting, run: handleResetPassword } = useAsyncAction(
    useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");

      if (!isStrongPassword(password)) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم.");
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمة المرور وتأكيدها غير متطابقين.");
        return;
      }
      if (!resetToken) {
        setError("رابط إعادة التعيين غير صالح. اطلب رابطاً جديداً.");
        return;
      }

      const response = await fetch("/api/auth/password/reset/confirm", {
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

  if (step === "sent") {
    return (
      <div className="grid gap-4">
        <div>
          <h2 className="text-xl font-black text-ink">تحقق من بريدك</h2>
          <p className="mt-1.5 text-sm font-medium text-muted">
            أرسلنا رابطاً آمناً إلى {maskedEmail || email} إن كان الحساب موجوداً. الرابط صالح لمدة ساعة.
          </p>
        </div>
        {message ? <FormMessage variant="success">{message}</FormMessage> : null}
        <Button fullWidth onClick={() => setStep("email")} type="button" variant="secondary">
          استخدام بريد آخر
        </Button>
        <Link className="text-center text-sm font-medium text-muted transition hover:text-ink" href="/login">
          العودة لتسجيل الدخول
        </Link>
      </div>
    );
  }

  if (step === "password") {
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
          autoComplete="email"
          label="البريد الإلكتروني"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <Input
          autoComplete="new-password"
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
    <form
      className="grid gap-4"
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(event);
      }}
    >
      <div>
        <h2 className="text-xl font-black text-ink">نسيت كلمة المرور؟</h2>
        <p className="mt-1.5 text-sm font-medium text-muted">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور. لن نرسل رمزاً عبر البريد.
        </p>
      </div>
      <Input
        label="البريد الإلكتروني"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        value={email}
      />
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      <Button fullWidth loading={isLoading} type="submit" variant="primary">
        إرسال رابط إعادة التعيين
      </Button>
      <Link className="text-center text-sm font-medium text-muted transition hover:text-ink" href="/login">
        العودة لتسجيل الدخول
      </Link>
    </form>
  );
}
