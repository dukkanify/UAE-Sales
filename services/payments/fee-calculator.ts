import type { OrderFeeBreakdown } from "@/types/domain/order";

const PLATFORM_FEE_RATE = 0.025;
const GATEWAY_FEE_RATE = 0.029;
const GATEWAY_FEE_FIXED = 1;

export function calculateOrderFees(
  productPrice: number,
  shippingFee = 0,
): OrderFeeBreakdown {
  const safePrice = Math.max(0, Math.round(productPrice));
  const safeShipping = Math.max(0, Math.round(shippingFee));
  const platformFee = Math.round(safePrice * PLATFORM_FEE_RATE);
  const gatewayFee = Math.round(safePrice * GATEWAY_FEE_RATE + GATEWAY_FEE_FIXED);
  const total = safePrice + safeShipping + platformFee + gatewayFee;

  return {
    productPrice: safePrice,
    shippingFee: safeShipping,
    gatewayFee,
    platformFee,
    total,
    currency: "AED",
  };
}
