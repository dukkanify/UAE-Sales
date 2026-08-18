import type { PushSubscriptionRecord } from "@/types/domain/notification";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "push-subscriptions.json";

export async function listPushSubscriptions(
  userId: string,
): Promise<PushSubscriptionRecord[]> {
  const subscriptions = await loadCollection<PushSubscriptionRecord>(FILE);
  return subscriptions.filter((item) => item.userId === userId);
}

export async function savePushSubscription(
  input: Omit<PushSubscriptionRecord, "createdAt">,
): Promise<PushSubscriptionRecord> {
  const subscriptions = await loadCollection<PushSubscriptionRecord>(FILE);
  const existing = subscriptions.find((item) => item.endpoint === input.endpoint);
  if (existing) {
    existing.userId = input.userId;
    existing.keys = input.keys;
    existing.userAgent = input.userAgent;
    await saveCollection(FILE, subscriptions);
    return existing;
  }

  const record: PushSubscriptionRecord = {
    ...input,
    createdAt: new Date().toISOString(),
  };
  subscriptions.push(record);
  await saveCollection(FILE, subscriptions);
  return record;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const subscriptions = await loadCollection<PushSubscriptionRecord>(FILE);
  const next = subscriptions.filter((item) => item.endpoint !== endpoint);
  if (next.length !== subscriptions.length) {
    await saveCollection(FILE, next);
  }
}
