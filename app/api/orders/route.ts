import { NextResponse } from "next/server";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { computeDisputeWindow } from "@/services/payments/dispute-window";
import { getOrdersForUser } from "@/services/payments/order-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const [orders, settings] = await Promise.all([
    getOrdersForUser(userId),
    getAdminSettings(),
  ]);
  const disputeWindows = Object.fromEntries(
    orders.map((order) => [order.id, computeDisputeWindow(order, settings)]),
  );
  return NextResponse.json({ orders, disputeWindows });
}
