import type { Metadata } from "next";

import { CgiConsoleView } from "@/features/cgi/components/cgi-console-view";
import { getCgiDashboardSnapshot } from "@/services/cgi/journey-service";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { ROLES } from "@/constants/roles";
import { requirePageRole } from "@/services/auth/guards";

export const metadata: Metadata = { title: "CGI Dashboard" };

export default async function CgiDashboardPage() {
  await requirePageRole(ROLES.CHIEF_GROUND_INSTRUCTOR);
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const snapshot = getCgiDashboardSnapshot();
  return <CgiConsoleView initial={snapshot} />;
}
