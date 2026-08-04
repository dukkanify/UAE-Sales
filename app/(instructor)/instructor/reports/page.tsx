import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Reports" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="Teaching performance and attendance summaries."
      role="instructor"
      href="/instructor/reports"
      icon="BarChart3"
      emptyTitle="Reports module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
