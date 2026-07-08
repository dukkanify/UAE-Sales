import { NextResponse } from "next/server";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import { getAllWalletAccounts } from "@/services/payments/wallet-ledger";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const [orders, events, wallets] = await Promise.all([
    getAllOrders(),
    getPaymentEvents(),
    getAllWalletAccounts(),
  ]);

  const paidOrders = orders.filter((o) => o.paymentStatus === "succeeded");
  const refundedOrders = orders.filter((o) => o.status === "refunded");
  const totalVolume = paidOrders.reduce((sum, o) => sum + o.fees.total, 0);
  const totalFees = paidOrders.reduce((sum, o) => sum + o.fees.platformFee, 0);

  return NextResponse.json({
    summary: {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      refundedOrders: refundedOrders.length,
      totalVolume,
      totalPlatformFees: totalFees,
      currency: "AED",
    },
    recentEvents: events.slice(0, 20),
    walletAccounts: wallets.length,
  });
}
