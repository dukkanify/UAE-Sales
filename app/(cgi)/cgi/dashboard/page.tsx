import type { Metadata } from "next";

import { CgiConsoleView } from "@/features/cgi/components/cgi-console-view";
import { getCgiDashboardSnapshot } from "@/services/cgi/journey-service";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { ensureCoursesSeeded } from "@/services/courses/seed";

export const metadata: Metadata = { title: "CGI Dashboard" };

export default function CgiDashboardPage() {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const snapshot = getCgiDashboardSnapshot();
  return <CgiConsoleView initial={snapshot} />;
}
