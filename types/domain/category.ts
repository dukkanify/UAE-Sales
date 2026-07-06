export type CategoryIconName =
  | "car"
  | "home"
  | "laptop"
  | "phone"
  | "sofa"
  | "briefcase"
  | "watch"
  | "paw"
  | "wrench"
  | "baby"
  | "book"
  | "sport"
  | "food";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconName;
  listingCount: number;
  subcategories: string[];
  imageUrl?: string;
  featuredListingSlug?: string;
};
