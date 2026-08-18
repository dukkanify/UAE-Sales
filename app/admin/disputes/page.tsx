import { AdminDisputesPanel } from "@/features/admin/components/AdminDisputesPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminDisputesPage() {
  return (
    <AdminShell
      activePath="/admin/disputes"
      description="راجع السبب والمهلة والأدلة ورد البائع، ثم أصدر قراراً يُشعر الطرفين."
      title="النزاعات"
    >
      <AdminDisputesPanel />
    </AdminShell>
  );
}
