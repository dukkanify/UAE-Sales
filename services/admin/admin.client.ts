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
import { apiClient, isApiConfigured } from "@/services/api";
import {
  addMockAdminCategory,
  getMockAdminCategories,
  getMockAdminDisputes,
  getMockAdminEscrow,
  getMockAdminListings,
  getMockAdminOrders,
  getMockAdminReports,
  getMockAdminSummary,
  getMockAdminUsers,
  patchMockAdminDispute,
  patchMockAdminEscrow,
  patchMockAdminListing,
  patchMockAdminUser,
  updateMockAdminCategory,
} from "@/mock/admin.mock";

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "all") {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function fetchWithFallback<T>(
  path: string,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (isApiConfigured()) {
    try {
      return await apiClient<T>(path);
    } catch {
      // fall through to mock
    }
  }
  return fallback();
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  return fetchWithFallback("/api/admin/summary", getMockAdminSummary);
}

export async function fetchAdminUsers(filters?: {
  query?: string;
  role?: string;
  verified?: string;
}): Promise<AdminUserRecord[]> {
  return fetchWithFallback(
    `/api/admin/users${buildQuery(filters ?? {})}`,
    () => getMockAdminUsers(filters),
  );
}

export async function fetchAdminListings(filters?: {
  status?: string;
  categoryId?: string;
  emirate?: string;
}): Promise<AdminListingRecord[]> {
  return fetchWithFallback(
    `/api/admin/listings${buildQuery(filters ?? {})}`,
    () => getMockAdminListings(filters),
  );
}

export async function fetchAdminOrders(filters?: {
  status?: string;
}): Promise<AdminOrderRecord[]> {
  return fetchWithFallback(
    `/api/admin/orders${buildQuery(filters ?? {})}`,
    () => getMockAdminOrders(filters),
  );
}

export async function fetchAdminEscrow(filters?: {
  status?: string;
}): Promise<AdminEscrowRecord[]> {
  return fetchWithFallback(
    `/api/admin/escrow${buildQuery(filters ?? {})}`,
    () => getMockAdminEscrow(filters),
  );
}

export async function fetchAdminDisputes(filters?: {
  status?: string;
}): Promise<AdminDisputeRecord[]> {
  return fetchWithFallback(
    `/api/admin/disputes${buildQuery(filters ?? {})}`,
    () => getMockAdminDisputes(filters),
  );
}

export async function fetchAdminCategories(): Promise<AdminCategoryRecord[]> {
  return fetchWithFallback("/api/admin/categories", getMockAdminCategories);
}

export async function fetchAdminReports(): Promise<AdminReportsData> {
  return fetchWithFallback("/api/admin/reports", getMockAdminReports);
}

export async function patchAdminUserClient(
  id: string,
  patch: AdminUserPatch,
): Promise<AdminUserRecord | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<AdminUserRecord>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      // fall through
    }
  }
  return patchMockAdminUser(id, patch);
}

export async function patchAdminListingClient(
  id: string,
  patch: AdminListingPatch,
): Promise<AdminListingRecord | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<AdminListingRecord>(`/api/admin/listings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      // fall through
    }
  }
  return patchMockAdminListing(id, patch);
}

export async function patchAdminDisputeClient(
  id: string,
  patch: AdminDisputePatch,
): Promise<AdminDisputeRecord | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<AdminDisputeRecord>(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      // fall through
    }
  }
  return patchMockAdminDispute(id, patch);
}

export async function patchAdminEscrowClient(
  id: string,
  action: "release" | "refund",
): Promise<AdminEscrowRecord | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<AdminEscrowRecord>(`/api/admin/escrow/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
    } catch {
      // fall through
    }
  }
  return patchMockAdminEscrow(id, action);
}

export async function addAdminCategoryClient(
  name: string,
): Promise<AdminCategoryRecord> {
  if (isApiConfigured()) {
    try {
      return await apiClient<AdminCategoryRecord>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    } catch {
      // fall through
    }
  }
  return addMockAdminCategory(name);
}

export async function updateAdminCategoryClient(
  id: string,
  patch: Partial<Pick<AdminCategoryRecord, "name" | "disabled">>,
): Promise<AdminCategoryRecord | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<AdminCategoryRecord>(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      // fall through
    }
  }
  return updateMockAdminCategory(id, patch);
}
