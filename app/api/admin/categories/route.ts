import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated, jsonSuccess } from "@/lib/api/response";
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
    await requireAdmin();
    const body = (await request.json()) as { name?: string };

    if (!body.name?.trim()) {
      throw new ApiHttpError(400, "VALIDATION_ERROR", "اسم التصنيف مطلوب.");
    }

    const category = await withDataFallback(
      async () => {
        const { prisma } = await import("@/lib/prisma");
        const created = await prisma.category.create({
          data: {
            id: `cat-${Date.now()}`,
            nameArabic: body.name!.trim(),
            slug: body.name!.trim().replace(/\s+/g, "-").toLowerCase(),
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
      () => addMockAdminCategory(body.name!.trim()),
      "admin-category-create",
    );

    return jsonCreated(category);
  });
}
