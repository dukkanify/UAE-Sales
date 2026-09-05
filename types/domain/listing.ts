export type ListingStatus =
  | "draft"
  | "active"
  | "pending_review"
  | "expired"
  | "rejected";

export type ListingCondition = "new" | "used" | "excellent";

export type SellerType = "individual" | "business";

export type ContactMethod = "chat" | "phone" | "both";

export type DeliveryOption =
  | "pickup"
  | "delivery"
  | "both"
  | "not_applicable";

export type ListingSeller = {
  id: string;
  name: string;
  /** English display name when locale is English. */
  nameEnglish?: string;
  rating?: number;
  avatarUrl?: string;
  isVerified?: boolean;
  sellerType?: SellerType;
  joinedAt?: string;
  reviewCount?: number;
  responseTime?: string;
  completedTransactions?: number;
};

export type CarSpecs = {
  mileage: string;
  transmission: string;
  fuel: string;
  warranty: string;
  accidentHistory: string;
  regionalSpecs: string;
  serviceHistory: string;
  vinAvailable: boolean;
};

export type RealEstateSpecs = {
  bedrooms: number;
  bathrooms: number;
  parking: number;
  areaSqft: number;
  furnished: string;
  developer: string;
  community: string;
  amenities: string[];
};

export type ElectronicsSpecs = {
  storage: string;
  color: string;
  warranty: string;
  accessories: string;
  purchaseDate: string;
};

export type ListingImageTone = "gold" | "amber" | "sky" | "rose" | "slate";

import type { CategorySpecs } from "./category-fields";

export type Listing = {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  city: string;
  country: string;
  price: number;
  currency: "AED";
  condition: ListingCondition;
  status: ListingStatus;
  isFeatured: boolean;
  views: number;
  imageUrl?: string;
  seller: ListingSeller;
  imageTone: ListingImageTone;
  titleEnglish?: string;
  descriptionEnglish?: string;
  subcategory?: string;
  emirate?: string;
  area?: string;
  images?: string[];
  /** Optional listing video URL (YouTube / direct link). */
  videoUrl?: string;
  isPremium?: boolean;
  /** Urgent sale — highlighted on listing cards. */
  isUrgent?: boolean;
  /** Eligible for escrow when purchased and paid in full through platform checkout. */
  escrowAvailable?: boolean;
  verifiedSeller?: boolean;
  postedAt?: string;
  /** ISO timestamp when the listing becomes / became expired. */
  expiresAt?: string;
  /** ISO timestamp until which the listing stays featured. */
  featuredUntil?: string;
  contactMethod?: ContactMethod;
  deliveryOption?: DeliveryOption;
  features?: string[];
  negotiable?: boolean;
  reasonForSelling?: string;
  carSpecs?: CarSpecs;
  realEstateSpecs?: RealEstateSpecs;
  electronicsSpecs?: ElectronicsSpecs;
  /** User-entered dynamic fields (local / new listings) */
  categorySpecs?: CategorySpecs;
  contactPhone?: string;
  /** Shown to the seller when status is rejected. */
  rejectionReason?: string;
  /** Append-only status transitions for audit. */
  statusHistory?: {
    at: string;
    from?: ListingStatus;
    to: ListingStatus;
    byUserId?: string;
    note?: string;
  }[];
};

export type ListingSearchFilters = {
  area?: string;
  categoryId?: string;
  city?: string;
  condition?: ListingCondition;
  country?: string;
  emirate?: string;
  featured?: boolean;
  maxPrice?: number;
  minPrice?: number;
  premium?: boolean;
  query?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};
