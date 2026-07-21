import type { CategoryIconName } from "./category";
import type { ListingStatus } from "./listing";
import type { AccountStatus, UserRole } from "./user";

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
  joinedAt: string;
  listingsCount: number;
};

export type AdminUserPatch = Partial<
  Pick<AdminUserRecord, "isVerified" | "accountStatus" | "role">
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

export type AdminListingPatch = Partial<
  Pick<AdminListingRecord, "status" | "isFeatured">
>;

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
  subcategories: string[];
};

export type AdminCategoryPatch = Partial<
  Pick<AdminCategoryRecord, "name" | "slug" | "enabled" | "listingCount" | "icon">
>;

export type AdminCategoryCreateInput = {
  name: string;
  slug: string;
  icon?: CategoryIconName;
};

export type AdminModerationSummary = {
  pendingListings: number;
  suspendedUsers: number;
  openDisputes: number;
  disabledCategories: number;
  totalUsers: number;
  totalListings: number;
};
