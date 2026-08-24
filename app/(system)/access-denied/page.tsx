import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

export default function AccessDeniedPage() {
  return (
    <SystemPage
      code="403"
      title="Access denied"
      description="You do not have permission to view this page. If you believe this is an error, contact your administrator."
      actionHref={routes.home}
      actionLabel="Back to home"
    />
  );
}
