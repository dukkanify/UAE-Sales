import webpush from "web-push";
import { BRAND } from "@/shared/constants/brand";
import { loadRecord, saveRecord } from "@/services/payments/data-store";
import {
  deletePushSubscription,
  listPushSubscriptions,
} from "@/services/notifications/push-subscriptions";
import type { AppNotification } from "@/types/domain/notification";

type VapidKeys = {
  privateKey: string;
  publicKey: string;
};

const VAPID_FILE = "vapid-keys.json";

function envVapidKeys(): VapidKeys | null {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey };
}

async function getVapidKeys(): Promise<VapidKeys | null> {
  const fromEnv = envVapidKeys();
  if (fromEnv) return fromEnv;

  const stored = await loadRecord<VapidKeys>(VAPID_FILE);
  if (stored?.publicKey && stored?.privateKey) return stored;

  // Ephemeral serverless hosts cannot share generated keys across instances.
  if (process.env.VERCEL) return null;

  const generated = webpush.generateVAPIDKeys();
  const keys: VapidKeys = {
    publicKey: generated.publicKey,
    privateKey: generated.privateKey,
  };
  await saveRecord(VAPID_FILE, keys);
  return keys;
}

export async function getVapidPublicKey(): Promise<string | null> {
  const keys = await getVapidKeys();
  return keys?.publicKey ?? null;
}

function configureWebPush(keys: VapidKeys) {
  webpush.setVapidDetails(
    `mailto:${BRAND.supportEmail}`,
    keys.publicKey,
    keys.privateKey,
  );
}

export async function dispatchWebPush(notification: AppNotification): Promise<void> {
  const keys = await getVapidKeys();
  if (!keys) return;

  const subscriptions = await listPushSubscriptions(notification.userId);
  if (subscriptions.length === 0) return;

  configureWebPush(keys);
  const payload = JSON.stringify({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    href: notification.href || "/notifications",
  });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload,
          { TTL: 60 * 60 * 12, urgency: "normal" },
        );
      } catch (error) {
        const status =
          error && typeof error === "object" && "statusCode" in error
            ? Number(error.statusCode)
            : 0;
        if (status === 404 || status === 410) {
          await deletePushSubscription(subscription.endpoint);
          return;
        }
        console.error("[Sooqna Notify] web push failed", error);
      }
    }),
  );
}
