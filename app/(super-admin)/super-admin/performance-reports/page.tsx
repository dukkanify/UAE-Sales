import type { Metadata } from "next";

import { AdminPerformanceOverview } from "@/features/performance/components/admin-performance-overview";

export const metadata: Metadata = { title: "Performance reports" };

export default function SuperAdminPerformanceReportsPage() {
  return <AdminPerformanceOverview />;
}
