export type NotificationType =
  | "welcome"
  | "order_paid"
  | "order_confirmed"
  | "order_preparing"
  | "order_shipped"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled"
  | "order_released"
  | "order_refunded"
  | "order_disputed"
  | "order_dispute_resolved"
  | "payment_failed"
  | "seller_proof"
  | "buyer_match"
  | "escrow_held"
  | "escrow_released"
  | "job_application"
  | "job_application_update"
  | "viewing_booking"
  | "viewing_booking_update"
  | "quote_request"
  | "quote_request_update"
  | "account_verified"
  | "account_approved"
  | "account_pending_approval"
  | "listing_report"
  | "listing_received"
  | "listing_approved"
  | "listing_rejected"
  | "listing_featured"
  | "listing_featured_payment"
  | "listing_featured_expired"
  | "chat_message"
  | "favorite_price"
  | "favorite_sold"
  | "saved_search_match"
  | "admin_ops";

export type EmailChannelStatus =
  | "pending"
  | "sent"
  | "failed"
  | "skipped"
  | "not_requested";

export type NotificationPreferenceKey =
  | "email"
  | "bookingUpdates"
  | "orderUpdates"
  | "messages"
  | "marketing"
  | "savedSearches";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  bookingUpdates: true,
  orderUpdates: true,
  messages: true,
  marketing: false,
  savedSearches: true,
};

export type AppNotification = {
  id: string;
  userId: string;
  orderId?: string;
  type: NotificationType;
  title: string;
  body: string;
  titleEn?: string;
  bodyEn?: string;
  href?: string;
  read: boolean;
  createdAt: string;
  idempotencyKey?: string;
  emailStatus?: EmailChannelStatus;
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
