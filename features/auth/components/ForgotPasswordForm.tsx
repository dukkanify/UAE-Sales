"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("أدخل بريداً إلكترونياً صحيحاً.");
      return;
    }

    setMessage("تم إرسال رابط إعادة التعيين إلى بريدك.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-black text-ink">نسيت كلمة المرور؟</h2>
        <p className="mt-1.5 text-sm font-medium text-muted">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.
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

      <Button fullWidth type="submit" variant="primary">
        إرسال رابط الاستعادة
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
