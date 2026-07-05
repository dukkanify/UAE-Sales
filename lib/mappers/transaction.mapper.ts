import type {
  Dispute as DbDispute,
  EscrowTransaction as DbEscrow,
  Order as DbOrder,
  User,
  Wallet,
  WalletTransaction as DbWalletTx,
  Listing,
} from "@prisma/client";
import type {
  Dispute,
  DisputeResolution,
  EscrowSummary,
  EscrowTransaction,
  Order,
  OrderMetadata,
  OrderTimelineStep,
  WalletSummary,
  WalletTransaction,
} from "@/types";

type DbOrderWithRelations = DbOrder & {
  listing: Listing & { images?: { url: string; sortOrder: number }[] };
  buyer: User;
  seller: User;
  escrow?: DbEscrow | null;
  disputes?: DbDispute[];
};

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

const walletTypeMap = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  ESCROW_HOLD: "escrow_hold",
  ESCROW_RELEASE: "escrow_release",
  ESCROW_REFUND: "escrow_refund",
  PAYMENT: "payment",
} as const;

const walletStatusMap = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

const disputeStatusMap = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export function mapDbOrder(order: DbOrderWithRelations): Order {
  const metadata = (order.metadata ?? {}) as OrderMetadata;
  const imageUrl = order.listing.images?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url;

  return {
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    listingId: order.listingId,
    listingTitle: order.listing.titleArabic,
    listingSlug: order.listing.slug,
    listingImageUrl: imageUrl,
    buyerId: order.buyerId,
    buyerName: order.buyer.fullName,
    sellerId: order.sellerId,
    sellerName: order.seller.fullName,
    amount: order.amount,
    paymentFee: order.paymentFee,
    platformFee: metadata.platformFee ?? 0,
    totalAmount: order.totalAmount,
    currency: "AED",
    status: orderStatusMap[order.status],
    escrowStatus: order.escrow
      ? escrowStatusMap[order.escrow.status]
      : undefined,
    escrowAmount: order.escrow?.amount,
    metadata,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function buildOrderTimeline(order: Order): OrderTimelineStep[] {
  const meta = order.metadata ?? {};

  const steps: OrderTimelineStep[] = [
    {
      id: "created",
      label: "تم إنشاء الطلب",
      description: "تم تسجيل طلب الشراء بنجاح.",
      completed: true,
      active: order.status === "pending",
      timestamp: order.createdAt,
    },
    {
      id: "payment",
      label: "تأكيد الدفع",
      description: "تم تأكيد الدفع وخصم المبلغ.",
      completed: ["paid", "completed", "disputed"].includes(order.status),
      active: order.status === "pending",
      timestamp: ["paid", "completed", "disputed"].includes(order.status)
        ? order.updatedAt
        : undefined,
    },
    {
      id: "escrow",
      label: "حجز المبلغ في الضمان",
      description: "المبلغ محفوظ بأمان حتى اكتمال التسليم.",
      completed: Boolean(order.escrowStatus),
      active: order.escrowStatus === "held",
      timestamp: order.escrowStatus ? order.updatedAt : undefined,
    },
    {
      id: "delivery",
      label: "بانتظار تسليم البائع",
      description: "البائع يجهّز المنتج للتسليم.",
      completed: Boolean(meta.sellerDelivered) || order.status === "completed",
      active:
        order.escrowStatus === "held" && !meta.sellerDelivered &&
        order.status !== "disputed",
      timestamp: meta.sellerDeliveredAt,
    },
    {
      id: "confirmation",
      label: "بانتظار تأكيد المشتري",
      description: "أكّد استلام المنتج لإطلاق المبلغ للبائع.",
      completed: Boolean(meta.buyerConfirmed) || order.status === "completed",
      active:
        Boolean(meta.sellerDelivered) && !meta.buyerConfirmed &&
        order.status === "paid",
      timestamp: meta.buyerConfirmedAt,
    },
    {
      id: "released",
      label: "إطلاق الدفع للبائع",
      description: "تم تحويل المبلغ للبائع بعد التأكيد.",
      completed: order.escrowStatus === "released" || order.status === "completed",
      active: order.escrowStatus === "released",
      timestamp:
        order.escrowStatus === "released" ? order.updatedAt : undefined,
    },
  ];

  return steps;
}

export function mapDbWalletTransaction(tx: DbWalletTx): WalletTransaction {
  return {
    id: tx.id,
    type: walletTypeMap[tx.type],
    amount: tx.amount,
    status: walletStatusMap[tx.status],
    description: tx.description ?? "",
    createdAt: tx.createdAt.toISOString(),
  };
}

export function mapDbWallet(
  wallet: Wallet & { transactions: DbWalletTx[] },
): WalletSummary {
  const heldBalance = wallet.transactions
    .filter((tx) => tx.type === "ESCROW_HOLD" && tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return {
    availableBalance: wallet.availableBalance,
    pendingBalance: wallet.pendingBalance,
    heldBalance,
    currency: "AED",
    totalTransactions: wallet.transactions.length,
    transactions: wallet.transactions.map(mapDbWalletTransaction),
  };
}

export function mapDbEscrowTransaction(
  escrow: DbEscrow & {
    order: {
      listing: Listing;
      buyer: User;
      seller: User;
    };
  },
): EscrowTransaction {
  return {
    id: escrow.id,
    orderId: escrow.orderId,
    listingTitle: escrow.order.listing.titleArabic,
    amount: escrow.amount,
    status: escrowStatusMap[escrow.status],
    buyerName: escrow.order.buyer.fullName,
    sellerName: escrow.order.seller.fullName,
    createdAt: escrow.heldAt.toISOString(),
    heldAt: escrow.heldAt.toISOString(),
    releasedAt: escrow.releasedAt?.toISOString(),
    refundedAt: escrow.refundedAt?.toISOString(),
  };
}

export function mapDbDispute(dispute: DbDispute): Dispute {
  return {
    id: dispute.id,
    orderId: dispute.orderId,
    reason: dispute.reason as Dispute["reason"],
    description: dispute.description ?? "",
    preferredResolution:
      (dispute.preferredResolution as DisputeResolution) ?? "full_refund",
    status: disputeStatusMap[dispute.status],
    evidenceNote: dispute.evidenceNote ?? undefined,
    createdAt: dispute.createdAt.toISOString(),
  };
}

export function mapEscrowSummary(transactions: EscrowTransaction[]): EscrowSummary {
  const active = transactions.filter(
    (tx) => tx.status === "held" || tx.status === "disputed",
  );

  return {
    activeHolds: active.length,
    totalProtected: active.reduce((sum, tx) => sum + tx.amount, 0),
    currency: "AED",
  };
}
