import type {
  AdminActivityItem,
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
import { demoAccounts } from "@/mock/demo-accounts.mock";
import { mockCategories } from "@/mock/categories.mock";
import { mockOrders } from "@/mock/orders.mock";
import { mockEscrowTransactions } from "@/mock/orders.mock";
import { marketplaceListings } from "@/mock/listings.mock";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function buildMockUsers(): AdminUserRecord[] {
  const demoUsers = demoAccounts.map((account) => ({
    id: account.profile.id,
    fullName: account.profile.fullName,
    email: account.email,
    phone: account.phone,
    role: account.profile.role ?? "user",
    verified: account.profile.isVerified,
    suspended: false,
    city: account.profile.city,
    emirate: account.profile.city,
    listingsCount: account.profile.listingsCount,
    joinedAt: account.profile.joinedAt,
  }));

  return [
    ...demoUsers,
    {
      id: "mock-user-002",
      fullName: "Fatima Al Zaabi",
      email: "fatima@example.com",
      phone: "0509876543",
      role: "user",
      verified: false,
      suspended: false,
      city: "الشارقة",
      emirate: "الشارقة",
      listingsCount: 3,
      joinedAt: "2025-11-02",
    },
    {
      id: "mock-user-003",
      fullName: "Omar Trading LLC",
      email: "omar@trading.ae",
      phone: "0561112233",
      role: "business",
      verified: true,
      suspended: true,
      city: "دبي",
      emirate: "دبي",
      listingsCount: 42,
      joinedAt: "2024-09-15",
    },
  ];
}

function buildMockListings(): AdminListingRecord[] {
  return marketplaceListings.slice(0, 24).map((listing) => ({
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    categoryId: listing.categoryId,
    categoryName:
      mockCategories.find((category) => category.id === listing.categoryId)
        ?.name ?? listing.categoryId,
    emirate: listing.emirate,
    price: listing.price,
    status: listing.status,
    featured: listing.isFeatured,
    premium: listing.isPremium ?? false,
    sellerName: listing.seller.name,
    views: listing.views,
    createdAt: listing.postedAt ?? new Date().toISOString(),
  }));
}

function buildMockOrders(): AdminOrderRecord[] {
  return mockOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    listingTitle: order.listingTitle,
    buyerName: order.buyerName,
    sellerName: order.sellerName,
    amount: order.amount,
    totalAmount: order.totalAmount,
    status: order.status,
    escrowStatus: order.escrowStatus,
    createdAt: order.createdAt,
  }));
}

function buildMockEscrow(): AdminEscrowRecord[] {
  return mockEscrowTransactions.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    listingTitle: item.listingTitle,
    buyerName: item.buyerName,
    sellerName: item.sellerName,
    amount: item.amount,
    status: item.status,
    heldAt: item.heldAt,
    releasedAt: item.releasedAt,
    refundedAt: undefined,
  }));
}

function buildMockDisputes(): AdminDisputeRecord[] {
  return [
    {
      id: "mock-dispute-001",
      orderId: "mock-order-001",
      listingTitle: "نيسان باترول بلاتينيوم 2022",
      openedByName: "Ahmed Al Mansoori",
      reason: "لم يتم التسليم",
      description: "البائع لم يسلّم المركبة في الموعد المتفق عليه.",
      preferredResolution: "refund",
      status: "open",
      evidenceNote: "صورة العقد + محادثة واتساب",
      buyerNote: "طلبت استرداد كامل المبلغ.",
      sellerNote: "المركبة جاهزة للتسليم، المشتري لم يحضر.",
      createdAt: "2026-06-27T11:00:00+04:00",
    },
    {
      id: "mock-dispute-002",
      orderId: "mock-order-003",
      listingTitle: "سوني بلايستيشن 5",
      openedByName: "Ahmed Al Mansoori",
      reason: "منتج غير مطابق",
      description: "الجهاز يختلف عن الوصف في الإعلان.",
      preferredResolution: "partial_refund",
      status: "under_review",
      evidenceNote: "صور الجهاز + لقطة من الإعلان",
      buyerNote: "أطلب استرداد جزئي 30%.",
      sellerNote: "الجهاز مطابق للوصف، يوجد خدش بسيط مذكور.",
      createdAt: "2026-06-30T08:30:00+04:00",
    },
  ];
}

function buildMockCategories(): AdminCategoryRecord[] {
  return mockCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    listingCount: category.listingCount,
    disabled: false,
    icon: category.icon,
  }));
}

const recentActivity: AdminActivityItem[] = [
  {
    id: "act-1",
    text: "مستخدم جديد: Fatima Al Zaabi",
    time: "منذ 12 دقيقة",
    type: "user",
  },
  {
    id: "act-2",
    text: "إعلان جديد بانتظار المراجعة: آيفون 15 برو",
    time: "منذ 35 دقيقة",
    type: "listing",
  },
  {
    id: "act-3",
    text: "طلب جديد ORD-24001 بقيمة 201,825 د.إ",
    time: "منذ ساعة",
    type: "order",
  },
  {
    id: "act-4",
    text: "نزاع مفتوح على طلب نيسان باترول",
    time: "منذ 3 ساعات",
    type: "dispute",
  },
  {
    id: "act-5",
    text: "إطلاق ضمان بقيمة 3,312 د.إ",
    time: "منذ 5 ساعات",
    type: "escrow",
  },
];

let mockAdminCategories = buildMockCategories();
const mockUsers = buildMockUsers();
const mockListings = buildMockListings();
const mockOrdersAdmin = buildMockOrders();
const mockEscrow = buildMockEscrow();
const mockDisputes = buildMockDisputes();

export function getMockAdminSummary(): AdminSummary {
  const heldAmount = mockEscrow
    .filter((item) => item.status === "held" || item.status === "disputed")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    totalUsers: mockUsers.length + 1247,
    activeListings: mockListings.filter((item) => item.status === "active").length + 842,
    pendingListings: mockListings.filter(
      (item) => item.status === "pending_review",
    ).length + 18,
    escrowHeldAmount: heldAmount,
    openDisputes: mockDisputes.filter((item) => item.status === "open").length,
    totalTransactions: mockOrdersAdmin.length + 3842,
    revenueDemo: 284750,
    recentActivity,
  };
}

export function getMockAdminUsers(filters?: {
  query?: string;
  role?: string;
  verified?: string;
}): AdminUserRecord[] {
  let items = [...mockUsers];

  if (filters?.query?.trim()) {
    const query = filters.query.trim().toLowerCase();
    items = items.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query),
    );
  }

  if (filters?.role && filters.role !== "all") {
    items = items.filter((user) => user.role === filters.role);
  }

  if (filters?.verified === "verified") {
    items = items.filter((user) => user.verified);
  }

  if (filters?.verified === "unverified") {
    items = items.filter((user) => !user.verified);
  }

  return items;
}

export function getMockAdminListings(filters?: {
  status?: string;
  categoryId?: string;
  emirate?: string;
}): AdminListingRecord[] {
  let items = [...mockListings];

  if (filters?.status && filters.status !== "all") {
    items = items.filter((item) => item.status === filters.status);
  }

  if (filters?.categoryId && filters.categoryId !== "all") {
    items = items.filter((item) => item.categoryId === filters.categoryId);
  }

  if (filters?.emirate && filters.emirate !== "all") {
    items = items.filter((item) => item.emirate === filters.emirate);
  }

  return items;
}

export function getMockAdminOrders(filters?: {
  status?: string;
}): AdminOrderRecord[] {
  let items = [...mockOrdersAdmin];

  if (filters?.status && filters.status !== "all") {
    items = items.filter((item) => item.status === filters.status);
  }

  return items;
}

export function getMockAdminEscrow(filters?: {
  status?: string;
}): AdminEscrowRecord[] {
  let items = [...mockEscrow];

  if (filters?.status && filters.status !== "all") {
    items = items.filter((item) => item.status === filters.status);
  }

  return items;
}

export function getMockAdminDisputes(filters?: {
  status?: string;
}): AdminDisputeRecord[] {
  let items = [...mockDisputes];

  if (filters?.status && filters.status !== "all") {
    items = items.filter((item) => item.status === filters.status);
  }

  return items;
}

export function getMockAdminCategories(): AdminCategoryRecord[] {
  return [...mockAdminCategories];
}

export function getMockAdminReports(): AdminReportsData {
  return {
    listingsGrowth: [
      { label: "يناير", value: 420 },
      { label: "فبراير", value: 510 },
      { label: "مارس", value: 680 },
      { label: "أبريل", value: 740 },
      { label: "مايو", value: 890 },
      { label: "يونيو", value: 1020 },
    ],
    usersGrowth: [
      { label: "يناير", value: 120 },
      { label: "فبراير", value: 180 },
      { label: "مارس", value: 240 },
      { label: "أبريل", value: 310 },
      { label: "مايو", value: 390 },
      { label: "يونيو", value: 470 },
    ],
    transactionsSummary: [
      { label: "مكتملة", value: 2840 },
      { label: "قيد المعالجة", value: 420 },
      { label: "ملغاة", value: 98 },
      { label: "نزاع", value: 34 },
    ],
    revenueDemo: 284750,
    escrowSummary: {
      held: mockEscrow
        .filter((item) => item.status === "held")
        .reduce((sum, item) => sum + item.amount, 0),
      released: mockEscrow
        .filter((item) => item.status === "released")
        .reduce((sum, item) => sum + item.amount, 0),
      refunded: 800,
    },
    disputeRate: 2.4,
  };
}

export function patchMockAdminUser(
  id: string,
  patch: AdminUserPatch,
): AdminUserRecord | undefined {
  const index = mockUsers.findIndex((user) => user.id === id);
  if (index === -1) {
    return undefined;
  }

  mockUsers[index] = { ...mockUsers[index], ...patch };
  return mockUsers[index];
}

export function patchMockAdminListing(
  id: string,
  patch: AdminListingPatch,
): AdminListingRecord | undefined {
  const index = mockListings.findIndex((listing) => listing.id === id);
  if (index === -1) {
    return undefined;
  }

  mockListings[index] = { ...mockListings[index], ...patch };
  return mockListings[index];
}

export function patchMockAdminDispute(
  id: string,
  patch: AdminDisputePatch,
): AdminDisputeRecord | undefined {
  const index = mockDisputes.findIndex((dispute) => dispute.id === id);
  if (index === -1) {
    return undefined;
  }

  const next = { ...mockDisputes[index] };

  if (patch.status) {
    next.status = patch.status;
  }

  if (patch.decision === "refund_buyer") {
    next.status = "resolved";
    const escrow = mockEscrow.find((item) => item.orderId === next.orderId);
    if (escrow) {
      escrow.status = "refunded";
      escrow.refundedAt = new Date().toISOString();
    }
  }

  if (patch.decision === "release_seller") {
    next.status = "resolved";
    const escrow = mockEscrow.find((item) => item.orderId === next.orderId);
    if (escrow) {
      escrow.status = "released";
      escrow.releasedAt = new Date().toISOString();
    }
  }

  if (patch.decision === "partial_refund") {
    next.status = "resolved";
  }

  mockDisputes[index] = next;
  return next;
}

export function patchMockAdminEscrow(
  id: string,
  action: "release" | "refund",
): AdminEscrowRecord | undefined {
  const index = mockEscrow.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const now = new Date().toISOString();
  if (action === "release") {
    mockEscrow[index] = {
      ...mockEscrow[index],
      status: "released",
      releasedAt: now,
    };
  } else {
    mockEscrow[index] = {
      ...mockEscrow[index],
      status: "refunded",
      refundedAt: now,
    };
  }

  return mockEscrow[index];
}

export function addMockAdminCategory(name: string): AdminCategoryRecord {
  const slug = name.trim().replace(/\s+/g, "-").toLowerCase();
  const category: AdminCategoryRecord = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    listingCount: 0,
    disabled: false,
    icon: "package",
  };
  mockAdminCategories = [category, ...mockAdminCategories];
  return category;
}

export function updateMockAdminCategory(
  id: string,
  patch: Partial<Pick<AdminCategoryRecord, "name" | "disabled">>,
): AdminCategoryRecord | undefined {
  const index = mockAdminCategories.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  mockAdminCategories[index] = { ...mockAdminCategories[index], ...patch };
  return mockAdminCategories[index];
}

export function formatAdminCurrency(value: number): string {
  return `${priceFormatter.format(value)} د.إ`;
}
