import { AdminSettingsPanel } from "@/features/admin/components/AdminSettingsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      activePath="/admin/settings"
      description="الرسوم، الضمان، اعتماد الحسابات الجديدة، وضع الصيانة، الشراء كضيف، ورابط لوحة Stripe."
      title="إعدادات الموقع"
    >
      <AdminSettingsPanel />
    </AdminShell>
  );
}
