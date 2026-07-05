"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Listing } from "@/types";
import { Button } from "@/shared/ui/Button";
import { getSessionUser } from "@/services/storage";

type BuyNowButtonProps = {
  listing: Listing;
};

export function BuyNowButton({ listing }: BuyNowButtonProps) {
  const router = useRouter();

  const handleBuyNow = useCallback(() => {
    const checkoutPath = `/checkout?listingId=${listing.id}`;
    const sessionUser = getSessionUser();

    if (!sessionUser) {
      router.push(`/login?next=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    router.push(checkoutPath);
  }, [listing.id, router]);

  return (
    <Button fullWidth onClick={handleBuyNow} size="lg" variant="accent">
      شراء الآن
    </Button>
  );
}
