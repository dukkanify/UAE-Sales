import type { OrderFeeBreakdown } from "@/types/domain/order";
import { getAdminSettingsSync } from "@/services/admin/admin-settings-store";

export function calculateOrderFees(
  productPrice: number,
  shippingFee = 0,
): OrderFeeBreakdown {
  const settings = getAdminSettingsSync();
  const platformRate = settings.platformFeePercent / 100;
  const gatewayRate = settings.gatewayFeePercent / 100;
  const gatewayFixed = settings.gatewayFeeFixed;

  const safePrice = Math.max(0, Math.round(productPrice));
  const safeShipping = Math.max(0, Math.round(shippingFee));
  const platformFee = Math.round(safePrice * platformRate);
  const gatewayFee = Math.round(safePrice * gatewayRate + gatewayFixed);
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
