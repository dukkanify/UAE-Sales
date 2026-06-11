import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  return (
    <form className="grid gap-5">
      <div>
        <p className="text-sm font-bold text-primary">تسجيل الدخول</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          ادخل إلى حسابك
        </h2>
        <p className="mt-3 leading-8 text-muted">
          استخدم رقم الهاتف أو البريد الإلكتروني لطلب رمز تحقق OTP في مرحلة
          الربط مع خدمة المصادقة.
        </p>
      </div>

      <Input
        autoComplete="username"
        label="رقم الهاتف أو البريد الإلكتروني"
        name="identifier"
        placeholder="example@email.com أو 05xxxxxxxx"
        required
        type="text"
      />

      <div className="rounded-3xl border border-dashed border-border bg-surface-muted p-5">
        <label className="grid gap-2 text-sm font-bold text-ink">
          <span>رمز OTP</span>
          <input
            className="focus-ring min-h-12 rounded-2xl border border-border bg-white px-4 text-center text-lg font-black tracking-[0.5em] text-ink placeholder:text-muted"
            disabled
            inputMode="numeric"
            placeholder="------"
            type="text"
          />
        </label>
        <p className="mt-3 text-xs font-bold text-muted">
          سيتم تفعيل إدخال الرمز بعد ربط خدمة إرسال OTP.
        </p>
      </div>

      <Button type="submit">طلب رمز الدخول</Button>

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
