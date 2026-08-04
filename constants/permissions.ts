/**
 * Permission keys — single source of truth for RBAC.
 * Must stay in sync with database/migrations/003_seed_permissions_countries.sql
 */

export const PERMISSIONS = {
  // Super Admin / System
  SYSTEM_SETTINGS: "system.settings",
  SYSTEM_SECURITY: "system.security",
  SYSTEM_EMAIL: "system.email",
  SYSTEM_ZOOM: "system.zoom",
  SYSTEM_PAYMENTS: "system.payments",
  FINANCE_REPORTS: "finance.reports",
  FINANCE_WALLETS: "finance.wallets",
  USERS_MANAGE_ADMINS: "users.manage_admins",
  USERS_MANAGE_ALL: "users.manage_all",
  DASHBOARD_SUPER_ADMIN: "dashboard.super_admin",
  AUDIT_READ: "audit.read",

  // Admin
  STUDENTS_MANAGE: "students.manage",
  INSTRUCTORS_MANAGE: "instructors.manage",
  COURSES_MANAGE: "courses.manage",
  CLASSES_MANAGE: "classes.manage",
  COMMUNITIES_MODERATE: "communities.moderate",
  REPORTS_VIEW: "reports.view",
  BLOG_MANAGE: "blog.manage",
  CALENDAR_MANAGE: "calendar.manage",
  DASHBOARD_ADMIN: "dashboard.admin",

  // Instructor
  DASHBOARD_INSTRUCTOR: "dashboard.instructor",
  COURSES_OWN: "courses.own",
  STUDENTS_OWN: "students.own",
  SCHEDULE_OWN: "schedule.own",
  ZOOM_SESSIONS: "zoom.sessions",
  ATTENDANCE_MANAGE: "attendance.manage",
  QUIZZES_MANAGE: "quizzes.manage",
  ASSIGNMENTS_MANAGE: "assignments.manage",
  WALLET_OWN: "wallet.own",
  EARNINGS_OWN: "earnings.own",
  REPORTS_OWN: "reports.own",
  PROFILE_OWN: "profile.own",

  // Student
  DASHBOARD_STUDENT: "dashboard.student",
  COURSES_ENROLLED: "courses.enrolled",
  CALENDAR_OWN: "calendar.own",
  ZOOM_CLASSES: "zoom.classes",
  ASSIGNMENTS_OWN: "assignments.own",
  QUIZZES_OWN: "quizzes.own",
  CERTIFICATES_OWN: "certificates.own",
  NOTIFICATIONS_OWN: "notifications.own",
  COMMUNITY_ACCESS: "community.access",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/** Role → permission grants */
export const ROLE_PERMISSIONS: Record<
  "super_admin" | "admin" | "instructor" | "student",
  readonly Permission[]
> = {
  super_admin: ALL_PERMISSIONS,
  admin: [
    PERMISSIONS.STUDENTS_MANAGE,
    PERMISSIONS.INSTRUCTORS_MANAGE,
    PERMISSIONS.COURSES_MANAGE,
    PERMISSIONS.CLASSES_MANAGE,
    PERMISSIONS.COMMUNITIES_MODERATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.BLOG_MANAGE,
    PERMISSIONS.CALENDAR_MANAGE,
    PERMISSIONS.DASHBOARD_ADMIN,
    PERMISSIONS.PROFILE_OWN,
    PERMISSIONS.NOTIFICATIONS_OWN,
  ],
  instructor: [
    PERMISSIONS.DASHBOARD_INSTRUCTOR,
    PERMISSIONS.COURSES_OWN,
    PERMISSIONS.STUDENTS_OWN,
    PERMISSIONS.SCHEDULE_OWN,
    PERMISSIONS.ZOOM_SESSIONS,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.QUIZZES_MANAGE,
    PERMISSIONS.ASSIGNMENTS_MANAGE,
    PERMISSIONS.WALLET_OWN,
    PERMISSIONS.EARNINGS_OWN,
    PERMISSIONS.REPORTS_OWN,
    PERMISSIONS.PROFILE_OWN,
    PERMISSIONS.NOTIFICATIONS_OWN,
  ],
  student: [
    PERMISSIONS.DASHBOARD_STUDENT,
    PERMISSIONS.COURSES_ENROLLED,
    PERMISSIONS.CALENDAR_OWN,
    PERMISSIONS.ZOOM_CLASSES,
    PERMISSIONS.ASSIGNMENTS_OWN,
    PERMISSIONS.QUIZZES_OWN,
    PERMISSIONS.CERTIFICATES_OWN,
    PERMISSIONS.NOTIFICATIONS_OWN,
    PERMISSIONS.COMMUNITY_ACCESS,
    PERMISSIONS.PROFILE_OWN,
  ],
};
