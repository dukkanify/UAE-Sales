import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { INSTRUCTOR_NAV } from "@/constants/dashboard-nav";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.INSTRUCTOR} navItems={INSTRUCTOR_NAV}>
      {children}
    </RoleShell>
  );
}
