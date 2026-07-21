import { NextResponse } from "next/server";
import {
  buildDailySeries,
  buildListingCategorySlices,
  buildOrderStatusSlices,
  buildPaymentStatusSlices,
} from "@/services/admin/admin-analytics";
import { getOpenDisputeCount } from "@/services/admin/dispute-store";
import { getAllUsers } from "@/services/auth/user-store";
import {
  getAdminListingRecords,
  getListingsModerationSummary,
} from "@/services/listings/listing-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import { getAllWalletAccounts } from "@/services/payments/wallet-ledger";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const [users, listingStats, listings, openDisputes, orders, events, wallets] =
    await Promise.all([
      getAllUsers(),
      getListingsModerationSummary(),
      getAdminListingRecords(),
      getOpenDisputeCount(),
      getAllOrders(),
      getPaymentEvents(),
      getAllWalletAccounts(),
    ]);

  const paid = orders.filter((o) => o.paymentStatus === "succeeded");
  const volume = paid.reduce((sum, o) => sum + o.fees.total, 0);
  const fees = paid.reduce((sum, o) => sum + o.fees.platformFee, 0);

  return NextResponse.json({
    overview: {
      totalOrders: orders.length,
      paidOrders: paid.length,
      volume,
      fees,
      currency: "AED",
      conversionRate:
        orders.length === 0 ? 0 : Math.round((paid.length / orders.length) * 100),
      totalUsers: users.length,
      totalListings: listingStats.totalListings,
      walletAccounts: wallets.length,
      recentEvents: events.length,
      openDisputes,
      pendingListings: listingStats.pendingListings,
    },
    daily: buildDailySeries(orders, 14),
    orderStatuses: buildOrderStatusSlices(orders),
    paymentStatuses: buildPaymentStatusSlices(orders),
    topCategories: buildListingCategorySlices(listings),
  });
}
