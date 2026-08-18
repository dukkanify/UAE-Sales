import { loadCollection, saveCollection } from "@/services/payments/data-store";
import { getAllOrders } from "@/services/payments/order-store";
import type { AdminDisputePatch, AdminDisputeRecord } from "@/types/domain/admin";

const FILE = "disputes.json";

function isPlaceholderDispute(row: AdminDisputeRecord): boolean {
  return (
    row.orderId.startsWith("order-demo-") ||
    /^dispute-00\d$/.test(row.id)
  );
}

async function loadDisputes(): Promise<AdminDisputeRecord[]> {
  const stored = await loadCollection<AdminDisputeRecord>(FILE).catch(
    () => [] as AdminDisputeRecord[],
  );
  const live = stored.filter((row) => !isPlaceholderDispute(row));
  if (live.length !== stored.length) {
    await saveCollection(FILE, live);
  }
  return live.map((row) => ({ ...row }));
}

export async function createDispute(input: {
  orderId: string;
  listingTitle: string;
  buyerName: string;
  sellerName: string;
  reason: string;
  amount: number;
  evidenceUrls?: string[];
}): Promise<AdminDisputeRecord> {
  const disputes = await loadDisputes();
  const existing = disputes.find((row) => row.orderId === input.orderId);
  if (existing && (existing.status === "open" || existing.status === "under_review")) {
    return { ...existing };
  }

  const record: AdminDisputeRecord = {
    id: `dispute-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId: input.orderId,
    listingTitle: input.listingTitle,
    buyerName: input.buyerName,
    sellerName: input.sellerName,
    reason: input.reason.trim(),
    status: "open",
    amount: input.amount,
    createdAt: new Date().toISOString(),
    evidenceUrls:
      input.evidenceUrls && input.evidenceUrls.length > 0
        ? input.evidenceUrls.filter((url) => url.trim().length > 0)
        : undefined,
  };

  disputes.unshift(record);
  await saveCollection(FILE, disputes);
  return { ...record };
}

/** Merge persisted disputes with live disputed orders from the site. */
export async function getAdminDisputes(): Promise<AdminDisputeRecord[]> {
  const [stored, orders] = await Promise.all([loadDisputes(), getAllOrders()]);
  const byOrder = new Map(stored.map((row) => [row.orderId, row]));

  for (const order of orders) {
    if (order.status !== "disputed") continue;
    if (byOrder.has(order.id)) continue;
    const row: AdminDisputeRecord = {
      id: `dispute-order-${order.id}`,
      orderId: order.id,
      listingTitle: order.listingTitle,
      buyerName: order.buyerName,
      sellerName: order.sellerName,
      reason: "نزاع مفتوح من طلب الضمان في الموقع.",
      status: "open",
      amount: order.fees.total,
      createdAt: order.updatedAt || order.createdAt,
    };
    byOrder.set(order.id, row);
  }

  return Array.from(byOrder.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function patchAdminDispute(
  id: string,
  patch: AdminDisputePatch,
): Promise<AdminDisputeRecord | undefined> {
  const disputes = await getAdminDisputes();
  const index = disputes.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  disputes[index] = { ...disputes[index], ...patch };
  await saveCollection(FILE, disputes);
  return { ...disputes[index] };
}

export async function getOpenDisputeCount(): Promise<number> {
  const disputes = await getAdminDisputes();
  return disputes.filter(
    (item) => item.status === "open" || item.status === "under_review",
  ).length;
}
