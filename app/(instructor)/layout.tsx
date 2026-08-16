import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { INSTRUCTOR_NAV } from "@/constants/dashboard-nav";
import { requirePageRole } from "@/services/auth/guards";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole([ROLES.INSTRUCTOR, ROLES.CHIEF_GROUND_INSTRUCTOR]);
  return (
    <RoleShell role={ROLES.INSTRUCTOR} navItems={INSTRUCTOR_NAV}>
      {children}
    </RoleShell>
  );
}
