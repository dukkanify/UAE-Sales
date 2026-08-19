export type NotificationType =
  | "welcome"
  | "order_paid"
  | "order_confirmed"
  | "order_released"
  | "order_refunded"
  | "order_disputed"
  | "seller_proof"
  | "buyer_match"
  | "escrow_held"
  | "job_application"
  | "viewing_booking"
  | "quote_request"
  | "account_verified"
  | "account_approved"
  | "account_pending_approval"
  | "listing_report"
  | "listing_received"
  | "listing_approved"
  | "listing_rejected"
  | "listing_featured";

export type AppNotification = {
  id: string;
  userId: string;
  orderId?: string;
  type: NotificationType;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export type PushSubscriptionRecord = {
  userId: string;
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  userAgent?: string;
  createdAt: string;
};
