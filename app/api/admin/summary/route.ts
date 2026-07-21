import { NextResponse } from "next/server";
import { getModerationSummary } from "@/services/admin/admin-ops-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import { loadCollection } from "@/services/payments/data-store";

type LeadRow = { id: string; createdAt?: string };

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const moderation = getModerationSummary();
  const [orders, events, jobs, bookings, quotes] = await Promise.all([
    getAllOrders(),
    getPaymentEvents(),
    loadCollection<LeadRow>("job-applications.json").catch(() => [] as LeadRow[]),
    loadCollection<LeadRow>("viewing-bookings.json").catch(() => [] as LeadRow[]),
    loadCollection<LeadRow>("quote-requests.json").catch(() => [] as LeadRow[]),
  ]);

  const paid = orders.filter((o) => o.paymentStatus === "succeeded");
  const refunded = orders.filter((o) => o.status === "refunded");
  const heldEscrow = orders.filter((o) => o.escrowStatus === "held");
  const volume = paid.reduce((sum, o) => sum + o.fees.total, 0);
  const fees = paid.reduce((sum, o) => sum + o.fees.platformFee, 0);

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
      alert: false,
    },
    {
      href: "/admin/orders",
      label: "طلبات تحتاج متابعة",
      meta: "مدفوعات واسترداد",
      count: orders.filter(
        (o) =>
          o.status === "pending_payment" ||
          o.paymentStatus === "pending" ||
          o.paymentStatus === "processing" ||
          o.paymentStatus === "failed",
      ).length,
      alert: true,
    },
    {
      href: "/admin/escrow",
      label: "ضمان محجوز",
      meta: "بانتظار التحرير أو الاسترداد",
      count: heldEscrow.length,
      alert: heldEscrow.length > 0,
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
    },
    attention,
    pulse: events.slice(0, 8).map((event) => ({
      id: event.id,
      text: event.type,
      time: event.createdAt,
    })),
  });
}
