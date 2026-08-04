import type { Metadata } from "next";

import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = { title: "Unauthorized" };

/** HTTP 401 — unauthenticated */
export default function Unauthorized401Page() {
  return (
    <SystemPage
      code="401"
      title="Sign in required"
      description="You need to sign in to access this resource."
      actionHref={routes.login}
      actionLabel="Sign in"
    />
  );
}
