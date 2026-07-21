import { AdminEscrowPanel } from "@/features/admin/components/AdminEscrowPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminEscrowPage() {
  return (
    <AdminShell
      activePath="/admin/escrow"
      description="المبالغ المحجوزة وحالة الضمان — حرّر أو استرد بقرار واضح."
      title="الضمان المالي"
    >
      <AdminEscrowPanel />
    </AdminShell>
  );
}
