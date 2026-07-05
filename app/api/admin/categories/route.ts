import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonCreated, jsonSuccess } from "@/lib/api/response";
import { enforceAdminRateLimit } from "@/lib/api/admin-rate-limit";
import { adminCategoryCreateSchema, parseJsonBody } from "@/lib/api/validation";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminCategoriesFromDb } from "@/lib/repositories/admin.repository";
import {
  addMockAdminCategory,
  getMockAdminCategories,
} from "@/mock/admin.mock";

export async function GET() {
  return handleApiRoute(async () => {
    await requireAdmin();
    const categories = await withDataFallback(
      getAdminCategoriesFromDb,
      getMockAdminCategories,
      "admin-categories-api",
    );
    return jsonSuccess(categories);
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const admin = await requireAdmin();
    await enforceAdminRateLimit(request, "categories-create", admin.id);
    const body = await parseJsonBody(request, adminCategoryCreateSchema);

    const category = await withDataFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        const created = await prisma.category.create({
          data: {
            id: `cat-${Date.now()}`,
            nameArabic: body.name,
            slug: body.name.replace(/\s+/g, "-").toLowerCase(),
            icon: "package",
            listingCount: 0,
          },
        });
        return {
          id: created.id,
          name: created.nameArabic,
          slug: created.slug,
          listingCount: created.listingCount,
          disabled: false,
          icon: created.icon,
        };
      },
      () => addMockAdminCategory(body.name),
      "admin-category-create",
    );

    return jsonCreated(category);
  });
}
