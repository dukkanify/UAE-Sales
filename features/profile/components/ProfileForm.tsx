"use client";

import { useState } from "react";
import { cities } from "@/shared/constants/locations";
import type { UserProfile } from "@/types";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { getSessionUser, setSessionUser } from "@/services/storage";

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
  const [displayUser, setDisplayUser] = useState(() =>
    typeof window !== "undefined" ? (getSessionUser() ?? user) : user,
  );
  const [saveMessage, setSaveMessage] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="overflow-hidden p-0">
        <div className="luxury-gradient p-6 text-white">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid size-20 place-items-center rounded-[var(--radius-2xl)] bg-secondary text-2xl font-semibold text-primary shadow-[var(--shadow-md)]">
              {displayUser.fullName.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-black">{displayUser.fullName}</h2>
              <p className="mt-2 text-sm font-medium text-white/75">
                {displayUser.email}
              </p>
              <p className="mt-2">
                <Badge variant={displayUser.isVerified ? "verified" : "pending"}>
                  {displayUser.isVerified ? "حساب موثق" : "بانتظار توثيق UAE PASS"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <form
          key={displayUser.id}
          className="grid gap-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            const cityId = String(formData.get("city") ?? "");
            const cityName =
              cities.find((city) => city.id === cityId)?.name ?? displayUser.city;
            const accountType = String(
              formData.get("accountType") ?? displayUser.accountType,
            ) as UserProfile["accountType"];

            const updatedUser: UserProfile = {
              ...displayUser,
              fullName: String(formData.get("fullName") ?? displayUser.fullName),
              email: String(formData.get("email") ?? displayUser.email),
              phone: String(formData.get("phone") ?? displayUser.phone),
              city: cityName,
              accountType,
            };

            setSessionUser(updatedUser);
            setDisplayUser(updatedUser);
            setSaveMessage("تم حفظ التغييرات محلياً.");
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
            <FormMessage variant="success">{saveMessage}</FormMessage>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">
              بياناتك محفوظة محلياً في هذا المتصفح.
            </p>
            <Button type="submit">حفظ التغييرات</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-black text-ink">حالة الحساب</h2>
          <div className="mt-5 grid gap-3 text-sm font-medium">
            <div className="flex justify-between rounded-[var(--radius-xl)] bg-surface-muted p-4">
              <span className="text-muted">نوع الحساب</span>
              <span className="font-semibold text-ink">
                {accountTypeLabels[displayUser.accountType]}
              </span>
            </div>
            <div className="flex justify-between rounded-[var(--radius-xl)] bg-surface-muted p-4">
              <span className="text-muted">التوثيق</span>
              <Badge variant={displayUser.isVerified ? "verified" : "pending"}>
                {displayUser.isVerified ? "موثق" : "بانتظار UAE PASS"}
              </Badge>
            </div>
            <div className="flex justify-between rounded-[var(--radius-xl)] bg-surface-muted p-4">
              <span className="text-muted">تاريخ الانضمام</span>
              <span className="font-semibold text-ink">{displayUser.joinedAt}</span>
            </div>
          </div>
        </Card>

        <Card className="border-primary-soft bg-primary-soft p-6">
          <h2 className="text-lg font-black text-primary">خطوة التوثيق القادمة</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-primary">
            عند تفعيل UAE PASS سيتمكن المستخدم من توثيق الهوية ورفع حدود البيع
            والسحب من المحفظة.
          </p>
        </Card>
      </div>
    </div>
  );
}
