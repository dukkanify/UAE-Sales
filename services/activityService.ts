import { getNotificationsForUser } from "@/services/payments/notification-store";

export async function getNotifications(userId: string) {
  return getNotificationsForUser(userId);
}

export async function getSavedListings() {
  return [];
}
