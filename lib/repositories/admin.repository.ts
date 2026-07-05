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
import type { ListingStatus, OrderStatus } from "@/types";
import { prisma } from "@/lib/prisma";
import { mapListingStatus } from "@/lib/mappers";

const roleMap = {
  USER: "user",
  BUSINESS: "business",
  ADMIN: "admin",
} as const;

const listingStatusMap = {
  DRAFT: "draft",
  ACTIVE: "active",
  PENDING_REVIEW: "pending_review",
  EXPIRED: "expired",
  REJECTED: "rejected",
} as const;

const orderStatusMap = {
  PENDING: "pending",
  PAID: "paid",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;

const escrowStatusMap = {
  HELD: "held",
  RELEASED: "released",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
} as const;

const disputeStatusMap = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

function mapDbListingStatus(status: keyof typeof listingStatusMap): ListingStatus {
  return listingStatusMap[status];
}

function mapDbOrderStatus(status: keyof typeof orderStatusMap): OrderStatus {
  return orderStatusMap[status];
}

function mapDbDisputeStatus(status: keyof typeof disputeStatusMap) {
  return disputeStatusMap[status];
}

export async function getAdminSummaryFromDb(): Promise<AdminSummary> {
  const [
    totalUsers,
    activeListings,
    pendingListings,
    escrowHeld,
    openDisputes,
    totalTransactions,
    orders,
    recentUsers,
    recentListings,
    recentOrders,
    recentDisputes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.escrowTransaction.aggregate({
      where: { status: { in: ["HELD", "DISPUTED"] } },
      _sum: { amount: true },
    }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.order.count(),
    prisma.order.findMany({
      select: { metadata: true, paymentFee: true },
      take: 200,
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 2 }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { titleArabic: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { order: { include: { listing: true } } },
    }),
  ]);

  const revenueDemo = orders.reduce((sum, order) => {
    const metadata = (order.metadata ?? {}) as { platformFee?: number };
    return sum + (metadata.platformFee ?? order.paymentFee * 0.4);
  }, 0);

  const recentActivity: AdminSummary["recentActivity"] = [
    ...recentUsers.map((user) => ({
      id: `user-${user.id}`,
      text: `مستخدم جديد: ${user.fullName}`,
      time: user.createdAt.toISOString(),
      type: "user" as const,
    })),
    ...recentListings.map((listing) => ({
      id: `listing-${listing.titleArabic}`,
      text: `إعلان جديد: ${listing.titleArabic}`,
      time: listing.createdAt.toISOString(),
      type: "listing" as const,
    })),
    ...recentOrders.map((order) => ({
      id: `order-${order.totalAmount}`,
      text: `طلب جديد بقيمة ${order.totalAmount.toLocaleString("ar-AE")} د.إ`,
      time: order.createdAt.toISOString(),
      type: "order" as const,
    })),
    ...recentDisputes.map((dispute) => ({
      id: `dispute-${dispute.id}`,
      text: `نزاع على ${dispute.order.listing.titleArabic}`,
      time: dispute.createdAt.toISOString(),
      type: "dispute" as const,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6)
    .map((item, index) => ({
      ...item,
      id: `act-db-${index}`,
      time: "مؤخراً",
    }));

  return {
    totalUsers,
    activeListings,
    pendingListings,
    escrowHeldAmount: escrowHeld._sum.amount ?? 0,
    openDisputes,
    totalTransactions,
    revenueDemo: Math.round(revenueDemo),
    recentActivity,
  };
}

export async function getAdminUsersFromDb(filters?: {
  query?: string;
  role?: string;
  verified?: string;
}): Promise<AdminUserRecord[]> {
  const where: Record<string, unknown> = {};

  if (filters?.query?.trim()) {
    const query = filters.query.trim();
    where.OR = [
      { fullName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query } },
    ];
  }

  if (filters?.role && filters.role !== "all") {
    const roleKey = filters.role.toUpperCase() as keyof typeof roleMap;
    where.role = roleKey;
  }

  if (filters?.verified === "verified") {
    where.verified = true;
  }

  if (filters?.verified === "unverified") {
    where.verified = false;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: roleMap[user.role],
    verified: user.verified,
    suspended: user.suspended,
    city: user.city ?? undefined,
    emirate: user.emirate ?? undefined,
    listingsCount: user.listingsCount ?? undefined,
    joinedAt: user.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getAdminListingsFromDb(filters?: {
  status?: string;
  categoryId?: string;
  emirate?: string;
}): Promise<AdminListingRecord[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status && filters.status !== "all") {
    where.status = mapListingStatus(filters.status as ListingStatus);
  }

  if (filters?.categoryId && filters.categoryId !== "all") {
    where.categoryId = filters.categoryId;
  }

  if (filters?.emirate && filters.emirate !== "all") {
    where.emirate = filters.emirate;
  }

  const listings = await prisma.listing.findMany({
    where,
    include: { seller: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return listings.map((listing) => ({
    id: listing.id,
    title: listing.titleArabic,
    slug: listing.slug,
    categoryId: listing.categoryId,
    categoryName: listing.category.nameArabic,
    emirate: listing.emirate ?? undefined,
    price: listing.price,
    status: mapDbListingStatus(listing.status),
    featured: listing.featured,
    premium: listing.premium,
    sellerName: listing.seller.sellerName,
    views: listing.views,
    createdAt: listing.createdAt.toISOString(),
  }));
}

export async function getAdminOrdersFromDb(filters?: {
  status?: string;
}): Promise<AdminOrderRecord[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status && filters.status !== "all") {
    const statusKey = filters.status.toUpperCase() as keyof typeof orderStatusMap;
    where.status = statusKey;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      buyer: true,
      seller: true,
      listing: true,
      escrow: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    listingTitle: order.listing.titleArabic,
    buyerName: order.buyer.fullName,
    sellerName: order.seller.fullName,
    amount: order.amount,
    totalAmount: order.totalAmount,
    status: mapDbOrderStatus(order.status),
    escrowStatus: order.escrow
      ? escrowStatusMap[order.escrow.status]
      : undefined,
    createdAt: order.createdAt.toISOString(),
  }));
}

export async function getAdminEscrowFromDb(filters?: {
  status?: string;
}): Promise<AdminEscrowRecord[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status && filters.status !== "all") {
    const statusKey = filters.status.toUpperCase() as keyof typeof escrowStatusMap;
    where.status = statusKey;
  }

  const escrows = await prisma.escrowTransaction.findMany({
    where,
    include: {
      order: {
        include: {
          listing: true,
          buyer: true,
          seller: true,
        },
      },
    },
    orderBy: { heldAt: "desc" },
    take: 100,
  });

  return escrows.map((escrow) => ({
    id: escrow.id,
    orderId: escrow.orderId,
    listingTitle: escrow.order.listing.titleArabic,
    buyerName: escrow.order.buyer.fullName,
    sellerName: escrow.order.seller.fullName,
    amount: escrow.amount,
    status: escrowStatusMap[escrow.status],
    heldAt: escrow.heldAt.toISOString(),
    releasedAt: escrow.releasedAt?.toISOString(),
    refundedAt: escrow.refundedAt?.toISOString(),
  }));
}

export async function getAdminDisputesFromDb(filters?: {
  status?: string;
}): Promise<AdminDisputeRecord[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status && filters.status !== "all") {
    const statusKey = filters.status.toUpperCase() as keyof typeof disputeStatusMap;
    where.status = statusKey;
  }

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      openedBy: true,
      order: {
        include: {
          listing: true,
          buyer: true,
          seller: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return disputes.map((dispute) => ({
    id: dispute.id,
    orderId: dispute.orderId,
    listingTitle: dispute.order.listing.titleArabic,
    openedByName: dispute.openedBy.fullName,
    reason: dispute.reason,
    description: dispute.description ?? "",
    preferredResolution: dispute.preferredResolution ?? "",
    status: mapDbDisputeStatus(dispute.status),
    evidenceNote: dispute.evidenceNote ?? undefined,
    buyerNote: dispute.order.buyer.fullName,
    sellerNote: dispute.order.seller.fullName,
    createdAt: dispute.createdAt.toISOString(),
  }));
}

export async function getAdminCategoriesFromDb(): Promise<AdminCategoryRecord[]> {
  const categories = await prisma.category.findMany({
    orderBy: { listingCount: "desc" },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.nameArabic,
    slug: category.slug,
    listingCount: category.listingCount,
    disabled: false,
    icon: category.icon,
  }));
}

export async function getAdminReportsFromDb(): Promise<AdminReportsData> {
  const [listings, users, orders, escrowHeld, escrowReleased, escrowRefunded, disputes, totalOrders] =
    await Promise.all([
      prisma.listing.groupBy({
        by: ["createdAt"],
        _count: true,
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: true,
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.escrowTransaction.aggregate({
        where: { status: "HELD" },
        _sum: { amount: true },
      }),
      prisma.escrowTransaction.aggregate({
        where: { status: "RELEASED" },
        _sum: { amount: true },
      }),
      prisma.escrowTransaction.aggregate({
        where: { status: "REFUNDED" },
        _sum: { amount: true },
      }),
      prisma.dispute.count(),
      prisma.order.count(),
    ]);

  const monthLabels = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];

  return {
    listingsGrowth: monthLabels.map((label, index) => ({
      label,
      value: Math.max(100, listings.length * (index + 1) * 40),
    })),
    usersGrowth: monthLabels.map((label, index) => ({
      label,
      value: Math.max(50, users.length * (index + 1) * 15),
    })),
    transactionsSummary: orders.map((item) => ({
      label: orderStatusMap[item.status],
      value: item._count,
    })),
    revenueDemo: 284750,
    escrowSummary: {
      held: escrowHeld._sum.amount ?? 0,
      released: escrowReleased._sum.amount ?? 0,
      refunded: escrowRefunded._sum.amount ?? 0,
    },
    disputeRate: totalOrders > 0 ? Number(((disputes / totalOrders) * 100).toFixed(1)) : 0,
  };
}

export async function patchAdminUserInDb(
  id: string,
  patch: AdminUserPatch,
): Promise<AdminUserRecord | undefined> {
  const user = await prisma.user.update({
    where: { id },
    data: patch,
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: roleMap[user.role],
    verified: user.verified,
    suspended: user.suspended,
    city: user.city ?? undefined,
    emirate: user.emirate ?? undefined,
    listingsCount: user.listingsCount ?? undefined,
    joinedAt: user.createdAt.toISOString().slice(0, 10),
  };
}

export async function patchAdminListingInDb(
  id: string,
  patch: AdminListingPatch,
): Promise<AdminListingRecord | undefined> {
  const data: Record<string, unknown> = {};

  if (patch.status) {
    data.status = mapListingStatus(patch.status);
  }
  if (typeof patch.featured === "boolean") {
    data.featured = patch.featured;
  }
  if (typeof patch.premium === "boolean") {
    data.premium = patch.premium;
  }

  const listing = await prisma.listing.update({
    where: { id },
    data,
    include: { seller: true, category: true },
  });

  return {
    id: listing.id,
    title: listing.titleArabic,
    slug: listing.slug,
    categoryId: listing.categoryId,
    categoryName: listing.category.nameArabic,
    emirate: listing.emirate ?? undefined,
    price: listing.price,
    status: mapDbListingStatus(listing.status),
    featured: listing.featured,
    premium: listing.premium,
    sellerName: listing.seller.sellerName,
    views: listing.views,
    createdAt: listing.createdAt.toISOString(),
  };
}

export async function patchAdminDisputeInDb(
  id: string,
  patch: AdminDisputePatch,
): Promise<AdminDisputeRecord | undefined> {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      openedBy: true,
      order: { include: { listing: true, buyer: true, seller: true, escrow: true } },
    },
  });

  if (!dispute) {
    return undefined;
  }

  const status = patch.status
    ? (patch.status.toUpperCase().replace("-", "_") as keyof typeof disputeStatusMap)
    : patch.decision
      ? "RESOLVED"
      : dispute.status;

  const updated = await prisma.dispute.update({
    where: { id },
    data: { status },
    include: {
      openedBy: true,
      order: { include: { listing: true, buyer: true, seller: true } },
    },
  });

  if (patch.decision && dispute.order.escrow) {
    if (patch.decision === "refund_buyer") {
      await prisma.escrowTransaction.update({
        where: { id: dispute.order.escrow.id },
        data: { status: "REFUNDED", refundedAt: new Date() },
      });
    } else if (patch.decision === "release_seller") {
      await prisma.escrowTransaction.update({
        where: { id: dispute.order.escrow.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
    }
  }

  return {
    id: updated.id,
    orderId: updated.orderId,
    listingTitle: updated.order.listing.titleArabic,
    openedByName: updated.openedBy.fullName,
    reason: updated.reason,
    description: updated.description ?? "",
    preferredResolution: updated.preferredResolution ?? "",
    status: mapDbDisputeStatus(updated.status),
    evidenceNote: updated.evidenceNote ?? undefined,
    buyerNote: updated.order.buyer.fullName,
    sellerNote: updated.order.seller.fullName,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function patchAdminEscrowInDb(
  id: string,
  action: "release" | "refund",
): Promise<AdminEscrowRecord | undefined> {
  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id },
    include: {
      order: {
        include: { listing: true, buyer: true, seller: true },
      },
    },
  });

  if (!escrow) {
    return undefined;
  }

  const updated = await prisma.escrowTransaction.update({
    where: { id },
    data:
      action === "release"
        ? { status: "RELEASED", releasedAt: new Date() }
        : { status: "REFUNDED", refundedAt: new Date() },
    include: {
      order: {
        include: { listing: true, buyer: true, seller: true },
      },
    },
  });

  return {
    id: updated.id,
    orderId: updated.orderId,
    listingTitle: updated.order.listing.titleArabic,
    buyerName: updated.order.buyer.fullName,
    sellerName: updated.order.seller.fullName,
    amount: updated.amount,
    status: escrowStatusMap[updated.status],
    heldAt: updated.heldAt.toISOString(),
    releasedAt: updated.releasedAt?.toISOString(),
    refundedAt: updated.refundedAt?.toISOString(),
  };
}
