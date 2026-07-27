import { AdminListingsPanel } from "@/features/admin/components/AdminListingsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminListingsPage() {
  return (
    <AdminShell
      activePath="/admin/listings"
      description="أضف إعلانات جديدة، وراجعها: اعتماد، رفض، وتمييز — مع اختيار القسم لكل إعلان."
      title="الإعلانات"
    >
      <AdminListingsPanel />
    </AdminShell>
  );
}
