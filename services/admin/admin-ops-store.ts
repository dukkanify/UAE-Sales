import { demoAccounts } from "@/mock/demo-accounts.mock";
import { mockCategories } from "@/mock/categories.mock";
import {
  marketplaceListings,
  marketplaceUserListings,
} from "@/mock/listings.mock";
import type {
  AdminCategoryCreateInput,
  AdminCategoryPatch,
  AdminCategoryRecord,
  AdminDisputePatch,
  AdminDisputeRecord,
  AdminListingPatch,
  AdminListingRecord,
  AdminModerationSummary,
  AdminUserPatch,
  AdminUserRecord,
} from "@/types";

function seedUsers(): AdminUserRecord[] {
  return demoAccounts.map((account) => ({
    id: account.profile.id,
    fullName: account.profile.fullName,
    email: account.profile.email,
    phone: account.profile.phone,
    city: account.profile.city,
    role: account.profile.role ?? account.role,
    isVerified: account.profile.isVerified,
    accountStatus: account.profile.accountStatus ?? "active",
    joinedAt: account.profile.joinedAt,
    listingsCount: account.profile.listingsCount ?? 0,
  }));
}

function seedListings(): AdminListingRecord[] {
  const byId = new Map<string, AdminListingRecord>();

  for (const listing of [...marketplaceListings, ...marketplaceUserListings]) {
    byId.set(listing.id, {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      sellerName: listing.seller.name,
      sellerId: listing.seller.id,
      categoryId: listing.categoryId,
      price: listing.price,
      currency: listing.currency,
      status: listing.status,
      isFeatured: listing.isFeatured,
      postedAt: listing.postedAt ?? "",
      city: listing.city,
    });
  }

  return Array.from(byId.values());
}

function seedCategories(): AdminCategoryRecord[] {
  return mockCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    listingCount: category.listingCount,
    enabled: true,
    subcategories: [...category.subcategories],
  }));
}

function seedDisputes(): AdminDisputeRecord[] {
  return [
    {
      id: "dispute-001",
      orderId: "order-demo-1001",
      listingTitle: "نيسان باترول بلاتينيوم 2022",
      buyerName: "Ahmed Al Mansoori",
      sellerName: "Emirates Motors LLC",
      reason: "السيارة وصلت بحالة مختلفة عن الوصف — خدوش غير مذكورة في الإعلان.",
      status: "open",
      amount: 185000,
      createdAt: "2026-07-18T09:30:00+04:00",
    },
    {
      id: "dispute-002",
      orderId: "order-demo-1002",
      listingTitle: "آيفون 15 برو 128 جيجابايت",
      buyerName: "Sara Al Nuaimi",
      sellerName: "Ahmed Al Mansoori",
      reason: "الجهاز لم يُشحن خلال المهلة المتفق عليها رغم الدفع عبر الضمان.",
      status: "under_review",
      amount: 4200,
      createdAt: "2026-07-16T14:15:00+04:00",
    },
    {
      id: "dispute-003",
      orderId: "order-demo-1003",
      listingTitle: "فيلا نخلة جميرا",
      buyerName: "Khalid Al Suwaidi",
      sellerName: "Palm Properties",
      reason: "طلب استرداد عربون المعاينة بعد إلغاء البائع للموعد مرتين.",
      status: "open",
      amount: 5000,
      createdAt: "2026-07-19T11:00:00+04:00",
    },
    {
      id: "dispute-004",
      orderId: "order-demo-1004",
      listingTitle: "طاولة طعام عصرية 8 كراسي",
      buyerName: "Mariam Hassan",
      sellerName: "Home Studio Dubai",
      reason: "قطعة مكسورة عند الاستلام — البائع يرفض الاستبدال.",
      status: "resolved_buyer",
      amount: 2800,
      createdAt: "2026-07-10T16:45:00+04:00",
      resolutionNote: "تم استرداد المبلغ للمشتري وإغلاق الضمان.",
    },
  ];
}

const usersStore: AdminUserRecord[] = seedUsers();
const listingsStore: AdminListingRecord[] = seedListings();
const disputesStore: AdminDisputeRecord[] = seedDisputes();
let categoriesStore: AdminCategoryRecord[] = seedCategories();

// Demo moderation backlog so the cockpit feels alive.
for (const listing of listingsStore.slice(0, 3)) {
  listing.status = "pending_review";
}
if (usersStore[1]) {
  usersStore[1].accountStatus = "suspended";
}

export function getUsers(): AdminUserRecord[] {
  return usersStore.map((user) => ({ ...user }));
}

export function patchUser(
  id: string,
  patch: AdminUserPatch,
): AdminUserRecord | null {
  const index = usersStore.findIndex((user) => user.id === id);
  if (index < 0) return null;
  usersStore[index] = { ...usersStore[index], ...patch };
  return { ...usersStore[index] };
}

export function getListings(): AdminListingRecord[] {
  return listingsStore.map((listing) => ({ ...listing }));
}

export function patchListing(
  id: string,
  patch: AdminListingPatch,
): AdminListingRecord | null {
  const index = listingsStore.findIndex((listing) => listing.id === id);
  if (index < 0) return null;
  listingsStore[index] = { ...listingsStore[index], ...patch };
  return { ...listingsStore[index] };
}

export function getDisputes(): AdminDisputeRecord[] {
  return disputesStore.map((dispute) => ({ ...dispute }));
}

export function patchDispute(
  id: string,
  patch: AdminDisputePatch,
): AdminDisputeRecord | null {
  const index = disputesStore.findIndex((dispute) => dispute.id === id);
  if (index < 0) return null;
  disputesStore[index] = { ...disputesStore[index], ...patch };
  return { ...disputesStore[index] };
}

export function getCategories(): AdminCategoryRecord[] {
  return categoriesStore.map((category) => ({
    ...category,
    subcategories: [...category.subcategories],
  }));
}

export function createCategory(
  input: AdminCategoryCreateInput,
): AdminCategoryRecord {
  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const record: AdminCategoryRecord = {
    id: `cat-${Date.now()}`,
    name: input.name.trim(),
    slug,
    icon: input.icon ?? "wrench",
    listingCount: 0,
    enabled: true,
    subcategories: [],
  };
  categoriesStore = [record, ...categoriesStore];
  return {
    ...record,
    subcategories: [...record.subcategories],
  };
}

export function patchCategory(
  id: string,
  patch: AdminCategoryPatch,
): AdminCategoryRecord | null {
  const index = categoriesStore.findIndex((category) => category.id === id);
  if (index < 0) return null;
  categoriesStore[index] = { ...categoriesStore[index], ...patch };
  return {
    ...categoriesStore[index],
    subcategories: [...categoriesStore[index].subcategories],
  };
}

export function getModerationSummary(): AdminModerationSummary {
  return {
    pendingListings: listingsStore.filter((l) => l.status === "pending_review")
      .length,
    suspendedUsers: usersStore.filter((u) => u.accountStatus === "suspended")
      .length,
    openDisputes: disputesStore.filter(
      (d) => d.status === "open" || d.status === "under_review",
    ).length,
    disabledCategories: categoriesStore.filter((c) => !c.enabled).length,
    totalUsers: usersStore.length,
    totalListings: listingsStore.length,
  };
}
