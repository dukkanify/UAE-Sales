import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <SystemPage
      title="We'll be right back"
      description="Eager Pilots is undergoing scheduled maintenance. Please check again shortly."
      actionLabel="Refresh home"
    />
  );
}
