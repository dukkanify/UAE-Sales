import { mapDbListing, mapListingCondition, mapListingStatus } from "@/lib/mappers";
import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { parseJsonBody, updateListingSchema } from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { ListingCondition, ListingStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const { id } = await context.params;
    const body = await parseJsonBody(request, updateListingSchema);

    const existing = await prisma.listing.findUnique({
      where: { id },
      include: { seller: true, images: true },
    });

    if (!existing || existing.ownerUserId !== user.id) {
      throw new ApiHttpError(404, "NOT_FOUND", "الإعلان غير موجود.");
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        categoryId: body.categoryId,
        titleArabic: body.titleArabic,
        titleEnglish: body.titleEnglish,
        slug: body.slug,
        descriptionArabic: body.descriptionArabic,
        descriptionEnglish: body.descriptionEnglish,
        price: body.price,
        emirate: body.emirate,
        city: body.city,
        area: body.area,
        condition: body.condition
          ? (mapListingCondition(body.condition) as ListingCondition)
          : undefined,
        status: body.status
          ? (mapListingStatus(body.status) as ListingStatus)
          : undefined,
        featured: body.featured,
        premium: body.premium,
        escrowAvailable: body.escrowAvailable,
        metadata: body.metadata as object | undefined,
      },
      include: { seller: true, images: true },
    });

    return jsonSuccess(mapDbListing(listing));
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const { id } = await context.params;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing || existing.ownerUserId !== user.id) {
      throw new ApiHttpError(404, "NOT_FOUND", "الإعلان غير موجود.");
    }

    await prisma.listing.delete({ where: { id } });
    return jsonSuccess({ deleted: true });
  });
}
