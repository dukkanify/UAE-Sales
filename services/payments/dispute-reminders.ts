import { createNotification } from "@/services/payments/notification-store";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";
import { getAllOrders } from "@/services/payments/order-store";
import { emailOrderStatusToUser } from "@/services/email/notification-emails";
import type { Order } from "@/types/domain/order";

export type DisputeReminderKind = "48h" | "24h" | "expired";

type DisputeReminderRecord = {
  id: string;
  orderId: string;
  kind: DisputeReminderKind;
  sentAt: string;
};

const reminderStore = createPayloadCollectionStore<DisputeReminderRecord>({
  table: "dispute_reminders",
  fileName: "sooqna-dispute-reminders.json",
});

const DISPUTE_ELIGIBLE = new Set([
  "paid_held_in_escrow",
  "delivered",
  "confirmed",
]);

export type DisputeWindowSnapshot = {
  orderId: string;
  windowDays: number;
  windowEndsAt: string;
  remainingMs: number;
  remainingHours: number;
  expired: boolean;
  nextReminder: DisputeReminderKind | null;
};

export function getDisputeWindowSnapshot(
  order: Pick<Order, "id" | "paidAt" | "createdAt" | "status">,
  disputeWindowDays: number,
  now = Date.now(),
): DisputeWindowSnapshot {
  const start = new Date(order.paidAt ?? order.createdAt).getTime();
  const windowMs = Math.max(1, disputeWindowDays) * 24 * 60 * 60 * 1000;
  const endsAt = start + windowMs;
  const remainingMs = endsAt - now;
  const remainingHours = remainingMs / (60 * 60 * 1000);
  let nextReminder: DisputeReminderKind | null = null;
  if (remainingMs <= 0) nextReminder = "expired";
  else if (remainingHours <= 24) nextReminder = "24h";
  else if (remainingHours <= 48) nextReminder = "48h";

  return {
    orderId: order.id,
    windowDays: disputeWindowDays,
    windowEndsAt: new Date(endsAt).toISOString(),
    remainingMs,
    remainingHours,
    expired: remainingMs <= 0,
    nextReminder,
  };
}

async function alreadySent(
  orderId: string,
  kind: DisputeReminderKind,
): Promise<boolean> {
  const rows = await reminderStore.listAll();
  return rows.some((row) => row.orderId === orderId && row.kind === kind);
}

async function markSent(orderId: string, kind: DisputeReminderKind): Promise<void> {
  await reminderStore.upsert({
    id: `drm-${orderId}-${kind}`,
    orderId,
    kind,
    sentAt: new Date().toISOString(),
  });
}

async function notifyReminder(
  order: Order,
  kind: DisputeReminderKind,
  snapshot: DisputeWindowSnapshot,
): Promise<void> {
  if (!order.buyerId) return;

  const hoursLeft = Math.max(0, Math.ceil(snapshot.remainingHours));
  const title =
    kind === "expired"
      ? "انتهت مهلة فتح النزاع"
      : kind === "24h"
        ? "تبقّى أقل من 24 ساعة لفتح نزاع"
        : "تبقّى أقل من 48 ساعة لفتح نزاع";
  const body =
    kind === "expired"
      ? `انتهت مهلة النزاع لطلب «${order.listingTitle}».`
      : `تبقّى حوالي ${hoursLeft} ساعة لفتح نزاع على طلب «${order.listingTitle}».`;

  await createNotification({
    userId: order.buyerId,
    orderId: order.id,
    type: "order_disputed",
    title,
    titleEn:
      kind === "expired"
        ? "Dispute window closed"
        : kind === "24h"
          ? "Less than 24 hours left to open a dispute"
          : "Less than 48 hours left to open a dispute",
    body,
    bodyEn:
      kind === "expired"
        ? `The dispute window for “${order.listingTitle}” has ended.`
        : `About ${hoursLeft} hours remain to open a dispute for “${order.listingTitle}”.`,
    href: `/orders/${order.id}`,
    dedupeKey: `dispute_reminder:${order.id}:${kind}`,
  });

  void emailOrderStatusToUser({
    userId: order.buyerId,
    fallbackEmail: order.buyerEmail,
    orderId: order.id,
    type: "order_disputed",
    title,
    subject: `${title} — ${order.listingTitle}`,
    body,
  }).catch((error) =>
    console.error("[Sooqna Email] dispute reminder failed", error),
  );

  await markSent(order.id, kind);
}

/** Scan eligible orders and send 48h / 24h / expired reminders once each. */
export async function processDisputeReminders(now = Date.now()): Promise<{
  scanned: number;
  sent: number;
}> {
  const settings = await getAdminSettings();
  const orders = await getAllOrders();
  let sent = 0;
  let scanned = 0;

  for (const order of orders) {
    if (!DISPUTE_ELIGIBLE.has(order.status)) continue;
    if (!order.buyerId) continue;
    scanned += 1;
    const snapshot = getDisputeWindowSnapshot(
      order,
      settings.disputeWindowDays,
      now,
    );
    const kind = snapshot.nextReminder;
    if (!kind) continue;
    if (await alreadySent(order.id, kind)) continue;
    await notifyReminder(order, kind, snapshot);
    sent += 1;
  }

  return { scanned, sent };
}

export async function getOrderDisputeWindow(
  order: Order,
): Promise<DisputeWindowSnapshot> {
  const settings = await getAdminSettings();
  return getDisputeWindowSnapshot(order, settings.disputeWindowDays);
}
