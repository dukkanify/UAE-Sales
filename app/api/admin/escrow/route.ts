import { NextResponse } from "next/server";
import { getAllOrders } from "@/services/payments/order-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const orders = await getAllOrders();
  const escrowOrders = orders.filter(
    (order) =>
      order.escrowStatus === "held" ||
      order.escrowStatus === "released" ||
      order.status === "paid_held_in_escrow",
  );

  const summary = {
    activeHolds: escrowOrders.filter((o) => o.escrowStatus === "held").length,
    totalProtected: escrowOrders
      .filter((o) => o.escrowStatus === "held")
      .reduce((sum, o) => sum + o.fees.productPrice, 0),
    currency: "AED" as const,
  };

  return NextResponse.json({ orders: escrowOrders, summary });
}
