import { PERMISSIONS } from "@/constants/permissions";
import type { Permission } from "@/constants/permissions";
import type { Role } from "@/constants/roles";

export const NAV_ITEMS = [
  { label: "Platform", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Flightpath", href: "/flightpath" },
  { label: "Live", href: "/live" },
  { label: "Book", href: "/book" },
] as const;

export const DASHBOARD_NAV_BY_ROLE: Record<
  Role,
  { label: string; href: string; permission?: Permission }[]
> = {
  student: [
    { label: "Dashboard", href: "/student/dashboard", permission: PERMISSIONS.DASHBOARD_STUDENT },
    { label: "Profile", href: "/student/profile", permission: PERMISSIONS.PROFILE_OWN },
  ],
  instructor: [
    {
      label: "Dashboard",
      href: "/instructor/dashboard",
      permission: PERMISSIONS.DASHBOARD_INSTRUCTOR,
    },
    { label: "Profile", href: "/instructor/profile", permission: PERMISSIONS.PROFILE_OWN },
  ],
  chief_ground_instructor: [
    { label: "Dashboard", href: "/cgi/dashboard", permission: PERMISSIONS.DASHBOARD_CGI },
    { label: "ATPL Journey", href: "/cgi/atpl", permission: PERMISSIONS.ATPL_FIRST_SUBJECT },
    { label: "Profile", href: "/cgi/profile", permission: PERMISSIONS.PROFILE_OWN },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", permission: PERMISSIONS.DASHBOARD_ADMIN },
    { label: "Users", href: "/admin/users", permission: PERMISSIONS.STUDENTS_MANAGE },
  ],
  super_admin: [
    {
      label: "Dashboard",
      href: "/super-admin/dashboard",
      permission: PERMISSIONS.DASHBOARD_SUPER_ADMIN,
    },
    {
      label: "Activity Logs",
      href: "/super-admin/activity-logs",
      permission: PERMISSIONS.AUDIT_READ,
    },
    { label: "Settings", href: "/super-admin/settings", permission: PERMISSIONS.SYSTEM_SETTINGS },
    { label: "Assets", href: "/super-admin/assets", permission: PERMISSIONS.SYSTEM_SETTINGS },
    { label: "Media", href: "/super-admin/media-library", permission: PERMISSIONS.SYSTEM_SETTINGS },
  ],
};

export const APP_METADATA = {
  title: {
    default: "AviatorPass | Your Aviation Journey Starts Here",
    template: "%s | AviatorPass",
  },
  description:
    "YOUR AVIATION JOURNEY STARTS HERE. AviatorPass delivers ATPL theory, live Zoom instructor coaching, quizzes, and exam mastery for pilots in Kuwait and Dubai.",
} as const;
