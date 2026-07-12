import type { Order } from "@/types/domain/order";
import type { UserProfile } from "@/types";

export function canUserAccessOrder(user: UserProfile, order: Order): boolean {
  if (user.role === "admin") return true;
  if (order.buyerId && order.buyerId === user.id) return true;
  if (order.sellerId === user.id) return true;
  return false;
}

export function toAuthorizedOrderView(order: Order, user: UserProfile): Order {
  if (user.role === "admin") return order;

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;

  if (isBuyer && !isSeller) {
    return order;
  }

  if (isSeller && !isBuyer) {
    return {
      ...order,
      guestEmail: undefined,
      guestPhone: undefined,
      guestFullName: undefined,
      guestAccessTokenHash: undefined,
      guestAccessExpiresAt: undefined,
      deliveryAddressSnapshot: order.deliveryAddressSnapshot
        ? {
            fullName: order.deliveryAddressSnapshot.fullName,
            phone: order.deliveryAddressSnapshot.phone,
            emirate: order.deliveryAddressSnapshot.emirate,
            city: order.deliveryAddressSnapshot.city,
            area: order.deliveryAddressSnapshot.area,
            street: order.deliveryAddressSnapshot.street,
            building: order.deliveryAddressSnapshot.building,
            unit: order.deliveryAddressSnapshot.unit,
          }
        : undefined,
    };
  }

  return order;
}
