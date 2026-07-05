import type { CreateDisputeInput, Dispute, Order } from "@/types";
import { mockOrders } from "@/mock/orders.mock";
import { apiClient, isApiConfigured } from "@/services/api";
import { calculateCheckoutFees } from "@/services/payments";

type CreateOrderInput = {
  listingId: string;
  amount: number;
  paymentFee: number;
  platformFee: number;
  useEscrow?: boolean;
};

let mockOrderCounter = 100;

function createMockOrder(input: CreateOrderInput): Order {
  const fees = calculateCheckoutFees(input.amount);
  const id = `mock-order-${++mockOrderCounter}`;
  const order: Order = {
    id,
    orderNumber: id.slice(-8).toUpperCase(),
    listingId: input.listingId,
    listingTitle: "إعلان تجريبي",
    buyerId: "demo-user-001",
    buyerName: "Ahmed Al Mansoori",
    sellerId: "seller-demo",
    sellerName: "بائع تجريبي",
    amount: input.amount,
    paymentFee: input.paymentFee,
    platformFee: input.platformFee,
    totalAmount: fees.totalAmount,
    currency: "AED",
    status: "paid",
    escrowStatus: input.useEscrow ? "held" : undefined,
    escrowAmount: input.useEscrow ? fees.totalAmount : undefined,
    metadata: { platformFee: input.platformFee },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockOrders.unshift(order);
  return order;
}

export async function createOrderClient(input: CreateOrderInput): Promise<Order> {
  if (isApiConfigured()) {
    try {
      const order = await apiClient<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          listingId: input.listingId,
          amount: input.amount,
          paymentFee: input.paymentFee + input.platformFee,
          platformFee: input.platformFee,
        }),
      });

      if (input.useEscrow) {
        await apiClient("/api/escrow/hold", {
          method: "POST",
          body: JSON.stringify({ orderId: order.id }),
        });
        return (
          (await apiClient<Order>(`/api/orders/${order.id}`)) ?? order
        );
      }

      return order;
    } catch {
      return createMockOrder(input);
    }
  }

  return createMockOrder(input);
}

export async function confirmOrderReceivedClient(
  orderId: string,
): Promise<Order | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<Order>(`/api/orders/${orderId}/confirm-received`, {
        method: "POST",
      });
    } catch {
      // fall through
    }
  }

  const order = mockOrders.find((item) => item.id === orderId);
  if (order) {
    order.status = "completed";
    order.escrowStatus = "released";
    order.metadata = {
      ...order.metadata,
      buyerConfirmed: true,
      buyerConfirmedAt: new Date().toISOString(),
    };
  }
  return order;
}

export async function markOrderDeliveredClient(
  orderId: string,
): Promise<Order | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<Order>(`/api/orders/${orderId}/mark-delivered`, {
        method: "POST",
      });
    } catch {
      // fall through
    }
  }

  const order = mockOrders.find((item) => item.id === orderId);
  if (order) {
    order.metadata = {
      ...order.metadata,
      sellerDelivered: true,
      sellerDeliveredAt: new Date().toISOString(),
    };
  }
  return order;
}

export async function createDisputeClient(
  input: CreateDisputeInput,
): Promise<Dispute> {
  if (isApiConfigured()) {
    try {
      return await apiClient<Dispute>("/api/disputes", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      // fall through
    }
  }

  const order = mockOrders.find((item) => item.id === input.orderId);
  if (order) {
    order.status = "disputed";
    order.escrowStatus = "disputed";
  }

  return {
    id: `mock-dispute-${Date.now()}`,
    ...input,
    status: "open",
    createdAt: new Date().toISOString(),
  };
}
