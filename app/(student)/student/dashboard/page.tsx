import { redirect } from "next/navigation";

import { LearningDashboardView } from "@/features/learning";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { agentLog } from "@/lib/debug/agent-log";
import { getCurrentSession } from "@/services/auth/auth-service";

export default async function StudentDashboardPage() {
  // #region agent log
  agentLog({
    hypothesisId: "E",
    location: "student/dashboard/page.tsx",
    message: "StudentDashboardPage entry",
    data: {},
  });
  // #endregion
  try {
    const { user } = await getCurrentSession();
    if (!user) redirect(routes.login);
    if (user.role !== ROLES.STUDENT) redirect(routes.accessDenied);

    // #region agent log
    agentLog({
      hypothesisId: "E",
      location: "student/dashboard/page.tsx",
      message: "StudentDashboardPage rendering LearningDashboardView",
      data: { userIdPrefix: user.id.slice(0, 8) },
    });
    // #endregion

    return <LearningDashboardView />;
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "E",
      location: "student/dashboard/page.tsx",
      message: "StudentDashboardPage THREW",
      data: {
        code:
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : "",
        errMessage: error instanceof Error ? error.message : String(error),
      },
    });
    // #endregion
    throw error;
  }
}
