import type {
  AdminCategoryRecord,
  AdminDisputePatch,
  AdminDisputeRecord,
  AdminEscrowRecord,
  AdminListingPatch,
  AdminListingRecord,
  AdminOrderRecord,
  AdminReportsData,
  AdminSummary,
  AdminUserPatch,
  AdminUserRecord,
} from "@/types/domain/admin";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getAdminCategoriesFromDb,
  getAdminDisputesFromDb,
  getAdminEscrowFromDb,
  getAdminListingsFromDb,
  getAdminOrdersFromDb,
  getAdminReportsFromDb,
  getAdminSummaryFromDb,
  getAdminUsersFromDb,
} from "@/lib/repositories/admin.repository";
import {
  getMockAdminCategories,
  getMockAdminDisputes,
  getMockAdminEscrow,
  getMockAdminListings,
  getMockAdminOrders,
  getMockAdminReports,
  getMockAdminSummary,
  getMockAdminUsers,
} from "@/mock/admin.mock";

export async function getAdminSummary(): Promise<AdminSummary> {
  return withDataFallback(
    getAdminSummaryFromDb,
    getMockAdminSummary,
    "admin-summary",
  );
}

export async function getAdminUsers(filters?: {
  query?: string;
  role?: string;
  verified?: string;
}): Promise<AdminUserRecord[]> {
  return withDataFallback(
    () => getAdminUsersFromDb(filters),
    () => getMockAdminUsers(filters),
    "admin-users",
  );
}

export async function getAdminListings(filters?: {
  status?: string;
  categoryId?: string;
  emirate?: string;
}): Promise<AdminListingRecord[]> {
  return withDataFallback(
    () => getAdminListingsFromDb(filters),
    () => getMockAdminListings(filters),
    "admin-listings",
  );
}

export async function getAdminOrders(filters?: {
  status?: string;
}): Promise<AdminOrderRecord[]> {
  return withDataFallback(
    () => getAdminOrdersFromDb(filters),
    () => getMockAdminOrders(filters),
    "admin-orders",
  );
}

export async function getAdminEscrow(filters?: {
  status?: string;
}): Promise<AdminEscrowRecord[]> {
  return withDataFallback(
    () => getAdminEscrowFromDb(filters),
    () => getMockAdminEscrow(filters),
    "admin-escrow",
  );
}

export async function getAdminDisputes(filters?: {
  status?: string;
}): Promise<AdminDisputeRecord[]> {
  return withDataFallback(
    () => getAdminDisputesFromDb(filters),
    () => getMockAdminDisputes(filters),
    "admin-disputes",
  );
}

export async function getAdminCategories(): Promise<AdminCategoryRecord[]> {
  return withDataFallback(
    getAdminCategoriesFromDb,
    getMockAdminCategories,
    "admin-categories",
  );
}

export async function getAdminReports(): Promise<AdminReportsData> {
  return withDataFallback(
    getAdminReportsFromDb,
    getMockAdminReports,
    "admin-reports",
  );
}

export type {
  AdminCategoryRecord,
  AdminDisputePatch,
  AdminDisputeRecord,
  AdminEscrowRecord,
  AdminListingPatch,
  AdminListingRecord,
  AdminOrderRecord,
  AdminReportsData,
  AdminSummary,
  AdminUserPatch,
  AdminUserRecord,
};
