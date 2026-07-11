"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cities, countries } from "@/shared/constants/locations";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import type { UserProfile } from "@/types";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { syncFavoritesAfterLogin } from "@/services/favorites/favorites-client";
import { setSessionUser } from "@/services/storage";

type RegisterErrors = {
  confirmPassword?: string;
  email?: string;
  fullName?: string;
  password?: string;
  phone?: string;
  terms?: string;
};

type PendingRegistration = {
  accountType: "individual" | "company";
  city: string;
  email: string;
  fullName: string;
  phone: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUaePhone(value: string) {
  return /^(\+971|971|0)?5\d{8}$/.test(value);
}

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function RegisterForm() {
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  const { isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const fullName = String(formData.get("fullName") ?? "").trim();
      const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
      const phone = String(formData.get("phone") ?? "").trim();
      const city = String(formData.get("city") ?? "dubai");
      const accountType = String(formData.get("accountType") ?? "individual") as
        | "individual"
        | "company";
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");
      const termsAccepted = formData.get("terms") === "on";
      const nextErrors: RegisterErrors = {};

      if (fullName.length < 3) {
        nextErrors.fullName = "اكتب الاسم الكامل بشكل صحيح.";
      }
      if (!isValidEmail(nextEmail)) {
        nextErrors.email = "اكتب بريد إلكتروني صحيح.";
      }
      if (phone && !isValidUaePhone(phone)) {
        nextErrors.phone = "اكتب رقم هاتف إماراتي صحيح مثل 05xxxxxxxx.";
      }
      if (!isStrongPassword(password)) {
        nextErrors.password =
          "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم.";
      }
      if (password !== confirmPassword) {
        nextErrors.confirmPassword = "كلمة المرور وتأكيدها غير متطابقين.";
      }
      if (!termsAccepted) {
        nextErrors.terms = "يجب الموافقة على الشروط قبل إنشاء الحساب.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      const response = await fetch("/api/auth/otp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextEmail,
          fullName,
          password,
          accountType,
          city: cities.find((item) => item.id === city)?.name ?? "دبي",
          phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error === "EMAIL_SEND_FAILED"
            ? "تعذر إرسال رمز التحقق إلى بريدك. حاول لاحقًا."
            : "تعذر إنشاء طلب التحقق. حاول مرة أخرى.",
        );
      }

      setEmail(data.email ?? nextEmail);
      setMaskedEmail(data.maskedEmail ?? nextEmail);
      setPending({
        accountType,
        city: cities.find((item) => item.id === city)?.name ?? "دبي",
        email: nextEmail,
        fullName,
        phone,
      });
      setShowOtp(true);
    }, []),
  );

  const handleVerified = useCallback(
    async (data?: { user?: UserProfile }) => {
      const user = data?.user;
      if (!user) return;

      setSessionUser(user);
      await persistSessionCookie(user);
      await syncFavoritesAfterLogin(user.id);
      router.push("/profile");
    },
    [router],
  );

  if (showOtp && pending) {
    return (
      <OtpVerification
        email={email}
        fullName={pending.fullName}
        maskedEmail={maskedEmail}
        onBack={() => setShowOtp(false)}
        onVerified={handleVerified}
        purpose="REGISTER"
      />
    );
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-bold text-primary">حساب جديد موثق</p>
        <h2 className="mt-2 text-2xl font-black text-ink">ابدأ البيع والشراء بأمان</h2>
        <p className="mt-3 leading-8 text-muted">
          أنشئ حسابك لإضافة الإعلانات، إدارة المحادثات، ومتابعة الصفقات المحمية داخل الإمارات.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="الدولة"
          name="country"
          options={countries.map((country) => ({
            label: country.name,
            value: country.id,
          }))}
        />
        <Select
          label="الإمارة / المدينة"
          name="city"
          options={cities.map((city) => ({
            label: city.name,
            value: city.id,
          }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          autoComplete="tel"
          error={errors.phone}
          hint="اختياري للتواصل — التحقق عبر البريد الإلكتروني فقط"
          label="رقم الهاتف (اختياري)"
          name="phone"
          placeholder="05xxxxxxxx"
          type="tel"
        />
        <Select
          label="نوع الحساب"
          name="accountType"
          options={[
            { label: "فرد", value: "individual" },
            { label: "شركة", value: "company" },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          autoComplete="new-password"
          error={errors.password}
          hint="8 أحرف على الأقل مع حرف كبير وصغير ورقم"
          label="كلمة المرور"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
        <Input
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          placeholder="••••••••"
          required
          type="password"
        />
      </div>

      <div>
        <label className="flex gap-3 rounded-[var(--radius-2xl)] bg-surface-muted p-4 text-sm font-medium leading-7 text-muted">
          <input
            className="mt-1 size-4 accent-primary"
            name="terms"
            required
            type="checkbox"
          />
          <span>أوافق على شروط الاستخدام وسياسة الخصوصية.</span>
        </label>
        {errors.terms ? (
          <FormMessage variant="error">{errors.terms}</FormMessage>
        ) : null}
      </div>

      <Button loading={isLoading} type="submit">
        إنشاء الحساب
      </Button>
    </form>
  );
}
