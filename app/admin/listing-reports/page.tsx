import { AdminListingReportsPanel } from "@/features/admin/components/AdminListingReportsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminListingReportsPage() {
  return (
    <AdminShell
      activePath="/admin/listing-reports"
      description="بلاغات الإعلانات من الزوار والمستخدمين. هنا اسم العميل وبريده وهاتفه وتفاصيل البلاغ."
      title="بلاغات الإعلانات"
    >
      <AdminListingReportsPanel />
    </AdminShell>
  );
}
