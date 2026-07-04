"use client";

import { useEffect, useState } from "react";
import { cities } from "@/constants/locations";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getSessionUser } from "@/services/clientStorage";

type ProfileFormProps = {
  user: UserProfile;
};

const accountTypeLabels: Record<UserProfile["accountType"], string> = {
  business: "متجر أو معرض",
  buyer: "مشتري",
  company: "شركة",
  individual: "فرد",
  seller: "بائع فردي",
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayUser, setDisplayUser] = useState(user);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDisplayUser(getSessionUser() ?? user);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="overflow-hidden p-0">
        <div className="bg-[linear-gradient(135deg,#111827,#1f2937)] p-6 text-white">
          <div className="uae-flag-strip mb-5 h-1.5 w-24 rounded-full" />
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid size-20 place-items-center rounded-3xl bg-secondary text-2xl font-black text-primary shadow-lg">
              {displayUser.fullName.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-black">{displayUser.fullName}</h2>
              <p className="mt-2 text-sm font-bold text-white/75">
                {displayUser.email}
              </p>
              <p className="mt-1 text-xs font-bold text-secondary">
                {displayUser.isVerified ? "حساب موثق ✓" : "بانتظار توثيق UAE PASS"}
              </p>
            </div>
          </div>
        </div>

        <form
          key={displayUser.id}
          className="grid gap-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSaveMessage("تم حفظ التغييرات محلياً. سيتم ربط الحفظ بالخادم لاحقاً.");
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              defaultValue={displayUser.fullName}
              label="الاسم الكامل"
              name="fullName"
              type="text"
            />
            <Input
              defaultValue={displayUser.email}
              label="البريد الإلكتروني"
              name="email"
              type="email"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              defaultValue={displayUser.phone}
              label="رقم الهاتف"
              name="phone"
              type="tel"
            />
            <Select
              defaultValue={cities.find((city) => city.name === displayUser.city)?.id}
              label="الإمارة / المدينة"
              name="city"
              options={cities.map((city) => ({
                label: city.name,
                value: city.id,
              }))}
            />
          </div>

          <Select
            defaultValue={displayUser.accountType}
            label="نوع الحساب"
            name="accountType"
            options={[
              { label: "فرد", value: "individual" },
              { label: "شركة", value: "company" },
              { label: "مشتري", value: "buyer" },
              { label: "بائع فردي", value: "seller" },
              { label: "متجر أو معرض", value: "business" },
            ]}
          />

          {saveMessage ? (
            <div className="rounded-2xl border border-secondary/30 bg-secondary-soft p-4 text-sm font-black text-primary">
              {saveMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface-muted p-4">
            <p className="text-sm font-bold text-muted">
              بياناتك محفوظة محلياً في هذا المتصفح.
            </p>
            <Button type="submit">حفظ التغييرات</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        <Card className="overflow-hidden p-6">
          <div className="uae-flag-strip -mx-6 -mt-6 mb-5 h-1.5" />
          <h2 className="text-xl font-black text-ink">حالة الحساب</h2>
          <div className="mt-5 grid gap-3 text-sm font-bold">
            <div className="flex justify-between rounded-2xl bg-surface-muted p-4">
              <span className="text-muted">نوع الحساب</span>
              <span className="text-ink">
                {accountTypeLabels[displayUser.accountType]}
              </span>
            </div>
            <div className="flex justify-between rounded-2xl bg-surface-muted p-4">
              <span className="text-muted">التوثيق</span>
              <span
                className={
                  displayUser.isVerified ? "text-primary" : "text-amber-700"
                }
              >
                {displayUser.isVerified ? "موثق" : "بانتظار UAE PASS"}
              </span>
            </div>
            <div className="flex justify-between rounded-2xl bg-surface-muted p-4">
              <span className="text-muted">تاريخ الانضمام</span>
              <span className="text-ink">{displayUser.joinedAt}</span>
            </div>
          </div>
        </Card>

        <Card className="border-primary-soft bg-primary-soft p-6">
          <h2 className="text-lg font-black text-primary">خطوة التوثيق القادمة</h2>
          <p className="mt-3 text-sm font-bold leading-7 text-primary">
            عند تفعيل UAE PASS سيتمكن المستخدم من توثيق الهوية ورفع حدود البيع
            والسحب من المحفظة.
          </p>
        </Card>
      </div>
    </div>
  );
}
