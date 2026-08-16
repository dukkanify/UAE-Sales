import type { Metadata } from "next";

import { AssignmentEngineView } from "@/features/assignment/components/assignment-engine-view";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { getAssignmentEngineSnapshot } from "@/services/assignment/engine";
import { ROLES } from "@/constants/roles";
import { requirePageRole } from "@/services/auth/guards";

export const metadata: Metadata = { title: "Assignment Engine" };

export default async function CgiAssignmentPage() {
  await requirePageRole(ROLES.CHIEF_GROUND_INSTRUCTOR);
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  return <AssignmentEngineView initial={getAssignmentEngineSnapshot()} />;
}
