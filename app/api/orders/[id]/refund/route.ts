import { NextResponse } from "next/server";
import { refundOrder } from "@/services/payments/order-service";
import { refundOrderSchema } from "@/services/payments/payment-schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = refundOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const order = await refundOrder(id, parsed.data.admin.role);
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "UNAUTHORIZED" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
