import { AdminOpsCockpit } from "@/features/admin/components/AdminOpsCockpit";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      activePath="/admin"
      description="قرار واحد في كل مرة: مدفوعات، ضمان، وطلبات واردة — مرتّبة حسب ما يحتاج تدخلك الآن."
      title="غرفة عمليات سوقنا"
    >
      <AdminOpsCockpit />
    </AdminShell>
  );
}
