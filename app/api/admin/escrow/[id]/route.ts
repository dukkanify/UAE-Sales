import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminEscrowInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminEscrow } from "@/mock/admin.mock";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as { action?: "release" | "refund" };

    if (!body.action) {
      throw new ApiHttpError(400, "VALIDATION_ERROR", "الإجراء مطلوب.");
    }

    const escrow = await withDataFallback(
      () => patchAdminEscrowInDb(id, body.action!),
      async () => patchMockAdminEscrow(id, body.action!) ?? undefined,
      "admin-escrow-patch",
    );

    if (!escrow) {
      throw new ApiHttpError(404, "NOT_FOUND", "معاملة الضمان غير موجودة.");
    }

    return jsonSuccess(escrow);
  });
}
