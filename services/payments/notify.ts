/**
 * Soft notifications for payment events.
 */

import { createNotification } from "@/services/notifications/notification-service";

export async function notifyPayment(
  userId: string,
  input: { title: string; body: string; type: string; data?: Record<string, unknown> },
) {
  await createNotification({
    userId,
    title: input.title,
    body: input.body,
    type: input.type,
    data: input.data,
  });
}
