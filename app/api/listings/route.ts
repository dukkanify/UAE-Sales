import {
  getAllListings,
  getListingBySlugFromDb,
  searchListingsFromDb,
} from "@/lib/repositories/listings.repository";
import { createListingInDb } from "@/lib/repositories/listings.repository";
import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated, jsonSuccess } from "@/lib/api/response";
import {
  createListingSchema,
  listingSearchSchema,
  parseJsonBody,
} from "@/lib/api/validation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const listing = await getListingBySlugFromDb(slug);
      if (!listing) {
        throw new ApiHttpError(404, "NOT_FOUND", "الإعلان غير موجود.");
      }
      return jsonSuccess(listing);
    }

    const filters = listingSearchSchema.parse({
      query: searchParams.get("query") ?? searchParams.get("q") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? searchParams.get("category") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      emirate: searchParams.get("emirate") ?? undefined,
      area: searchParams.get("area") ?? undefined,
      condition: searchParams.get("condition") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      featured: searchParams.get("featured") ?? undefined,
      premium: searchParams.get("premium") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    const hasFilters = Object.values(filters).some(
      (value) => value !== undefined,
    );

    const listings = hasFilters
      ? await searchListingsFromDb(filters)
      : await getAllListings();

    return jsonSuccess(listings);
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, createListingSchema);

    const seller = await prisma.seller.findFirst({
      where: { userId: user.id },
    });

    if (!seller) {
      throw new ApiHttpError(
        400,
        "VALIDATION_ERROR",
        "لا يوجد ملف بائع مرتبط بهذا الحساب.",
      );
    }

    const listing = await createListingInDb(user.id, seller.id, body);
    return jsonCreated(listing);
  });
}
