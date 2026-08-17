import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type FeaturedPaymentStatus = "pending" | "completed" | "failed";

export type FeaturedPaymentRecord = {
  id: string;
  listingId: string;
  userId: string;
  amountAed: number;
  days: number;
  status: FeaturedPaymentStatus;
  stripeSessionId?: string;
  createdAt: string;
  completedAt?: string;
};

const FILE = "featured-payments.json";

export async function getFeaturedPayments(): Promise<FeaturedPaymentRecord[]> {
  return loadCollection<FeaturedPaymentRecord>(FILE).catch(
    () => [] as FeaturedPaymentRecord[],
  );
}

export async function recordFeaturedPayment(
  input: Omit<FeaturedPaymentRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): Promise<FeaturedPaymentRecord> {
  const all = await getFeaturedPayments();
  const record: FeaturedPaymentRecord = {
    id: input.id ?? `feat-pay-${Date.now()}`,
    listingId: input.listingId,
    userId: input.userId,
    amountAed: input.amountAed,
    days: input.days,
    status: input.status,
    stripeSessionId: input.stripeSessionId,
    createdAt: input.createdAt ?? new Date().toISOString(),
    completedAt: input.completedAt,
  };
  all.unshift(record);
  await saveCollection(FILE, all);
  return record;
}

export async function completeFeaturedPaymentBySession(
  sessionId: string,
): Promise<FeaturedPaymentRecord | undefined> {
  const all = await getFeaturedPayments();
  const index = all.findIndex((item) => item.stripeSessionId === sessionId);
  if (index < 0) return undefined;
  if (all[index].status === "completed") return all[index];
  all[index] = {
    ...all[index],
    status: "completed",
    completedAt: new Date().toISOString(),
  };
  await saveCollection(FILE, all);
  return all[index];
}
