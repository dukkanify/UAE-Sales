import type { Metadata } from "next";

import { AutomationCenterView } from "@/features/automation/components/automation-center-view";

export const metadata: Metadata = { title: "Automation Center" };

export default function SuperAdminAutomationCenterPage() {
  return <AutomationCenterView />;
}
