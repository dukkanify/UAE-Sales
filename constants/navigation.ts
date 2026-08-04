export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/#programs" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export const DASHBOARD_NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: "User",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
] as const;

export const APP_METADATA = {
  title: {
    default: "Eager Pilots | Aviation Education Platform",
    template: "%s | Eager Pilots",
  },
  description:
    "Professional aviation education, consultation, and pilot training by Eager Pilots.",
} as const;
