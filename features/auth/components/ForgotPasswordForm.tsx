"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { PASSWORD_RESET_GENERIC_MESSAGE } from "@/services/auth/auth-messages";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token")?.trim();
    if (token) {
      router.replace(`/reset-password?token=${encodeURIComponent(token)}`);
    }
  }, [router, searchParams]);

  const { isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");

      if (!isValidEmail(email.trim())) {
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

      const data = await response.json().catch(() => ({}));
      setMaskedEmail(typeof data.maskedEmail === "string" ? data.maskedEmail : email);
      setSent(true);
    }, [email]),
  );

  if (sent) {
    return (
      <LocalizedTree>
        <div className="grid gap-4">
          <div>
            <h2 className="text-xl font-black text-ink">تحقق من بريدك</h2>
            <p className="mt-1.5 text-sm font-medium text-muted">
              {PASSWORD_RESET_GENERIC_MESSAGE}
            </p>
          </div>
          <FormMessage variant="success">{PASSWORD_RESET_GENERIC_MESSAGE}</FormMessage>
          <p className="text-sm font-medium text-muted">
            إن وُجد حساب، ستصل الرسالة إلى {maskedEmail || "بريدك"}. الرابط صالح لمدة 60 دقيقة ويُستخدم
            مرة واحدة.
          </p>
          <Button
            fullWidth
            onClick={() => {
              setSent(false);
              setMaskedEmail("");
            }}
            type="button"
            variant="secondary"
          >
            استخدام بريد آخر
          </Button>
          <Link className="text-center text-sm font-medium text-muted transition hover:text-ink" href="/login">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </LocalizedTree>
    );
  }

  return (
    <LocalizedTree>
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
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور إن وُجد حساب.
          </p>
        </div>
        <Input
          autoComplete="email"
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
    </LocalizedTree>
  );
}
