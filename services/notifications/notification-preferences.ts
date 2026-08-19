import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "@/types/domain/notification";
import type { UserProfile } from "@/types/domain/user";

const CRITICAL_EMAIL_TYPES = new Set([
  "welcome",
  "account_verified",
  "account_approved",
  "listing_received",
  "listing_approved",
  "listing_rejected",
  "listing_featured",
  "listing_featured_payment",
  "order_paid",
  "payment_failed",
  "order_refunded",
  "escrow_held",
  "escrow_released",
  "order_disputed",
  "order_dispute_resolved",
  "viewing_booking",
  "viewing_booking_update",
  "quote_request",
  "quote_request_update",
  "job_application",
  "job_application_update",
]);

export type PreferenceCategory =
  | "transactional"
  | "booking"
  | "order"
  | "messages"
  | "marketing"
  | "savedSearches";

export function resolveNotificationPreferences(
  user?: Pick<UserProfile, "notificationPreferences"> | null,
): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(user?.notificationPreferences ?? {}),
  };
}

export function shouldSendEmail(input: {
  category?: PreferenceCategory;
  critical?: boolean;
  type: string;
  user?: Pick<UserProfile, "notificationPreferences"> | null;
}): boolean {
  if (input.critical || CRITICAL_EMAIL_TYPES.has(input.type)) {
    return true;
  }
  const prefs = resolveNotificationPreferences(input.user);
  if (!prefs.email) return false;

  switch (input.category) {
    case "booking":
      return prefs.bookingUpdates;
    case "order":
      return prefs.orderUpdates;
    case "messages":
      return prefs.messages;
    case "marketing":
      return prefs.marketing;
    case "savedSearches":
      return prefs.savedSearches;
    default:
      return true;
  }
}

export const PREFERENCE_LABELS: Record<
  NotificationPreferenceKey,
  { ar: string; en: string; locked?: boolean }
> = {
  email: {
    ar: "رسائل البريد الإلكتروني",
    en: "Email notifications",
  },
  bookingUpdates: {
    ar: "تحديثات الحجوزات والمعاينات",
    en: "Booking and viewing updates",
  },
  orderUpdates: {
    ar: "تحديثات الطلبات والشحن",
    en: "Order and shipping updates",
  },
  messages: {
    ar: "رسائل المحادثة",
    en: "Chat messages",
  },
  marketing: {
    ar: "عروض تسويقية",
    en: "Marketing offers",
  },
  savedSearches: {
    ar: "نتائج البحث المحفوظ والتنبيهات",
    en: "Saved search alerts",
  },
};
