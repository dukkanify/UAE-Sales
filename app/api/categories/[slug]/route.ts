import { getCategoryBySlugFromDb } from "@/lib/repositories/listings.repository";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const { slug } = await context.params;
    const category = await getCategoryBySlugFromDb(slug);

    if (!category) {
      throw new ApiHttpError(404, "NOT_FOUND", "القسم غير موجود.");
    }

    return jsonSuccess(category);
  });
}
