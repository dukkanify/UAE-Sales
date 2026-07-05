import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { escrowActionSchema, parseJsonBody } from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

async function getOrderForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: { escrow: true },
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, escrowActionSchema);
    const order = await getOrderForUser(body.orderId, user.id);

    if (!order) {
      throw new ApiHttpError(404, "NOT_FOUND", "الطلب غير موجود.");
    }

    const escrow = await prisma.escrowTransaction.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        status: "HELD",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    return jsonSuccess(escrow);
  });
}
