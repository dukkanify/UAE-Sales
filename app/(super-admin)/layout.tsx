import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { SUPER_ADMIN_NAV } from "@/constants/dashboard-nav";
import { requirePageRole } from "@/services/auth/guards";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole(ROLES.SUPER_ADMIN);
  return (
    <RoleShell role={ROLES.SUPER_ADMIN} navItems={SUPER_ADMIN_NAV}>
      {children}
    </RoleShell>
  );
}
