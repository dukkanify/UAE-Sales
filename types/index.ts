import type { Role } from "@/constants/roles";
import type { AccountStatus } from "@/constants/account-status";
import type { Permission } from "@/constants/permissions";
import type { ActivityAction } from "@/constants/activity-actions";

export type { Role, AccountStatus, Permission, ActivityAction };

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  countryCode: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  city: string | null;
  bio: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  avatarUrl: string | null;
  timezone: string;
  language: string;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  profileComplete: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  /** Stable browser/device fingerprint hash (CR002) */
  deviceFingerprint: string | null;
  /** Short human label derived from user agent */
  deviceLabel: string | null;
  rememberMe: boolean;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  lastActiveAt: string;
}

/** Safe session row for session management UI (no token hashes). */
export interface SessionListItem {
  id: string;
  deviceLabel: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  deviceFingerprint: string | null;
  rememberMe: boolean;
  current: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

/** Client DRM / content protection flags for recorded lessons (CR002). */
export interface ContentProtectionConfig {
  watermarkEnabled: boolean;
  watermarkText: string;
  disableRightClick: boolean;
  blockScreenshotShortcuts: boolean;
  deterScreenRecording: boolean;
  videoDownloadProtection: boolean;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: "in_app" | "email" | "push" | "mobile";
  type: string;
  /** Catalog category for filters */
  category?: string;
  priority?: "critical" | "high" | "medium" | "low" | "informational";
  actionUrl?: string | null;
  /** unread | read | archived | deleted */
  status?: "unread" | "read" | "archived" | "deleted";
  data: Record<string, unknown>;
  /** Smart grouping key (similar events collapse in UI) */
  groupKey?: string | null;
  /** Idempotency / anti-spam key */
  dedupeKey?: string | null;
  readAt: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
  emailSentAt?: string | null;
  createdAt: string;
}

export interface ActivityLogRecord {
  id: string;
  actorId: string | null;
  action: ActivityAction | string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string | null;
  action: string;
  resource: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string | null;
  active: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type StatusVariant = "default" | "success" | "warning" | "error" | "info";
