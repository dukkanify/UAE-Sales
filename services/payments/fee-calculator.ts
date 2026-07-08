import type { OrderFeeBreakdown } from "@/types/domain/order";

const PLATFORM_FEE_RATE = 0.025;
const GATEWAY_FEE_RATE = 0.029;
const GATEWAY_FEE_FIXED = 1;

export function calculateOrderFees(productPrice: number): OrderFeeBreakdown {
  const safePrice = Math.max(0, Math.round(productPrice));
  const platformFee = Math.round(safePrice * PLATFORM_FEE_RATE);
  const gatewayFee = Math.round(safePrice * GATEWAY_FEE_RATE + GATEWAY_FEE_FIXED);
  const total = safePrice + platformFee + gatewayFee;

  return {
    productPrice: safePrice,
    gatewayFee,
    platformFee,
    total,
    currency: "AED",
  };
}
