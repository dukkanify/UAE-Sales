import type { Metadata } from "next";

import { CgiConsoleView } from "@/features/cgi/components/cgi-console-view";
import { newDashboardCorrelationId, safeDashboardQuery } from "@/lib/dashboard/safe-load";
import { getCgiDashboardSnapshot } from "@/services/cgi/journey-service";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { ROLES } from "@/constants/roles";
import { requirePageRole } from "@/services/auth/guards";

export const metadata: Metadata = { title: "CGI Dashboard" };

type CgiSnapshot = ReturnType<typeof getCgiDashboardSnapshot>;

const EMPTY_CGI_SNAPSHOT: CgiSnapshot = {
  settings: {
    defaultFirstSubjectCourseId: null,
    packageSku: "ATPL-PACKAGE",
    updatedAt: new Date(0).toISOString(),
    updatedById: null,
  },
  subjectCount: 0,
  studentCount: 0,
  instructorCount: 0,
  lectureAssignmentCount: 0,
  defaultFirstSubjectCourseId: null,
  recentAudit: [],
  subjects: [],
  students: [],
  instructors: [],
};

export default async function CgiDashboardPage() {
  const user = await requirePageRole(ROLES.CHIEF_GROUND_INSTRUCTOR);
  const correlationId = newDashboardCorrelationId();
  const base = {
    userId: user.id,
    role: user.role,
    correlationId,
    path: "/cgi/dashboard",
  };

  safeDashboardQuery({
    ...base,
    label: "ensureDemoUsersSeeded",
    fallback: undefined,
    run: () => {
      ensureDemoUsersSeeded();
    },
  });
  safeDashboardQuery({
    ...base,
    label: "ensureCoursesSeeded",
    fallback: undefined,
    run: () => {
      ensureCoursesSeeded();
    },
  });

  const snapshot = safeDashboardQuery({
    ...base,
    label: "getCgiDashboardSnapshot",
    fallback: EMPTY_CGI_SNAPSHOT,
    run: () => getCgiDashboardSnapshot(),
  });

  return <CgiConsoleView initial={snapshot} />;
}
