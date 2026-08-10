/**
 * Soft notifications for payment events (+ CR009 email automation).
 */

import { emailPaymentUpdate } from "@/services/email/automation-service";
import { createNotification } from "@/services/notifications/notification-service";

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
  },
) {
  await createNotification({
    userId,
    title: input.title,
    body: input.body,
    type: input.type,
    data: input.data,
  });

  if (input.email === false) return;

  await emailPaymentUpdate({
    userId,
    title: input.title,
    detail: input.body,
    amountLabel: input.amountLabel,
    reference: input.reference,
  });
}
