import type { ListingCondition } from "@/types";

export type AddListingErrors = {
  category?: string;
  contact?: string;
  description?: string;
  images?: string;
  package?: string;
  price?: string;
  submit?: string;
  title?: string;
  video?: string;
};

export type ListingPreview = {
  city: string;
  condition: ListingCondition;
  description: string;
  price: string;
  title: string;
};
