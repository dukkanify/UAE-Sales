export type NotificationType =
  | "order_paid"
  | "order_confirmed"
  | "order_released"
  | "order_refunded"
  | "escrow_held";

export type AppNotification = {
  id: string;
  userId: string;
  orderId?: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};
