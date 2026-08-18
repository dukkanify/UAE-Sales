import { AdminListingsPanel } from "@/features/admin/components/AdminListingsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminListingsPage() {
  return (
    <AdminShell
      activePath="/admin/listings"
      description="راجع الإعلانات قبل النشر: اعتمد أو ارفض بسبب واضح. يظهر الإعلان في البحث بعد الاعتماد فقط."
      title="الإعلانات"
    >
      <AdminListingsPanel />
    </AdminShell>
  );
}
