"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { OtpVerification } from "@/components/auth/OtpVerification";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { setSessionUser } from "@/services/clientStorage";

type LoginErrors = {
  identifier?: string;
  password?: string;
};

function isValidIdentifier(value: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const uaePhonePattern = /^(\+971|971|0)?5\d{8}$/;

  return emailPattern.test(value) || uaePhonePattern.test(value);
}

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [identifier, setIdentifier] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextIdentifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const nextErrors: LoginErrors = {};

    if (!isValidIdentifier(nextIdentifier)) {
      nextErrors.identifier = "اكتب بريد إلكتروني صحيح أو رقم هاتف إماراتي صحيح.";
    }

    if (!isStrongPassword(password)) {
      nextErrors.password =
        "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIdentifier(nextIdentifier);
      setShowOtp(true);
    }
  }

  if (showOtp) {
    return (
      <OtpVerification
        identifier={identifier}
        onBack={() => setShowOtp(false)}
        onVerified={() => {
          setSessionUser({
            id: "mock-session-user",
            accountType: "individual",
            city: "دبي",
            email: identifier.includes("@") ? identifier : "user@uaesales.ae",
            fullName: "مستخدم UAE Sales",
            isVerified: true,
            joinedAt: new Date().toISOString().slice(0, 10),
            phone: identifier.includes("@") ? "0500000000" : identifier,
          });
          const nextPath = new URLSearchParams(window.location.search).get("next");
          router.push(nextPath || "/profile");
        }}
      />
    );
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-bold text-primary">تسجيل الدخول</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          ادخل إلى حسابك
        </h2>
        <p className="mt-3 leading-8 text-muted">
          استخدم رقم الهاتف أو البريد الإلكتروني مع كلمة المرور، ثم انتقل
          لواجهة OTP الجاهزة للربط.
        </p>
      </div>

      <div>
        <Input
          autoComplete="username"
          label="رقم الهاتف أو البريد الإلكتروني"
          name="identifier"
          placeholder="example@email.com أو 05xxxxxxxx"
          required
          type="text"
        />
        {errors.identifier ? (
          <p className="mt-2 text-xs font-bold text-rose-700">
            {errors.identifier}
          </p>
        ) : null}
      </div>

      <div>
        <Input
          autoComplete="current-password"
          label="كلمة المرور"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
        {errors.password ? (
          <p className="mt-2 text-xs font-bold text-rose-700">
            {errors.password}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
        <label className="flex items-center gap-2 text-muted">
          <input className="size-4 accent-primary" type="checkbox" />
          تذكرني
        </label>
        <Link href="/forgot-password" className="text-primary">
          نسيت كلمة المرور؟
        </Link>
      </div>

      <Button type="submit">تسجيل الدخول</Button>

      <button
        className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-black text-ink transition hover:border-primary hover:text-primary"
        disabled
        type="button"
      >
        الدخول عبر UAE PASS قريباً
      </button>
    </form>
  );
}
