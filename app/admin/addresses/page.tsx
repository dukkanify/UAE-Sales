import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminAddressesPanel } from "@/features/admin/components/AdminAddressesPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminAddressesPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/addresses"
      description="عناوين التوصيل المحفوظة للمستخدمين من رحلة الشراء في الموقع."
      title="العناوين"
    >
      <AdminAddressesPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
