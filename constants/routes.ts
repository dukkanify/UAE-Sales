/**
 * Application routes — single source of truth for navigation paths.
 */

export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  verifyOtp: "/verify-otp",
  authCallback: "/auth/callback",
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
  maintenance: "/maintenance",
  unauthorized: "/unauthorized",
  api: {
    health: "/api/health",
  },
} as const;

/** Routes that require authentication */
export const protectedRoutes = [
  "/dashboard",
] as const;

/** Routes accessible only when unauthenticated */
export const authRoutes = [
  "/login",
  "/register",
  "/verify-otp",
] as const;

/** Public system pages */
export const publicSystemRoutes = [
  "/maintenance",
  "/unauthorized",
] as const;
