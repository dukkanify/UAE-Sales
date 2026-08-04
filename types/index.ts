import type { Role } from "@/constants/roles";

export type { Role };

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: Role;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
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
