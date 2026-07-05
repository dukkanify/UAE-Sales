import { prisma } from "@/lib/prisma";
import {
  mapDbDispute,
  mapDbEscrowTransaction,
  mapDbOrder,
  mapDbWallet,
} from "@/lib/mappers/transaction.mapper";
import type { CreateDisputeInput } from "@/types";

const orderInclude = {
  listing: { include: { images: true } },
  buyer: true,
  seller: true,
  escrow: true,
  disputes: true,
} as const;

export async function getOrdersFromDb(userId: string) {
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapDbOrder);
}

export async function getOrderByIdFromDb(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: orderInclude,
  });
  return order ? mapDbOrder(order) : undefined;
}

export async function createOrderInDb(
  buyerId: string,
  data: {
    listingId: string;
    amount: number;
    paymentFee: number;
    platformFee: number;
  },
) {
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { seller: true },
  });

  if (!listing?.seller.userId) {
    throw new Error("Listing or seller not found");
  }

  const totalAmount = data.amount + data.paymentFee + data.platformFee;

  const order = await prisma.order.create({
    data: {
      buyerId,
      sellerId: listing.seller.userId,
      listingId: listing.id,
      amount: data.amount,
      paymentFee: data.paymentFee,
      totalAmount,
      status: "PENDING",
      metadata: { platformFee: data.platformFee },
    },
    include: orderInclude,
  });

  return mapDbOrder(order);
}

export async function holdEscrowInDb(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: userId },
    include: orderInclude,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await prisma.escrowTransaction.upsert({
    where: { orderId },
    update: {},
    create: {
      orderId,
      amount: order.totalAmount,
      status: "HELD",
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  return updated ? mapDbOrder(updated) : undefined;
}

export async function markOrderDeliveredInDb(orderId: string, sellerUserId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, sellerId: sellerUserId },
    include: orderInclude,
  });

  if (!order) {
    return undefined;
  }

  const metadata = {
    ...((order.metadata as object) ?? {}),
    sellerDelivered: true,
    sellerDeliveredAt: new Date().toISOString(),
  };

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { metadata },
    include: orderInclude,
  });

  return mapDbOrder(updated);
}

export async function confirmOrderReceivedInDb(orderId: string, buyerId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId },
    include: orderInclude,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const metadata = {
    ...((order.metadata as object) ?? {}),
    buyerConfirmed: true,
    buyerConfirmedAt: new Date().toISOString(),
  };

  await prisma.order.update({
    where: { id: orderId },
    data: { metadata, status: "COMPLETED" },
  });

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { orderId },
  });

  if (escrow) {
    await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: { status: "RELEASED", releasedAt: new Date() },
    });
  }

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  return updated ? mapDbOrder(updated) : undefined;
}

export async function getWalletFromDb(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!wallet) {
    return null;
  }

  return mapDbWallet(wallet);
}

export async function getEscrowTransactionsFromDb(userId: string) {
  const escrows = await prisma.escrowTransaction.findMany({
    where: {
      order: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    },
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
  });

  return escrows.map(mapDbEscrowTransaction);
}

export async function createDisputeInDb(
  userId: string,
  input: CreateDisputeInput,
) {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const dispute = await prisma.dispute.create({
    data: {
      orderId: input.orderId,
      openedById: userId,
      reason: input.reason,
      description: input.description,
      preferredResolution: input.preferredResolution,
      evidenceNote: input.evidenceNote,
      status: "OPEN",
    },
  });

  await prisma.order.update({
    where: { id: input.orderId },
    data: { status: "DISPUTED" },
  });

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { orderId: input.orderId },
  });

  if (escrow) {
    await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: { status: "DISPUTED" },
    });
  }

  return mapDbDispute(dispute);
}
