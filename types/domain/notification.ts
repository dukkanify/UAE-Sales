export type NotificationType =
  | "new_message"
  | "listing_approved"
  | "listing_rejected"
  | "order_created"
  | "payment_held"
  | "payment_released"
  | "dispute_opened"
  | "wallet_updated";

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
  metadata?: Record<string, string>;
};

export type NotificationSummary = {
  unreadCount: number;
  items: NotificationRecord[];
};
