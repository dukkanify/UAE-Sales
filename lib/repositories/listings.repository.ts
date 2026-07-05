import type { Listing, ListingSearchFilters } from "@/types";
import type { ListingCondition, ListingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  mapDbCategory,
  mapDbListing,
  mapListingCondition,
  mapListingStatus,
} from "@/lib/mappers";

const listingInclude = {
  seller: true,
  images: true,
} as const;

function buildListingWhere(
  filters: ListingSearchFilters = {},
): Prisma.ListingWhereInput {
  const emirateFilter = filters.emirate ?? filters.city;
  const and: Prisma.ListingWhereInput[] = [{ status: "ACTIVE" }];

  if (filters.categoryId) {
    and.push({ categoryId: filters.categoryId });
  }

  if (emirateFilter) {
    and.push({
      OR: [{ emirate: emirateFilter }, { city: emirateFilter }],
    });
  }

  if (filters.area) {
    and.push({ area: filters.area });
  }

  if (filters.condition) {
    and.push({
      condition: mapListingCondition(
        filters.condition,
      ) as ListingCondition,
    });
  }

  if (typeof filters.minPrice === "number") {
    and.push({ price: { gte: filters.minPrice } });
  }

  if (typeof filters.maxPrice === "number") {
    and.push({ price: { lte: filters.maxPrice } });
  }

  if (filters.featured) {
    and.push({ featured: true });
  }

  if (filters.premium) {
    and.push({ premium: true });
  }

  if (filters.query?.trim()) {
    const query = filters.query.trim();
    and.push({
      OR: [
        { titleArabic: { contains: query, mode: "insensitive" } },
        { titleEnglish: { contains: query, mode: "insensitive" } },
        { descriptionArabic: { contains: query, mode: "insensitive" } },
        { descriptionEnglish: { contains: query, mode: "insensitive" } },
        { area: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { emirate: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  return { AND: and };
}

function buildListingOrder(
  sort?: ListingSearchFilters["sort"],
): Prisma.ListingOrderByWithRelationInput {
  if (sort === "price_asc") {
    return { price: "asc" };
  }
  if (sort === "price_desc") {
    return { price: "desc" };
  }
  return { createdAt: "desc" };
}

export async function getAllListings() {
  const listings = await prisma.listing.findMany({
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
  return listings.map(mapDbListing);
}

export async function getFeaturedListingsFromDb() {
  const listings = await prisma.listing.findMany({
    where: { featured: true, status: "ACTIVE" },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
  return listings.map(mapDbListing);
}

export async function getListingBySlugFromDb(slug: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: listingInclude,
  });
  return listing ? mapDbListing(listing) : undefined;
}

export async function searchListingsFromDb(filters: ListingSearchFilters = {}) {
  const listings = await prisma.listing.findMany({
    where: buildListingWhere(filters),
    include: listingInclude,
    orderBy: buildListingOrder(filters.sort),
  });
  return listings.map(mapDbListing);
}

export async function getRelatedListingsFromDb(
  categoryId: string,
  excludedId: string,
) {
  const listings = await prisma.listing.findMany({
    where: {
      categoryId,
      status: "ACTIVE",
      id: { not: excludedId },
    },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return listings.map(mapDbListing);
}

export async function getUserListingsFromDb(userId: string) {
  const listings = await prisma.listing.findMany({
    where: { ownerUserId: userId },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
  return listings.map(mapDbListing);
}

export async function getAllCategoriesFromDb() {
  const categories = await prisma.category.findMany({
    orderBy: { listingCount: "desc" },
  });
  return categories.map(mapDbCategory);
}

export async function getCategoryBySlugFromDb(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  return category ? mapDbCategory(category) : undefined;
}

export async function getDashboardSummaryFromDb(userId: string) {
  const [listings, wallet, unreadMessages] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerUserId: userId },
      select: { views: true, status: true },
    }),
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.message.count({
      where: { receiverId: userId, read: false },
    }),
  ]);

  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const activeListings = listings.filter(
    (listing) => listing.status === "ACTIVE",
  ).length;

  return {
    activeListings,
    totalListings: listings.length,
    totalViews,
    walletBalance: wallet?.availableBalance ?? 0,
    pendingBalance: wallet?.pendingBalance ?? 0,
    unreadMessages,
  };
}

export async function createListingInDb(
  userId: string,
  sellerId: string,
  data: {
    categoryId: string;
    titleArabic: string;
    titleEnglish?: string;
    slug: string;
    descriptionArabic: string;
    descriptionEnglish?: string;
    price: number;
    emirate?: string;
    city?: string;
    area?: string;
    condition: Listing["condition"];
    status?: Listing["status"];
    featured?: boolean;
    premium?: boolean;
    escrowAvailable?: boolean;
    images?: string[];
    metadata?: Record<string, unknown>;
  },
) {
  const listing = await prisma.listing.create({
    data: {
      sellerId,
      ownerUserId: userId,
      categoryId: data.categoryId,
      titleArabic: data.titleArabic,
      titleEnglish: data.titleEnglish,
      slug: data.slug,
      descriptionArabic: data.descriptionArabic,
      descriptionEnglish: data.descriptionEnglish,
      price: data.price,
      emirate: data.emirate,
      city: data.city,
      area: data.area,
      condition: mapListingCondition(data.condition) as ListingCondition,
      status: data.status
        ? (mapListingStatus(data.status) as ListingStatus)
        : "ACTIVE",
      featured: data.featured ?? false,
      premium: data.premium ?? false,
      escrowAvailable: data.escrowAvailable ?? false,
      metadata: data.metadata as object | undefined,
      images: data.images
        ? {
            create: data.images.map((url, index) => ({
              url,
              sortOrder: index,
            })),
          }
        : undefined,
    },
    include: listingInclude,
  });

  return mapDbListing(listing);
}
