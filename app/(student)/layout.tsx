import { RoleShell, type RoleNavItem } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";

const navItems: RoleNavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
  { label: "My Courses", href: "/student/courses", icon: "courses" },
  { label: "Profile", href: "/student/profile", icon: "settings" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.STUDENT} navItems={navItems}>
      {children}
    </RoleShell>
  );
}
