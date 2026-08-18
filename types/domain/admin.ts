import type { CategoryIconName } from "./category";
import type { CategorySpecs } from "./category-fields";
import type { ListingCondition, ListingStatus } from "./listing";
import type { AccountStatus, AdminPermission, UserRole } from "./user";

export type DisputeStatus =
  | "open"
  | "under_review"
  | "resolved_buyer"
  | "resolved_seller"
  | "closed";

export type AdminUserRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  isVerified: boolean;
  accountStatus: AccountStatus;
  emailVerifiedAt?: string | null;
  joinedAt: string;
  listingsCount: number;
  adminPermissions?: AdminPermission[];
};

export type AdminUserPatch = Partial<
  Pick<
    AdminUserRecord,
    "isVerified" | "accountStatus" | "role" | "adminPermissions"
  >
>;

export type AdminListingRecord = {
  id: string;
  slug: string;
  title: string;
  sellerName: string;
  sellerId: string;
  categoryId: string;
  price: number;
  currency: string;
  status: ListingStatus;
  isFeatured: boolean;
  postedAt: string;
  city: string;
};

export type AdminListingCreateInput = {
  title: string;
  description?: string;
  categoryId: string;
  city: string;
  price: number;
  condition?: ListingCondition;
  status?: ListingStatus;
  isFeatured?: boolean;
  isUrgent?: boolean;
  sellerName?: string;
  emirate?: string;
  area?: string;
  contactPhone?: string;
  features?: string[];
  negotiable?: boolean;
  categorySpecs?: CategorySpecs;
};

export type AdminListingPatch = Partial<
  Pick<AdminListingRecord, "status" | "isFeatured">
> & {
  rejectReason?: string;
};

export type AdminDisputeRecord = {
  id: string;
  orderId: string;
  listingTitle: string;
  buyerName: string;
  sellerName: string;
  reason: string;
  status: DisputeStatus;
  amount: number;
  createdAt: string;
  resolutionNote?: string;
  evidenceUrls?: string[];
};

export type AdminDisputePatch = Partial<
  Pick<AdminDisputeRecord, "status" | "resolutionNote">
>;

export type AdminCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconName;
  listingCount: number;
  enabled: boolean;
  sortOrder: number;
  subcategories: string[];
};

export type AdminCategoryPatch = Partial<
  Pick<
    AdminCategoryRecord,
    "name" | "slug" | "enabled" | "listingCount" | "icon" | "sortOrder"
  >
>;

export type AdminCategoryCreateInput = {
  name: string;
  slug: string;
  icon?: CategoryIconName;
  sortOrder?: number;
};

export type AdminModerationSummary = {
  pendingListings: number;
  suspendedUsers: number;
  openDisputes: number;
  disabledCategories: number;
  totalUsers: number;
  totalListings: number;
};
