/**
 * Soft notifications for payment events (+ email via central engine).
 */

import { emitNotification } from "@/services/notifications/notification-service";

export async function notifyPayment(
  userId: string,
  input: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
    amountLabel?: string;
    reference?: string;
    email?: boolean;
    actionUrl?: string | null;
  },
) {
  await emitNotification({
    userId,
    title: input.title,
    body: input.body,
    type: input.type,
    data: input.data,
    actionUrl: input.actionUrl ?? "/student/payments",
    amountLabel: input.amountLabel,
    reference: input.reference,
    email: input.email,
    dedupeKey: input.reference ? `payment:${input.type}:${input.reference}` : null,
  });
}
