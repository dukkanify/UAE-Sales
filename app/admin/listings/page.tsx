import { AdminListingsPanel } from "@/features/admin/components/AdminListingsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminListingsPage() {
  return (
    <AdminShell
      activePath="/admin/listings"
      description="مراجعة الإعلانات: اعتماد، رفض، وتمييز المميز."
      title="الإعلانات"
    >
      <AdminListingsPanel />
    </AdminShell>
  );
}
