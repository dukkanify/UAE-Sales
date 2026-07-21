import { AdminDisputesPanel } from "@/features/admin/components/AdminDisputesPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminDisputesPage() {
  return (
    <AdminShell
      activePath="/admin/disputes"
      description="فض النزاعات بين المشتري والبائع بقرار واضح."
      title="النزاعات"
    >
      <AdminDisputesPanel />
    </AdminShell>
  );
}
