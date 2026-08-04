import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Reports" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="Operational reports for your administration scope."
      role="admin"
      href="/admin/reports"
      icon="BarChart3"
      emptyTitle="Reports module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
