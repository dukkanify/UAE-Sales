import { RoleShell } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";
import { ADMIN_NAV } from "@/constants/dashboard-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.ADMIN} navItems={ADMIN_NAV}>
      {children}
    </RoleShell>
  );
}
