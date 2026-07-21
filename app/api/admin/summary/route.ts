import { NextResponse } from "next/server";
import { getAdminAuditLog } from "@/services/admin/admin-audit-store";
import { getListings, getModerationSummary } from "@/services/admin/admin-ops-store";
import {
  buildDailySeries,
  buildListingCategorySlices,
  buildOrderStatusSlices,
  buildPaymentStatusSlices,
} from "@/services/admin/admin-analytics";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import { getAllWalletAccounts } from "@/services/payments/wallet-ledger";
import { loadCollection } from "@/services/payments/data-store";
import {
  getStripeCurrency,
  getStripePublishableKey,
  getStripeWebhookSecret,
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";

type LeadRow = { id: string; createdAt?: string };

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const moderation = getModerationSummary();
  const listings = getListings();
  const settings = await getAdminSettings();

  const [orders, events, jobs, bookings, quotes, wallets, audit] = await Promise.all([
    getAllOrders(),
    getPaymentEvents(),
    loadCollection<LeadRow>("job-applications.json").catch(() => [] as LeadRow[]),
    loadCollection<LeadRow>("viewing-bookings.json").catch(() => [] as LeadRow[]),
    loadCollection<LeadRow>("quote-requests.json").catch(() => [] as LeadRow[]),
    getAllWalletAccounts(),
    getAdminAuditLog(20),
  ]);

  const paid = orders.filter((o) => o.paymentStatus === "succeeded");
  const refunded = orders.filter((o) => o.status === "refunded");
  const heldEscrow = orders.filter((o) => o.escrowStatus === "held");
  const failedPayments = orders.filter(
    (o) =>
      o.paymentStatus === "failed" ||
      o.paymentStatus === "pending" ||
      o.paymentStatus === "processing",
  );
  const volume = paid.reduce((sum, o) => sum + o.fees.total, 0);
  const fees = paid.reduce((sum, o) => sum + o.fees.platformFee, 0);
  const walletHeld = wallets.reduce((sum, w) => sum + w.heldInEscrow, 0);
  const walletAvailable = wallets.reduce((sum, w) => sum + w.availableBalance, 0);

  const attention = [
    {
      href: "/admin/listings",
      label: "إعلانات بانتظار المراجعة",
      meta: "اعتماد أو رفض",
      count: moderation.pendingListings,
      alert: moderation.pendingListings > 0,
    },
    {
      href: "/admin/disputes",
      label: "نزاعات مفتوحة",
      meta: "تحتاج حكم إداري",
      count: moderation.openDisputes,
      alert: moderation.openDisputes > 0,
    },
    {
      href: "/admin/users",
      label: "حسابات موقوفة",
      meta: "مراجعة حالة الحساب",
      count: moderation.suspendedUsers,
      alert: moderation.suspendedUsers > 0,
    },
    {
      href: "/admin/orders",
      label: "طلبات تحتاج متابعة",
      meta: "مدفوعات واسترداد",
      count: failedPayments.length,
      alert: failedPayments.length > 0,
    },
    {
      href: "/admin/escrow",
      label: "ضمان محجوز",
      meta: "بانتظار التحرير أو الاسترداد",
      count: heldEscrow.length,
      alert: heldEscrow.length > 0,
    },
    {
      href: "/admin/stripe",
      label: "مدفوعات Stripe معلّقة",
      meta: "مراجعة بوابة الدفع",
      count: failedPayments.filter((o) => Boolean(o.stripePaymentIntentId)).length,
      alert: true,
    },
    {
      href: "/admin/job-applications",
      label: "طلبات توظيف",
      meta: "وارد جديد",
      count: jobs.length,
      alert: false,
    },
    {
      href: "/admin/viewing-bookings",
      label: "حجوزات معاينة",
      meta: "عقارات",
      count: bookings.length,
      alert: false,
    },
    {
      href: "/admin/quote-requests",
      label: "عروض أسعار",
      meta: "خدمات",
      count: quotes.length,
      alert: false,
    },
  ];

  const sections = [
    {
      href: "/admin/analytics",
      label: "التحليلات",
      meta: "حجم، رسوم، اتجاهات",
      group: "insight",
      count: paid.length,
    },
    {
      href: "/admin/reports",
      label: "التقارير المالية",
      meta: "ملخص الإيرادات والأحداث",
      group: "insight",
      count: events.length,
    },
    {
      href: "/admin/users",
      label: "المستخدمون",
      meta: "تحقق وتعليق",
      group: "moderation",
      count: moderation.totalUsers,
    },
    {
      href: "/admin/listings",
      label: "الإعلانات",
      meta: `${moderation.pendingListings} بانتظار المراجعة`,
      group: "moderation",
      count: moderation.totalListings,
    },
    {
      href: "/admin/disputes",
      label: "النزاعات",
      meta: "حكم إداري",
      group: "moderation",
      count: moderation.openDisputes,
    },
    {
      href: "/admin/categories",
      label: "التصنيفات",
      meta: "هيكل السوق",
      group: "moderation",
      count: moderation.disabledCategories,
    },
    {
      href: "/admin/orders",
      label: "الطلبات",
      meta: "استرداد ومتابعة",
      group: "money",
      count: orders.length,
    },
    {
      href: "/admin/escrow",
      label: "الضمان",
      meta: "حجوزات نشطة",
      group: "money",
      count: heldEscrow.length,
    },
    {
      href: "/admin/wallets",
      label: "المحافظ",
      meta: "أرصدة المستخدمين",
      group: "money",
      count: wallets.length,
    },
    {
      href: "/admin/stripe",
      label: "Stripe",
      meta: isStripeConfigured() ? "متصل" : "غير مُعدّ",
      group: "money",
      count: events.length,
    },
    {
      href: "/admin/job-applications",
      label: "التوظيف",
      meta: "طلبات واردة",
      group: "leads",
      count: jobs.length,
    },
    {
      href: "/admin/viewing-bookings",
      label: "المعاينات",
      meta: "عقارات",
      group: "leads",
      count: bookings.length,
    },
    {
      href: "/admin/quote-requests",
      label: "عروض الأسعار",
      meta: "خدمات",
      group: "leads",
      count: quotes.length,
    },
    {
      href: "/admin/settings",
      label: "إعدادات الموقع",
      meta: settings.maintenanceMode ? "وضع الصيانة" : "تشغيل عادي",
      group: "system",
      count: settings.platformFeePercent,
    },
    {
      href: "/admin/audit",
      label: "سجل العمليات",
      meta: "تتبع إجراءات المدير",
      group: "system",
      count: audit.length,
    },
  ];

  return NextResponse.json({
    kpis: {
      totalOrders: orders.length,
      paidOrders: paid.length,
      refundedOrders: refunded.length,
      heldEscrow: heldEscrow.length,
      volume,
      fees,
      currency: "AED",
      recentEvents: events.length,
      pendingListings: moderation.pendingListings,
      openDisputes: moderation.openDisputes,
      totalUsers: moderation.totalUsers,
      totalListings: moderation.totalListings,
      walletAccounts: wallets.length,
      walletAvailable,
      walletHeld,
      conversionRate:
        orders.length === 0 ? 0 : Math.round((paid.length / orders.length) * 100),
    },
    attention,
    sections,
    analytics: {
      daily: buildDailySeries(orders, 7),
      orderStatuses: buildOrderStatusSlices(orders),
      paymentStatuses: buildPaymentStatusSlices(orders),
      topCategories: buildListingCategorySlices(listings),
    },
    stripe: {
      configured: isStripeConfigured(),
      publishableConfigured: Boolean(getStripePublishableKey()),
      webhookConfigured: Boolean(getStripeWebhookSecret()),
      currency: getStripeCurrency(),
      mockAllowed: isMockCheckoutAllowed(),
      dashboardUrl: settings.stripeDashboardUrl,
      paymentsUrl: `${settings.stripeDashboardUrl.replace(/\/$/, "")}/payments`,
      webhooksUrl: `${settings.stripeDashboardUrl.replace(/\/$/, "")}/webhooks`,
      customersUrl: `${settings.stripeDashboardUrl.replace(/\/$/, "")}/customers`,
    },
    settings: {
      maintenanceMode: settings.maintenanceMode,
      platformFeePercent: settings.platformFeePercent,
      escrowHoldDays: settings.escrowHoldDays,
    },
    pulse: events.slice(0, 10).map((event) => ({
      id: event.id,
      text: event.type,
      time: event.createdAt,
      orderId: event.orderId,
    })),
  });
}
