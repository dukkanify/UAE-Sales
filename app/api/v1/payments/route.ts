import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { listProducts } from "@/services/payments/catalog-service";

export const GET = withApiHandler(async (request) => {
  await requireApiUser(request);
  return ok({ catalog: listProducts({ activeOnly: true }) });
});
