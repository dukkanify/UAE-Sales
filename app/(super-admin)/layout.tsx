import { RoleShell, type RoleNavItem } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";

const navItems: RoleNavItem[] = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: "dashboard" },
  { label: "Activity Logs", href: "/super-admin/activity-logs", icon: "activity" },
  { label: "Settings", href: "/super-admin/settings", icon: "settings" },
  { label: "Users", href: "/admin/users", icon: "users" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.SUPER_ADMIN} navItems={navItems}>
      {children}
    </RoleShell>
  );
}
