import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getDisputesForUser } from "@/services/admin/dispute-store";
import { computeDisputeWindow } from "@/services/payments/dispute-window";
import { getOrdersForUser } from "@/services/payments/order-store";

export async function GET() {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const [disputes, orders, settings] = await Promise.all([
    getDisputesForUser(user.id),
    getOrdersForUser(user.id),
    getAdminSettings(),
  ]);

  const eligible = orders
    .map((order) => ({
      order,
      window: computeDisputeWindow(order, settings),
    }))
    .filter((item) => item.window.canOpen && item.order.buyerId === user.id);

  return NextResponse.json({
    disputes,
    eligible,
    settings: {
      disputeWindowDays: settings.disputeWindowDays,
      disputeResponseDays: settings.disputeResponseDays,
    },
  });
}
