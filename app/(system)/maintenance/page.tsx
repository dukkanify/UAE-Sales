import type { Metadata } from "next";

import { MaintenanceStatusView } from "@/features/ops/components/maintenance-status-view";
import { getMaintenancePublicStatus } from "@/services/support-ops";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  const status = getMaintenancePublicStatus();
  return <MaintenanceStatusView status={status} />;
}
