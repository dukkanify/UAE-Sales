import { mapDbWalletTransaction } from "@/lib/mappers/transaction.mapper";
import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
      include: {
        transactions: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!wallet) {
      throw new ApiHttpError(404, "NOT_FOUND", "المحفظة غير موجودة.");
    }

    return jsonSuccess(wallet.transactions.map(mapDbWalletTransaction));
  });
}
