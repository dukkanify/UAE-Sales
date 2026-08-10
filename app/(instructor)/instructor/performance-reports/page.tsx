import type { Metadata } from "next";

import { PerformanceReportsList } from "@/features/performance/components/performance-reports-list";

export const metadata: Metadata = { title: "Performance reports" };

export default function InstructorPerformanceReportsPage() {
  return (
    <PerformanceReportsList
      title="Submitted performance reports"
      description="Student evaluations you have filed after lectures."
      breadcrumbs={[{ label: "Instructor" }, { label: "Performance reports" }]}
    />
  );
}
