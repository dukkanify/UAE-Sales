import type { Metadata } from "next";

import { AssignmentEngineView } from "@/features/assignment/components/assignment-engine-view";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { getAssignmentEngineSnapshot } from "@/services/assignment/engine";

export const metadata: Metadata = { title: "Assignment Engine" };

export default function CgiAssignmentPage() {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  return <AssignmentEngineView initial={getAssignmentEngineSnapshot()} />;
}
