import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated, jsonSuccess } from "@/lib/api/response";
import { createOrderSchema, parseJsonBody } from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

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
      include: {
        listing: true,
        escrow: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonSuccess(orders);
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
    const totalAmount = body.amount + paymentFee;

    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        sellerId: listing.seller.userId,
        listingId: listing.id,
        amount: body.amount,
        paymentFee,
        totalAmount,
        status: "PENDING",
      },
      include: { listing: true, escrow: true },
    });

    return jsonCreated(order);
  });
}
