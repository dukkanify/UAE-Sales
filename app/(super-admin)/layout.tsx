import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { SUPER_ADMIN_NAV } from "@/constants/dashboard-nav";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.SUPER_ADMIN} navItems={SUPER_ADMIN_NAV}>
      {children}
    </RoleShell>
  );
}
