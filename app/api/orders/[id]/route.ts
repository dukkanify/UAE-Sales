import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      include: {
        listing: true,
        escrow: true,
        disputes: true,
      },
    });

    if (!order) {
      throw new ApiHttpError(404, "NOT_FOUND", "الطلب غير موجود.");
    }

    return jsonSuccess(order);
  });
}
