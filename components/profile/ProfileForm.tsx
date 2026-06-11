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

  useEffect(() => {
    setDisplayUser(getSessionUser() ?? user);
  }, [user]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="p-6">
        <form key={displayUser.id} className="grid gap-5">
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
              label="المدينة"
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface-muted p-4">
            <p className="text-sm font-bold text-muted">
              سيتم ربط الحفظ بخدمة المستخدم عند توفر Backend.
            </p>
            <Button type="submit">حفظ التغييرات</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        <Card className="p-6">
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
