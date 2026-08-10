/**
 * Checkout, orders, payments, subscriptions — core payment flow.
 */

import { generateId, generateToken } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ORDER_EXPIRY_MINUTES } from "@/constants/payments";
import { logActivity } from "@/services/auth/activity-log";
import { assertCanCheckout, assertOwnOrder, PaymentError } from "@/services/payments/access";
import { getProduct, validateCoupon } from "@/services/payments/catalog-service";
import { getPaymentGateway } from "@/services/payments/gateway";
import {
  createInstallmentPlanForOrder,
  getInstallmentPlan,
  grantPackageAccess,
  listScheduleForPlan,
  markInstallmentPaid,
  resumePackageService,
} from "@/services/payments/installment-service";
import { issueInvoiceForOrder } from "@/services/payments/invoice-service";
import { calcTax, formatMinor } from "@/services/payments/money";
import { notifyPayment } from "@/services/payments/notify";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import { creditInstructorEarnings } from "@/services/payments/wallet-service";
import type {
  CheckoutPaymentMode,
  Order,
  OrderItem,
  PaymentMethodBrand,
  PaymentRecord,
  PricingModel,
  Subscription,
} from "@/types/payments";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function nextOrderNumber(): string {
  const y = new Date().getFullYear();
  const n = readPaymentsDb().orders.length + 1;
  return `ORD-${y}-${String(n).padStart(5, "0")}`;
}

export function listOrders(filters?: { studentId?: string; status?: Order["status"] | "all" }) {
  let rows = [...readPaymentsDb().orders];
  if (filters?.studentId) rows = rows.filter((o) => o.studentId === filters.studentId);
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((o) => o.status === filters.status);
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrder(id: string): Order | null {
  return readPaymentsDb().orders.find((o) => o.id === id) ?? null;
}

export function getPayment(id: string): PaymentRecord | null {
  return readPaymentsDb().payments.find((p) => p.id === id) ?? null;
}

export function listPayments(filters?: { orderId?: string }) {
  let rows = [...readPaymentsDb().payments];
  if (filters?.orderId) rows = rows.filter((p) => p.orderId === filters.orderId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listSubscriptions(studentId?: string) {
  let rows = [...readPaymentsDb().subscriptions];
  if (studentId) rows = rows.filter((s) => s.studentId === studentId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listTransactionLogs(limit = 100) {
  return [...readPaymentsDb().transactionLogs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function expireStaleOrders() {
  const now = nowIso();
  writePaymentsDb((db) => {
    for (const o of db.orders) {
      if (o.status === "pending" && o.expiresAt && o.expiresAt < now) {
        o.status = "expired";
        o.updatedAt = now;
      }
    }
  });
}

export async function createCheckoutOrder(input: {
  user: UserProfile;
  productId: string;
  billingName: string;
  billingEmail: string;
  billingCountry?: string;
  billingAddress?: string;
  couponCode?: string;
  idempotencyKey?: string;
}): Promise<Order> {
  assertCanCheckout(input.user);
  expireStaleOrders();

  const product = getProduct(input.productId);
  if (!product || !product.active) throw new PaymentError("Product not available", 404);

  const idempotencyKey = input.idempotencyKey?.trim() || generateToken(16);
  const existing = readPaymentsDb().orders.find(
    (o) => o.idempotencyKey === idempotencyKey && o.studentId === input.user.id,
  );
  if (existing) return existing;

  // Duplicate paid guard for same product+student
  const alreadyPaid = readPaymentsDb().orders.find(
    (o) =>
      o.studentId === input.user.id &&
      o.status === "paid" &&
      o.items.some((i) => i.productId === product.id) &&
      product.pricingModel === "one_time",
  );
  if (alreadyPaid) {
    throw new PaymentError("You already purchased this product", 409);
  }

  const settings = readPaymentsDb().settings;
  const stamp = nowIso();
  const subtotal = product.isFree ? 0 : product.priceAmount;
  let discountAmount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;

  if (input.couponCode && !product.isFree) {
    const validated = validateCoupon({
      code: input.couponCode,
      userId: input.user.id,
      subtotalAmount: subtotal,
      courseId: product.courseId,
    });
    discountAmount = validated.discountAmount;
    couponId = validated.coupon.id;
    couponCode = validated.coupon.code;
  }

  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = calcTax(taxable, settings.taxRatePercent);
  const totalAmount = taxable + taxAmount;

  const item: OrderItem = {
    id: generateId(),
    productId: product.id,
    productName: product.name,
    courseId: product.courseId,
    instructorId: product.instructorId,
    pricingModel: product.pricingModel,
    unitAmount: product.priceAmount,
    quantity: 1,
    discountAmount,
    taxAmount,
    totalAmount,
  };

  const order: Order = {
    id: generateId(),
    orderNumber: nextOrderNumber(),
    studentId: input.user.id,
    studentName: input.user.fullName || input.user.email,
    studentEmail: input.billingEmail || input.user.email,
    status: "pending",
    currency: product.currency || settings.currency,
    subtotalAmount: subtotal,
    discountAmount,
    taxAmount,
    taxRatePercent: settings.taxRatePercent,
    totalAmount,
    couponId,
    couponCode,
    billingName: input.billingName || input.user.fullName || input.user.email,
    billingEmail: input.billingEmail || input.user.email,
    billingCountry: input.billingCountry || "KW",
    billingAddress: input.billingAddress || "",
    items: [item],
    paymentId: null,
    invoiceId: null,
    idempotencyKey,
    failureReason: null,
    paidAt: null,
    cancelledAt: null,
    expiresAt: new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60_000).toISOString(),
    metadata: {},
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.orders.unshift(order);
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.CHECKOUT_STARTED,
    entityType: "order",
    entityId: order.id,
    metadata: { productId: product.id, totalAmount },
  });

  // Free checkout completes immediately
  if (totalAmount === 0) {
    const paid = await finalizeSuccessfulPayment({
      orderId: order.id,
      methodBrand: "card",
      paymentToken: "free",
      user: input.user,
    });
    return paid.order;
  }

  return order;
}

export async function payOrder(input: {
  user: UserProfile;
  orderId: string;
  methodBrand: PaymentMethodBrand;
  paymentToken?: string;
  simulateFailure?: boolean;
  paymentMode?: CheckoutPaymentMode;
  installmentCount?: number;
  agreementAccepted?: boolean;
  passportDocumentId?: string | null;
  scheduleItemId?: string;
}): Promise<{ order: Order; payment: PaymentRecord }> {
  assertCanCheckout(input.user);
  const order = getOrder(input.orderId);
  if (!order) throw new PaymentError("Order not found", 404);
  assertOwnOrder(input.user, order.studentId);

  // Subsequent installment payment against an existing plan.
  if (input.scheduleItemId) {
    return payScheduleItem({
      user: input.user,
      orderId: order.id,
      scheduleItemId: input.scheduleItemId,
      methodBrand: input.methodBrand,
      paymentToken: input.paymentToken,
      simulateFailure: input.simulateFailure,
    });
  }

  if (order.status === "paid") {
    const payment = order.paymentId ? getPayment(order.paymentId) : null;
    if (!payment) throw new PaymentError("Paid order missing payment record", 500);
    return { order, payment };
  }
  if (order.status !== "pending" && order.status !== "failed") {
    throw new PaymentError(`Cannot pay order in status ${order.status}`);
  }

  return finalizeSuccessfulPayment({
    orderId: order.id,
    methodBrand: input.methodBrand,
    paymentToken: input.paymentToken,
    simulateFailure: input.simulateFailure,
    user: input.user,
    paymentMode: input.paymentMode ?? "full",
    installmentCount: input.installmentCount,
    agreementAccepted: Boolean(input.agreementAccepted),
    passportDocumentId: input.passportDocumentId ?? null,
  });
}

async function payScheduleItem(input: {
  user: UserProfile;
  orderId: string;
  scheduleItemId: string;
  methodBrand: PaymentMethodBrand;
  paymentToken?: string;
  simulateFailure?: boolean;
}): Promise<{ order: Order; payment: PaymentRecord }> {
  const order = getOrder(input.orderId);
  if (!order) throw new PaymentError("Order not found", 404);
  const planId = String(order.metadata.installmentPlanId ?? "");
  const plan = planId ? getInstallmentPlan(planId) : null;
  if (!plan) throw new PaymentError("Installment plan not found for order", 404);
  const item = listScheduleForPlan(plan.id).find((s) => s.id === input.scheduleItemId);
  if (!item) throw new PaymentError("Installment schedule item not found", 404);
  if (item.status === "paid") throw new PaymentError("Installment already paid");

  const gateway = getPaymentGateway();
  const charge = await gateway.createPayment({
    orderId: order.id,
    amount: item.amount,
    currency: order.currency,
    customerEmail: order.billingEmail,
    customerName: order.billingName,
    methodBrand: input.methodBrand,
    paymentToken: input.paymentToken,
    idempotencyKey: `${order.idempotencyKey}-inst-${item.sequence}`,
    simulateFailure: input.simulateFailure,
  });

  const stamp = nowIso();
  const payment: PaymentRecord = {
    id: generateId(),
    orderId: order.id,
    provider: charge.provider,
    providerPaymentId: charge.providerPaymentId,
    status: charge.status,
    methodBrand: charge.methodBrand,
    paymentMethodSummary: charge.paymentMethodSummary,
    amount: item.amount,
    currency: order.currency,
    clientSecret: charge.clientSecret,
    checkoutUrl: charge.checkoutUrl,
    webhookVerified:
      charge.provider === "mock" || charge.provider === "tamara" || charge.provider === "tabby",
    failureCode: charge.failureCode,
    failureMessage: charge.failureMessage,
    rawProviderPayload: { ...charge.rawProviderPayload, scheduleItemId: item.id },
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.payments.unshift(payment);
    db.transactionLogs.unshift({
      id: generateId(),
      kind: "payment",
      referenceId: payment.id,
      actorId: input.user.id,
      studentId: order.studentId,
      instructorId: order.items[0]?.instructorId ?? null,
      amount: item.amount,
      currency: order.currency,
      description: `Installment #${item.sequence} ${charge.status} for ${order.orderNumber}`,
      metadata: { scheduleItemId: item.id, planId: plan.id },
      createdAt: stamp,
    });
  });

  if (charge.status !== "succeeded") {
    throw new PaymentError(charge.failureMessage ?? "Installment payment failed");
  }

  await markInstallmentPaid({
    planId: plan.id,
    scheduleItemId: item.id,
    paymentId: payment.id,
    actorId: input.user.id,
  });
  await resumePackageService({ planId: plan.id, actorId: input.user.id });

  return { order: getOrder(order.id)!, payment };
}

async function finalizeSuccessfulPayment(input: {
  orderId: string;
  methodBrand: PaymentMethodBrand;
  paymentToken?: string;
  simulateFailure?: boolean;
  user: UserProfile;
  paymentMode?: CheckoutPaymentMode;
  installmentCount?: number;
  agreementAccepted?: boolean;
  passportDocumentId?: string | null;
}): Promise<{ order: Order; payment: PaymentRecord }> {
  const order = getOrder(input.orderId);
  if (!order) throw new PaymentError("Order not found", 404);

  const mode = input.paymentMode ?? "full";
  const settings = readPaymentsDb().settings;
  const count = Math.max(1, input.installmentCount ?? settings.defaultInstallmentCount);

  let planId: string | null = null;
  let firstScheduleId: string | null = null;
  let amountToCharge = order.totalAmount;

  const existingPlanId = order.metadata.installmentPlanId
    ? String(order.metadata.installmentPlanId)
    : null;
  if (existingPlanId && getInstallmentPlan(existingPlanId)) {
    planId = existingPlanId;
    const schedule = listScheduleForPlan(existingPlanId);
    firstScheduleId =
      schedule.find((s) => s.status === "due" || s.status === "upcoming" || s.status === "overdue")
        ?.id ??
      schedule[0]?.id ??
      null;
    amountToCharge =
      mode === "installments"
        ? (schedule.find((s) => s.id === firstScheduleId)?.amount ?? order.totalAmount)
        : order.totalAmount;
  } else {
    const plan = await createInstallmentPlanForOrder({
      order,
      user: input.user,
      mode,
      installmentCount:
        mode === "installments" ? count : mode === "tamara" || mode === "tabby" ? 4 : 1,
      agreementAccepted: mode === "full" ? true : Boolean(input.agreementAccepted),
      passportDocumentId: mode === "full" ? null : (input.passportDocumentId ?? null),
      actorId: input.user.id,
    });
    planId = plan.id;
    const schedule = listScheduleForPlan(plan.id);
    firstScheduleId = schedule[0]?.id ?? null;
    amountToCharge =
      mode === "installments" ? (schedule[0]?.amount ?? order.totalAmount) : order.totalAmount;
  }

  const gateway = getPaymentGateway();
  const charge = await gateway.createPayment({
    orderId: order.id,
    amount: amountToCharge,
    currency: order.currency,
    customerEmail: order.billingEmail,
    customerName: order.billingName,
    methodBrand: mode === "tamara" ? "tamara" : mode === "tabby" ? "tabby" : input.methodBrand,
    paymentToken: input.paymentToken,
    idempotencyKey: order.idempotencyKey,
    simulateFailure: input.simulateFailure,
  });

  const stamp = nowIso();
  const payment: PaymentRecord = {
    id: generateId(),
    orderId: order.id,
    provider: charge.provider,
    providerPaymentId: charge.providerPaymentId,
    status: charge.status,
    methodBrand: charge.methodBrand,
    paymentMethodSummary: charge.paymentMethodSummary,
    amount: amountToCharge,
    currency: order.currency,
    clientSecret: charge.clientSecret,
    checkoutUrl: charge.checkoutUrl,
    webhookVerified:
      charge.provider === "mock" || charge.provider === "tamara" || charge.provider === "tabby",
    failureCode: charge.failureCode,
    failureMessage: charge.failureMessage,
    rawProviderPayload: {
      ...charge.rawProviderPayload,
      paymentMode: mode,
      installmentPlanId: planId,
    },
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.payments.unshift(payment);
    const o = db.orders.find((x) => x.id === order.id);
    if (!o) return;
    o.paymentId = payment.id;
    o.updatedAt = stamp;
    o.metadata = {
      ...o.metadata,
      paymentMode: mode,
      installmentPlanId: planId,
    };
    if (charge.status === "failed") {
      o.status = "failed";
      o.failureReason = charge.failureMessage;
    } else if (charge.status === "succeeded" || order.totalAmount === 0) {
      if (mode === "installments") {
        o.status = "pending";
        o.paidAt = null;
        o.failureReason = null;
        o.metadata = { ...o.metadata, firstInstallmentPaidAt: stamp };
      } else {
        o.status = "paid";
        o.paidAt = stamp;
        o.failureReason = null;
      }
      if (o.couponId && mode !== "installments") {
        const coupon = db.coupons.find((c) => c.id === o.couponId);
        if (coupon) {
          coupon.usedCount += 1;
          coupon.updatedAt = stamp;
          db.couponUsages.unshift({
            id: generateId(),
            couponId: coupon.id,
            userId: o.studentId,
            orderId: o.id,
            discountAmount: o.discountAmount,
            createdAt: stamp,
          });
        }
      }
    } else if (charge.status === "requires_payment") {
      o.status = "pending";
    }

    db.transactionLogs.unshift({
      id: generateId(),
      kind: "payment",
      referenceId: payment.id,
      actorId: input.user.id,
      studentId: order.studentId,
      instructorId: order.items[0]?.instructorId ?? null,
      amount: amountToCharge,
      currency: order.currency,
      description: `Payment ${charge.status} for ${order.orderNumber}`,
      metadata: { provider: charge.provider, method: charge.methodBrand, mode },
      createdAt: stamp,
    });
  });

  let updated = getOrder(order.id)!;
  const savedPayment = getPayment(payment.id)!;

  if (charge.status === "failed") {
    await notifyPayment(updated.studentId, {
      title: "Payment failed",
      body: updated.failureReason ?? "Your payment could not be processed.",
      type: "payment.failed",
      data: { orderId: updated.id },
    });
    await logActivity({
      actorId: input.user.id,
      action: ACTIVITY_ACTIONS.PAYMENT_FAILED,
      entityType: "payment",
      entityId: payment.id,
    });
    return { order: updated, payment: savedPayment };
  }

  if (charge.status === "succeeded" || order.totalAmount === 0) {
    if (planId && firstScheduleId) {
      if (mode === "tamara" || mode === "tabby" || mode === "full") {
        for (const item of listScheduleForPlan(planId)) {
          await markInstallmentPaid({
            planId,
            scheduleItemId: item.id,
            paymentId: payment.id,
            actorId: input.user.id,
          });
        }
      } else {
        await markInstallmentPaid({
          planId,
          scheduleItemId: firstScheduleId,
          paymentId: payment.id,
          actorId: input.user.id,
        });
      }
    }

    if (updated.status === "paid") {
      await completePaidOrder(updated, savedPayment, input.user.id);
    } else if (mode === "installments" && planId) {
      const unlocked = getInstallmentPlan(planId);
      if (unlocked) await grantPackageAccess(unlocked, input.user.id);
      await notifyPayment(updated.studentId, {
        title: "First installment received",
        body: `${updated.orderNumber} — access unlocked. Remaining installments stay on your billing schedule.`,
        type: "payment.installment",
        data: { orderId: updated.id, planId },
      });
    }
    updated = getOrder(order.id)!;
  }

  return { order: updated, payment: getPayment(payment.id)! };
}

async function completePaidOrder(order: Order, payment: PaymentRecord, actorId: string) {
  const invoice = await issueInvoiceForOrder(order, payment);

  for (const item of order.items) {
    if (item.instructorId && item.totalAmount > 0) {
      const type =
        item.pricingModel === "subscription_monthly" ||
        item.pricingModel === "subscription_annual" ||
        item.pricingModel === "premium_membership"
          ? "subscription"
          : "course_sale";
      creditInstructorEarnings({
        instructorId: item.instructorId,
        grossAmount: item.totalAmount,
        currency: order.currency,
        orderId: order.id,
        type,
        description: `Sale: ${item.productName}`,
      });
    }

    if (
      item.pricingModel === "subscription_monthly" ||
      item.pricingModel === "subscription_annual" ||
      item.pricingModel === "premium_membership"
    ) {
      createSubscriptionFromItem(order, item.pricingModel, item);
    }
  }

  writePaymentsDb((db) => {
    const o = db.orders.find((x) => x.id === order.id);
    if (o) o.invoiceId = invoice.id;
  });

  const planId = order.metadata.installmentPlanId ? String(order.metadata.installmentPlanId) : null;
  if (planId) {
    const plan = getInstallmentPlan(planId);
    if (plan) await grantPackageAccess(plan, actorId);
  }

  await notifyPayment(order.studentId, {
    title: "Payment successful",
    body: `${order.orderNumber} paid — ${formatMinor(order.totalAmount, order.currency)}.`,
    type: "payment.succeeded",
    data: { orderId: order.id, invoiceId: invoice.id },
  });

  await logActivity({
    actorId,
    action: ACTIVITY_ACTIONS.PAYMENT_COMPLETED,
    entityType: "order",
    entityId: order.id,
    metadata: { invoiceId: invoice.id, amount: order.totalAmount },
  });
}

function createSubscriptionFromItem(order: Order, model: PricingModel, item: OrderItem) {
  const stamp = nowIso();
  const days = model === "subscription_annual" ? 365 : 30;
  const sub: Subscription = {
    id: generateId(),
    studentId: order.studentId,
    productId: item.productId,
    productName: item.productName,
    status: "active",
    pricingModel: model,
    amount: item.unitAmount,
    currency: order.currency,
    currentPeriodStart: stamp,
    currentPeriodEnd: new Date(Date.now() + days * 86_400_000).toISOString(),
    cancelAtPeriodEnd: false,
    canceledAt: null,
    orderId: order.id,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writePaymentsDb((db) => {
    db.subscriptions.unshift(sub);
    db.transactionLogs.unshift({
      id: generateId(),
      kind: "subscription",
      referenceId: sub.id,
      actorId: order.studentId,
      studentId: order.studentId,
      instructorId: item.instructorId,
      amount: item.unitAmount,
      currency: order.currency,
      description: `Subscription started: ${item.productName}`,
      metadata: {},
      createdAt: stamp,
    });
  });
}

export async function retryPayment(input: {
  user: UserProfile;
  orderId: string;
  methodBrand: PaymentMethodBrand;
  paymentToken?: string;
}) {
  const order = getOrder(input.orderId);
  if (!order) throw new PaymentError("Order not found", 404);
  assertOwnOrder(input.user, order.studentId);
  if (order.status !== "failed" && order.status !== "pending") {
    throw new PaymentError("Only failed or pending orders can be retried");
  }
  writePaymentsDb((db) => {
    const o = db.orders.find((x) => x.id === order.id);
    if (o) {
      o.status = "pending";
      o.failureReason = null;
      o.updatedAt = nowIso();
    }
  });
  return payOrder(input);
}

export function cancelOrder(user: UserProfile, orderId: string): Order {
  const order = getOrder(orderId);
  if (!order) throw new PaymentError("Order not found", 404);
  assertOwnOrder(user, order.studentId);
  if (order.status !== "pending" && order.status !== "failed") {
    throw new PaymentError("Only pending/failed orders can be cancelled");
  }
  const stamp = nowIso();
  writePaymentsDb((db) => {
    const o = db.orders.find((x) => x.id === orderId);
    if (!o) return;
    o.status = "cancelled";
    o.cancelledAt = stamp;
    o.updatedAt = stamp;
  });
  return getOrder(orderId)!;
}

export async function handleProviderWebhook(input: { payload: string; signature: string | null }) {
  const gateway = getPaymentGateway();
  const result = await gateway.confirmWebhook(input.payload, input.signature);
  const payment = readPaymentsDb().payments.find(
    (p) => p.providerPaymentId === result.providerPaymentId,
  );
  if (!payment) throw new PaymentError("Payment not found for webhook", 404);

  writePaymentsDb((db) => {
    const p = db.payments.find((x) => x.id === payment.id);
    if (!p) return;
    p.status = result.status;
    p.webhookVerified = true;
    p.rawProviderPayload = { ...p.rawProviderPayload, webhook: result.raw };
    p.updatedAt = nowIso();
  });

  if (result.status === "succeeded") {
    const order = getOrder(payment.orderId);
    if (order && order.status !== "paid") {
      writePaymentsDb((db) => {
        const o = db.orders.find((x) => x.id === order.id);
        if (!o) return;
        o.status = "paid";
        o.paidAt = nowIso();
      });
      const userLike = {
        id: order.studentId,
        email: order.studentEmail,
        fullName: order.studentName,
      } as UserProfile;
      await completePaidOrder(getOrder(order.id)!, getPayment(payment.id)!, order.studentId);
      void userLike;
    }
  }

  return { paymentId: payment.id, status: result.status };
}
