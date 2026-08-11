/**
 * Seed catalog products, coupons, wallets, and a demo paid order.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { listCourses } from "@/services/courses/course-service";
import { majorToMinor } from "@/services/payments/money";
import { ensureCustomerJourneyProducts } from "@/services/journeys/customer-journey-catalog";
import { defaultRegionalPaymentRules } from "@/services/payments/regional-rules-service";
import { ensureWallet } from "@/services/payments/wallet-service";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type { CatalogProduct, Coupon, Invoice, Order, PaymentRecord } from "@/types/payments";

export function ensurePaymentsSeeded(): void {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const db = readPaymentsDb();
  if (db.seeded && db.products.length > 0) {
    ensureAtplPackageAndRegionalRules();
    ensureCustomerJourneyProducts();
    return;
  }

  const users = readAuthDb().users;
  const student = users.find((u) => u.role === ROLES.STUDENT && u.status === "active");
  const instructor = users.find((u) => u.role === ROLES.INSTRUCTOR);
  const admin = users.find((u) => u.role === ROLES.ADMIN);
  const courses = listCourses({ pageSize: 10, status: "published" }).data;
  if (!student || !instructor || !admin || courses.length === 0) {
    writePaymentsDb((d) => {
      d.seeded = true;
    });
    return;
  }

  const stamp = new Date().toISOString();
  const currency = db.settings.currency;
  const studentP = toUserProfile(student);
  const instructorP = toUserProfile(instructor);

  const products: CatalogProduct[] = [
    {
      id: generateId(),
      name: courses[0]!.title,
      description: "One-time course purchase",
      pricingModel: "one_time",
      courseId: courses[0]!.id,
      instructorId: courses[0]!.primaryInstructorId ?? instructor.id,
      priceAmount: majorToMinor(75, currency),
      compareAtAmount: majorToMinor(95, currency),
      currency,
      isFree: false,
      active: true,
      metadata: {},
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      name: courses[1]?.title ?? "ATPL Mass & Balance",
      description: "One-time course purchase",
      pricingModel: "one_time",
      courseId: courses[1]?.id ?? null,
      instructorId: courses[1]?.primaryInstructorId ?? instructor.id,
      priceAmount: majorToMinor(65, currency),
      compareAtAmount: null,
      currency,
      isFree: false,
      active: true,
      metadata: {},
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      name: "AviatorPass Premium Membership",
      description: "Monthly premium membership",
      pricingModel: "subscription_monthly",
      courseId: null,
      instructorId: instructor.id,
      priceAmount: majorToMinor(29, currency),
      compareAtAmount: null,
      currency,
      isFree: false,
      active: true,
      metadata: {},
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      name: "Annual Premium",
      description: "Annual premium membership",
      pricingModel: "subscription_annual",
      courseId: null,
      instructorId: instructor.id,
      priceAmount: majorToMinor(290, currency),
      compareAtAmount: majorToMinor(348, currency),
      currency,
      isFree: false,
      active: true,
      metadata: {},
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      name: "PPL Intro Package",
      description: "Discounted multi-course package",
      pricingModel: "package",
      courseId: courses[3]?.id ?? courses[0]!.id,
      instructorId: instructor.id,
      priceAmount: majorToMinor(120, currency),
      compareAtAmount: majorToMinor(160, currency),
      currency,
      isFree: false,
      active: true,
      metadata: {},
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      name: "ATPL Theory Package",
      description:
        "Full ATPL theory package with full payment, installments, or Tamara / Tabby (تالي) by country.",
      pricingModel: "package",
      courseId: courses.find((c) => c.code === "ATPL-010")?.id ?? courses[0]!.id,
      instructorId: instructor.id,
      priceAmount: majorToMinor(480, currency),
      compareAtAmount: majorToMinor(560, currency),
      currency,
      isFree: false,
      active: true,
      metadata: {
        sku: "ATPL-PACKAGE",
        courseIds: courses
          .filter((c) => c.code.startsWith("ATPL-"))
          .map((c) => c.id)
          .slice(0, 7),
        supportsInstallments: true,
        supportsBnpl: true,
      },
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      name: "Orientation Webinar (Free)",
      description: "Complimentary orientation",
      pricingModel: "free",
      courseId: null,
      instructorId: instructor.id,
      priceAmount: 0,
      compareAtAmount: null,
      currency,
      isFree: true,
      active: true,
      metadata: {},
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];

  const firstProduct = products[0]!;
  const coupons: Coupon[] = [
    {
      id: generateId(),
      code: "ATPL10",
      type: "percent",
      value: 10,
      courseId: null,
      maxUses: 100,
      usedCount: 0,
      minPurchaseAmount: majorToMinor(20, currency),
      maxDiscountAmount: majorToMinor(50, currency),
      expiresAt: new Date(Date.now() + 90 * 86_400_000).toISOString(),
      active: true,
      createdById: admin.id,
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      code: "WELCOME5",
      type: "fixed",
      value: majorToMinor(5, currency),
      courseId: firstProduct.courseId,
      maxUses: null,
      usedCount: 0,
      minPurchaseAmount: 0,
      maxDiscountAmount: null,
      expiresAt: null,
      active: true,
      createdById: admin.id,
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];

  const product = firstProduct;
  const orderId = generateId();
  const paymentId = generateId();
  const invoiceId = generateId();
  const order: Order = {
    id: orderId,
    orderNumber: `ORD-${new Date().getFullYear()}-00001`,
    studentId: student.id,
    studentName: studentP.fullName || student.email,
    studentEmail: student.email,
    status: "paid",
    currency,
    subtotalAmount: product.priceAmount,
    discountAmount: 0,
    taxAmount: 0,
    taxRatePercent: 0,
    totalAmount: product.priceAmount,
    couponId: null,
    couponCode: null,
    billingName: studentP.fullName || student.email,
    billingEmail: student.email,
    billingCountry: "KW",
    billingAddress: "Kuwait City",
    items: [
      {
        id: generateId(),
        productId: product.id,
        productName: product.name,
        courseId: product.courseId,
        instructorId: product.instructorId,
        pricingModel: product.pricingModel,
        unitAmount: product.priceAmount,
        quantity: 1,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: product.priceAmount,
      },
    ],
    paymentId,
    invoiceId,
    idempotencyKey: `seed-${orderId}`,
    failureReason: null,
    paidAt: stamp,
    cancelledAt: null,
    expiresAt: null,
    metadata: { seeded: true },
    createdAt: stamp,
    updatedAt: stamp,
  };

  const payment: PaymentRecord = {
    id: paymentId,
    orderId,
    provider: "mock",
    providerPaymentId: `mock_pay_seed01`,
    status: "succeeded",
    methodBrand: "visa",
    paymentMethodSummary: "VISA •••• 4242",
    amount: order.totalAmount,
    currency,
    clientSecret: null,
    checkoutUrl: null,
    webhookVerified: true,
    failureCode: null,
    failureMessage: null,
    rawProviderPayload: { seeded: true },
    createdAt: stamp,
    updatedAt: stamp,
  };

  const invoice: Invoice = {
    id: invoiceId,
    invoiceNumber: `INV-${new Date().getFullYear()}-00001`,
    orderId,
    studentId: student.id,
    studentName: order.studentName,
    studentEmail: order.studentEmail,
    status: "paid",
    currency,
    subtotalAmount: order.subtotalAmount,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: order.totalAmount,
    paymentMethodSummary: payment.paymentMethodSummary,
    items: order.items.map((i) => ({
      id: generateId(),
      description: i.productName,
      quantity: i.quantity,
      unitAmount: i.unitAmount,
      totalAmount: i.totalAmount,
    })),
    issuedAt: stamp,
    paidAt: stamp,
    pdfReady: true,
    emailedAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((d) => {
    d.products = products;
    d.coupons = coupons;
    d.orders = [order];
    d.payments = [payment];
    d.invoices = [invoice];
    d.regionalRules = defaultRegionalPaymentRules(currency);
    d.transactionLogs = [
      {
        id: generateId(),
        kind: "payment",
        referenceId: paymentId,
        actorId: student.id,
        studentId: student.id,
        instructorId: instructor.id,
        amount: order.totalAmount,
        currency,
        description: `Seeded payment for ${order.orderNumber}`,
        metadata: { seeded: true },
        createdAt: stamp,
      },
    ];
    d.seeded = true;
  });

  // Credit instructor wallet (80% after 20% platform fee)
  ensureWallet(instructor.id);
  const fee = Math.round(order.totalAmount * 0.2);
  const net = order.totalAmount - fee;
  writePaymentsDb((d) => {
    const w = d.wallets.find((x) => x.instructorId === instructor.id);
    if (!w) return;
    w.instructorName = instructorP.fullName || instructor.email;
    w.availableBalance += net;
    w.lifetimeEarned += net;
    w.courseRevenue += net;
    w.updatedAt = stamp;
    d.walletTransactions.unshift({
      id: generateId(),
      walletId: w.id,
      instructorId: instructor.id,
      type: "course_sale",
      direction: "credit",
      amount: net,
      currency,
      availableDelta: net,
      pendingDelta: 0,
      orderId,
      payoutId: null,
      description: `Sale: ${product.name}`,
      createdAt: stamp,
    });
  });

  // Ensure second instructor wallet exists empty
  const instructor2 = users.find((u) => u.role === ROLES.INSTRUCTOR && u.id !== instructor.id);
  if (instructor2) ensureWallet(instructor2.id);

  ensureCustomerJourneyProducts();
}

/** Backfill ATPL package + regional BNPL rules on already-seeded payment DBs. */
function ensureAtplPackageAndRegionalRules(): void {
  ensureCoursesSeeded();
  const courses = listCourses({ pageSize: 50, status: "published" }).data;
  const users = readAuthDb().users;
  const instructor = users.find((u) => u.role === ROLES.INSTRUCTOR);
  writePaymentsDb((d) => {
    if (d.regionalRules.length === 0) {
      d.regionalRules = defaultRegionalPaymentRules(d.settings.currency);
    }
    const hasAtpl = d.products.some((p) => p.metadata?.sku === "ATPL-PACKAGE");
    if (hasAtpl || !instructor) return;
    const stamp = new Date().toISOString();
    const currency = d.settings.currency;
    d.products.push({
      id: generateId(),
      name: "ATPL Theory Package",
      description:
        "Full ATPL theory package with full payment, installments, or Tamara / Tabby (تالي) by country.",
      pricingModel: "package",
      courseId: courses.find((c) => c.code === "ATPL-010")?.id ?? courses[0]?.id ?? null,
      instructorId: instructor.id,
      priceAmount: majorToMinor(480, currency),
      compareAtAmount: majorToMinor(560, currency),
      currency,
      isFree: false,
      active: true,
      metadata: {
        sku: "ATPL-PACKAGE",
        courseIds: courses
          .filter((c) => c.code.startsWith("ATPL-"))
          .map((c) => c.id)
          .slice(0, 7),
        supportsInstallments: true,
        supportsBnpl: true,
      },
      createdAt: stamp,
      updatedAt: stamp,
    });
  });
}
