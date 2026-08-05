import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Account suspended",
  robots: { index: false, follow: false },
};

export default function AccountSuspendedPage() {
  return (
    <SystemPage
      title="Account suspended"
      description="Your account has been suspended. Please contact support if you need assistance restoring access."
      actionHref={routes.login}
      actionLabel="Back to sign in"
    />
  );
}
