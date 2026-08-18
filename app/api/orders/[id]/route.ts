import { NextResponse } from "next/server";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { computeDisputeWindow } from "@/services/payments/dispute-window";
import { getOrderById } from "@/services/payments/order-store";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }
  const settings = await getAdminSettings();
  return NextResponse.json({
    order,
    disputeWindow: computeDisputeWindow(order, settings),
  });
}
