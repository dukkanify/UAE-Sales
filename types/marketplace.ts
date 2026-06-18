export type ListingStatus =
  | "draft"
  | "active"
  | "pending_review"
  | "expired"
  | "rejected";

export type ListingCondition = "new" | "used" | "excellent";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  listingCount: number;
  subcategories: string[];
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  accountType: "buyer" | "seller" | "business" | "individual" | "company";
  isVerified: boolean;
  joinedAt: string;
};

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
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  imageTone: "gold" | "amber" | "sky" | "rose" | "slate";
};

export type City = {
  id: string;
  name: string;
};
