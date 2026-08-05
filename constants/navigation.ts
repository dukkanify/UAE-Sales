import { PERMISSIONS } from "@/constants/permissions";
import type { Permission } from "@/constants/permissions";
import type { Role } from "@/constants/roles";

export const NAV_ITEMS = [
  { label: "Platform", href: "/" },
  { label: "Flightpath", href: "/#flightpath" },
  { label: "Live", href: "/#live" },
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
    default: "ATPL PASS | Aviation Course Platform",
    template: "%s | ATPL PASS",
  },
  description:
    "The 2030 aviation course platform for ATPL theory, live Zoom coaching, and exam mastery.",
} as const;
