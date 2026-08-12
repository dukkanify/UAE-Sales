import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAllOrders } from "@/services/payments/order-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}
