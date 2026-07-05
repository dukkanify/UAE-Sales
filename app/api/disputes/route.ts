import { createDisputeInDb } from "@/lib/repositories/transactions.repository";
import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated } from "@/lib/api/response";
import { createDisputeSchema, parseJsonBody } from "@/lib/api/validation";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, createDisputeSchema);
    const dispute = await createDisputeInDb(user.id, body);
    return jsonCreated(dispute);
  });
}
