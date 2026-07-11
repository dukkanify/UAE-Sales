import type { ShippingMethod, ShippingMethodId } from "@/types/domain/address";
import {
  SHIPPABLE_CATEGORIES,
  SHIPPING_METHOD_CONFIG,
} from "@/services/shipping/shipping.config";

export { SHIPPING_METHOD_CONFIG, SHIPPABLE_CATEGORIES };

export function isCategoryShippable(categoryId: string): boolean {
  return SHIPPABLE_CATEGORIES.has(categoryId);
}

export function getAvailableShippingMethods(
  categoryId: string,
  sellerEmirate?: string,
  buyerEmirate?: string,
): ShippingMethod[] {
  if (!isCategoryShippable(categoryId)) {
    return [];
  }

  const methods: ShippingMethod[] = [
    { id: "standard", ...SHIPPING_METHOD_CONFIG.standard },
    { id: "pickup", ...SHIPPING_METHOD_CONFIG.pickup },
  ];

  const sameEmirate =
    sellerEmirate &&
    buyerEmirate &&
    sellerEmirate.trim() === buyerEmirate.trim();

  if (sameEmirate) {
    methods.unshift({ id: "express", ...SHIPPING_METHOD_CONFIG.express });
  }

  return methods;
}

export function calculateShippingFee(methodId: ShippingMethodId): number {
  return SHIPPING_METHOD_CONFIG[methodId]?.fee ?? 0;
}

export function estimateDeliveryDate(methodId: ShippingMethodId): string {
  return SHIPPING_METHOD_CONFIG[methodId]?.estimatedLabel ?? "";
}

export function validateDeliveryAddress(input: {
  fullName: string;
  phone: string;
  emirate: string;
  city: string;
  area: string;
  street: string;
}): boolean {
  return (
    input.fullName.trim().length >= 2 &&
    input.phone.trim().length >= 8 &&
    input.emirate.trim().length > 0 &&
    input.city.trim().length > 0 &&
    input.area.trim().length > 0 &&
    input.street.trim().length > 0
  );
}

export type CheckoutShippingInput = {
  categoryId: string;
  sellerEmirate?: string;
  buyerEmirate?: string;
  shippingMethod?: ShippingMethodId;
};

export function resolveCheckoutShipping(
  input: CheckoutShippingInput,
): { shippingFee: number; shippingMethod?: ShippingMethodId } {
  if (!isCategoryShippable(input.categoryId)) {
    return { shippingFee: 0 };
  }

  const methodId = input.shippingMethod ?? "standard";
  const available = getAvailableShippingMethods(
    input.categoryId,
    input.sellerEmirate,
    input.buyerEmirate,
  );

  const isAllowed = available.some((method) => method.id === methodId);
  if (!isAllowed) {
    throw new Error("SHIPPING_UNAVAILABLE");
  }

  return {
    shippingFee: calculateShippingFee(methodId),
    shippingMethod: methodId,
  };
}
