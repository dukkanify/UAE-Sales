import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Reports" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="Cross-platform analytics and exportable reports."
      role="super-admin"
      href="/super-admin/reports"
      icon="BarChart3"
      emptyTitle="Reports module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
