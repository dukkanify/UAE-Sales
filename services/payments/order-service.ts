import type { Order } from "@/types/domain/order";
import type { CheckoutSessionResult } from "@/types/domain/payment";
import { calculateOrderFees } from "@/services/payments/fee-calculator";
import {
  getServerListingById,
  getServerListingBySlug,
  toListingSnapshot,
  validateLocalListingSnapshot,
  type ListingSnapshot,
} from "@/services/payments/listing-resolver";
import { createNotification } from "@/services/payments/notification-store";
import {
  createOrder,
  findPendingOrder,
  generateOrderId,
  getOrderById,
  isValidOrderTransition,
  updateOrder,
} from "@/services/payments/order-store";
import { logPaymentEvent } from "@/services/payments/payment-log";
import { isStripeConfigured } from "@/services/payments/payment-config";
import type { CreateCheckoutInput } from "@/services/payments/payment-schemas";
import {
  createCheckoutSession,
  refundStripePayment,
} from "@/services/payments/stripe.service";
import { addWalletTransaction } from "@/services/payments/wallet-ledger";

function resolveListingSnapshot(input: CreateCheckoutInput): ListingSnapshot | null {
  const catalog =
    getServerListingById(input.listingId) ??
    getServerListingBySlug(input.listingId);

  if (catalog) {
    return toListingSnapshot(catalog);
  }

  if (input.localListing && validateLocalListingSnapshot(input.localListing)) {
    if (input.localListing.id === input.listingId) {
      return input.localListing;
    }
  }

  return null;
}

export async function initiateCheckout(
  input: CreateCheckoutInput,
): Promise<CheckoutSessionResult> {
  const listing = resolveListingSnapshot(input);
  if (!listing) {
    throw new Error("LISTING_NOT_FOUND");
  }

  if (listing.seller.id === input.buyer.id) {
    throw new Error("CANNOT_BUY_OWN_LISTING");
  }

  const existingPending = await findPendingOrder(input.buyer.id, listing.id);
  if (existingPending) {
    return {
      mode: isStripeConfigured() ? "checkout" : "mock",
      orderId: existingPending.id,
    };
  }

  const fees = calculateOrderFees(listing.price);
  const orderId = generateOrderId();

  const order = await createOrder({
    id: orderId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingSlug: listing.slug,
    buyerId: input.buyer.id,
    buyerName: input.buyer.fullName,
    buyerEmail: input.buyer.email,
    sellerId: listing.seller.id,
    sellerName: listing.seller.name,
    status: "pending_payment",
    escrowStatus: "pending",
    paymentStatus: "pending",
    fees,
  });

  if (!isStripeConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Sooqna Payments] STRIPE_SECRET_KEY is missing — using mock checkout fallback.",
      );
    }
    return { mode: "mock", orderId: order.id };
  }

  const session = await createCheckoutSession({
    order,
    buyerEmail: input.buyer.email,
    listingTitle: listing.title,
  });

  await updateOrder(
    order.id,
    {
      stripeCheckoutSessionId: session.sessionId,
      paymentStatus: "processing",
    },
    {
      type: "checkout_session_created",
      message: "تم إنشاء جلسة Stripe Checkout",
      metadata: { sessionId: session.sessionId ?? "" },
    },
  );

  return session;
}

export async function completeMockPayment(orderId: string): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order || order.status !== "pending_payment") {
    return order;
  }

  return markOrderPaid(order, undefined, "mock");
}

async function markOrderPaid(
  order: Order,
  paymentIntentId?: string,
  source: "stripe" | "mock" = "stripe",
): Promise<Order | undefined> {
  if (!isValidOrderTransition(order.status, "paid_held_in_escrow")) {
    return order;
  }

  const sellerNet = order.fees.productPrice;
  const updated = await updateOrder(
    order.id,
    {
      status: "paid_held_in_escrow",
      escrowStatus: "held",
      paymentStatus: "succeeded",
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date().toISOString(),
    },
    {
      type: "payment_succeeded",
      message:
        source === "mock"
          ? "تم الدفع (وضع تجريبي بدون Stripe)"
          : "تم الدفع عبر Stripe",
      metadata: { paymentIntentId: paymentIntentId ?? "mock" },
    },
  );

  if (!updated) return undefined;

  await addWalletTransaction(order.sellerId, {
    orderId: order.id,
    type: "escrow_hold",
    amount: sellerNet,
    description: `حجز ضمان — ${order.listingTitle}`,
    status: "pending",
  });

  await addWalletTransaction(order.sellerId, {
    orderId: order.id,
    type: "platform_fee",
    amount: -order.fees.platformFee,
    description: `رسوم المنصة — ${order.listingTitle}`,
    status: "completed",
  });

  await createNotification({
    userId: order.buyerId,
    orderId: order.id,
    type: "order_paid",
    title: "تم الدفع بنجاح",
    body: `تم دفع مبلغ ${order.fees.total} د.إ لطلب «${order.listingTitle}». المبلغ محجوز في الضمان.`,
  });

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "escrow_held",
    title: "دفعة جديدة محجوزة",
    body: `تم حجز ${sellerNet} د.إ في الضمان لطلب «${order.listingTitle}».`,
  });

  await logPaymentEvent({
    orderId: order.id,
    type: "order.paid_held_in_escrow",
    payload: { source, paymentIntentId },
  });

  return updated;
}

export async function handleCheckoutSessionCompleted(
  session: {
    id: string;
    metadata?: Record<string, string> | null;
    payment_intent?: string | { id: string } | null;
  },
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await getOrderById(orderId);
  if (!order || order.status !== "pending_payment") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await markOrderPaid(order, paymentIntentId, "stripe");
}

export async function handlePaymentIntentFailed(
  paymentIntentId: string,
  orderId?: string,
): Promise<void> {
  if (!orderId) return;
  await updateOrder(
    orderId,
    { paymentStatus: "failed" },
    {
      type: "payment_failed",
      message: "فشل الدفع",
      metadata: { paymentIntentId },
    },
  );
}

export async function confirmOrderReceived(
  orderId: string,
  buyerId: string,
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;
  if (order.buyerId !== buyerId) {
    throw new Error("UNAUTHORIZED");
  }

  if (!isValidOrderTransition(order.status, "confirmed")) {
    throw new Error("INVALID_STATUS");
  }

  const updated = await updateOrder(
    orderId,
    {
      status: "confirmed",
      escrowStatus: "released",
      confirmedAt: new Date().toISOString(),
      releasedAt: new Date().toISOString(),
    },
    {
      type: "buyer_confirmed",
      message: "أكد المشتري استلام الطلب",
    },
  );

  if (!updated) return undefined;

  const sellerNet = order.fees.productPrice;
  await addWalletTransaction(order.sellerId, {
    orderId: order.id,
    type: "escrow_release",
    amount: sellerNet,
    description: `تحويل ضمان — ${order.listingTitle}`,
    status: "completed",
  });

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_released",
    title: "تم تحويل المبلغ",
    body: `تم تحويل ${sellerNet} د.إ إلى رصيدك المتاح لطلب «${order.listingTitle}».`,
  });

  const released = await updateOrder(orderId, { status: "released" });
  return released;
}

export async function refundOrder(
  orderId: string,
  adminRole?: string,
): Promise<Order | undefined> {
  if (adminRole !== "admin") {
    throw new Error("UNAUTHORIZED");
  }

  const order = await getOrderById(orderId);
  if (!order) return undefined;

  if (order.status === "refunded") return order;

  if (order.stripePaymentIntentId && isStripeConfigured()) {
    const refund = await refundStripePayment(
      order.stripePaymentIntentId,
      orderId,
    );
    await updateOrder(orderId, { stripeRefundId: refund.id });
  }

  const updated = await updateOrder(
    orderId,
    {
      status: "refunded",
      escrowStatus: "refunded",
      paymentStatus: "refunded",
      refundedAt: new Date().toISOString(),
    },
    {
      type: "order_refunded",
      message: "تم استرداد المبلغ",
    },
  );

  if (!updated) return undefined;

  if (order.status === "paid_held_in_escrow" || order.status === "confirmed") {
    await addWalletTransaction(order.sellerId, {
      orderId: order.id,
      type: "refund",
      amount: -order.fees.productPrice,
      description: `استرداد — ${order.listingTitle}`,
      status: "completed",
    });
  }

  await createNotification({
    userId: order.buyerId,
    orderId: order.id,
    type: "order_refunded",
    title: "تم استرداد المبلغ",
    body: `تم استرداد دفعتك لطلب «${order.listingTitle}».`,
  });

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_refunded",
    title: "تم استرداد الطلب",
    body: `تم استرداد الطلب «${order.listingTitle}».`,
  });

  return updated;
}
