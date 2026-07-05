import type { ListingCondition } from "@/types";

export type AddListingErrors = {
  category?: string;
  contact?: string;
  description?: string;
  price?: string;
  title?: string;
};

export type ListingPreview = {
  city: string;
  condition: ListingCondition;
  description: string;
  price: string;
  title: string;
};
