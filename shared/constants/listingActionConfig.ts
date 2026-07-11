import type { Listing } from "@/types";

export type ListingActionType =
  | "BUY_NOW"
  | "RESERVE"
  | "CONTACT_SELLER"
  | "BOOK_VIEWING"
  | "REQUEST_QUOTE"
  | "APPLY_JOB"
  | "BOOK_SERVICE"
  | "SEND_MESSAGE";

export type ListingActionConfig = {
  checkoutEnabled: boolean;
  mobileBarActions: ListingActionType[];
  primaryAction: ListingActionType;
  secondaryActions: ListingActionType[];
  shippingEnabled: boolean;
  showBuyNow: boolean;
  showEscrowBadge: boolean;
};

const PRODUCT_CATEGORIES = new Set([
  "mobiles",
  "electronics",
  "furniture",
  "fashion",
  "kids",
  "sports",
  "books",
  "pets",
  "food",
]);

const CONTACT_ONLY_CATEGORIES = new Set(["pets"]);

function isPurchasableProduct(listing: Listing): boolean {
  if (listing.status !== "active") return false;
  if (!PRODUCT_CATEGORIES.has(listing.categoryId)) return false;
  if (CONTACT_ONLY_CATEGORIES.has(listing.categoryId)) return false;
  return Boolean(listing.escrowAvailable);
}

function isCarPurchasable(listing: Listing): boolean {
  return (
    listing.categoryId === "cars" &&
    listing.status === "active" &&
    Boolean(listing.escrowAvailable) &&
    !listing.negotiable
  );
}

export function getListingActionConfig(listing: Listing): ListingActionConfig {
  const { categoryId } = listing;

  if (categoryId === "jobs") {
    return {
      primaryAction: "APPLY_JOB",
      secondaryActions: ["SEND_MESSAGE", "CONTACT_SELLER"],
      mobileBarActions: ["CONTACT_SELLER", "SEND_MESSAGE", "APPLY_JOB"],
      checkoutEnabled: false,
      shippingEnabled: false,
      showBuyNow: false,
      showEscrowBadge: false,
    };
  }

  if (categoryId === "real-estate") {
    return {
      primaryAction: "BOOK_VIEWING",
      secondaryActions: ["CONTACT_SELLER", "SEND_MESSAGE"],
      mobileBarActions: ["CONTACT_SELLER", "SEND_MESSAGE", "BOOK_VIEWING"],
      checkoutEnabled: false,
      shippingEnabled: false,
      showBuyNow: false,
      showEscrowBadge: Boolean(listing.escrowAvailable),
    };
  }

  if (categoryId === "services") {
    return {
      primaryAction: "REQUEST_QUOTE",
      secondaryActions: ["BOOK_SERVICE", "SEND_MESSAGE"],
      mobileBarActions: ["CONTACT_SELLER", "SEND_MESSAGE", "REQUEST_QUOTE"],
      checkoutEnabled: false,
      shippingEnabled: false,
      showBuyNow: false,
      showEscrowBadge: false,
    };
  }

  if (categoryId === "cars") {
    const purchasable = isCarPurchasable(listing);
    return {
      primaryAction: purchasable ? "RESERVE" : "CONTACT_SELLER",
      secondaryActions: ["SEND_MESSAGE"],
      mobileBarActions: [
        "CONTACT_SELLER",
        "SEND_MESSAGE",
        purchasable ? "RESERVE" : "CONTACT_SELLER",
      ],
      checkoutEnabled: purchasable,
      shippingEnabled: false,
      showBuyNow: purchasable,
      showEscrowBadge: Boolean(listing.escrowAvailable),
    };
  }

  if (isPurchasableProduct(listing)) {
    return {
      primaryAction: "BUY_NOW",
      secondaryActions: ["SEND_MESSAGE"],
      mobileBarActions: ["CONTACT_SELLER", "SEND_MESSAGE", "BUY_NOW"],
      checkoutEnabled: true,
      shippingEnabled: true,
      showBuyNow: true,
      showEscrowBadge: Boolean(listing.escrowAvailable),
    };
  }

  return {
    primaryAction: "CONTACT_SELLER",
    secondaryActions: ["SEND_MESSAGE"],
    mobileBarActions: ["CONTACT_SELLER", "SEND_MESSAGE"],
    checkoutEnabled: false,
    shippingEnabled: false,
    showBuyNow: false,
    showEscrowBadge: Boolean(listing.escrowAvailable),
  };
}

export const ACTION_LABELS: Record<ListingActionType, string> = {
  BUY_NOW: "شراء الآن",
  RESERVE: "احجز المركبة",
  CONTACT_SELLER: "اتصال",
  BOOK_VIEWING: "احجز معاينة",
  REQUEST_QUOTE: "طلب عرض سعر",
  APPLY_JOB: "تقديم على الوظيفة",
  BOOK_SERVICE: "حجز الخدمة",
  SEND_MESSAGE: "محادثة",
};
