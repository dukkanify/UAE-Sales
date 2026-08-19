import type { Order } from "@/types/domain/order";
import type { CheckoutSessionResult } from "@/types/domain/payment";
import { getAddressesForUser } from "@/services/addresses/address-store";
import { normalizeEmail } from "@/services/auth/guest-account.service";
import { finalizeGuestCheckoutAfterPayment } from "@/services/payments/guest-checkout.service";
import { calculateOrderFees } from "@/services/payments/fee-calculator";
import {
  getServerListingById,
  getServerListingBySlug,
  toListingSnapshot,
  validateLocalListingSnapshot,
} from "@/services/payments/listing-resolver";
import { resolveCheckoutShipping } from "@/services/shipping/shipping.service";
import { createNotification } from "@/services/payments/notification-store";
import {
  emailOrderPaid,
  emailOrderStatusToUser,
} from "@/services/email/notification-emails";
import {
  createOrder,
  findPendingOrder,
  generateOrderId,
  getOrderByCheckoutSessionId,
  getOrderById,
  getOrderByPaymentIntentId,
  isValidOrderTransition,
  updateOrder,
} from "@/services/payments/order-store";
import { logPaymentEvent } from "@/services/payments/payment-log";
import {
  isStripeConfigured,
  isMockCheckoutAllowed,
} from "@/services/payments/payment-config";
import type { CreateCheckoutInput } from "@/services/payments/payment-schemas";
import {
  createCheckoutSession,
  refundStripePayment,
  retrieveCheckoutSession,
} from "@/services/payments/stripe.service";
import { addWalletTransaction } from "@/services/payments/wallet-ledger";
import type { ListingSnapshot } from "@/services/payments/listing-resolver";
import { hydrateListingCatalog } from "@/services/payments/listing-resolver";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { formatCurrencyLabel } from "@/shared/utils/currency";
import { normalizeUaePhone } from "@/shared/utils/phone";

type ListingCheckoutContext = {
  snapshot: ListingSnapshot;
  categoryId: string;
  sellerEmirate?: string;
};

function resolveListingCheckoutContext(
  input: CreateCheckoutInput,
): ListingCheckoutContext | null {
  const catalog =
    getServerListingById(input.listingId) ??
    getServerListingBySlug(input.listingId);

  if (catalog) {
    return {
      snapshot: toListingSnapshot(catalog),
      categoryId: catalog.categoryId,
      sellerEmirate: catalog.emirate ?? catalog.city,
    };
  }

  if (input.localListing && validateLocalListingSnapshot(input.localListing)) {
    if (input.localListing.id !== input.listingId) {
      return null;
    }
    if (!input.localListing.categoryId) {
      return null;
    }
    return {
      snapshot: input.localListing,
      categoryId: input.localListing.categoryId,
      sellerEmirate: input.localListing.emirate ?? input.localListing.city,
    };
  }

  return null;
}

function isGuestCheckout(input: CreateCheckoutInput): boolean {
  return Boolean(input.isGuest || !input.buyer.id);
}

export async function initiateCheckout(
  input: CreateCheckoutInput,
): Promise<CheckoutSessionResult> {
  await hydrateListingCatalog();
  const context = resolveListingCheckoutContext(input);
  if (!context) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const listing = context.snapshot;
  const guest = isGuestCheckout(input);
  const buyerEmail = normalizeEmail(input.buyer.email);
  const buyerName = input.buyer.fullName.trim();
  const buyerPhone = normalizeUaePhone(input.buyer.phone ?? "");

  if (guest) {
    const settings = await getAdminSettings();
    if (!settings.allowGuestCheckout) {
      throw new Error("GUEST_CHECKOUT_DISABLED");
    }
  }

  if (!guest && listing.seller.id === input.buyer.id) {
    throw new Error("CANNOT_BUY_OWN_LISTING");
  }

  const existingPending = await findPendingOrder(
    input.buyer.id,
    listing.id,
    guest ? buyerEmail : undefined,
  );
  if (existingPending) {
    if (input.forceMock && isMockCheckoutAllowed()) {
      return { mode: "mock", orderId: existingPending.id };
    }
    return resumeCheckoutForOrder(existingPending, buyerEmail, listing.title);
  }

  let buyerEmirate: string | undefined;
  if (input.deliveryAddress?.emirate) {
    buyerEmirate = input.deliveryAddress.emirate;
  } else if (input.addressId && input.buyer.id) {
    const addresses = await getAddressesForUser(input.buyer.id);
    buyerEmirate = addresses.find((item) => item.id === input.addressId)?.emirate;
  }

  const shipping = resolveCheckoutShipping({
    categoryId: context.categoryId,
    sellerEmirate: context.sellerEmirate,
    buyerEmirate,
    shippingMethod: input.shippingMethod,
  });

  const fees = calculateOrderFees(listing.price, shipping.shippingFee);
  const orderId = generateOrderId();

  const order = await createOrder({
    id: orderId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingSlug: listing.slug,
    buyerId: guest ? null : input.buyer.id,
    buyerName,
    buyerEmail,
    guestEmail: guest ? buyerEmail : undefined,
    guestFullName: guest ? buyerName : undefined,
    guestPhone: guest ? buyerPhone : undefined,
    customerType: guest ? "guest" : "registered",
    sellerId: listing.seller.id,
    sellerName: listing.seller.name,
    status: "pending_payment",
    escrowStatus: "pending",
    paymentStatus: "pending",
    fees,
    shippingMethod: shipping.shippingMethod,
    deliveryAddressId: input.addressId,
    deliveryAddressSnapshot: input.deliveryAddress
      ? {
          label: input.deliveryAddress.label,
          fullName: input.deliveryAddress.fullName ?? buyerName,
          phone: input.deliveryAddress.phone ?? buyerPhone,
          emirate: input.deliveryAddress.emirate,
          city: input.deliveryAddress.city,
          area: input.deliveryAddress.area,
          street: input.deliveryAddress.street,
          building: input.deliveryAddress.building,
          unit: input.deliveryAddress.unit,
          landmark: input.deliveryAddress.landmark,
          notes: input.deliveryAddress.notes,
          companyName: input.deliveryAddress.companyName,
          latitude: input.deliveryAddress.latitude,
          longitude: input.deliveryAddress.longitude,
          formattedAddress: input.deliveryAddress.formattedAddress,
        }
      : undefined,
    saveAddress: input.deliveryAddress?.saveAddress,
  });

  if (!isStripeConfigured()) {
    if (!isMockCheckoutAllowed()) {
      throw new Error("STRIPE_NOT_CONFIGURED");
    }
    if (input.forceMock) {
      console.warn("[Sooqna Payments] Forced mock checkout (testing).");
    } else {
      console.warn(
        "[Sooqna Payments] STRIPE_SECRET_KEY is missing — using mock checkout fallback.",
      );
    }
    return { mode: "mock", orderId: order.id };
  }

  if (input.forceMock && isMockCheckoutAllowed()) {
    console.warn("[Sooqna Payments] Forced mock checkout (testing).");
    return { mode: "mock", orderId: order.id };
  }

  return attachStripeCheckout(order, buyerEmail, listing.title);
}

async function resumeCheckoutForOrder(
  order: Order,
  buyerEmail: string,
  listingTitle: string,
): Promise<CheckoutSessionResult> {
  if (!isStripeConfigured()) {
    if (!isMockCheckoutAllowed()) {
      throw new Error("STRIPE_NOT_CONFIGURED");
    }
    return { mode: "mock", orderId: order.id };
  }

  if (order.stripeCheckoutSessionId) {
    try {
      const existing = await retrieveCheckoutSession(order.stripeCheckoutSessionId);
      if (existing.status === "open" && existing.url) {
        return {
          mode: "checkout",
          orderId: order.id,
          checkoutUrl: existing.url,
          sessionId: existing.id,
        };
      }
    } catch {
      // Session missing or unusable — create a fresh one below.
    }
  }

  return attachStripeCheckout(order, buyerEmail, listingTitle, true);
}

async function attachStripeCheckout(
  order: Order,
  buyerEmail: string,
  listingTitle: string,
  freshSession = false,
): Promise<CheckoutSessionResult> {
  const session = await createCheckoutSession({
    order,
    buyerEmail,
    listingTitle,
    freshSession,
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

export async function completeMockPayment(orderId: string): Promise<{
  order?: Order;
  guestAccessToken?: string;
  hasExistingAccount?: boolean;
}> {
  const order = await getOrderById(orderId);
  if (!order || order.status !== "pending_payment") {
    return { order };
  }

  return markOrderPaid(order, undefined, "mock");
}

async function sendOrderNotifications(order: Order): Promise<void> {
  if (!order.buyerId) return;

  await createNotification({
    userId: order.buyerId,
    orderId: order.id,
    type: "order_paid",
    title: "تم الدفع بنجاح",
    body: `تم دفع مبلغ ${formatCurrencyLabel(order.fees.total)} لطلب «${order.listingTitle}». المبلغ محجوز في الضمان.`,
  });

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "escrow_held",
    title: "دفعة جديدة محجوزة",
    body: `تم حجز ${formatCurrencyLabel(order.fees.productPrice)} في الضمان لطلب «${order.listingTitle}».`,
  });

  void emailOrderPaid(order).catch((error) => {
    console.error("[Sooqna Email] order paid email failed", error);
  });
}

async function markOrderPaid(
  order: Order,
  paymentIntentId?: string,
  source: "stripe" | "mock" = "stripe",
): Promise<{ order?: Order; guestAccessToken?: string; hasExistingAccount?: boolean }> {
  if (!isValidOrderTransition(order.status, "paid_held_in_escrow")) {
    return { order };
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

  if (!updated) return {};

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

  let finalOrder = updated;
  let guestAccessToken: string | undefined;
  let hasExistingAccount = updated.hasExistingAccount;

  if (updated.customerType === "guest" || updated.guestEmail || !updated.buyerId) {
    const result = await finalizeGuestCheckoutAfterPayment(updated, {
      saveAddress: updated.saveAddress,
      deliveryAddress: updated.deliveryAddressSnapshot
        ? {
            ...updated.deliveryAddressSnapshot,
            label: updated.deliveryAddressSnapshot.label ?? "المنزل",
            userId: "",
            id: "",
            isDefault: true,
            createdAt: "",
            updatedAt: "",
          }
        : undefined,
    });
    finalOrder = result.order;
    guestAccessToken = result.guestAccessToken;
    hasExistingAccount = result.hasExistingAccount;
  }

  await sendOrderNotifications(finalOrder);

  await logPaymentEvent({
    orderId: order.id,
    type: "order.paid_held_in_escrow",
    payload: { source, paymentIntentId },
  });

  return { order: finalOrder, guestAccessToken, hasExistingAccount };
}

export async function handleCheckoutSessionCompleted(
  session: {
    id: string;
    metadata?: Record<string, string> | null;
    payment_intent?: string | { id: string } | null;
  },
): Promise<void> {
  if (session.metadata?.type === "featured_listing") {
    const listingId = session.metadata.listingId;
    if (!listingId) return;
    const { markListingFeatured } = await import(
      "@/services/payments/featured-checkout.service"
    );
    await markListingFeatured(listingId, session.id);
    return;
  }

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

/** Shared escrow release path used by buyer confirm / match flows. */
async function releaseEscrowToSeller(
  order: Order,
  audit: { type: string; message: string },
  options?: { buyerMatchConfirmedAt?: string },
): Promise<Order | undefined> {
  if (order.status === "released" && order.escrowStatus === "released") {
    if (options?.buyerMatchConfirmedAt && !order.buyerMatchConfirmedAt) {
      return updateOrder(order.id, {
        buyerMatchConfirmedAt: options.buyerMatchConfirmedAt,
      });
    }
    return order;
  }

  const fromHeld =
    order.status === "paid_held_in_escrow" || order.status === "delivered";
  const fromConfirmed = order.status === "confirmed";

  if (!fromHeld && !fromConfirmed) {
    throw new Error("INVALID_STATUS");
  }

  if (fromHeld && !isValidOrderTransition(order.status, "confirmed")) {
    throw new Error("INVALID_STATUS");
  }
  if (fromConfirmed && !isValidOrderTransition(order.status, "released")) {
    throw new Error("INVALID_STATUS");
  }

  const now = new Date().toISOString();
  const matchPatch = options?.buyerMatchConfirmedAt
    ? { buyerMatchConfirmedAt: options.buyerMatchConfirmedAt }
    : {};

  let working: Order | undefined;
  if (fromHeld) {
    working = await updateOrder(
      order.id,
      {
        status: "confirmed",
        escrowStatus: "released",
        confirmedAt: now,
        releasedAt: now,
        ...matchPatch,
      },
      audit,
    );
  } else {
    working = await updateOrder(
      order.id,
      {
        status: "released",
        escrowStatus: "released",
        releasedAt: now,
        ...matchPatch,
      },
      audit,
    );
  }

  if (!working) return undefined;

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
    body: `تم تحويل ${formatCurrencyLabel(sellerNet)} إلى رصيدك المتاح لطلب «${order.listingTitle}».`,
  });

  if (order.buyerId) {
    await createNotification({
      userId: order.buyerId,
      orderId: order.id,
      type: "order_confirmed",
      title: "تم تأكيد الاستلام",
      body: `تم تأكيد طلب «${order.listingTitle}» وتحويل المبلغ للبائع.`,
    });
    void emailOrderStatusToUser({
      userId: order.buyerId,
      fallbackEmail: order.buyerEmail,
      orderId: order.id,
      type: "order_confirmed",
      title: "تم تأكيد الاستلام",
      subject: `تحديث الطلب — ${order.listingTitle}`,
      body: `تم تأكيد طلب «${order.listingTitle}» وتحويل المبلغ للبائع.`,
    }).catch((error) => console.error("[Sooqna Email] order confirmed email failed", error));
  }

  void emailOrderStatusToUser({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_released",
    title: "تم تحويل المبلغ",
    subject: `تم تحويل مبلغ الطلب — ${order.listingTitle}`,
    body: `تم تحويل المبلغ إلى رصيدك المتاح لطلب «${order.listingTitle}».`,
  }).catch((error) => console.error("[Sooqna Email] order released email failed", error));

  if (working.status === "released") {
    return working;
  }

  return updateOrder(order.id, { status: "released" });
}

export async function submitSellerProof(
  orderId: string,
  sellerId: string,
  proofUrls: string[],
  note?: string,
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;
  if (order.sellerId !== sellerId) {
    throw new Error("UNAUTHORIZED");
  }

  const eligible =
    order.status === "paid_held_in_escrow" || order.status === "delivered";
  if (!eligible) {
    throw new Error("INVALID_STATUS");
  }

  const urls = proofUrls.map((url) => url.trim()).filter(Boolean);
  if (urls.length === 0) {
    throw new Error("INVALID_PROOF");
  }

  const updated = await updateOrder(
    orderId,
    {
      sellerProofUrls: urls,
      sellerProofNote: note?.trim() || undefined,
      sellerProofAt: new Date().toISOString(),
    },
    {
      type: "seller_proof_submitted",
      message: "رفع البائع إثبات التسليم / المطابقة",
    },
  );

  if (!updated) return undefined;

  if (order.buyerId) {
    await createNotification({
      userId: order.buyerId,
      orderId: order.id,
      type: "seller_proof",
      title: "إثبات من البائع",
      body: `رفع البائع إثباتاً لطلب «${order.listingTitle}». راجع الإثبات وأكّد المطابقة.`,
    });
    void emailOrderStatusToUser({
      userId: order.buyerId,
      fallbackEmail: order.buyerEmail,
      orderId: order.id,
      type: "seller_proof",
      title: "إثبات من البائع",
      subject: `إثبات تسليم — ${order.listingTitle}`,
      body: `رفع البائع إثباتاً لطلب «${order.listingTitle}». راجع الإثبات وأكّد المطابقة.`,
    }).catch((error) => console.error("[Sooqna Email] seller proof email failed", error));
  }

  return updated;
}

/**
 * Buyer confirms item match after seller proof — preferred release path.
 * Sets buyerMatchConfirmedAt then releases escrow like confirmOrderReceived.
 */
export async function confirmBuyerMatch(
  orderId: string,
  buyerId: string,
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;
  if (order.buyerId !== buyerId) {
    throw new Error("UNAUTHORIZED");
  }

  if (!order.sellerProofAt) {
    throw new Error("PROOF_REQUIRED");
  }

  if (order.buyerMatchConfirmedAt && order.status === "released") {
    return order;
  }

  const matchAt = new Date().toISOString();
  const released = await releaseEscrowToSeller(
    order,
    {
      type: "buyer_match_confirmed",
      message: "أكد المشتري المطابقة وتم تحويل الضمان",
    },
    { buyerMatchConfirmedAt: matchAt },
  );

  if (released && order.buyerId) {
    await createNotification({
      userId: order.buyerId,
      orderId: order.id,
      type: "buyer_match",
      title: "تم تأكيد المطابقة",
      body: `تم تأكيد مطابقة طلب «${order.listingTitle}» وتحرير الضمان.`,
    });
  }

  return released;
}

/** Buyer confirm receipt — requires seller proof before escrow release. */
export async function confirmOrderReceived(
  orderId: string,
  buyerId: string,
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;
  if (order.buyerId !== buyerId) {
    throw new Error("UNAUTHORIZED");
  }

  if (!order.sellerProofAt) {
    throw new Error("PROOF_REQUIRED");
  }

  return releaseEscrowToSeller(order, {
    type: "buyer_confirmed",
    message: "أكد المشتري استلام الطلب",
  });
}

/** Caller must enforce admin session before invoking. */
export async function refundOrder(
  orderId: string,
  options?: { skipStripe?: boolean; stripeRefundId?: string },
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;

  if (order.status === "refunded") return order;

  if (
    !options?.skipStripe &&
    order.stripePaymentIntentId &&
    isStripeConfigured()
  ) {
    const refund = await refundStripePayment(
      order.stripePaymentIntentId,
      orderId,
    );
    await updateOrder(orderId, { stripeRefundId: refund.id });
  } else if (options?.stripeRefundId) {
    await updateOrder(orderId, { stripeRefundId: options.stripeRefundId });
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
      message: options?.skipStripe
        ? "تمت مزامنة الاسترداد من Stripe"
        : "تم استرداد المبلغ",
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

  if (order.buyerId) {
    await createNotification({
      userId: order.buyerId,
      orderId: order.id,
      type: "order_refunded",
      title: "تم استرداد المبلغ",
      body: `تم استرداد دفعتك لطلب «${order.listingTitle}».`,
    });
    void emailOrderStatusToUser({
      userId: order.buyerId,
      fallbackEmail: order.buyerEmail,
      orderId: order.id,
      type: "order_refunded",
      title: "تم استرداد المبلغ",
      subject: `استرداد الطلب — ${order.listingTitle}`,
      body: `تم استرداد دفعتك لطلب «${order.listingTitle}».`,
    }).catch((error) => console.error("[Sooqna Email] refund buyer email failed", error));
  }

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_refunded",
    title: "تم استرداد الطلب",
    body: `تم استرداد الطلب «${order.listingTitle}».`,
  });
  void emailOrderStatusToUser({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_refunded",
    title: "تم استرداد الطلب",
    subject: `استرداد الطلب — ${order.listingTitle}`,
    body: `تم استرداد الطلب «${order.listingTitle}».`,
  }).catch((error) => console.error("[Sooqna Email] refund seller email failed", error));

  return updated;
}

/** Sync local order when Stripe Dashboard issues a refund. */
export async function syncRefundFromStripeCharge(input: {
  paymentIntentId?: string;
  chargeId?: string;
  refundId?: string;
}): Promise<Order | undefined> {
  if (!input.paymentIntentId) return undefined;
  const order = await getOrderByPaymentIntentId(input.paymentIntentId);
  if (!order) return undefined;
  return refundOrder(order.id, {
    skipStripe: true,
    stripeRefundId: input.refundId,
  });
}

/** Resolve order after Stripe redirect using Checkout Session id. */
export async function resolveOrderFromCheckoutSession(
  sessionId: string,
): Promise<Order | undefined> {
  if (!sessionId || !isStripeConfigured()) return undefined;

  const local = await getOrderByCheckoutSessionId(sessionId);
  if (local && local.status !== "pending_payment") return local;

  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (session.payment_status === "paid") {
      await handleCheckoutSessionCompleted(session);
    }
    const orderId = session.metadata?.orderId ?? local?.id;
    if (!orderId) return local;
    return getOrderById(orderId);
  } catch {
    return local;
  }
}

/** Admin force-release of held escrow to the seller (no buyer confirmation).
 * Caller must enforce admin session before invoking. */
export async function adminReleaseEscrow(
  orderId: string,
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;

  if (order.escrowStatus === "released" && order.status === "released") {
    return order;
  }

  if (order.escrowStatus === "refunded" || order.status === "refunded") {
    throw new Error("ALREADY_REFUNDED");
  }

  if (order.escrowStatus !== "held" && order.status !== "paid_held_in_escrow") {
    throw new Error("NOT_HELD");
  }

  let working = order;

  if (working.status === "paid_held_in_escrow" || working.status === "delivered") {
    if (!isValidOrderTransition(working.status, "confirmed")) {
      throw new Error("INVALID_STATUS");
    }
    const confirmed = await updateOrder(
      orderId,
      {
        status: "confirmed",
        escrowStatus: "released",
        confirmedAt: new Date().toISOString(),
        releasedAt: new Date().toISOString(),
      },
      {
        type: "admin_escrow_release",
        message: "حرّر المدير الضمان إدارياً",
      },
    );
    if (!confirmed) return undefined;
    working = confirmed;
  } else if (working.status === "confirmed" || working.status === "disputed") {
    if (!isValidOrderTransition(working.status, "released")) {
      throw new Error("INVALID_STATUS");
    }
    const releasedMid = await updateOrder(
      orderId,
      {
        status: "released",
        escrowStatus: "released",
        releasedAt: new Date().toISOString(),
      },
      {
        type: "admin_escrow_release",
        message: "حرّر المدير الضمان إدارياً",
      },
    );
    if (!releasedMid) return undefined;

    const sellerNet = order.fees.productPrice;
    await addWalletTransaction(order.sellerId, {
      orderId: order.id,
      type: "escrow_release",
      amount: sellerNet,
      description: `تحرير إداري للضمان — ${order.listingTitle}`,
      status: "completed",
    });

    await createNotification({
      userId: order.sellerId,
      orderId: order.id,
      type: "order_released",
      title: "تم تحويل المبلغ",
      body: `حرّرت الإدارة ${formatCurrencyLabel(sellerNet)} إلى رصيدك لطلب «${order.listingTitle}».`,
    });
    void emailOrderStatusToUser({
      userId: order.sellerId,
      orderId: order.id,
      type: "order_released",
      title: "تم تحويل المبلغ",
      subject: `تحرير الضمان — ${order.listingTitle}`,
      body: `حرّرت الإدارة المبلغ إلى رصيدك لطلب «${order.listingTitle}».`,
    }).catch((error) => console.error("[Sooqna Email] admin release email failed", error));

    return releasedMid;
  } else {
    throw new Error("INVALID_STATUS");
  }

  const sellerNet = order.fees.productPrice;
  await addWalletTransaction(order.sellerId, {
    orderId: order.id,
    type: "escrow_release",
    amount: sellerNet,
    description: `تحرير إداري للضمان — ${order.listingTitle}`,
    status: "completed",
  });

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_released",
    title: "تم تحويل المبلغ",
    body: `حرّرت الإدارة ${formatCurrencyLabel(sellerNet)} إلى رصيدك لطلب «${order.listingTitle}».`,
  });
  void emailOrderStatusToUser({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_released",
    title: "تم تحويل المبلغ",
    subject: `تحرير الضمان — ${order.listingTitle}`,
    body: `حرّرت الإدارة المبلغ إلى رصيدك لطلب «${order.listingTitle}».`,
  }).catch((error) => console.error("[Sooqna Email] admin release email failed", error));

  const released = await updateOrder(orderId, { status: "released" });
  return released;
}
