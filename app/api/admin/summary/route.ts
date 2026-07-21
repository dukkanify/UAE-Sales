import { NextResponse } from "next/server";
import { getAdminAuditLog } from "@/services/admin/admin-audit-store";
import {
  buildDailySeries,
  buildListingCategorySlices,
  buildOrderStatusSlices,
  buildPaymentStatusSlices,
} from "@/services/admin/admin-analytics";
import { getOpenDisputeCount } from "@/services/admin/dispute-store";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getAllAddresses } from "@/services/addresses/address-store";
import { getAllUsers } from "@/services/auth/user-store";
import { getAdminCategoryRecords } from "@/services/categories/category-store";
import { getAllFavorites } from "@/services/favorites/favorite-store";
import { getAllJobApplications } from "@/services/job-applications/job-application-store";
import {
  getAdminListingRecords,
  getAllListings,
  getListingsModerationSummary,
} from "@/services/listings/listing-store";
import { getAllNotifications } from "@/services/payments/notification-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import { getAllWalletAccounts } from "@/services/payments/wallet-ledger";
import { getAllQuoteRequests } from "@/services/quote-requests/quote-request-store";
import { getAllViewingBookings } from "@/services/viewing-bookings/viewing-booking-store";
import {
  getStripeCurrency,
  getStripePublishableKey,
  getStripeWebhookSecret,
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const settings = await getAdminSettings();

  const [
    users,
    listings,
    listingStats,
    adminListings,
    categories,
    openDisputes,
    orders,
    events,
    jobs,
    bookings,
    quotes,
    wallets,
    audit,
    notifications,
    favorites,
    addresses,
  ] = await Promise.all([
    getAllUsers(),
    getAllListings(),
    getListingsModerationSummary(),
    getAdminListingRecords(),
    getAdminCategoryRecords(),
    getOpenDisputeCount(),
    getAllOrders(),
    getPaymentEvents(),
    getAllJobApplications(),
    getAllViewingBookings(),
    getAllQuoteRequests(),
    getAllWalletAccounts(),
    getAdminAuditLog(20),
    getAllNotifications(),
    getAllFavorites(),
    getAllAddresses(),
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
  const suspendedUsers = users.filter((u) => u.accountStatus === "suspended").length;
  const disabledCategories = categories.filter((c) => !c.enabled).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const submittedJobs = jobs.filter((j) => j.status === "submitted").length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed").length;
  const openQuotes = quotes.filter((q) => q.status === "submitted").length;

  const attention = [
    {
      href: "/admin/listings",
      label: "إعلانات بانتظار المراجعة",
      meta: "اعتماد أو رفض",
      count: listingStats.pendingListings,
      alert: listingStats.pendingListings > 0,
    },
    {
      href: "/admin/disputes",
      label: "نزاعات مفتوحة",
      meta: "تحتاج حكم إداري",
      count: openDisputes,
      alert: openDisputes > 0,
    },
    {
      href: "/admin/users",
      label: "حسابات موقوفة",
      meta: "مراجعة حالة الحساب",
      count: suspendedUsers,
      alert: suspendedUsers > 0,
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
      label: "طلبات توظيف جديدة",
      meta: "وارد",
      count: submittedJobs,
      alert: submittedJobs > 0,
    },
    {
      href: "/admin/viewing-bookings",
      label: "معاينات مؤكدة",
      meta: "عقارات",
      count: activeBookings,
      alert: false,
    },
    {
      href: "/admin/quote-requests",
      label: "عروض أسعار جديدة",
      meta: "خدمات",
      count: openQuotes,
      alert: openQuotes > 0,
    },
    {
      href: "/admin/notifications",
      label: "إشعارات غير مقروءة",
      meta: "تنبيهات المستخدمين",
      count: unreadNotifications,
      alert: unreadNotifications > 20,
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
      meta: "من حسابات الموقع الحية",
      group: "moderation",
      count: users.length,
    },
    {
      href: "/admin/listings",
      label: "الإعلانات",
      meta: `${listingStats.pendingListings} بانتظار المراجعة`,
      group: "moderation",
      count: listings.length,
    },
    {
      href: "/admin/disputes",
      label: "النزاعات",
      meta: "من الطلبات + السجل",
      group: "moderation",
      count: openDisputes,
    },
    {
      href: "/admin/categories",
      label: "التصنيفات",
      meta: disabledCategories ? `${disabledCategories} معطّل` : "هيكل السوق",
      group: "moderation",
      count: categories.length,
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
      href: "/admin/favorites",
      label: "المفضلة",
      meta: "اهتمام المستخدمين",
      group: "insight",
      count: favorites.length,
    },
    {
      href: "/admin/notifications",
      label: "الإشعارات",
      meta: `${unreadNotifications} غير مقروء`,
      group: "leads",
      count: notifications.length,
    },
    {
      href: "/admin/addresses",
      label: "العناوين",
      meta: "عناوين التوصيل",
      group: "leads",
      count: addresses.length,
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
      pendingListings: listingStats.pendingListings,
      openDisputes,
      totalUsers: users.length,
      totalListings: listings.length,
      walletAccounts: wallets.length,
      walletAvailable,
      walletHeld,
      conversionRate:
        orders.length === 0 ? 0 : Math.round((paid.length / orders.length) * 100),
      favorites: favorites.length,
      notifications: notifications.length,
      unreadNotifications,
      addresses: addresses.length,
      activeListings: listingStats.activeListings,
    },
    attention,
    sections,
    analytics: {
      daily: buildDailySeries(orders, 7),
      orderStatuses: buildOrderStatusSlices(orders),
      paymentStatuses: buildPaymentStatusSlices(orders),
      topCategories: buildListingCategorySlices(adminListings),
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
