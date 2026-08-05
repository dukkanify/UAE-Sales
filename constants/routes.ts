/**
 * Application routes — single source of truth.
 */

export const routes = {
  home: "/",
  splash: "/splash",
  book: "/book",

  // Auth
  login: "/login",
  register: "/register",
  verifyOtp: "/verify-otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  completeProfile: "/complete-profile",
  authCallback: "/auth/callback",

  // System auth states
  accessDenied: "/access-denied",
  accountSuspended: "/account-suspended",
  sessionExpired: "/session-expired",
  unauthorized: "/unauthorized",
  maintenance: "/maintenance",

  // Role dashboards
  studentDashboard: "/student/dashboard",
  instructorDashboard: "/instructor/dashboard",
  adminDashboard: "/admin/dashboard",
  superAdminDashboard: "/super-admin/dashboard",

  // Legacy alias (redirects by role)
  dashboard: "/dashboard",

  api: {
    health: "/api/health",
    auth: {
      me: "/api/auth/me",
      logout: "/api/auth/logout",
      requestOtp: "/api/auth/otp/request",
      verifyOtp: "/api/auth/otp/verify",
      forgotPassword: "/api/auth/forgot-password",
      resetPassword: "/api/auth/reset-password",
      completeProfile: "/api/auth/complete-profile",
    },
    notifications: "/api/notifications",
    activityLogs: "/api/admin/activity-logs",
  },
} as const;

/** Routes that require authentication */
export const protectedRoutePrefixes = [
  "/student",
  "/instructor",
  "/admin",
  "/super-admin",
  "/dashboard",
  "/complete-profile",
  "/join",
] as const;

/** Routes accessible only when unauthenticated */
export const authRoutes = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/splash",
] as const;

/** Public system pages (no auth required) */
export const publicSystemRoutes = [
  "/maintenance",
  "/unauthorized",
  "/access-denied",
  "/account-suspended",
  "/session-expired",
  "/coming-soon",
  "/offline",
  "/401",
  "/403",
  "/design-system",
] as const;

/** Map route prefix → required role */
export const ROLE_ROUTE_GUARDS: Record<string, string> = {
  "/student": "student",
  "/instructor": "instructor",
  "/admin": "admin",
  "/super-admin": "super_admin",
};
