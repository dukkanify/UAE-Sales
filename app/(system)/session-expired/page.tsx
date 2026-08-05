import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Session expired",
  robots: { index: false, follow: false },
};

export default function SessionExpiredPage() {
  return (
    <SystemPage
      title="Session expired"
      description="Your session has ended for security reasons. Please sign in again to continue."
      actionHref={routes.login}
      actionLabel="Sign in"
    />
  );
}
