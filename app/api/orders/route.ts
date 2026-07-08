import { NextResponse } from "next/server";
import { getOrdersForUser } from "@/services/payments/order-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const orders = await getOrdersForUser(userId);
  return NextResponse.json({ orders });
}
