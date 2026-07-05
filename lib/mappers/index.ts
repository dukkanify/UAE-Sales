import type {
  Category as DbCategory,
  Listing as DbListing,
  ListingImage,
  Seller,
  User,
} from "@prisma/client";
import type { Category, Listing, ListingSeller, UserProfile } from "@/types";

type ListingWithRelations = DbListing & {
  seller: Seller;
  images: ListingImage[];
};

type ListingMetadata = {
  subcategory?: string;
  country?: string;
  imageTone?: Listing["imageTone"];
  verifiedSeller?: boolean;
  contactMethod?: Listing["contactMethod"];
  deliveryOption?: Listing["deliveryOption"];
  features?: string[];
  negotiable?: boolean;
  reasonForSelling?: string;
  carSpecs?: Listing["carSpecs"];
  realEstateSpecs?: Listing["realEstateSpecs"];
  electronicsSpecs?: Listing["electronicsSpecs"];
};

const conditionMap = {
  NEW: "new",
  USED: "used",
  EXCELLENT: "excellent",
} as const;

const statusMap = {
  DRAFT: "draft",
  ACTIVE: "active",
  PENDING_REVIEW: "pending_review",
  EXPIRED: "expired",
  REJECTED: "rejected",
} as const;

const roleMap = {
  USER: "user",
  BUSINESS: "business",
  ADMIN: "admin",
} as const;

const accountTypeMap = {
  INDIVIDUAL: "individual",
  BUSINESS: "business",
  BUYER: "buyer",
  SELLER: "seller",
  COMPANY: "company",
} as const;

export function mapSellerToListingSeller(seller: Seller): ListingSeller {
  return {
    id: seller.id,
    name: seller.sellerName,
    rating: seller.rating,
    avatarUrl: seller.avatarUrl ?? undefined,
    isVerified: seller.verified,
    sellerType:
      seller.sellerType === "business" ? "business" : "individual",
    joinedAt: seller.joinedAt?.toISOString().slice(0, 10),
    reviewCount: seller.reviewsCount,
    responseTime: seller.responseTime ?? undefined,
    completedTransactions: seller.completedTransactions,
  };
}

export function mapDbListing(listing: ListingWithRelations): Listing {
  const metadata = (listing.metadata ?? {}) as ListingMetadata;
  const imageUrls = listing.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.url);

  return {
    id: listing.id,
    title: listing.titleArabic,
    titleEnglish: listing.titleEnglish ?? undefined,
    slug: listing.slug,
    description: listing.descriptionArabic,
    descriptionEnglish: listing.descriptionEnglish ?? undefined,
    categoryId: listing.categoryId,
    subcategory: metadata.subcategory,
    city: listing.city ?? listing.emirate ?? "",
    emirate: listing.emirate ?? undefined,
    area: listing.area ?? undefined,
    country: metadata.country ?? "الإمارات العربية المتحدة",
    price: listing.price,
    currency: "AED",
    condition: conditionMap[listing.condition],
    status: statusMap[listing.status],
    isFeatured: listing.featured,
    isPremium: listing.premium,
    views: listing.views,
    images: imageUrls.length > 0 ? imageUrls : undefined,
    imageUrl: imageUrls[0],
    seller: mapSellerToListingSeller(listing.seller),
    imageTone: metadata.imageTone ?? "gold",
    verifiedSeller: metadata.verifiedSeller,
    escrowAvailable: listing.escrowAvailable,
    postedAt: listing.createdAt.toISOString(),
    contactMethod: metadata.contactMethod,
    deliveryOption: metadata.deliveryOption,
    features: metadata.features,
    negotiable: metadata.negotiable,
    reasonForSelling: metadata.reasonForSelling,
    carSpecs: metadata.carSpecs,
    realEstateSpecs: metadata.realEstateSpecs,
    electronicsSpecs: metadata.electronicsSpecs,
  };
}

export function mapDbCategory(category: DbCategory): Category {
  const subcategories = Array.isArray(category.subcategories)
    ? (category.subcategories as string[])
    : [];

  return {
    id: category.id,
    name: category.nameArabic,
    slug: category.slug,
    icon: category.icon as Category["icon"],
    listingCount: category.listingCount,
    subcategories,
    imageUrl: category.image ?? undefined,
    featuredListingSlug: category.featuredListingSlug ?? undefined,
  };
}

export function mapDbUser(
  user: User,
  walletBalance?: number,
): UserProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    city: user.city ?? "",
    accountType: accountTypeMap[user.accountType],
    isVerified: user.verified,
    joinedAt: user.createdAt.toISOString().slice(0, 10),
    role: roleMap[user.role],
    subscription: user.subscription ?? undefined,
    employeesCount: user.employeesCount ?? undefined,
    listingsCount: user.listingsCount ?? undefined,
    favoritesCount: user.favoritesCount ?? undefined,
    walletBalance,
  };
}

export function mapListingCondition(
  condition: Listing["condition"],
): keyof typeof conditionMap {
  const reverse = {
    new: "NEW",
    used: "USED",
    excellent: "EXCELLENT",
  } as const;
  return reverse[condition];
}

export function mapListingStatus(
  status: Listing["status"],
): keyof typeof statusMap {
  const reverse = {
    draft: "DRAFT",
    active: "ACTIVE",
    pending_review: "PENDING_REVIEW",
    expired: "EXPIRED",
    rejected: "REJECTED",
  } as const;
  return reverse[status];
}
