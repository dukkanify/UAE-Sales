"use client";

import type { Listing } from "@/types";
import { sellerName } from "./listing-copy";
import { useLocale } from "./useLocale";

type SellerNameProps = {
  className?: string;
  seller: Pick<Listing["seller"], "name" | "nameEnglish">;
};

export function SellerName({ className, seller }: SellerNameProps) {
  const name = sellerName(seller, useLocale());
  if (className) {
    return (
      <span className={className} data-ugc>
        {name}
      </span>
    );
  }
  return <span data-ugc>{name}</span>;
}
