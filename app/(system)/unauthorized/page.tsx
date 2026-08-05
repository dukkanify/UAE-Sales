import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Unauthorized",
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <SystemPage
      code="401"
      title="Unauthorized"
      description="You do not have permission to access this resource. Sign in with an authorized account or contact your administrator."
      actionHref={routes.login}
      actionLabel="Sign in"
    />
  );
}
