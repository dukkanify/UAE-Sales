/**
 * Activity / audit action keys.
 */

export const ACTIVITY_ACTIONS = {
  LOGIN: "auth.login",
  LOGOUT: "auth.logout",
  PASSWORD_CHANGE: "auth.password_change",
  PASSWORD_RESET_REQUEST: "auth.password_reset_request",
  PASSWORD_RESET: "auth.password_reset",
  EMAIL_VERIFIED: "auth.email_verified",
  PROFILE_UPDATE: "profile.update",
  PROFILE_COMPLETE: "profile.complete",
  ROLE_CHANGE: "users.role_change",
  PERMISSION_CHANGE: "users.permission_change",
  USER_CREATED: "users.created",
  USER_DELETED: "users.deleted",
  STATUS_CHANGE: "users.status_change",
  SESSION_REVOKED: "auth.session_revoked",
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];
