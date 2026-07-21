import { NextResponse } from "next/server";
import {
  buildDailySeries,
  buildListingCategorySlices,
  buildOrderStatusSlices,
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

  const paidOrders = orders.filter((o) => o.paymentStatus === "succeeded");
  const refundedOrders = orders.filter((o) => o.status === "refunded");
  const totalVolume = paidOrders.reduce((sum, o) => sum + o.fees.total, 0);
  const totalFees = paidOrders.reduce((sum, o) => sum + o.fees.platformFee, 0);
  const gatewayFees = paidOrders.reduce((sum, o) => sum + o.fees.gatewayFee, 0);

  return NextResponse.json({
    summary: {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      refundedOrders: refundedOrders.length,
      totalVolume,
      totalPlatformFees: totalFees,
      totalGatewayFees: gatewayFees,
      currency: "AED",
      conversionRate:
        orders.length === 0
          ? 0
          : Math.round((paidOrders.length / orders.length) * 100),
      totalUsers: users.length,
      totalListings: listingStats.totalListings,
      pendingListings: listingStats.pendingListings,
      openDisputes,
    },
    daily: buildDailySeries(orders, 7),
    orderStatuses: buildOrderStatusSlices(orders),
    topCategories: buildListingCategorySlices(listings),
    recentEvents: events.slice(0, 30),
    walletAccounts: wallets.length,
    walletBalances: {
      available: wallets.reduce((sum, w) => sum + w.availableBalance, 0),
      held: wallets.reduce((sum, w) => sum + w.heldInEscrow, 0),
    },
  });
}
