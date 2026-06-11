import { cities } from "@/constants/locations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function RegisterForm() {
  return (
    <form className="grid gap-5">
      <div>
        <p className="text-sm font-bold text-primary">إنشاء حساب</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          ابدأ البيع والشراء بأمان
        </h2>
        <p className="mt-3 leading-8 text-muted">
          أنشئ حساباً أولياً لإدارة الإعلانات والمحادثات والطلبات والمحفظة
          لاحقاً.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          autoComplete="name"
          label="الاسم الكامل"
          name="fullName"
          placeholder="اكتب اسمك"
          required
          type="text"
        />
        <Input
          autoComplete="email"
          label="البريد الإلكتروني"
          name="email"
          placeholder="example@email.com"
          required
          type="email"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          autoComplete="tel"
          label="رقم الهاتف"
          name="phone"
          placeholder="05xxxxxxxx"
          required
          type="tel"
        />
        <Select
          label="المدينة"
          name="city"
          options={cities.map((city) => ({
            label: city.name,
            value: city.id,
          }))}
        />
      </div>

      <Select
        label="نوع الحساب"
        name="accountType"
        options={[
          { label: "مشتري", value: "buyer" },
          { label: "بائع فردي", value: "seller" },
          { label: "متجر أو معرض", value: "business" },
        ]}
      />

      <label className="flex gap-3 rounded-3xl bg-surface-muted p-4 text-sm font-bold leading-7 text-muted">
        <input className="mt-1 size-4 accent-primary" name="terms" required type="checkbox" />
        <span>
          أوافق على شروط الاستخدام وسياسة الخصوصية، وأفهم أن التحقق بالهوية
          وUAE PASS سيتم تفعيله لاحقاً.
        </span>
      </label>

      <Button type="submit">إنشاء الحساب</Button>
    </form>
  );
}
