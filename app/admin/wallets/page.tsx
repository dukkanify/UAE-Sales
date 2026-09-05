import { AdminWalletsPanel } from "@/features/admin/components/AdminWalletsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminWalletsPage() {
  return (
    <AdminShell
      activePath="/admin/wallets"
      description="أرصدة المستخدمين المتاحة والمعلّقة والمحجوزة في الضمان."
      title="المحافظ"
    >
      <AdminWalletsPanel />
    </AdminShell>
  );
}
