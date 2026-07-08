import { NextResponse } from "next/server";
import { confirmOrderReceived } from "@/services/payments/order-service";
import { confirmOrderSchema } from "@/services/payments/payment-schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = confirmOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const order = await confirmOrderReceived(id, parsed.data.buyer.id);
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "UNAUTHORIZED" ? 403 : message === "INVALID_STATUS" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
