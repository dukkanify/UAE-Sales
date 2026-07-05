import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated, jsonSuccess } from "@/lib/api/response";
import { createOrderSchema, parseJsonBody } from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

import { mapDbOrder } from "@/lib/mappers/transaction.mapper";

const orderInclude = {
  listing: { include: { images: true } },
  buyer: true,
  seller: true,
  escrow: true,
  disputes: true,
} as const;

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return jsonSuccess(orders.map(mapDbOrder));
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, createOrderSchema);

    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      include: { seller: true },
    });

    if (!listing || !listing.seller.userId) {
      throw new ApiHttpError(404, "NOT_FOUND", "الإعلان غير موجود.");
    }

    const paymentFee = body.paymentFee ?? 0;
    const platformFee = body.platformFee ?? 0;
    const totalAmount = body.amount + paymentFee + platformFee;

    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        sellerId: listing.seller.userId,
        listingId: listing.id,
        amount: body.amount,
        paymentFee,
        totalAmount,
        status: "PENDING",
        metadata: { platformFee },
      },
      include: orderInclude,
    });

    return jsonCreated(mapDbOrder(order));
  });
}
