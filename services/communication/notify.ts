/**
 * Soft notification helper for communication events.
 */

import { createNotification } from "@/services/notifications/notification-service";

export async function notifyUsers(
  userIds: string[],
  input: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
  },
) {
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(
    unique.map((userId) =>
      createNotification({
        userId,
        title: input.title,
        body: input.body,
        type: input.type,
        data: input.data,
      }),
    ),
  );
}
