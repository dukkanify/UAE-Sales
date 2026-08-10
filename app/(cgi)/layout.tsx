import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { CGI_NAV } from "@/constants/dashboard-nav";

export default function CgiLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.CHIEF_GROUND_INSTRUCTOR} navItems={CGI_NAV}>
      {children}
    </RoleShell>
  );
}
