import { AdminOpsCockpit } from "@/features/admin/components/AdminOpsCockpit";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      activePath="/admin"
      description="تقارير، تحليلات، إشراف، مدفوعات Stripe، ومحافظ — كل أقسام الموقع من مكان واحد."
      title="غرفة التحكم الكاملة"
    >
      <AdminOpsCockpit />
    </AdminShell>
  );
}
