"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { trackAuthEventClient } from "@/services/analytics/auth-events";

type RegisterErrors = {
  email?: string;
  fullName?: string;
  terms?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RegisterForm() {
  const [errors, setErrors] = useState<RegisterErrors>({});
  const router = useRouter();

  const { isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const fullName = String(formData.get("fullName") ?? "").trim();
      const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
      const accountType = String(formData.get("accountType") ?? "individual") as
        | "individual"
        | "company";
      const termsAccepted = formData.get("terms") === "on";
      const nextErrors: RegisterErrors = {};

      if (fullName.length < 3) {
        nextErrors.fullName = "اكتب الاسم الكامل بشكل صحيح.";
      }
      if (!isValidEmail(nextEmail)) {
        nextErrors.email = "اكتب بريد إلكتروني صحيح.";
      }
      if (!termsAccepted) {
        nextErrors.terms = "يجب الموافقة على الشروط قبل إنشاء الحساب.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      trackAuthEventClient("registration_started", { accountType });

      const response = await fetch("/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextEmail,
          fullName,
          accountType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error === "EMAIL_SEND_FAILED"
            ? "تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى."
            : "تعذر إنشاء طلب التحقق. حاول مرة أخرى.",
        );
      }

      trackAuthEventClient("registration_otp_sent");
      const params = new URLSearchParams({
        email: data.email ?? nextEmail,
        purpose: "REGISTER",
        masked: data.maskedEmail ?? nextEmail,
      });
      router.push(`/verify-email?${params.toString()}`);
    }, [router]),
  );

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-bold text-primary">حساب جديد</p>
        <h2 className="mt-2 text-2xl font-black text-ink">ابدأ بالبريد الإلكتروني فقط</h2>
        <p className="mt-3 leading-8 text-muted">
          سجّل بالبريد الإلكتروني وسنرسل لك رمز تحقق لتفعيل حسابك فورًا — بدون كلمة مرور
          إلزامية.
        </p>
      </div>

      <Input
        autoComplete="name"
        error={errors.fullName}
        label="الاسم الكامل"
        name="fullName"
        placeholder="اكتب اسمك"
        required
        type="text"
      />

      <Input
        autoComplete="email"
        error={errors.email}
        label="البريد الإلكتروني"
        name="email"
        placeholder="example@email.com"
        required
        type="email"
      />

      <Select
        label="نوع الحساب"
        name="accountType"
        options={[
          { label: "فرد", value: "individual" },
          { label: "شركة", value: "company" },
        ]}
      />

      <div>
        <label className="flex gap-3 rounded-[var(--radius-2xl)] bg-surface-muted p-4 text-sm font-medium leading-7 text-muted">
          <input className="mt-1 size-4 accent-primary" name="terms" required type="checkbox" />
          <span>أوافق على شروط الاستخدام وسياسة الخصوصية.</span>
        </label>
        {errors.terms ? <FormMessage variant="error">{errors.terms}</FormMessage> : null}
      </div>

      <Button loading={isLoading} type="submit">
        متابعة
      </Button>
    </form>
  );
}
