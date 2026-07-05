import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

export function AdminSettingsPanel() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="marketplace-panel p-6" variant="flat">
        <h2 className="text-sm font-semibold text-ink">إعدادات المنصة</h2>
        <p className="mt-2 text-sm text-muted">
          إعدادات الإدارة المتقدمة ستتوفر في المرحلة التالية من تطوير
          الـ backend.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted">
          <li>· سياسات المراجعة التلقائية</li>
          <li>· حدود الضمان والعمولات</li>
          <li>· إشعارات المدير</li>
          <li>· صلاحيات الأدوار الفرعية</li>
        </ul>
      </Card>

      <Card className="marketplace-panel p-6" variant="flat">
        <h2 className="text-sm font-semibold text-ink">حساب المدير التجريبي</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted">البريد</dt>
            <dd className="font-medium">admin@uaesales.demo</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">كلمة المرور</dt>
            <dd className="font-medium">Admin@123</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">رمز OTP</dt>
            <dd className="font-medium">123456</dd>
          </div>
        </dl>
        <Button className="mt-5" href="/" variant="secondary">
          العودة للموقع
        </Button>
      </Card>
    </div>
  );
}
