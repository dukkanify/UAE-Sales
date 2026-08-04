import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import {
  getWalletForUser,
  listWalletTransactions,
} from "@/services/payments/wallet-service";
import { ROLES } from "@/constants/roles";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  if (ctx.user.role !== ROLES.INSTRUCTOR && ctx.user.role !== ROLES.ADMIN && ctx.user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "forbidden", "Instructor wallet access required");
  }
  const wallet = getWalletForUser(ctx.user);
  return ok({
    wallet,
    transactions: listWalletTransactions(wallet.instructorId),
  });
});
