import { AdminListingsPanel } from "@/features/admin/components/AdminListingsPanel";
import {
  AdminShell,
  type AdminPath,
} from "@/features/admin/components/AdminShell";

export default function AdminListingsPage() {
  return (
    <AdminShell
      activePath={"/admin/listings" as AdminPath}
      description="مراجعة الإعلانات — اعتماد، رفض، وتمييز العروض المميزة."
      title="إدارة الإعلانات"
    >
      <AdminListingsPanel />
    </AdminShell>
  );
}
