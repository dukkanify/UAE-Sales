import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { ADMIN_NAV } from "@/constants/dashboard-nav";
import { requirePageRole } from "@/services/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  return (
    <RoleShell role={ROLES.ADMIN} navItems={ADMIN_NAV}>
      {children}
    </RoleShell>
  );
}
