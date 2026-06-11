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

export type Listing = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  city: string;
  country: string;
  price: number;
  currency: "AED";
  condition: ListingCondition;
  status: ListingStatus;
  isFeatured: boolean;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  imageTone: "emerald" | "amber" | "sky" | "rose" | "slate";
};

export type City = {
  id: string;
  name: string;
};
