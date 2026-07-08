export type StripePaymentMode = "checkout" | "mock";

export type CheckoutSessionResult = {
  mode: StripePaymentMode;
  orderId: string;
  checkoutUrl?: string;
  sessionId?: string;
};

export type PaymentEventLog = {
  id: string;
  stripeEventId?: string;
  orderId?: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
