import { NextResponse } from "next/server";
import { getAllOrders } from "@/services/payments/order-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}
