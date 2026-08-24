import { RoleShell, type RoleNavItem } from "@/components/layout/role-shell";
import { ROLES } from "@/constants/roles";

const navItems: RoleNavItem[] = [
  { label: "Dashboard", href: "/instructor/dashboard", icon: "dashboard" },
  { label: "My Courses", href: "/instructor/courses", icon: "courses" },
  { label: "Wallet", href: "/instructor/wallet", icon: "wallet" },
  { label: "Profile", href: "/instructor/profile", icon: "settings" },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleShell role={ROLES.INSTRUCTOR} navItems={navItems}>
      {children}
    </RoleShell>
  );
}
