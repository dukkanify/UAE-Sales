import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = { title: "Forbidden" };

/** HTTP 403 — authenticated but not allowed */
export default function Forbidden403Page() {
  return (
    <SystemPage
      code="403"
      title="Access forbidden"
      description="You do not have permission to view this page."
      actionHref={routes.home}
      actionLabel="Back to home"
    />
  );
}
