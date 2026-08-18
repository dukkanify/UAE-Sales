"use client";

import type { Listing } from "@/types";
import { listingTitle } from "./listing-copy";
import { useLocale } from "./useLocale";

type ListingTitleProps = {
  className?: string;
  listing: Pick<Listing, "title" | "titleEnglish">;
};

export function ListingTitle({ className, listing }: ListingTitleProps) {
  const title = listingTitle(listing, useLocale());
  if (className) {
    return <span className={className}>{title}</span>;
  }
  return <>{title}</>;
}
