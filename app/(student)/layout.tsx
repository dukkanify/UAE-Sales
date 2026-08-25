import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { STUDENT_NAV } from "@/constants/dashboard-nav";
import { agentLog } from "@/lib/debug/agent-log";
import { requirePageRole } from "@/services/auth/guards";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // #region agent log
  agentLog({
    hypothesisId: "E",
    location: "app/(student)/layout.tsx",
    message: "StudentLayout entry — before requirePageRole",
    data: {},
  });
  // #endregion
  try {
    await requirePageRole(ROLES.STUDENT);
    // #region agent log
    agentLog({
      hypothesisId: "E",
      location: "app/(student)/layout.tsx",
      message: "StudentLayout requirePageRole ok",
      data: {},
    });
    // #endregion
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "E",
      location: "app/(student)/layout.tsx",
      message: "StudentLayout requirePageRole THREW",
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
  return (
    <RoleShell role={ROLES.STUDENT} navItems={STUDENT_NAV}>
      {children}
    </RoleShell>
  );
}
