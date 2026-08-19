import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminLocationsPanel } from "@/features/admin/components/AdminLocationsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminLocationsPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/locations"
      description="إدارة المدن والمواقع المعروضة في السوق."
      title="المواقع / المدن"
    >
      <AdminLocationsPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
