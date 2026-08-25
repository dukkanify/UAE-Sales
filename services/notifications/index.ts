/**
 * Public exports for the enterprise notification engine.
 */

export {
  archiveNotification,
  createNotification,
  deleteNotification,
  emitNotification,
  getNotificationPreferences,
  getUnreadCount,
  groupNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  normalizeNotification,
  notifyRole,
  notifyUsers,
  updateNotificationPreferences,
} from "@/services/notifications/notification-service";
