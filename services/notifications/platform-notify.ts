import { createNotification } from "@/services/payments/notification-store";
import type { AppNotification, NotificationType } from "@/types/domain/notification";

type NotifyChannels = {
  inApp?: boolean;
  email?: () => Promise<unknown>;
};

/**
 * Unified notification entrypoint:
 * Business event → in-app (durable) → optional email.
 * Email failures never throw to the caller.
 */
export async function dispatchPlatformNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  href?: string;
  orderId?: string;
  dedupeKey?: string;
  channels?: NotifyChannels;
}): Promise<AppNotification | null> {
  const channels = input.channels ?? { inApp: true };
  let notification: AppNotification | null = null;

  if (channels.inApp !== false) {
    try {
      notification = await createNotification({
        userId: input.userId,
        type: input.type,
        title: input.title,
        titleEn: input.titleEn,
        body: input.body,
        bodyEn: input.bodyEn,
        href: input.href,
        orderId: input.orderId,
        dedupeKey: input.dedupeKey,
      });
    } catch (error) {
      console.error("[Sooqna Notify] in-app failed", error);
    }
  }

  if (channels.email) {
    try {
      await channels.email();
    } catch (error) {
      console.error("[Sooqna Notify] email failed", error);
    }
  }

  return notification;
}
