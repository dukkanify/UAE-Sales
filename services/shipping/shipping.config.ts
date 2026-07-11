import type { ShippingMethod, ShippingMethodId } from "@/types/domain/address";

export const SHIPPABLE_CATEGORIES = new Set([
  "mobiles",
  "electronics",
  "furniture",
  "fashion",
  "kids",
  "sports",
  "books",
  "food",
]);

export const SHIPPING_METHOD_CONFIG: Record<
  ShippingMethodId,
  Omit<ShippingMethod, "id">
> = {
  express: {
    label: "التوصيل السريع",
    description: "توصيل خلال 1-2 يوم عمل",
    fee: 35,
    estimatedLabel: "1-2 يوم",
  },
  standard: {
    label: "التوصيل العادي",
    description: "توصيل خلال 3-5 أيام عمل",
    fee: 15,
    estimatedLabel: "3-5 أيام",
  },
  pickup: {
    label: "الاستلام من البائع",
    description: "التنسيق المباشر مع البائع في مكان آمن",
    fee: 0,
    estimatedLabel: "حسب الاتفاق",
  },
};
