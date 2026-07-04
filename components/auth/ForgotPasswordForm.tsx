"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

    setMessage(
      "تم إرسال رابط إعادة التعيين إلى بريدك. تحقق من صندوق الوارد.",
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-black text-ink">نسيت كلمة المرور؟</h2>
        <p className="mt-2 text-sm text-muted">
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

      {error ? (
        <p className="text-sm font-bold text-accent">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-success-soft p-4 text-sm font-bold text-success">
          {message}
        </p>
      ) : null}

      <Button className="w-full" type="submit">
        إرسال رابط الاستعادة
      </Button>

      <Link
        className="text-center text-sm font-bold text-muted transition hover:text-ink"
        href="/login"
      >
        العودة لتسجيل الدخول
      </Link>
    </form>
  );
}
