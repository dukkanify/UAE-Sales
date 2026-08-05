import { RoleShell, type RoleNavItem } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";

const navItems: RoleNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Courses", href: "/admin/courses", icon: "courses" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.ADMIN} navItems={navItems}>
      {children}
    </RoleShell>
  );
}
