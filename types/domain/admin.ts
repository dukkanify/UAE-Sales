import type { DisputeStatus, ListingStatus, OrderStatus, UserRole } from "@/types";

export type AdminSummary = {
  totalUsers: number;
  activeListings: number;
  pendingListings: number;
  escrowHeldAmount: number;
  openDisputes: number;
  totalTransactions: number;
  revenueDemo: number;
  recentActivity: AdminActivityItem[];
};

export type AdminActivityItem = {
  id: string;
  text: string;
  time: string;
  type: "user" | "listing" | "order" | "dispute" | "escrow";
};

export type AdminUserRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  verified: boolean;
  suspended: boolean;
  city?: string;
  emirate?: string;
  listingsCount?: number;
  joinedAt: string;
};

export type AdminListingRecord = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  emirate?: string;
  price: number;
  status: ListingStatus;
  featured: boolean;
  premium: boolean;
  sellerName: string;
  views: number;
  createdAt: string;
};

export type AdminOrderRecord = {
  id: string;
  orderNumber: string;
  listingTitle: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  totalAmount: number;
  status: OrderStatus;
  escrowStatus?: "held" | "released" | "refunded" | "disputed";
  createdAt: string;
};

export type AdminEscrowRecord = {
  id: string;
  orderId: string;
  listingTitle: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  status: "held" | "released" | "refunded" | "disputed";
  heldAt: string;
  releasedAt?: string;
  refundedAt?: string;
};

export type AdminDisputeRecord = {
  id: string;
  orderId: string;
  listingTitle: string;
  openedByName: string;
  reason: string;
  description: string;
  preferredResolution: string;
  status: DisputeStatus;
  evidenceNote?: string;
  buyerNote?: string;
  sellerNote?: string;
  createdAt: string;
};

export type AdminCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  listingCount: number;
  disabled: boolean;
  icon: string;
};

export type AdminReportsData = {
  listingsGrowth: { label: string; value: number }[];
  usersGrowth: { label: string; value: number }[];
  transactionsSummary: { label: string; value: number }[];
  revenueDemo: number;
  escrowSummary: { held: number; released: number; refunded: number };
  disputeRate: number;
};

export type AdminUserPatch = {
  verified?: boolean;
  suspended?: boolean;
};

export type AdminListingPatch = {
  status?: ListingStatus;
  featured?: boolean;
  premium?: boolean;
};

export type AdminDisputePatch = {
  status?: DisputeStatus;
  decision?: "refund_buyer" | "release_seller" | "partial_refund";
};
