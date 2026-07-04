"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cities, countries } from "@/shared/constants/locations";
import { OtpVerification } from "@/features/auth/components/OtpVerification";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { setSessionUser } from "@/services/storage";

type RegisterErrors = {
  confirmPassword?: string;
  email?: string;
  fullName?: string;
  password?: string;
  phone?: string;
  terms?: string;
};

type PendingUser = {
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
  const [identifier, setIdentifier] = useState("");
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
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

    if (!isValidEmail(email)) {
      nextErrors.email = "اكتب بريد إلكتروني صحيح.";
    }

    if (!isValidUaePhone(phone)) {
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

    if (Object.keys(nextErrors).length === 0) {
      setIdentifier(phone || email);
      setPendingUser({
        accountType,
        city: cities.find((item) => item.id === city)?.name ?? "دبي",
        email,
        fullName,
        phone,
      });
      setShowOtp(true);
    }
  }

  if (showOtp) {
    return (
      <OtpVerification
        identifier={identifier}
        onBack={() => setShowOtp(false)}
        onVerified={() => {
          if (!pendingUser) {
            return;
          }

          setSessionUser({
            id: `user-${Date.now()}`,
            ...pendingUser,
            isVerified: true,
            joinedAt: new Date().toISOString().slice(0, 10),
          });
          router.push("/profile");
        }}
      />
    );
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-bold text-primary">حساب جديد موثق</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          ابدأ البيع والشراء بأمان
        </h2>
        <p className="mt-3 leading-8 text-muted">
          أنشئ حسابك لإضافة الإعلانات، إدارة المحادثات، ومتابعة الصفقات المحمية داخل الإمارات.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input
            autoComplete="name"
            label="الاسم الكامل"
            name="fullName"
            placeholder="اكتب اسمك"
            required
            type="text"
          />
          {errors.fullName ? (
            <FormMessage variant="error">{errors.fullName}</FormMessage>
          ) : null}
        </div>
        <div>
          <Input
            autoComplete="email"
            label="البريد الإلكتروني"
            name="email"
            placeholder="example@email.com"
            required
            type="email"
          />
          {errors.email ? (
            <FormMessage variant="error">{errors.email}</FormMessage>
          ) : null}
        </div>
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
        <div>
          <Input
            autoComplete="tel"
            label="رقم الهاتف"
            name="phone"
            placeholder="05xxxxxxxx"
            required
            type="tel"
          />
          {errors.phone ? (
            <FormMessage variant="error">{errors.phone}</FormMessage>
          ) : null}
        </div>
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
        <div>
          <Input
            autoComplete="new-password"
            label="كلمة المرور"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
          {errors.password ? (
            <FormMessage variant="error">{errors.password}</FormMessage>
          ) : null}
        </div>
        <div>
          <Input
            autoComplete="new-password"
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            placeholder="••••••••"
            required
            type="password"
          />
          {errors.confirmPassword ? (
            <FormMessage variant="error">{errors.confirmPassword}</FormMessage>
          ) : null}
        </div>
      </div>

      <div>
        <label className="flex gap-3 rounded-[var(--radius-2xl)] bg-surface-muted p-4 text-sm font-medium leading-7 text-muted">
          <input
            className="mt-1 size-4 accent-primary"
            name="terms"
            required
            type="checkbox"
          />
          <span>
            أوافق على شروط الاستخدام وسياسة الخصوصية، وأفهم أن التحقق بالهوية
            وUAE PASS سيتم تفعيله لاحقاً.
          </span>
        </label>
        {errors.terms ? (
          <FormMessage variant="error">{errors.terms}</FormMessage>
        ) : null}
      </div>

      <Button type="submit">إنشاء الحساب</Button>
    </form>
  );
}
