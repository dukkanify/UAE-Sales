import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminViewingBookingsPanel } from "@/features/admin/components/AdminViewingBookingsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminViewingBookingsPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/viewing-bookings"
      description="حجوزات معاينة العقارات والمواعيد المرتبطة بها."
      title="حجوزات المعاينة"
    >
      <AdminViewingBookingsPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
