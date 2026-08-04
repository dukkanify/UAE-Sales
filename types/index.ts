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
  rememberMe: boolean;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  lastActiveAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: "in_app" | "email";
  type: string;
  data: Record<string, unknown>;
  readAt: string | null;
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
