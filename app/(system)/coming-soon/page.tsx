import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = { title: "Coming soon" };

export default function ComingSoonPage() {
  return (
    <SystemPage
      code="Soon"
      title="Coming soon"
      description="This part of ATPL PASS is under construction. Check back shortly."
      actionHref={routes.home}
      actionLabel="Back to home"
    />
  );
}
