"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cities } from "@/shared/constants/locations";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { setSessionUser } from "@/services/storage";

const categories = [
  { label: "سيارات", value: "cars" },
  { label: "عقارات", value: "property" },
  { label: "إلكترونيات", value: "electronics" },
  { label: "أزياء", value: "fashion" },
  { label: "خدمات", value: "services" },
];

export function BusinessOnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/auth/business/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessName: String(formData.get("businessName") ?? "").trim(),
          tradeLicenseNumber: String(formData.get("tradeLicenseNumber") ?? "").trim(),
          emirate:
            cities.find((city) => city.id === String(formData.get("emirate") ?? ""))?.name ??
            "دبي",
          category: String(formData.get("category") ?? ""),
          contactPhone: String(formData.get("contactPhone") ?? "").trim(),
          logoUrl: String(formData.get("logoUrl") ?? "").trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError("تعذر حفظ بيانات النشاط التجاري.");
        return;
      }

      if (data.user) {
        setSessionUser(data.user);
        await persistSessionCookie(data.user);
      }
      router.push("/dashboard/listings");
    }, [router]),
  );

  return (
    <Card className="p-6" variant="flat">
      <h2 className="text-2xl font-black text-ink">إكمال بيانات النشاط التجاري</h2>
      <p className="mt-2 text-sm text-muted">
        أكمل بيانات شركتك لبدء نشر الإعلانات وإدارة الصفقات.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <Input label="اسم النشاط التجاري" name="businessName" required type="text" />
        <Input label="رقم الرخصة التجارية" name="tradeLicenseNumber" required type="text" />
        <Select
          label="الإمارة"
          name="emirate"
          options={cities.map((city) => ({ label: city.name, value: city.id }))}
        />
        <Select label="التصنيف" name="category" options={categories} />
        <Input label="هاتف التواصل" name="contactPhone" required type="tel" />
        <Input hint="اختياري" label="رابط الشعار" name="logoUrl" type="url" />
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}
        <Button loading={isLoading} type="submit">
          حفظ ومتابعة
        </Button>
      </form>
    </Card>
  );
}
