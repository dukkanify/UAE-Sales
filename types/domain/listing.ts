export type ListingStatus =
  | "draft"
  | "active"
  | "pending_review"
  | "expired"
  | "rejected";

export type ListingCondition = "new" | "used" | "excellent";

export type ListingSeller = {
  id: string;
  name: string;
  rating: number;
};

export type ListingImageTone = "gold" | "amber" | "sky" | "rose" | "slate";

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
};

export type ListingSearchFilters = {
  categoryId?: string;
  city?: string;
  condition?: ListingCondition;
  country?: string;
  maxPrice?: number;
  minPrice?: number;
  query?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};
