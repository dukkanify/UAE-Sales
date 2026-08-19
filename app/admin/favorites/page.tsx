import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminFavoritesPanel } from "@/features/admin/components/AdminFavoritesPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminFavoritesPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/favorites"
      description="اهتمام المستخدمين بالإعلانات — من مخزن المفضلة الحي في الموقع."
      title="المفضلة"
    >
      <AdminFavoritesPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
