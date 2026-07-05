import { mapDbListing } from "@/lib/mappers";
import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { parseJsonBody, favoriteSchema } from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { ApiHttpError } from "@/lib/api/response";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: { seller: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonSuccess(favorites.map((fav) => mapDbListing(fav.listing)));
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, favoriteSchema);

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: body.listingId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        listingId: body.listingId,
      },
      include: {
        listing: {
          include: { seller: true, images: true },
        },
      },
    });

    return jsonSuccess(mapDbListing(favorite.listing));
  });
}
