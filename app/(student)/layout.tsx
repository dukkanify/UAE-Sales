import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { STUDENT_NAV } from "@/constants/dashboard-nav";
import { requirePageRole } from "@/services/auth/guards";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole(ROLES.STUDENT);
  return (
    <RoleShell role={ROLES.STUDENT} navItems={STUDENT_NAV}>
      {children}
    </RoleShell>
  );
}
