import type { Order } from "@/types";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getOrderByIdFromDb,
  getOrdersFromDb,
} from "@/lib/repositories/transactions.repository";
import { mockOrders } from "@/mock/orders.mock";

async function getSessionUserId(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return null;
  }
  const { getCurrentSessionUser } = await import("@/lib/auth/session");
  const user = await getCurrentSessionUser();
  return user?.id ?? null;
}

export async function getOrders(): Promise<Order[]> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return mockOrders;
      }
      return getOrdersFromDb(userId);
    },
    async () => mockOrders,
    "orders",
  );
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return mockOrders.find((order) => order.id === orderId);
      }
      return getOrderByIdFromDb(orderId, userId);
    },
    async () => mockOrders.find((order) => order.id === orderId),
    "order-by-id",
  );
}
