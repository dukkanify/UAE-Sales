import type { Metadata } from "next";

import { PerformanceReportsList } from "@/features/performance/components/performance-reports-list";

export const metadata: Metadata = { title: "Performance reports" };

export default function StudentPerformanceReportsPage() {
  return (
    <PerformanceReportsList
      title="My performance reports"
      description="Evaluations submitted by your instructor after each lecture."
      breadcrumbs={[{ label: "Student" }, { label: "Performance reports" }]}
    />
  );
}
