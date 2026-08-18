import type { ListingCondition } from "@/types";

export type AddListingErrors = {
  category?: string;
  city?: string;
  contact?: string;
  description?: string;
  emirate?: string;
  images?: string;
  price?: string;
  submit?: string;
  title?: string;
};

export type ListingPreview = {
  city: string;
  condition: ListingCondition;
  description: string;
  price: string;
  title: string;
};
