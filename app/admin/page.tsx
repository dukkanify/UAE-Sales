import { AdminOpsCockpit } from "@/features/admin/components/AdminOpsCockpit";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      activePath="/admin"
      description="تقارير وتحليلات ومدفوعات وإشراف — كل أدوات تشغيل السوق في مكان واحد."
      title="غرفة التحكم"
    >
      <AdminOpsCockpit />
    </AdminShell>
  );
}
