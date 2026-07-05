import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { enforceAdminRateLimit } from "@/lib/api/admin-rate-limit";
import { adminCategoryPatchSchema, parseJsonBody } from "@/lib/api/validation";
import { withDataFallback } from "@/lib/data/fallback";
import { updateMockAdminCategory } from "@/mock/admin.mock";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const admin = await requireAdmin();
    await enforceAdminRateLimit(request, "categories-patch", admin.id);
    const { id } = await context.params;
    const patch = await parseJsonBody(request, adminCategoryPatchSchema);

    const category = await withDataFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.category.update({
          where: { id },
          data: {
            nameArabic: patch.name,
          },
        });
        return {
          id: updated.id,
          name: updated.nameArabic,
          slug: updated.slug,
          listingCount: updated.listingCount,
          disabled: patch.disabled ?? false,
          icon: updated.icon,
        };
      },
      async () => updateMockAdminCategory(id, patch) ?? undefined,
      "admin-category-patch",
    );

    if (!category) {
      throw new ApiHttpError(404, "NOT_FOUND", "التصنيف غير موجود.");
    }

    return jsonSuccess(category);
  });
}
