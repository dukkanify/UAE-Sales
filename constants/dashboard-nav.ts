/**
 * Role-based sidebar navigation for dashboards.
 */

import type { Role } from "@/constants/roles";

export type DashboardIcon =
  | "dashboard"
  | "users"
  | "admins"
  | "instructors"
  | "students"
  | "courses"
  | "classes"
  | "lessons"
  | "communities"
  | "blog"
  | "payments"
  | "wallets"
  | "reports"
  | "settings"
  | "logs"
  | "notifications"
  | "profile"
  | "calendar"
  | "bookings"
  | "assignments"
  | "quizzes"
  | "certificates"
  | "wallet"
  | "activity"
  | "monitoring"
  | "favorites"
  | "notes"
  | "resources"
  | "planner"
  | "history"
  | "search"
  | "bookmark"
  | "messages"
  | "support"
  | "megaphone"
  | "analytics"
  | "ai"
  | "ops"
  | "api"
  | "assets"
  | "media"
  | "phase2";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: DashboardIcon;
}

export const SUPER_ADMIN_NAV: DashboardNavItem[] = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: "dashboard" },
  { label: "Users", href: "/super-admin/users", icon: "users" },
  { label: "Admins", href: "/super-admin/admins", icon: "admins" },
  { label: "Instructors", href: "/super-admin/instructors", icon: "instructors" },
  { label: "Students", href: "/super-admin/students", icon: "students" },
  { label: "Courses", href: "/super-admin/courses", icon: "courses" },
  { label: "Course publishing", href: "/super-admin/courses/publishing", icon: "courses" },
  { label: "Quizzes", href: "/super-admin/quizzes", icon: "quizzes" },
  { label: "Certificates", href: "/super-admin/certificates", icon: "certificates" },
  { label: "Classes", href: "/super-admin/classes", icon: "classes" },
  { label: "Bookings", href: "/super-admin/bookings", icon: "bookings" },
  { label: "Messages", href: "/super-admin/messages", icon: "messages" },
  { label: "Communities", href: "/super-admin/communities", icon: "communities" },
  { label: "Announcements", href: "/super-admin/announcements", icon: "megaphone" },
  { label: "Blog", href: "/super-admin/blog", icon: "blog" },
  { label: "Support", href: "/super-admin/support", icon: "support" },
  { label: "Moderation", href: "/super-admin/moderation", icon: "logs" },
  { label: "Payments", href: "/super-admin/payments", icon: "payments" },
  { label: "Instructor Wallets", href: "/super-admin/wallets", icon: "wallets" },
  { label: "Analytics", href: "/super-admin/analytics", icon: "analytics" },
  { label: "AI Assistant", href: "/super-admin/ai", icon: "ai" },
  { label: "Reports", href: "/super-admin/reports", icon: "reports" },
  { label: "Platform Settings", href: "/super-admin/settings", icon: "settings" },
  { label: "Asset Manager", href: "/super-admin/assets", icon: "assets" },
  { label: "Media Library", href: "/super-admin/media-library", icon: "media" },
  { label: "Phase 2 Roadmap", href: "/super-admin/phase2", icon: "phase2" },
  { label: "Monitoring", href: "/super-admin/monitoring", icon: "monitoring" },
  { label: "Ops Center", href: "/super-admin/ops-center", icon: "ops" },
  { label: "API Platform", href: "/super-admin/api-platform", icon: "api" },
  { label: "Ops / Backups", href: "/super-admin/system-logs", icon: "logs" },
  { label: "Activity Logs", href: "/super-admin/activity-logs", icon: "activity" },
  { label: "Notifications", href: "/super-admin/notifications", icon: "notifications" },
  { label: "Profile", href: "/super-admin/profile", icon: "profile" },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Students", href: "/admin/students", icon: "students" },
  { label: "Instructors", href: "/admin/instructors", icon: "instructors" },
  { label: "Courses", href: "/admin/courses", icon: "courses" },
  { label: "Quizzes", href: "/admin/quizzes", icon: "quizzes" },
  { label: "Certificates", href: "/admin/certificates", icon: "certificates" },
  { label: "Classes", href: "/admin/classes", icon: "classes" },
  { label: "Bookings", href: "/admin/bookings", icon: "bookings" },
  { label: "Messages", href: "/admin/messages", icon: "messages" },
  { label: "Communities", href: "/admin/communities", icon: "communities" },
  { label: "Announcements", href: "/admin/announcements", icon: "megaphone" },
  { label: "Blog", href: "/admin/blog", icon: "blog" },
  { label: "Support", href: "/admin/support", icon: "support" },
  { label: "Moderation", href: "/admin/moderation", icon: "logs" },
  { label: "Payments", href: "/admin/payments", icon: "payments" },
  { label: "Wallets", href: "/admin/wallets", icon: "wallets" },
  { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
  { label: "AI Assistant", href: "/admin/ai", icon: "ai" },
  { label: "Reports", href: "/admin/reports", icon: "reports" },
  { label: "Notifications", href: "/admin/notifications", icon: "notifications" },
  { label: "Profile", href: "/admin/profile", icon: "profile" },
];

export const INSTRUCTOR_NAV: DashboardNavItem[] = [
  { label: "Dashboard", href: "/instructor/dashboard", icon: "dashboard" },
  { label: "My Courses", href: "/instructor/courses", icon: "courses" },
  { label: "Lessons", href: "/instructor/lessons", icon: "lessons" },
  { label: "Students", href: "/instructor/students", icon: "students" },
  { label: "Assignments", href: "/instructor/assignments", icon: "assignments" },
  { label: "Quizzes", href: "/instructor/quizzes", icon: "quizzes" },
  { label: "Certificates", href: "/instructor/certificates", icon: "certificates" },
  { label: "Calendar", href: "/instructor/calendar", icon: "calendar" },
  { label: "Bookings", href: "/instructor/bookings", icon: "bookings" },
  { label: "Live Classes", href: "/instructor/classes", icon: "classes" },
  { label: "Messages", href: "/instructor/messages", icon: "messages" },
  { label: "Community", href: "/instructor/community", icon: "communities" },
  { label: "Announcements", href: "/instructor/announcements", icon: "megaphone" },
  { label: "Support", href: "/instructor/support", icon: "support" },
  { label: "Wallet", href: "/instructor/wallet", icon: "wallet" },
  { label: "Analytics", href: "/instructor/analytics", icon: "analytics" },
  { label: "AI Assistant", href: "/instructor/ai", icon: "ai" },
  { label: "Reports", href: "/instructor/reports", icon: "reports" },
  { label: "Notifications", href: "/instructor/notifications", icon: "notifications" },
  { label: "Profile", href: "/instructor/profile", icon: "profile" },
];

export const CGI_NAV: DashboardNavItem[] = [
  { label: "Dashboard", href: "/cgi/dashboard", icon: "dashboard" },
  { label: "ATPL Journey", href: "/cgi/atpl", icon: "courses" },
  { label: "Subjects", href: "/cgi/subjects", icon: "lessons" },
  { label: "Lectures", href: "/cgi/lectures", icon: "calendar" },
  { label: "Assignment Engine", href: "/cgi/assignment", icon: "instructors" },
  { label: "Instructors", href: "/cgi/instructors", icon: "instructors" },
  { label: "Students", href: "/cgi/students", icon: "students" },
  { label: "Schedule", href: "/cgi/schedule", icon: "classes" },
  { label: "Messages", href: "/cgi/messages", icon: "messages" },
  { label: "Notifications", href: "/cgi/notifications", icon: "notifications" },
  { label: "Profile", href: "/cgi/profile", icon: "profile" },
];

export const STUDENT_NAV: DashboardNavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
  { label: "My Courses", href: "/student/courses", icon: "courses" },
  { label: "Resources", href: "/student/resources", icon: "resources" },
  { label: "Notes", href: "/student/notes", icon: "notes" },
  { label: "Favorites", href: "/student/favorites", icon: "favorites" },
  { label: "Planner", href: "/student/planner", icon: "planner" },
  { label: "Calendar", href: "/student/calendar", icon: "calendar" },
  { label: "Book a session", href: "/student/bookings", icon: "bookings" },
  { label: "History", href: "/student/history", icon: "history" },
  { label: "Search", href: "/student/search", icon: "search" },
  { label: "Assignments", href: "/student/assignments", icon: "assignments" },
  { label: "Quizzes", href: "/student/quizzes", icon: "quizzes" },
  { label: "Progress", href: "/student/progress", icon: "activity" },
  { label: "Analytics", href: "/student/analytics", icon: "analytics" },
  { label: "AI Assistant", href: "/student/ai", icon: "ai" },
  { label: "Certificates", href: "/student/certificates", icon: "certificates" },
  { label: "Transcript", href: "/student/transcript", icon: "reports" },
  { label: "Messages", href: "/student/messages", icon: "messages" },
  { label: "Community", href: "/student/community", icon: "communities" },
  { label: "Announcements", href: "/student/announcements", icon: "megaphone" },
  { label: "Support", href: "/student/support", icon: "support" },
  { label: "Checkout", href: "/student/checkout", icon: "payments" },
  { label: "Billing", href: "/student/billing", icon: "wallet" },
  { label: "Comm Search", href: "/student/comm-search", icon: "search" },
  { label: "Notifications", href: "/student/notifications", icon: "notifications" },
  { label: "Profile", href: "/student/profile", icon: "profile" },
];

export const DASHBOARD_NAV: Record<Role, DashboardNavItem[]> = {
  super_admin: SUPER_ADMIN_NAV,
  admin: ADMIN_NAV,
  chief_ground_instructor: CGI_NAV,
  instructor: INSTRUCTOR_NAV,
  student: STUDENT_NAV,
};
