import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { STUDENT_NAV } from "@/constants/dashboard-nav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.STUDENT} navItems={STUDENT_NAV}>
      {children}
    </RoleShell>
  );
}
