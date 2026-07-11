import type { Order, OrderAuditEvent, OrderStatus } from "@/types/domain/order";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const ORDERS_FILE = "orders.json";

function createAuditEvent(
  type: string,
  message: string,
  metadata?: Record<string, string>,
): OrderAuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    createdAt: new Date().toISOString(),
    metadata,
  };
}

export async function getAllOrders(): Promise<Order[]> {
  return loadCollection<Order>(ORDERS_FILE);
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const orders = await getAllOrders();
  return orders.find((order) => order.id === orderId);
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const orders = await getAllOrders();
  return orders.filter(
    (order) => order.buyerId === userId || order.sellerId === userId,
  );
}

export async function findPendingOrder(
  buyerId: string,
  listingId: string,
): Promise<Order | undefined> {
  const orders = await getAllOrders();
  return orders.find(
    (order) =>
      order.buyerId === buyerId &&
      order.listingId === listingId &&
      order.status === "pending_payment",
  );
}

export async function createOrder(
  input: Omit<Order, "auditLog" | "createdAt" | "updatedAt">,
): Promise<Order> {
  const orders = await getAllOrders();
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    createdAt: now,
    updatedAt: now,
    auditLog: [
      createAuditEvent("order_created", "تم إنشاء الطلب", {
        status: input.status,
      }),
    ],
  };
  orders.unshift(order);
  await saveCollection(ORDERS_FILE, orders);
  return order;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<Order>,
  audit?: { type: string; message: string; metadata?: Record<string, string> },
): Promise<Order | undefined> {
  const orders = await getAllOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return undefined;

  const existing = orders[index];
  const updated: Order = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
    auditLog: audit
      ? [...existing.auditLog, createAuditEvent(audit.type, audit.message, audit.metadata)]
      : existing.auditLog,
  };
  orders[index] = updated;
  await saveCollection(ORDERS_FILE, orders);
  return updated;
}

export function generateOrderId(): string {
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isValidOrderTransition(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    pending_payment: ["paid_held_in_escrow", "refunded"],
    paid_held_in_escrow: ["delivered", "confirmed", "disputed", "refunded"],
    delivered: ["confirmed", "disputed", "refunded"],
    confirmed: ["released", "disputed", "refunded"],
    released: ["refunded"],
    disputed: ["refunded", "released"],
    refunded: [],
  };
  return allowed[current]?.includes(next) ?? false;
}
