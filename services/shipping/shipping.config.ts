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

/** Categories that participate in checkout delivery / handover step (includes vehicles). */
export const CHECKOUT_SHIPPING_CATEGORIES = new Set([
  "cars",
  ...SHIPPABLE_CATEGORIES,
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

export const CAR_SHIPPING_METHOD_OVERRIDES: Partial<
  Record<ShippingMethodId, Omit<ShippingMethod, "id">>
> = {
  pickup: {
    label: "الاستلام من المعرض",
    description: "استلام المركبة من موقع البائع أو المعرض",
    fee: 0,
    estimatedLabel: "حسب الاتفاق",
  },
  standard: {
    label: "نقل المركبة",
    description: "نقل المركبة إلى العنوان المحدد عبر شريك نقل معتمد",
    fee: 350,
    estimatedLabel: "3-7 أيام",
  },
};
