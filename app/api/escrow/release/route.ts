import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { escrowActionSchema, parseJsonBody } from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, escrowActionSchema);

    const escrow = await prisma.escrowTransaction.findFirst({
      where: {
        orderId: body.orderId,
        order: { sellerId: user.id },
        status: "HELD",
      },
    });

    if (!escrow) {
      throw new ApiHttpError(404, "NOT_FOUND", "معاملة الضمان غير موجودة.");
    }

    const updated = await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: {
        status: "RELEASED",
        releasedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: body.orderId },
      data: { status: "COMPLETED" },
    });

    return jsonSuccess(updated);
  });
}
