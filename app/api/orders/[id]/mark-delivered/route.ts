import { markOrderDeliveredInDb } from "@/lib/repositories/transactions.repository";
import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const { id } = await context.params;

    const order = await markOrderDeliveredInDb(id, user.id);
    if (!order) {
      throw new ApiHttpError(404, "NOT_FOUND", "الطلب غير موجود أو ليس لديك صلاحية.");
    }

    return jsonSuccess(order);
  });
}
