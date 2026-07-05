export const PAYMENT_GATEWAY_FEE_RATE = 0.025;
export const PLATFORM_FEE_RATE = 0.01;
export const MIN_PAYMENT_FEE = 25;

export type CheckoutFees = {
  productPrice: number;
  paymentGatewayFee: number;
  platformFee: number;
  totalAmount: number;
};

export function calculateCheckoutFees(productPrice: number): CheckoutFees {
  const paymentGatewayFee = Math.max(
    MIN_PAYMENT_FEE,
    Math.round(productPrice * PAYMENT_GATEWAY_FEE_RATE),
  );
  const platformFee = Math.round(productPrice * PLATFORM_FEE_RATE);
  const totalAmount = productPrice + paymentGatewayFee + platformFee;

  return {
    productPrice,
    paymentGatewayFee,
    platformFee,
    totalAmount,
  };
}

export const MOCK_PAYMENT_METHODS = [
  {
    id: "card",
    label: "بطاقة بنكية",
    description: "Visa · Mastercard · مدى",
    icon: "wallet" as const,
  },
  {
    id: "apple-pay",
    label: "Apple Pay",
    description: "دفع سريع وآمن",
    icon: "shield" as const,
  },
] as const;
