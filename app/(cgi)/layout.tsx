import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { CGI_NAV } from "@/constants/dashboard-nav";
import { requirePageRole } from "@/services/auth/guards";

export default async function CgiLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole(ROLES.CHIEF_GROUND_INSTRUCTOR);
  return (
    <RoleShell role={ROLES.CHIEF_GROUND_INSTRUCTOR} navItems={CGI_NAV}>
      {children}
    </RoleShell>
  );
}
